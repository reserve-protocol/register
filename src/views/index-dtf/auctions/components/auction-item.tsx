import { Button } from '@/components/ui/button'
import { AssetTrade, tradeVolatilityAtom } from '../atoms'
import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { formatPercentage } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { ArrowRight, Square } from 'lucide-react'

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

const VOLATILITY_OPTIONS = ['Low', 'Medium', 'High']

const ProposedTradeVolatility = ({ index }: { index: number }) => {
  const [volatility, setVolatility] = useAtom(tradeVolatilityAtom)

  return (
    <div className="border rounded-xl p-0 sm:p-1">
      <ToggleGroup
        type="single"
        className="bg-muted-foreground/10 p-1 rounded-xl text-sm"
        value={volatility[index]?.toString() || '0'}
        onValueChange={(value) => {
          // setVolatility((prev) => {
          //   const newVolatility = [...prev]
          //   newVolatility[index] = Number(value)
          //   return newVolatility
          // })
        }}
      >
        {VOLATILITY_OPTIONS.map((option, index) => (
          <ToggleGroupItem
            key={option}
            value={index.toString()}
            className="px-1 sm:px-2 h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
          >
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
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

const TradeButton = ({
  trade,
  className,
}: {
  trade: AssetTrade
  className?: string
}) => {
  const handleLaunch = () => {
    console.log('launch')
  }

  return (
    <Button className={cn('sm:py-6 gap-1', className)} onClick={handleLaunch}>
      <Square size={16} className="relative" /> Launch
    </Button>
  )
}

const AuctionItem = ({ trade }: { trade: AssetTrade }) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border">
      <div className="flex items-center flex-grow flex-wrap gap-2">
        <TradePreview trade={trade} />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <ProposedTradeVolatility index={0} />
          <TradeButton className="ml-auto flex sm:hidden" trade={trade} />
        </div>
      </div>
      <TradeButton trade={trade} className="hidden sm:flex flex-shrink-0" />
    </div>
  )
}

export default AuctionItem
