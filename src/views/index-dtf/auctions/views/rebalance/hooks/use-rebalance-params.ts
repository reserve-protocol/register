import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import dtfIndexAbiV5 from '@/abis/dtf-index-abi'
import useAssetPricesWithSnapshot, {
  TokenPriceWithSnapshot,
} from '@/hooks/use-asset-prices-with-snapshot'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFRebalanceControlAtom,
  indexDTFVersionAtom,
  isHybridDTFAtom,
} from '@/state/dtf/atoms'
import { Token, Volatility } from '@/types'
import { calculatePriceFromRange } from '@/utils'
import { FolioVersion, WeightRange } from '@reserve-protocol/dtf-rebalance-lib'
import { Rebalance as RebalanceV4 } from '@reserve-protocol/dtf-rebalance-lib/dist/4.0.0/types'
import { Rebalance as RebalanceV5 } from '@reserve-protocol/dtf-rebalance-lib/dist/types'
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
  transformV5Rebalance,
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

const useRebalanceParams = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)
  const originalWeights = useAtomValue(originalRebalanceWeightsAtom)
  const tokenPriceVolatility = useRebalancePriceVolatility()
  const versionString = useAtomValue(indexDTFVersionAtom)

  const folioVersion = useMemo(
    () => getFolioVersion(versionString),
    [versionString]
  )
  const abi = folioVersion === FolioVersion.V5 ? dtfIndexAbiV5 : dtfIndexAbiV4

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

  const { data: prices } = useAssetPricesWithSnapshot(rebalanceTokens)
  const { data: currentRebalanceData } = useRebalanceCurrentData()
  const { data: initialRebalanceData } = useRebalanceInitialData()
  const { data: initialRebalanceRaw } = useReadContract({
    abi,
    address: dtf?.id,
    functionName: 'getRebalance',
    chainId: dtf?.chainId,
    args: [],
    blockNumber: BigInt(rebalance?.rebalance.blockNumber ?? '0'),
    query: {
      enabled: !!rebalance?.rebalance.blockNumber && !!dtf?.id,
    },
  })

  return useMemo(() => {
    if (
      !currentRebalanceData ||
      !initialRebalanceData ||
      !prices ||
      !rebalanceControl ||
      !rebalance ||
      !initialRebalanceRaw ||
      !tokenPriceVolatility
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

    // Transform historical rebalance using version-aware helpers
    const historicalRebalance =
      folioVersion === FolioVersion.V5
        ? transformV5Rebalance(initialRebalanceRaw as readonly unknown[])
        : transformV4Rebalance(initialRebalanceRaw as readonly unknown[])

    const historicalTokens = getRebalanceTokens(historicalRebalance, folioVersion)
    const historicalWeights = getRebalanceWeights(historicalRebalance, folioVersion)
    const historicalPrices = getRebalancePrices(historicalRebalance, folioVersion)

    const initialPrices: Record<string, number> = {}
    let initialWeights: Record<string, WeightRange> = {}

    for (let i = 0; i < historicalTokens.length; i++) {
      const token = historicalTokens[i].toLowerCase()
      const decimals = tokenMap[token].decimals

      initialPrices[token] = calculatePriceFromRange(historicalPrices[i], decimals)
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
    initialRebalanceRaw,
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
