import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import useAssetPricesWithSnapshot, {
  TokenPriceWithSnapshot,
} from '@/hooks/use-asset-prices-with-snapshot'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFRebalanceControlAtom,
  isHybridDTFAtom,
} from '@/state/dtf/atoms'
import { Token } from '@/types'
import { calculatePriceFromRange } from '@/utils'
import {
  Rebalance,
  WeightRange,
} from '@reserve-protocol/dtf-rebalance-lib/dist/types'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useReadContract } from 'wagmi'
import { currentRebalanceAtom } from '../../../atoms'
import { originalRebalanceWeightsAtom, rebalanceAuctionsAtom } from '../atoms'
import useRebalanceCurrentData from './use-rebalance-current-data'
import useRebalanceInitialData from './use-rebalance-initial-data'

export type RebalanceParams = {
  supply: bigint
  initialSupply: bigint
  rebalance: Rebalance
  currentAssets: Record<string, bigint>
  initialAssets: Record<string, bigint>
  initialPrices: Record<string, number>
  initialWeights: Record<string, WeightRange>
  prices: TokenPriceWithSnapshot
  isTrackingDTF: boolean
}

const useRebalanceParams = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)
  const originalWeights = useAtomValue(originalRebalanceWeightsAtom)

  // Memoize tokenMap separately from tokenList
  const tokenMap = useMemo(() => {
    if (!rebalance || !basket) return undefined

    const map: Record<string, Token> = {}

    // Add rebalance tokens to map
    rebalance.rebalance.tokens.forEach((token) => {
      map[token.address.toLowerCase()] = token
    })

    // Add basket tokens to map (may override with more complete data)
    basket.forEach((token) => {
      map[token.address.toLowerCase()] = token
    })

    return map
  }, [basket, rebalance])

  // Extract tokenList from tokenMap
  const tokenList = useMemo(() => {
    return tokenMap ? Object.keys(tokenMap) : []
  }, [tokenMap])

  const { data: prices } = useAssetPricesWithSnapshot(tokenList)
  const { data: currentRebalanceData } = useRebalanceCurrentData()
  const { data: initialRebalanceData } = useRebalanceInitialData()
  const { data: initialRebalance } = useReadContract({
    abi: dtfIndexAbiV4,
    address: dtf?.id,
    functionName: 'getRebalance',
    chainId: dtf?.chainId,
    args: [],
    blockNumber: BigInt(rebalance?.rebalance.blockNumber ?? '0'),
    query: {
      enabled: !!rebalance?.rebalance.blockNumber && !!dtf?.id,
    },
  })

  // Extract initial prices and weights calculation
  const { initialPrices, calculatedInitialWeights } = useMemo(() => {
    if (!initialRebalance || !tokenMap) {
      return { initialPrices: {}, calculatedInitialWeights: {} }
    }

    const prices: Record<string, number> = {}
    const weights: Record<string, WeightRange> = {}

    for (let i = 0; i < initialRebalance[1].length; i++) {
      const token = initialRebalance[1][i].toLowerCase()
      const decimals = tokenMap[token].decimals

      prices[token] = calculatePriceFromRange(
        {
          low: initialRebalance[3][i].low,
          high: initialRebalance[3][i].high,
        },
        decimals
      )

      weights[token] = {
        low: initialRebalance[2][i].low,
        spot: initialRebalance[2][i].spot,
        high: initialRebalance[2][i].high,
      }
    }

    return { initialPrices: prices, calculatedInitialWeights: weights }
  }, [initialRebalance, tokenMap])

  // Determine final initial weights
  const initialWeights = useMemo(() => {
    // Use historical weights for subsequent auctions in hybrid DTFs
    if (isHybridDTF && auctions.length > 0 && originalWeights) {
      return originalWeights
    }
    return calculatedInitialWeights
  }, [isHybridDTF, auctions.length, originalWeights, calculatedInitialWeights])

  // Build rebalance object separately
  const rebalanceObject = useMemo(() => {
    if (!currentRebalanceData) return undefined

    return {
      nonce: currentRebalanceData.rebalance[0],
      tokens: currentRebalanceData.rebalance[1],
      weights: currentRebalanceData.rebalance[2],
      initialPrices: currentRebalanceData.rebalance[3],
      inRebalance: currentRebalanceData.rebalance[4],
      limits: currentRebalanceData.rebalance[5],
      startedAt: currentRebalanceData.rebalance[6],
      restrictedUntil: currentRebalanceData.rebalance[7],
      availableUntil: currentRebalanceData.rebalance[8],
      priceControl: currentRebalanceData.rebalance[9],
    } as Rebalance
  }, [currentRebalanceData])

  // Final result composition
  return useMemo(() => {
    if (
      !currentRebalanceData ||
      !initialRebalanceData ||
      !prices ||
      !rebalanceControl ||
      !rebalance ||
      !rebalanceObject ||
      !tokenMap
    )
      return undefined

    return {
      initialSupply: initialRebalanceData.supply,
      initialPrices,
      initialWeights,
      initialAssets: initialRebalanceData.initialAssets,
      currentAssets: currentRebalanceData.currentAssets,
      supply: currentRebalanceData.supply,
      prices,
      isTrackingDTF: !rebalanceControl.weightControl,
      rebalance: rebalanceObject,
    } as RebalanceParams
  }, [
    currentRebalanceData,
    initialRebalanceData,
    prices,
    rebalanceControl,
    rebalance,
    rebalanceObject,
    initialPrices,
    initialWeights,
    tokenMap,
  ])
}

export default useRebalanceParams