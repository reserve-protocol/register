import dtfIndexAbi from '@/abis/dtf-index-abi'
import { Button } from '@/components/ui/button'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { parseDuration, parseDurationShort } from '@/utils'
import { atom, useAtom, useAtomValue } from 'jotai'
import { LoaderCircle, MousePointerBan } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { currentRebalanceAtom } from '../../../atoms'
import {
  isAuctionOngoingAtom,
  rebalanceAuctionsAtom,
  rebalancePercentAtom,
  refreshNonceAtom,
} from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import Help from '@/components/ui/help'

const auctionNumberAtom = atom((get) => {
  const auctions = get(rebalanceAuctionsAtom)
  return auctions.length + 1
})

const CommunityLaunchAuctionsButton = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const rebalancePercent = useAtomValue(rebalancePercentAtom)
  const rebalanceParams = useRebalanceParams()
  const [refreshNonce, setRefreshNonce] = useAtom(refreshNonceAtom)
  const auctionNumber = useAtomValue(auctionNumberAtom)
  const [isLaunching, setIsLaunching] = useState(false)
  const { writeContract, isError, isPending, data } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
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
  const isValid = !!rebalanceParams && rebalancePercent > 0 && rebalance && dtf
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

  useEffect(() => {
    if (isSuccess) {
      setError(null)
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

  const handleStartAuctions = () => {
    if (!isValid || !rebalanceParams) return

    try {
      setIsLaunching(true)
      setError(null)

      writeContract({
        address: dtf?.id,
        abi: dtfIndexAbi,
        functionName: 'openAuctionUnrestricted',
        args: [BigInt(rebalance.rebalance.nonce)],
      })
    } catch (e) {
      console.error('Error opening auction', e)
      setIsLaunching(false)
      setError('Error opening auctions')
    }
  }

  if (isNotCommunityLaunch) {
    return (
      <div className="flex gap-2 items-center justify-center p-6 text-center">
        <div className="text-sm text-muted-foreground">
          Community launch is not available for this rebalance
        </div>
        <Help content="Only the auction launcher can start auctions" />
      </div>
    )
  }

  if (isRestrictedPeriod && timeUntilPermissionless > 0) {
    return (
      <div className="flex flex-col gap-2 p-2 text-center">
        <Button className="rounded-xl w-full py-6 gap-2" disabled={true}>
          <MousePointerBan size={14} strokeWidth={1.5} />
          <span className="text-sm text-muted-foreground">
            Permissionless in:{' '}
            <span className="font-bold ">
              {parseDurationShort(countdown, { round: true })
                .replaceAll(' ', '')
                .replaceAll(',', ' ')}
            </span>
          </span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <Button
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
              {isAuctionOngoing ? 'Rebalance ongoing' : 'Launching...'}
            </span>
          </>
        ) : (
          <>
            <span>Start auction {auctionNumber}</span>
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
