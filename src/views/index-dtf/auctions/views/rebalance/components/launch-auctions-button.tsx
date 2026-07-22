import dtfIndexAbi from '@/abis/dtf-index-abi'
import { Button } from '@/components/ui/button'
import { indexDTFAtom, isHybridDTFAtom } from '@/state/dtf/atoms'
import { parseDuration } from '@/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { atom, useAtom, useAtomValue } from 'jotai'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { currentRebalanceAtom } from '../../../atoms'
import {
  areWeightsSavedAtom,
  isAuctionOngoingAtom,
  priceVolatilityAtom,
  rebalanceAuctionsAtom,
  rebalancePercentAtom,
  refreshNonceAtom,
  savedWeightsAtom,
} from '../atoms'
import useRebalanceParams, {
  useRebalancePrices,
} from '../hooks/use-rebalance-params'
import getRebalanceOpenAuction, {
  buildRebalanceOpenAuctionArrays,
} from '../utils/get-rebalance-open-auction'
import { TransactionButtonContainer } from '@/components/ui/transaction'

const auctionNumberAtom = atom((get) => {
  const auctions = get(rebalanceAuctionsAtom)
  return auctions.length + 1
})

const LaunchAuctionsButton = () => {
  const { t } = useLingui()
  const dtf = useAtomValue(indexDTFAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const rebalancePercent = useAtomValue(rebalancePercentAtom)
  const priceVolatility = useAtomValue(priceVolatilityAtom)
  const rebalanceParams = useRebalanceParams()
  const { isError: isPriceError } = useRebalancePrices()
  const [refreshNonce, setRefreshNonce] = useAtom(refreshNonceAtom)
  const auctionNumber = useAtomValue(auctionNumberAtom)
  const [isLaunching, setIsLaunching] = useState(false)
  const { writeContract, isError, isPending, data } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
    chainId: dtf?.chainId,
  })
  const isAuctionOngoing = useAtomValue(isAuctionOngoingAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const savedWeights = useAtomValue(savedWeightsAtom)
  const areWeightsSaved = useAtomValue(areWeightsSavedAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)

  const weightsToUse =
    isHybridDTF && areWeightsSaved && savedWeights && auctions.length === 0
      ? savedWeights
      : rebalanceParams?.initialWeights

  // Validate prices up front so a missing/0 price surfaces "cannot launch" before the click.
  const priceCheck = useMemo(() => {
    if (!rebalanceParams || !rebalance || !weightsToUse) return undefined
    return buildRebalanceOpenAuctionArrays(
      rebalanceParams.folioVersion,
      rebalance.rebalance.tokens,
      rebalanceParams.rebalance,
      rebalanceParams.currentAssets,
      rebalanceParams.initialAssets,
      rebalanceParams.initialPrices,
      weightsToUse,
      rebalanceParams.prices,
      rebalanceParams.tokenPriceVolatility,
      rebalanceParams.isTrackingDTF,
      isHybridDTF
    )
  }, [rebalanceParams, rebalance, weightsToUse, isHybridDTF])

  // A hard price-fetch error leaves params undefined — surface it, not an inert disabled button.
  const priceUnavailable = isPriceError || priceCheck?.ok === false
  const unavailableSymbol =
    priceCheck && !priceCheck.ok
      ? rebalance?.rebalance.tokens.find(
          (token) => token.address.toLowerCase() === priceCheck.token
        )?.symbol
      : undefined

  const isValid =
    !!rebalanceParams &&
    rebalancePercent > 0 &&
    rebalance &&
    dtf &&
    !priceUnavailable

  useEffect(() => {
    if (isSuccess) {
      toast.success(t`Auction launched successfully`)
      // Refresh nonce after 10s
      let timeout = setTimeout(() => {
        setRefreshNonce(refreshNonce + 1)
      }, 1000 * 10)
      // Remove loading after 15s
      let launchTimeout = setTimeout(() => {
        setIsLaunching(false)
      }, 1000 * 15)

      return () => {
        clearTimeout(timeout)
        clearTimeout(launchTimeout)
      }
    }
  }, [isSuccess])

  useEffect(() => {
    if (isError) {
      setIsLaunching(false)
      toast.error(t`Transaction rejected or failed`)
    }
  }, [isError])

  const handleStartAuctions = () => {
    if (!isValid || !rebalanceParams || !weightsToUse) return

    try {
      setIsLaunching(true)

      const [openAuctionArgs] = getRebalanceOpenAuction(
        rebalanceParams.folioVersion,
        rebalance.rebalance.tokens,
        rebalanceParams.rebalance,
        rebalanceParams.supply,
        rebalanceParams.initialSupply,
        rebalanceParams.currentAssets,
        rebalanceParams.initialAssets,
        rebalanceParams.initialPrices,
        weightsToUse,
        rebalanceParams.prices,
        rebalanceParams.isTrackingDTF,
        rebalanceParams.tokenPriceVolatility,
        rebalancePercent,
        isHybridDTF
      )

      writeContract({
        address: dtf?.id,
        abi: dtfIndexAbi,
        functionName: 'openAuction',
        args: [
          openAuctionArgs.rebalanceNonce,
          openAuctionArgs.tokens as Address[],
          openAuctionArgs.newWeights as any,
          openAuctionArgs.newPrices as any,
          openAuctionArgs.newLimits as any,
        ],
        chainId: dtf?.chainId,
      })
    } catch (e) {
      console.error('Error opening auction', e)
      setIsLaunching(false)
      toast.error(t`Error opening auctions`)
    }
  }

  return (
    <TransactionButtonContainer
      chain={dtf?.chainId}
      className="p-2"
      connectButtonClassName="w-full"
      switchChainButtonClassName="w-full"
    >
      {priceUnavailable && (
        <p
          data-testid="auctions-price-unavailable"
          className="text-center text-sm text-destructive px-2 pb-2"
        >
          {unavailableSymbol ? (
            <Trans>Price unavailable for {unavailableSymbol} — cannot launch</Trans>
          ) : (
            <Trans>Price unavailable — cannot launch</Trans>
          )}
        </p>
      )}
      <Button
        data-testid="auctions-launch-btn"
        className="rounded-xl py-6 w-full gap-2"
        disabled={!isValid || isPending || isAuctionOngoing || isLaunching}
        onClick={handleStartAuctions}
      >
        {isPending || isAuctionOngoing || isLaunching ? (
          <>
            <LoaderCircle size={16} className="animate-spin" />
            <span>
              {isAuctionOngoing ? (
                <Trans>Rebalance ongoing</Trans>
              ) : (
                <Trans>Launching...</Trans>
              )}
            </span>
          </>
        ) : (
          <>
            <span>
              <Trans>Start auction {auctionNumber}</Trans>
            </span>
            <span className="font-light">
              ({parseDuration(dtf?.auctionLength ?? 0, { round: true })})
            </span>
          </>
        )}
      </Button>
    </TransactionButtonContainer>
  )
}

export default LaunchAuctionsButton
