import { formatCurrency } from '@/utils'
import { BadgeDollarSign } from 'lucide-react'
import { IndexDTFPerformance } from '../../hooks/use-dtf-price-history'

const MarketCap = ({
  timeseries,
}: {
  timeseries: IndexDTFPerformance['timeseries']
}) => {
  return (
    <div className="flex items-center gap-1 justify-end sm:text-base text-sm">
      <BadgeDollarSign size={16} className="text-white/80" />
      <div className="text-white/80">MCap:</div>
      <div className="text-white">
        $
        {formatCurrency(timeseries[timeseries.length - 1]?.marketCap || 0, 1, {
          notation: 'compact',
          compactDisplay: 'short',
        })}
      </div>
    </div>
  )
}

export default MarketCap
