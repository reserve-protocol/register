import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { formatPercentage, getCurrentTime, shortenString } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Link,
  LoaderCircle,
  Square,
  SquareCheck,
  X,
} from 'lucide-react'
import {
  addSelectedTradeAtom,
  AssetTrade,
  dtfTradeMapAtom,
  dtfTradeVolatilityAtom,
  isAuctionLauncherAtom,
  selectedTradesAtom,
  setTradeVolatilityAtom,
  TRADE_STATE,
  VOLATILITY_OPTIONS,
} from '../atoms'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useEffect } from 'react'
import { indexDTFAtom } from '@/state/dtf/atoms'
import dtfIndexAbi from '@/abis/dtf-index-abi'
import { Address } from 'viem'

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

// Updates the trade state!
export const updateTradeStateAtom = atom(null, (get, set, tradeId: string) => {
  const dtf = get(indexDTFAtom)
  const tradeMap = get(dtfTradeMapAtom)

  // Edge case if we are here, these exists
  if (!tradeMap || !dtf) return

  const currentTime = getCurrentTime()

  set(dtfTradeMapAtom, {
    ...tradeMap,
    [tradeId]: {
      ...tradeMap[tradeId],
      state: TRADE_STATE.RUNNING,
      start: currentTime,
      end: currentTime + dtf.auctionLength,
    },
  })
})

const TradeButton = ({
  trade,
  className,
}: {
  trade: AssetTrade
  className?: string
}) => {
  const isAuctionLauncher = useAtomValue(isAuctionLauncherAtom)
  const updateTradeState = useSetAtom(updateTradeStateAtom)
  const { writeContract, isError, isPending, data } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  })

  const isLoading = isPending || (!!data && !isSuccess && !isError)
  const canLaunch =
    trade.state === TRADE_STATE.AVAILABLE ||
    (isAuctionLauncher && trade.state === TRADE_STATE.PENDING)

  // TODO: Show sonnet
  useEffect(() => {
    if (isSuccess) {
      updateTradeState(trade.id)
    }
  }, [isSuccess])

  const handleLaunch = () => {
    if (!canLaunch || getCurrentTime() >= trade.launchTimeout + 5) return

    // Trade id has the dtfId as prefix
    const [dtfAddress, tradeId] = trade.id.split('-')

    // Open trade
    if (isAuctionLauncher) {
      // TODO: run helper to get estimates in case the price is deferred
      writeContract({
        address: dtfAddress as Address,
        abi: dtfIndexAbi,
        functionName: 'openAuction',
        args: [
          BigInt(tradeId),
          trade.sellLimitSpot,
          trade.buyLimitSpot,
          trade.startPrice,
          trade.endPrice,
        ],
      })
    } else {
      writeContract({
        address: dtfAddress as Address,
        abi: dtfIndexAbi,
        functionName: 'openAuctionPermissionlessly',
        args: [BigInt(tradeId)],
      })
    }
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
    <Button
      className={cn('sm:py-6 gap-1', className)}
      disabled={isLoading || !canLaunch}
      onClick={handleLaunch}
    >
      {isLoading ? (
        <>
          <LoaderCircle size={16} className="animate-spin" />
          <span>Launching...</span>
        </>
      ) : (
        'Launch'
      )}
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
  if (from == undefined || to === undefined)
    return <Skeleton className="h-8 w-14" />

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
          <TokenLogo
            symbol={trade.sell.symbol}
            address={trade.sell.address}
            chain={chainId}
            size="lg"
          />
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
          <TokenLogo
            symbol={trade.buy.symbol}
            address={trade.buy.address}
            chain={chainId}
            size="lg"
          />
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
  <>
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
  </>
)

export default AuctionItem
