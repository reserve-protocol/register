import DecimalDisplay from '@/components/decimal-display'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPercentage } from '@/utils'
import { atom, useAtomValue } from 'jotai'
import { ArrowLeftRight, Target } from 'lucide-react'
import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { rebalanceAuctionsAtom, rebalanceMetricsAtom } from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'

const trackingErrorAtom = atom((get) => {
  const metrics = get(rebalanceMetricsAtom)

  if (!metrics) return undefined

  return 100 - metrics.absoluteProgression
})

const useTotalValueTraded = () => {
  const rebalanceParams = useRebalanceParams()
  const auctions = useAtomValue(rebalanceAuctionsAtom)

  return useMemo(() => {
    if (!rebalanceParams || auctions.length === 0) return 0

    const { prices } = rebalanceParams

    const totalValueTraded = auctions.reduce((acc, auction) => {
      return (
        acc +
        auction.bids.reduce((acc, bid) => {
          const price = prices[bid.sellToken.address]
          const sellAmount = Number(
            formatUnits(BigInt(bid.sellAmount), bid.sellToken.decimals)
          )

          if (!price || sellAmount === 0) return acc

          return acc + price.currentPrice * sellAmount
        }, 0)
      )
    }, 0)

    return totalValueTraded
  }, [rebalanceParams, auctions])
}

const RebalanceOverview = () => {
  const trackingError = useAtomValue(trackingErrorAtom)
  const totalValueTraded = useTotalValueTraded()

  return (
    <div className="border-t border-secondary p-4 md:p-6">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 mr-auto text-legend">
          <ArrowLeftRight className="h-4 w-4" />
          <span>Total value traded:</span>
        </div>
        <span>
          $
          <DecimalDisplay value={totalValueTraded} />
        </span>
      </div>
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <div className="flex items-center gap-2 mr-auto text-legend">
          <Target className="h-4 w-4" />
          <span>Current basket deviation:</span>
        </div>
        {trackingError ? (
          <span>-{formatPercentage(trackingError)}</span>
        ) : (
          <Skeleton className="w-16 h-4" />
        )}
      </div>
    </div>
  )
}

export default RebalanceOverview
