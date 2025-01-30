import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { formatPercentage, getCurrentTime, shortenString } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Link,
  Loader,
  LoaderCircle,
  Square,
  SquareCheck,
  X,
} from 'lucide-react'
import {
  AssetTrade,
  setTradeVolatilityAtom,
  VOLATILITY_OPTIONS,
  dtfTradeVolatilityAtom,
  selectedTradesAtom,
  addSelectedTradeAtom,
  TRADE_STATE,
} from '../atoms'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'

const TradeCompletedStatus = ({ className }: { className?: string }) => {
  return (
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
}

const TradeOngoingStatus = ({ className }: { className?: string }) => {
  return (
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
}

const TradeExpiredStatus = ({ className }: { className?: string }) => {
  return (
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
}

const TradeButton = ({
  trade,
  className,
}: {
  trade: AssetTrade
  className?: string
}) => {
  const isSelected = !!useAtomValue(selectedTradesAtom)[trade.id]
  const setSelectedTrades = useSetAtom(addSelectedTradeAtom)

  const handleLaunch = () => {
    setSelectedTrades(trade.id)
  }

  if (trade.state === TRADE_STATE.EXPIRED) {
    return <TradeExpiredStatus className={className} />
  }

  if (trade.state === TRADE_STATE.COMPLETED) {
    return <TradeCompletedStatus className={className} />
  }

  if (trade.state === TRADE_STATE.RUNNING) {
    return <TradeOngoingStatus className={className} />
  }

  if (trade.state === TRADE_STATE.COMPLETED) {
    return (
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
  }

  return (
    <Button className={cn('sm:py-6 gap-1', className)} onClick={handleLaunch}>
      {isSelected ? (
        <SquareCheck size={16} className="relative" />
      ) : (
        <Square size={16} className="relative" />
      )}
      Launch
    </Button>
  )
}

const ProposedTradeVolatility = ({ tradeId }: { tradeId: string }) => {
  const setVolatility = useSetAtom(setTradeVolatilityAtom)
  const volatility = useAtomValue(dtfTradeVolatilityAtom)

  return (
    <div className="border rounded-xl p-0 sm:p-1">
      <ToggleGroup
        type="single"
        className="bg-muted-foreground/10 p-1 rounded-xl text-sm"
        value={volatility[tradeId] || VOLATILITY_OPTIONS.LOW}
        onValueChange={(value) => {
          setVolatility([tradeId, value])
        }}
      >
        {Object.values(VOLATILITY_OPTIONS).map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            className="px-1 sm:px-2 h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
          >
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

const Share = ({
  share,
  prefix,
}: {
  share: number | undefined
  prefix?: string
}) => {
  if (!share) return <Skeleton className="h-8 w-14" />

  return (
    <h4 className="font-bold text-2xl">
      {prefix}
      {formatPercentage(share)}
    </h4>
  )
}

const ShareRange = ({
  from,
  to,
}: {
  from: number | undefined
  to: number | undefined
}) => {
  if (!from || !to) return <Skeleton className="h-8 w-14" />

  return (
    <span className="text-xs whitespace-nowrap">
      from {formatPercentage(from)} to {formatPercentage(to)}
    </span>
  )
}

const TradePreview = ({ trade }: { trade: AssetTrade }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center w-full sm:w-80 mr-auto">
      <div className="flex flex-col gap-1">
        <span>Sell ${trade.sell.symbol}</span>
        <div className="flex items-center gap-1">
          <TokenLogo address={trade.sell.address} chain={chainId} size="lg" />
          <Share share={trade.deltaSellShare} />
        </div>
        <ShareRange from={trade.currentSellShare} to={trade.sellShare} />
      </div>
      <div className="bg-muted rounded-full p-1 text-legend">
        <ArrowRight size={18} />
      </div>
      <div className="flex flex-col gap-1 items-end">
        <span>Buy ${trade.buy.symbol}</span>
        <div className="flex items-center gap-1">
          <Share share={trade.deltaBuyShare} prefix="+" />
          <TokenLogo address={trade.buy.address} chain={chainId} size="lg" />
        </div>
        <ShareRange from={trade.currentBuyShare} to={trade.buyShare} />
      </div>
    </div>
  )
}

// Display volatility options / hash / or nothing!
const AuctionContext = ({ trade }: { trade: AssetTrade }) => {
  const chainId = useAtomValue(chainIdAtom)

  // Auction launcher state!
  if (trade.state === TRADE_STATE.PENDING) {
    return <ProposedTradeVolatility tradeId={trade.id} />
  }

  if (trade.state === TRADE_STATE.COMPLETED && trade.closedTransactionHash) {
    return (
      <Link
        className="flex items-center text-primary cursor-pointer gap-1"
        to={getExplorerLink(
          trade.closedTransactionHash,
          chainId,
          ExplorerDataType.TRANSACTION
        )}
      >
        <div className="p-1 rounded-ful bg-primary text-primary-foreground">
          <Check size={12} />
        </div>
        <span>{shortenString(trade.closedTransactionHash)}</span>
        <div className="p-1 rounded-full bg-muted text-foreground">
          <ArrowUpRight size={12} />
        </div>
      </Link>
    )
  }

  return null
}

const AuctionItem = ({ trade }: { trade: AssetTrade }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl border">
    <div className="flex items-center flex-grow flex-wrap gap-2">
      <TradePreview trade={trade} />
      <div className="flex items-center gap-2 w-full md:w-auto">
        <AuctionContext trade={trade} />
        <TradeButton className="ml-auto flex sm:hidden" trade={trade} />
      </div>
    </div>
    <TradeButton trade={trade} className="hidden sm:flex flex-shrink-0" />
  </div>
)

export default AuctionItem
