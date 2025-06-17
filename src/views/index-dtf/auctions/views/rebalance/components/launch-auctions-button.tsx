import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import { Button } from '@/components/ui/button'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { currentRebalanceAtom } from '../../../atoms'
import {
  isAuctionOngoingAtom,
  rebalancePercentAtom,
  refreshNonceAtom,
} from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import getRebalanceOpenAuction from '../utils/get-rebalance-open-auction'

const LaunchAuctionsButton = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const rebalancePercent = useAtomValue(rebalancePercentAtom)
  const rebalanceParams = useRebalanceParams()
  const [refreshNonce, setRefreshNonce] = useAtom(refreshNonceAtom)
  const [isLaunching, setIsLaunching] = useState(false)
  const { writeContract, isError, isPending, data } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  })
  const [error, setError] = useState<string | null>(null)
  const isAuctionOngoing = useAtomValue(isAuctionOngoingAtom)
  const isValid = !!rebalanceParams && rebalancePercent > 0 && rebalance && dtf

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
      const [openAuctionArgs] = getRebalanceOpenAuction(
        rebalance.rebalance.tokens,
        rebalanceParams.rebalance,
        rebalanceParams.supply,
        rebalanceParams.currentFolio,
        rebalanceParams.initialFolio,
        rebalanceParams.prices,
        rebalanceParams.isTrackingDTF,
        rebalancePercent
      )

      writeContract({
        address: dtf?.id,
        abi: dtfIndexAbiV4,
        functionName: 'openAuction',
        args: [
          openAuctionArgs.rebalanceNonce,
          openAuctionArgs.tokens as Address[],
          openAuctionArgs.newWeights as any,
          openAuctionArgs.newPrices as any,
          openAuctionArgs.newLimits as any,
        ],
      })
    } catch (e) {
      console.error('Error opening auction', e)
      setIsLaunching(false)
      setError('Error opening auctions')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="mt-4 w-full gap-2"
        disabled={!isValid || isPending || isAuctionOngoing || isLaunching}
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
          'Start auctions'
        )}
      </Button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  )
}

export default LaunchAuctionsButton
