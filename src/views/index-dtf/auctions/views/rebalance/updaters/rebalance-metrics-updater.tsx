import { isHybridDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { currentRebalanceAtom, RebalanceByProposal } from '../../../atoms'
import {
  areWeightsSavedAtom,
  AUCTION_PRICE_VOLATILITY,
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
        } = params

        // Use saved weights for hybrid DTFs on first auction if available
        const weightsToUse =
          isHybridDTF &&
          areWeightsSaved &&
          savedWeights &&
          auctions.length === 0
            ? savedWeights
            : initialWeights

        const [, rebalanceMetrics] = getRebalanceOpenAuction(
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
          rebalancePercent,
          AUCTION_PRICE_VOLATILITY.MEDIUM,
          isHybridDTF
        )

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
    [setRebalanceMetrics, isHybridDTF, savedWeights, areWeightsSaved, auctions]
  )

  useEffect(() => {
    if (rebalanceParams && currentRebalance && rebalancePercent) {
      updateMetrics(rebalanceParams, currentRebalance, rebalancePercent)
    }
  }, [rebalanceParams, currentRebalance, updateMetrics, rebalancePercent])

  return null
}

export default RebalanceMetricsUpdater
