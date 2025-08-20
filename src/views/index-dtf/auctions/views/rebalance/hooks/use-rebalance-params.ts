import useAssetPricesWithSnapshot, {
  TokenPriceWithSnapshot,
} from '@/hooks/use-asset-prices-with-snapshot'
import {
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
  const basket = useAtomValue(indexDTFBasketAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)
  const originalWeights = useAtomValue(originalRebalanceWeightsAtom)

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

  return useMemo(() => {
    if (
      !currentRebalanceData ||
      !initialRebalanceData ||
      !prices ||
      !rebalanceControl ||
      !rebalance
    )
      return undefined

    const {
      supply: initialSupply,
      rebalance: initialRebalance,
      initialAssets,
    } = initialRebalanceData
    const tokenMap = rebalance.rebalance.tokens.reduce(
      (acc, token) => {
        acc[token.address.toLowerCase()] = token
        return acc
      },
      {} as Record<string, Token>
    )
    const initialPrices: Record<string, number> = {}
    let initialWeights: Record<string, WeightRange> = {}

    for (let i = 0; i < initialRebalance[1].length; i++) {
      const token = initialRebalance[1][i].toLowerCase()
      const decimals = tokenMap[token].decimals

      initialPrices[token] = calculatePriceFromRange(
        {
          low: initialRebalance[3][i].low,
          high: initialRebalance[3][i].high,
        },
        decimals
      )

      initialWeights[token] = {
        low: initialRebalance[2][i].low,
        spot: initialRebalance[2][i].spot,
        high: initialRebalance[2][i].high,
      }
    }

    // Use historical weights for subsequent auctions in hybrid DTFs
    if (isHybridDTF && auctions.length > 0 && originalWeights) {
      initialWeights = originalWeights
    }

    return {
      initialSupply: initialSupply,
      initialPrices,
      initialWeights,
      initialAssets,
      currentAssets: currentRebalanceData.currentAssets,
      supply: currentRebalanceData.supply,
      prices,
      isTrackingDTF: !rebalanceControl.weightControl,
      rebalance: {
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
      } as Rebalance,
    } as RebalanceParams
  }, [
    currentRebalanceData,
    initialRebalanceData,
    prices,
    rebalance,
    rebalanceControl,
    isHybridDTF,
    auctions.length,
    originalWeights,
  ])
}

export default useRebalanceParams
