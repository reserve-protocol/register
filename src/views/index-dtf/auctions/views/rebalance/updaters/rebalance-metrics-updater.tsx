import { chainIdAtom, devModeAtom } from '@/state/atoms'
import { isHybridDTFAtom } from '@/state/dtf/atoms'
import { ChainId } from '@/utils/chains'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { currentRebalanceAtom, RebalanceByProposal } from '../../../atoms'
import {
  areWeightsSavedAtom,
  rebalanceAuctionsAtom,
  rebalanceErrorAtom,
  rebalanceMetricsAtom,
  rebalancePercentAtom,
  savedWeightsAtom,
} from '../atoms'
import useRebalanceParams, {
  RebalanceParams,
  useRebalancePrices,
} from '../hooks/use-rebalance-params'
import getRebalanceOpenAuction, {
  PriceUnavailableError,
} from '../utils/get-rebalance-open-auction'

const RebalanceMetricsUpdater = () => {
  const { t } = useLingui()
  const setRebalanceMetrics = useSetAtom(rebalanceMetricsAtom)
  const setRebalanceError = useSetAtom(rebalanceErrorAtom)
  const rebalancePercent = useAtomValue(rebalancePercentAtom)
  const rebalanceParams = useRebalanceParams()
  const { isError: isPriceError } = useRebalancePrices()
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
          folioVersion,
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
          folioVersion,
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
                folioVersion,
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
        if (e instanceof PriceUnavailableError) {
          const symbol = currentRebalance.rebalance.tokens.find(
            (token) => token.address.toLowerCase() === e.token
          )?.symbol
          setRebalanceError(
            symbol
              ? t`Price unavailable for "${symbol}" — cannot launch auction.`
              : t`Price unavailable for a basket token — cannot launch auction.`
          )
        } else if (e instanceof Error && e.message.includes('out of bounds')) {
          // The rebalance lib prints the token as "[object Object]" on v5, so
          // identify it by matching the locked low price from the message.
          const lockedLow = e.message.match(/initial range \[(\d+)/)?.[1]
          const index = currentRebalance.rebalance.priceLowLimit.findIndex(
            (low) => low === lockedLow
          )
          const symbol =
            index >= 0
              ? currentRebalance.rebalance.tokens[index]?.symbol
              : undefined

          setRebalanceError(
            symbol
              ? t`Token "${symbol}" is out of bounds. Rebalance must be closed.`
              : t`One or more tokens in the rebalance is out of bounds. Rebalance must be closed.`
          )
        } else {
          setRebalanceError(t`Unexpected error getting Rebalance data.`)
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
      t,
    ]
  )

  useEffect(() => {
    if (rebalanceParams && currentRebalance && rebalancePercent) {
      updateMetrics(rebalanceParams, currentRebalance, rebalancePercent)
    }
  }, [rebalanceParams, currentRebalance, updateMetrics, rebalancePercent])

  // A hard price-fetch error leaves rebalanceParams undefined — surface the reason, not a silent skeleton.
  useEffect(() => {
    if (isPriceError) {
      setRebalanceError(t`Price data unavailable — cannot launch auction.`)
    }
  }, [isPriceError, setRebalanceError, t])

  return null
}

export default RebalanceMetricsUpdater
