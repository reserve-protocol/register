import { ArrowLeftRight, ArrowRight, Target } from 'lucide-react'
import { rebalanceAuctionsAtom, rebalanceMetricsAtom } from '../atoms'
import { atom, useAtomValue } from 'jotai'
import { formatCurrency, formatPercentage } from '@/utils'
import { Skeleton } from '@/components/ui/skeleton'
import useRebalanceParams from '../hooks/use-rebalance-params'
import { useMemo } from 'react'
import { formatUnits } from 'viem'
import DecimalDisplay from '@/components/decimal-display'

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
    <div className="grid grid-cols-2 border-t border-secondary">
      <div className="flex flex-col p-4 md:p-6 border-r border-secondary">
        <div className="flex items-center mb-4 md:mb-6">
          <Target className="h-4 w-4" />
          <ArrowRight className="h-4 w-4 ml-auto" />
        </div>
        <h4 className="text-legend text-sm">Tracking error</h4>
        {trackingError ? (
          <span>-{formatPercentage(trackingError)}</span>
        ) : (
          <Skeleton className="w-16 h-4" />
        )}
      </div>
      <div className="flex flex-col p-4 md:p-6">
        <div className="flex items-center mb-4 md:mb-6">
          <ArrowLeftRight className="h-4 w-4" />
          <ArrowRight className="h-4 w-4 ml-auto" />
        </div>
        <h4 className="text-legend text-sm">Total value traded</h4>
        <span>
          $
          <DecimalDisplay value={totalValueTraded} />
        </span>
      </div>
    </div>
  )
}

export default RebalanceOverview
