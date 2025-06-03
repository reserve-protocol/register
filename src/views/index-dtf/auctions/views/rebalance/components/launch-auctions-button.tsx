import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import { Button } from '@/components/ui/button'
import { indexDTFAtom, indexDTFRebalanceControlAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { Address } from 'viem'
import { useWriteContract } from 'wagmi'
import { currentRebalanceAtom } from '../../../atoms'
import { rebalancePercentAtom, rebalanceStateAtom } from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import getRebalanceOpenAuction from '../utils/get-rebalance-open-auction'

const LaunchAuctionsButton = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const rebalancePercent = useAtomValue(rebalancePercentAtom)
  const rebalanceParams = useRebalanceParams()
  const { writeContract, isError, isPending, data } = useWriteContract()
  const [error, setError] = useState<string | null>(null)

  const isValid = !!rebalanceParams && rebalancePercent > 0 && rebalance && dtf

  const handleStartAuctions = () => {
    if (!isValid || !rebalanceParams) return

    try {
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
      setError('Error opening auctions')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="mt-4 w-full"
        disabled={!isValid || isPending}
        onClick={handleStartAuctions}
      >
        {isPending ? (
          <>
            <LoaderCircle size={16} className="animate-spin" />
            <span>Launching...</span>
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
