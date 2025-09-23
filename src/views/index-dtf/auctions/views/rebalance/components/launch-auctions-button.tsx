import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import { Button } from '@/components/ui/button'
import { indexDTFAtom, isHybridDTFAtom } from '@/state/dtf/atoms'
import { parseDuration } from '@/utils'
import { atom, useAtom, useAtomValue } from 'jotai'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import useRebalanceParams from '../hooks/use-rebalance-params'
import getRebalanceOpenAuction from '../utils/get-rebalance-open-auction'

const auctionNumberAtom = atom((get) => {
  const auctions = get(rebalanceAuctionsAtom)
  return auctions.length + 1
})

const LaunchAuctionsButton = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const rebalancePercent = useAtomValue(rebalancePercentAtom)
  const priceVolatility = useAtomValue(priceVolatilityAtom)
  const rebalanceParams = useRebalanceParams()
  const [refreshNonce, setRefreshNonce] = useAtom(refreshNonceAtom)
  const auctionNumber = useAtomValue(auctionNumberAtom)
  const [isLaunching, setIsLaunching] = useState(false)
  const { writeContract, isError, isPending, data } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  })
  const isAuctionOngoing = useAtomValue(isAuctionOngoingAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const savedWeights = useAtomValue(savedWeightsAtom)
  const areWeightsSaved = useAtomValue(areWeightsSavedAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)
  const isValid = !!rebalanceParams && rebalancePercent > 0 && rebalance && dtf

  useEffect(() => {
    if (isSuccess) {
      toast.success('Auction launched successfully')
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
      toast.error('Transaction rejected or failed')
    }
  }, [isError])

  const handleStartAuctions = () => {
    if (!isValid || !rebalanceParams) return

    try {
      setIsLaunching(true)

      // Use saved weights for hybrid DTFs on first auction if available
      const weightsToUse =
        isHybridDTF && areWeightsSaved && savedWeights && auctions.length === 0
          ? savedWeights
          : rebalanceParams.initialWeights

      const [openAuctionArgs] = getRebalanceOpenAuction(
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
      toast.error('Error opening auctions')
    }
  }

  return (
    <div className="p-2">
      <Button
        className="rounded-xl py-6 w-full gap-2"
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
          <>
            <span>Start auction {auctionNumber}</span>
            <span className="font-light">
              ({parseDuration(dtf?.auctionLength ?? 0, { round: true })})
            </span>
          </>
        )}
      </Button>
    </div>
  )
}

export default LaunchAuctionsButton
