import dtfIndexAbi from '@/abis/dtf-index-abi'
import { Button } from '@/components/ui/button'
import { folioVersionAtom, indexDTFAtom } from '@/state/dtf/atoms'
import {
  prepareIndexDtfOpenAuctionUnrestricted,
  useIndexDtfIdentity,
} from '@reserve-protocol/react-sdk'
import { parseDuration, parseDurationShort } from '@/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { atom, useAtomValue } from 'jotai'
import { LoaderCircle, MousePointerBan } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { currentRebalanceAtom } from '../../../atoms'
import {
  isAuctionOngoingAtom,
  latestAuctionAtom,
  rebalanceAuctionsAtom,
  rebalancePercentAtom,
} from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import useLaunchReceipt from '../hooks/use-launch-receipt'
import Help from '@/components/ui/help'

const auctionNumberAtom = atom((get) => {
  const auctions = get(rebalanceAuctionsAtom)
  return auctions.length + 1
})

const CommunityLaunchAuctionsButton = () => {
  const { t } = useLingui()
  const dtf = useAtomValue(indexDTFAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const rebalancePercent = useAtomValue(rebalancePercentAtom)
  const rebalanceParams = useRebalanceParams()
  const auctionNumber = useAtomValue(auctionNumberAtom)
  const identity = useIndexDtfIdentity()
  const versionState = useAtomValue(folioVersionAtom)
  const latestAuction = useAtomValue(latestAuctionAtom)
  const major = versionState.status === 'ready' ? versionState.major : undefined
  const isSdkVersion = major === 5 || major === 6
  const isVersionReady =
    major === 4 || (isSdkVersion && latestAuction !== undefined)
  const [isLaunching, setIsLaunching] = useState(false)
  const { writeContract, isPending, data } = useWriteContract()
  const { isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash: data,
    chainId: dtf?.chainId,
  })
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number>(0)
  const isAuctionOngoing = useAtomValue(isAuctionOngoingAtom)
  const currentTime = Math.floor(Date.now() / 1000)
  const restrictedUntil = rebalance
    ? Number(rebalance.rebalance.restrictedUntil)
    : 0
  const isRestrictedPeriod = rebalance && restrictedUntil > currentTime
  const timeUntilPermissionless = isRestrictedPeriod
    ? restrictedUntil - currentTime
    : 0
  const isValid =
    !!rebalanceParams &&
    rebalancePercent > 0 &&
    rebalance &&
    dtf &&
    isVersionReady
  const isNotCommunityLaunch =
    rebalance?.rebalance.availableUntil === rebalance?.rebalance.restrictedUntil

  // Countdown effect for restricted period
  useEffect(() => {
    if (isRestrictedPeriod) {
      const interval = setInterval(() => {
        const newTime = Math.floor(Date.now() / 1000)
        const remaining = restrictedUntil - newTime
        setCountdown(Math.max(0, remaining))

        if (remaining <= 0) {
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isRestrictedPeriod, restrictedUntil])

  useLaunchReceipt(receipt?.blockNumber, () => setIsLaunching(false))

  useEffect(() => {
    if (isSuccess) setError(null)
  }, [isSuccess])

  const handleStartAuctions = () => {
    if (!isValid || !rebalanceParams) return

    try {
      setIsLaunching(true)
      setError(null)

      if (isSdkVersion) {
        const call = prepareIndexDtfOpenAuctionUnrestricted({
          address: dtf.id,
          chainId: identity.chainId,
          rebalanceNonce: BigInt(rebalance.rebalance.nonce),
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
        functionName: 'openAuctionUnrestricted',
        args: [BigInt(rebalance.rebalance.nonce)],
        chainId: dtf?.chainId,
      })
    } catch (e) {
      console.error('Error opening auction', e)
      setIsLaunching(false)
      setError(t`Error opening auctions`)
    }
  }

  if (isNotCommunityLaunch) {
    return (
      <div className="flex gap-2 items-center justify-center p-6 text-center">
        <div className="text-sm text-muted-foreground">
          <Trans>Community launch is not available for this rebalance</Trans>
        </div>
        <Help content={t`Only the auction launcher can start auctions`} />
      </div>
    )
  }

  if (isRestrictedPeriod && timeUntilPermissionless > 0) {
    return (
      <div className="flex flex-col gap-2 p-2 text-center">
        <Button className="rounded-xl w-full py-6 gap-2" disabled={true}>
          <MousePointerBan size={14} strokeWidth={1.5} />
          <span className="text-sm text-muted-foreground">
            <Trans>
              Permissionless in:{' '}
              <span className="font-bold ">
                {parseDurationShort(countdown, { round: true })
                  .replaceAll(' ', '')
                  .replaceAll(',', ' ')}
              </span>
            </Trans>
          </span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <Button
        data-testid="auctions-community-launch-btn"
        data-ongoing={isAuctionOngoing}
        className="rounded-xl w-full py-6 gap-2"
        disabled={
          !isValid ||
          isPending ||
          isAuctionOngoing ||
          isLaunching ||
          isRestrictedPeriod
        }
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
      {error && <div className="text-red-500">{error}</div>}
    </div>
  )
}

export default CommunityLaunchAuctionsButton
