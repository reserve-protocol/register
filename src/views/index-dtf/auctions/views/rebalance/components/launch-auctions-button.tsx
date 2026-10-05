import dtfIndexAbi from '@/abis/dtf-index-abi'
import { Button } from '@/components/ui/button'
import {
  folioVersionAtom,
  indexDTFAtom,
  isHybridDTFAtom,
} from '@/state/dtf/atoms'
import {
  prepareIndexDtfOpenAuction,
  useIndexDtfIdentity,
} from '@reserve-protocol/react-sdk'
import { parseDuration } from '@/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { atom, useAtomValue } from 'jotai'
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
  latestAuctionAtom,
  rebalancePercentAtom,
  savedWeightsAtom,
} from '../atoms'
import useRebalanceParams, {
  useRebalancePrices,
} from '../hooks/use-rebalance-params'
import getRebalanceOpenAuction, {
  buildRebalanceOpenAuctionArrays,
} from '../utils/get-rebalance-open-auction'
import { toIndexDtfWriteVersion } from '../utils/transforms'
import useLaunchPreflight, {
  LAUNCH_BLOCKER_MESSAGES,
} from '../hooks/use-launch-preflight'
import {
  isPriceSnapshotStale,
  type LaunchBlocker,
} from '../utils/launch-readiness'
import useLaunchReceipt from '../hooks/use-launch-receipt'
import useRebalanceAuctionLength from '../hooks/use-rebalance-auction-length'
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
  const {
    isError: isPriceError,
    dataUpdatedAt: pricesUpdatedAt,
    refetch: refetchPrices,
  } = useRebalancePrices()
  const auctionNumber = useAtomValue(auctionNumberAtom)
  const identity = useIndexDtfIdentity()
  const versionState = useAtomValue(folioVersionAtom)
  const latestAuction = useAtomValue(latestAuctionAtom)
  const major = versionState.status === 'ready' ? versionState.major : undefined
  const {
    auctionLength,
    isReady: isAuctionLengthReady,
    isError: isAuctionLengthError,
  } = useRebalanceAuctionLength()
  const { hasLiveStateError, revalidate } = useLaunchPreflight('launcher')
  const [blocker, setBlocker] = useState<LaunchBlocker>()
  const isLiveStateUnavailable = hasLiveStateError || isAuctionLengthError
  const [isLaunching, setIsLaunching] = useState(false)
  const { writeContract, isError, isPending, data } = useWriteContract()
  const {
    isSuccess,
    isError: isReceiptError,
    data: receipt,
  } = useWaitForTransactionReceipt({
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

  // v5/v6 wait for the RPC latest-auction read so the ongoing gate is chain truth before a send.
  const isVersionReady =
    major === 4 ||
    ((major === 5 || major === 6) &&
      latestAuction !== undefined &&
      isAuctionLengthReady)

  const isValid =
    !!rebalanceParams &&
    rebalancePercent > 0 &&
    rebalance &&
    dtf &&
    !priceUnavailable &&
    !isLiveStateUnavailable &&
    isVersionReady

  useLaunchReceipt(receipt?.blockNumber, () => setIsLaunching(false))

  useEffect(() => {
    if (isSuccess) toast.success(t`Auction launched successfully`)
  }, [isSuccess])

  useEffect(() => {
    if (isError) {
      setIsLaunching(false)
      toast.error(t`Transaction rejected or failed`)
    }
  }, [isError])

  // wagmi throws on a reverted receipt (and on a failed receipt poll), so the success path never settles it.
  useEffect(() => {
    if (isReceiptError) {
      setIsLaunching(false)
      toast.error(t`Couldn't confirm the launch — check your wallet before retrying`)
    }
  }, [isReceiptError, t])

  const handleStartAuctions = async () => {
    if (!isValid || !rebalanceParams || !weightsToUse) return

    setIsLaunching(true)
    setBlocker(undefined)
    try {
      const pageNonce = BigInt(rebalance.rebalance.nonce)
      const pricesStale = isPriceSnapshotStale(pricesUpdatedAt, Date.now())
      if (pricesStale) void refetchPrices()
      // The args carry the render-time params (nonce, balances, length, prices); any re-read that moved them needs a fresh render first.
      const found =
        (await revalidate(pageNonce, {
          supply: rebalanceParams.supply,
          currentAssets: rebalanceParams.currentAssets,
          auctionLength,
        })) ??
        (rebalanceParams.rebalance.nonce !== pageNonce || pricesStale
          ? 'state-refreshed'
          : undefined)
      if (found) {
        setBlocker(found)
        setIsLaunching(false)
        toast.error(t(LAUNCH_BLOCKER_MESSAGES[found]))
        return
      }

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
        isHybridDTF,
        auctionLength
      )

      const writeVersion = toIndexDtfWriteVersion(rebalanceParams.folioVersion)
      if (writeVersion) {
        const call = prepareIndexDtfOpenAuction({
          address: dtf.id,
          chainId: identity.chainId,
          version: writeVersion,
          args: openAuctionArgs,
        })
        writeContract({
          address: call.contract.address,
          abi: call.contract.abi,
          functionName: call.contract.functionName,
          args: call.contract.args as any,
          chainId: call.chainId,
        })
        return
      }

      // v4 stays Register-local by decision.
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
      {isLiveStateUnavailable && (
        <p
          data-testid="auctions-live-state-unavailable"
          className="text-center text-sm text-destructive px-2 pb-2"
        >
          <Trans>Live auction state unavailable — retrying before launch</Trans>
        </p>
      )}
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
        data-ongoing={isAuctionOngoing}
        data-blocker={blocker}
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
