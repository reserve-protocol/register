import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import useAssetPricesWithSnapshot, {
  TokenPriceWithSnapshot,
} from '@/hooks/use-asset-prices-with-snapshot'
import {
  folioVersionAtom,
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFRebalanceControlAtom,
  isHybridDTFAtom,
} from '@/state/dtf/atoms'
import { Token, Volatility } from '@/types'
import { calculatePriceFromRange } from '@/utils'
import { FolioVersion, WeightRange } from '@reserve-protocol/dtf-rebalance-lib'
import { Rebalance as RebalanceV4 } from '@reserve-protocol/dtf-rebalance-lib/dist/4.0.0/types'
import { Rebalance as RebalanceV5 } from '@reserve-protocol/dtf-rebalance-lib/dist/types'
import {
  useIndexDtfCurrentRebalance,
  useIndexDtfIdentity,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useReadContract } from 'wagmi'
import { currentRebalanceAtom } from '../../../atoms'
import { originalRebalanceWeightsAtom, rebalanceAuctionsAtom } from '../atoms'
import {
  getFolioVersion,
  getRebalancePrices,
  getRebalanceTokens,
  getRebalanceWeights,
  transformV4Rebalance,
} from '../utils/transforms'
import useRebalanceCurrentData from './use-rebalance-current-data'
import useRebalanceInitialData from './use-rebalance-initial-data'
import useRebalancePriceVolatility from './use-rebalance-price-volatility'

export type RebalanceParams = {
  supply: bigint
  initialSupply: bigint
  rebalance: RebalanceV4 | RebalanceV5
  currentAssets: Record<string, bigint>
  initialAssets: Record<string, bigint>
  initialPrices: Record<string, number>
  initialWeights: Record<string, WeightRange>
  prices: TokenPriceWithSnapshot
  tokenPriceVolatility: Record<string, Volatility>
  isTrackingDTF: boolean
  folioVersion: FolioVersion
  bidsEnabled: boolean
}

// Exposed so the launch UI can distinguish loading from a hard price-fetch error; same queryKey as useRebalanceParams → one fetch.
export const useRebalancePrices = () => {
  const basket = useAtomValue(indexDTFBasketAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)

  const rebalanceTokens = useMemo(() => {
    if (!rebalance || !basket) return []

    const tokens = new Set<string>()

    rebalance.rebalance.tokens.forEach((token) => {
      tokens.add(token.address.toLowerCase())
    })

    basket.forEach((token) => {
      tokens.add(token.address.toLowerCase())
    })

    return Array.from(tokens)
  }, [basket, rebalance])

  return useAssetPricesWithSnapshot(rebalanceTokens)
}

const useRebalanceParams = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)
  const originalWeights = useAtomValue(originalRebalanceWeightsAtom)
  const tokenPriceVolatility = useRebalancePriceVolatility()
  const versionState = useAtomValue(folioVersionAtom)
  const identity = useIndexDtfIdentity()

  const folioVersion = useMemo(
    () => getFolioVersion(versionState),
    [versionState]
  )
  const major = versionState.status === 'ready' ? versionState.major : undefined
  const isSdkVersion = major === 5 || major === 6
  const startBlock = rebalance?.rebalance.blockNumber
    ? BigInt(rebalance.rebalance.blockNumber)
    : undefined

  const { data: prices } = useRebalancePrices()
  const { data: currentRebalanceData } = useRebalanceCurrentData()
  const { data: initialRebalanceData } = useRebalanceInitialData()
  // The rebalance as started (weights, prices) at its start block: v5/v6 via the SDK, v4 local.
  const { data: sdkHistorical } = useIndexDtfCurrentRebalance(
    isSdkVersion && identity.address && startBlock !== undefined
      ? { ...identity, blockNumber: startBlock }
      : undefined
  )
  const { data: v4HistoricalRaw } = useReadContract({
    abi: dtfIndexAbiV4,
    address: dtf?.id,
    functionName: 'getRebalance',
    chainId: dtf?.chainId,
    args: [],
    blockNumber: startBlock ?? 0n,
    query: {
      enabled: startBlock !== undefined && !!dtf?.id && major === 4,
    },
  })
  const historicalRebalance = useMemo(() => {
    if (isSdkVersion) return sdkHistorical?.rebalance
    if (!v4HistoricalRaw) return undefined
    return transformV4Rebalance(v4HistoricalRaw as readonly unknown[])
  }, [isSdkVersion, sdkHistorical, v4HistoricalRaw])

  return useMemo(() => {
    if (
      !currentRebalanceData ||
      !initialRebalanceData ||
      !prices ||
      !rebalanceControl ||
      !rebalance ||
      !historicalRebalance ||
      !tokenPriceVolatility ||
      folioVersion === undefined
    )
      return undefined

    const { supply: initialSupply, initialAssets } = initialRebalanceData
    const tokenMap = rebalance.rebalance.tokens.reduce(
      (acc, token) => {
        acc[token.address.toLowerCase()] = token
        return acc
      },
      {} as Record<string, Token>
    )

    const historicalTokens = getRebalanceTokens(historicalRebalance, folioVersion)
    const historicalWeights = getRebalanceWeights(historicalRebalance, folioVersion)
    const historicalPrices = getRebalancePrices(historicalRebalance, folioVersion)

    const initialPrices: Record<string, number> = {}
    let initialWeights: Record<string, WeightRange> = {}

    for (let i = 0; i < historicalTokens.length; i++) {
      const token = historicalTokens[i].toLowerCase()
      // Indexer lag can omit a rebalance token's metadata — skip it here and
      // the downstream builder fails the launch closed instead of crashing.
      const meta = tokenMap[token]
      if (!meta) continue

      initialPrices[token] = calculatePriceFromRange(
        historicalPrices[i],
        meta.decimals
      )
      initialWeights[token] = historicalWeights[i]
    }

    // Use historical weights for subsequent auctions in hybrid DTFs
    if (isHybridDTF && auctions.length > 0 && originalWeights) {
      initialWeights = originalWeights
    }

    return {
      initialSupply,
      initialPrices,
      initialWeights,
      initialAssets,
      currentAssets: currentRebalanceData.currentAssets,
      supply: currentRebalanceData.supply,
      prices,
      tokenPriceVolatility,
      isTrackingDTF: !rebalanceControl.weightControl,
      rebalance: currentRebalanceData.rebalance,
      folioVersion: currentRebalanceData.folioVersion,
      bidsEnabled: currentRebalanceData.bidsEnabled,
    } as RebalanceParams
  }, [
    currentRebalanceData,
    initialRebalanceData,
    historicalRebalance,
    prices,
    rebalance,
    rebalanceControl,
    isHybridDTF,
    auctions.length,
    originalWeights,
    tokenPriceVolatility,
    folioVersion,
  ])
}

export default useRebalanceParams
