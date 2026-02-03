import { chainIdAtom, devModeAtom } from '@/state/atoms'
import { isHybridDTFAtom } from '@/state/dtf/atoms'
import { ChainId } from '@/utils/chains'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { currentRebalanceAtom, RebalanceByProposal } from '../../../atoms'
import {
  areWeightsSavedAtom,
  rebalanceAuctionsAtom,
  rebalanceErrorAtom,
  rebalanceMetricsAtom,
  rebalancePercentAtom,
  rebalanceTokenMapAtom,
  savedWeightsAtom,
} from '../atoms'
import useRebalanceParams, {
  RebalanceParams,
} from '../hooks/use-rebalance-params'
import getRebalanceOpenAuction from '../utils/get-rebalance-open-auction'

const RebalanceMetricsUpdater = () => {
  const setRebalanceMetrics = useSetAtom(rebalanceMetricsAtom)
  const setRebalanceError = useSetAtom(rebalanceErrorAtom)
  const rebalancePercent = useAtomValue(rebalancePercentAtom)
  const rebalanceParams = useRebalanceParams()
  const currentRebalance = useAtomValue(currentRebalanceAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const savedWeights = useAtomValue(savedWeightsAtom)
  const areWeightsSaved = useAtomValue(areWeightsSavedAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)
  const chainId = useAtomValue(chainIdAtom)
  const isDevMode = useAtomValue(devModeAtom)
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)

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

        setRebalanceError('')
        setRebalanceMetrics({
          ...rebalanceMetrics,
          absoluteProgression: rebalanceMetrics.absoluteProgression * 100,
          relativeProgression: rebalanceMetrics.relativeProgression * 100,
          initialProgression: rebalanceMetrics.initialProgression * 100,
        })
      } catch (e) {
        console.error('Error getting rebalance metrics', e)
        if (e instanceof Error && e.message.includes('out of bounds')) {
          const tokenAddr = e.message.split(' ')[1]?.toLowerCase().replace(':', '')
          console.log('words', tokenAddr)
          if (!tokenMap[tokenAddr]) {
            setRebalanceError('One or more tokens in the rebalance is out of bounds. Rebalance must be closed.')
          } else {
            setRebalanceError(`Token "${tokenMap[tokenAddr].symbol}" is out of bounds. Rebalance must be closed.`)
          }

        } else {
          setRebalanceError('Unexpected error getting Rebalance data.')
        }
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
      setRebalanceError,
      tokenMap
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
