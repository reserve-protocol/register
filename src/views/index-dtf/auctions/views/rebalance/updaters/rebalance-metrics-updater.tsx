import { chainIdAtom, devModeAtom } from '@/state/atoms'
import { isHybridDTFAtom } from '@/state/dtf/atoms'
import { ChainId } from '@/utils/chains'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { currentRebalanceAtom, RebalanceByProposal } from '../../../atoms'
import {
  areWeightsSavedAtom,
  rebalanceAuctionsAtom,
  rebalanceMetricsAtom,
  rebalancePercentAtom,
  savedWeightsAtom,
} from '../atoms'
import useRebalanceParams, {
  RebalanceParams,
} from '../hooks/use-rebalance-params'
import getRebalanceOpenAuction from '../utils/get-rebalance-open-auction'

const RebalanceMetricsUpdater = () => {
  const setRebalanceMetrics = useSetAtom(rebalanceMetricsAtom)
  const rebalancePercent = useAtomValue(rebalancePercentAtom)
  const rebalanceParams = useRebalanceParams()
  const currentRebalance = useAtomValue(currentRebalanceAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const savedWeights = useAtomValue(savedWeightsAtom)
  const areWeightsSaved = useAtomValue(areWeightsSavedAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)
  const chainId = useAtomValue(chainIdAtom)
  const isDevMode = useAtomValue(devModeAtom)

  const updateMetrics = useCallback(
    (
      params: RebalanceParams,
      currentRebalance: RebalanceByProposal,
      rebalancePercent: number
    ) => {
      try {
        const {
          supply,
          initialSupply,
          rebalance,
          currentAssets,
          initialAssets,
          initialPrices,
          initialWeights,
          prices,
          isTrackingDTF,
          tokenPriceVolatility,
        } = params

        // Use saved weights for hybrid DTFs on first auction if available
        const weightsToUse =
          isHybridDTF &&
          areWeightsSaved &&
          savedWeights &&
          auctions.length === 0
            ? savedWeights
            : initialWeights

        // First, calculate metrics with the current percent to get auctionSize
        const [, initialMetrics] = getRebalanceOpenAuction(
          currentRebalance.rebalance.tokens,
          rebalance,
          supply,
          initialSupply,
          currentAssets,
          initialAssets,
          initialPrices,
          weightsToUse,
          prices,
          isTrackingDTF,
          tokenPriceVolatility,
          rebalancePercent,
          isHybridDTF
        )

        // Determine if auction is small based on chain
        const isSmallAuction = (auctionSize: number) => {
          if (chainId === ChainId.BSC || chainId === ChainId.Base)
            return auctionSize < 100 // BSC & Base: $100
          if (chainId === ChainId.Mainnet) return auctionSize < 1000 // Mainnet: $1000
          return false // Other chains: no adjustment
        }

        // Override percent to 100 if auction is small (non-dev mode only)
        const effectivePercent =
          !isDevMode && isSmallAuction(initialMetrics.auctionSize ?? 0)
            ? 100
            : rebalancePercent

        // Recalculate if percent was adjusted
        const [, rebalanceMetrics] =
          effectivePercent !== rebalancePercent
            ? getRebalanceOpenAuction(
                currentRebalance.rebalance.tokens,
                rebalance,
                supply,
                initialSupply,
                currentAssets,
                initialAssets,
                initialPrices,
                weightsToUse,
                prices,
                isTrackingDTF,
                tokenPriceVolatility,
                effectivePercent,
                isHybridDTF
              )
            : [, initialMetrics]

        setRebalanceMetrics({
          ...rebalanceMetrics,
          absoluteProgression: rebalanceMetrics.absoluteProgression * 100,
          relativeProgression: rebalanceMetrics.relativeProgression * 100,
          initialProgression: rebalanceMetrics.initialProgression * 100,
        })
      } catch (e) {
        console.error('Error getting rebalance metrics', e)
      }
    },
    [
      setRebalanceMetrics,
      isHybridDTF,
      savedWeights,
      areWeightsSaved,
      auctions,
      chainId,
      isDevMode,
    ]
  )

  useEffect(() => {
    if (rebalanceParams && currentRebalance && rebalancePercent) {
      updateMetrics(rebalanceParams, currentRebalance, rebalancePercent)
    }
  }, [rebalanceParams, currentRebalance, updateMetrics, rebalancePercent])

  return null
}

export default RebalanceMetricsUpdater
