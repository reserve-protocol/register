import { cn } from '@/lib/utils'
import { Check, LoaderCircle, X } from 'lucide-react'
import { AssetTrade, TRADE_STATE } from '../atoms'

const TradeCompletedStatus = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'flex items-center gap-1 rounded-lg text-primary border py-2 px-4',
      className
    )}
  >
    <Check size={16} />
    <span className="font-semibold">Traded</span>
  </div>
)

const TradeOngoingStatus = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'flex items-center gap-1 rounded-lg text-primary border py-2 px-4',
      className
    )}
  >
    <LoaderCircle size={16} className="animate-spin" />
    <span className="font-semibold">Ongoing</span>
  </div>
)

const TradeExpiredStatus = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'flex items-center gap-1 rounded-lg text-legend bg-muted py-2 px-4',
      className
    )}
  >
    <X size={16} />
    <span className="font-semibold">Expired</span>
  </div>
)

const TradeButtonStates = ({
  trade,
  className,
}: {
  trade: AssetTrade
  className?: string
}) => {
  if (trade.state === TRADE_STATE.EXPIRED) {
    return <TradeExpiredStatus className={className} />
  }

  if (trade.state === TRADE_STATE.COMPLETED) {
    return <TradeCompletedStatus className={className} />
  }

  if (trade.state === TRADE_STATE.RUNNING) {
    return <TradeOngoingStatus className={className} />
  }

  return null
}

export default TradeButtonStates
