import DecimalDisplay from '@/components/decimal-display'
import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatPercentage, getCurrentTime } from '@/utils'
import { atom, useAtomValue } from 'jotai'
import { ArrowRight } from 'lucide-react'
import { formatUnits } from 'viem'
import {
  AssetTrade,
  dtfTradeMapAtom,
  expectedBasketAtom,
  TRADE_STATE,
} from '../atoms'
import LaunchTradeButton from './launch-trade-button'

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

const Share = ({
  share,
  prefix,
}: {
  share: number | undefined
  prefix?: string
}) => {
  if (share === undefined) return <Skeleton className="h-8 w-14" />

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
  const expectedBasket = useAtomValue(expectedBasketAtom)?.basket
  const isCompleted = trade.state === TRADE_STATE.COMPLETED

  const delta = Math.min(
    Math.abs(expectedBasket?.[trade.sell.address]?.delta || 0),
    Math.abs(Math.max(expectedBasket?.[trade.buy.address]?.delta || 0, 0))
  )

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center w-full sm:w-80 mr-auto">
      <div className="flex flex-col gap-1">
        <span>
          {isCompleted ? 'Sold' : 'Sell'} ${trade.sell.symbol}
        </span>
        <div className="flex items-center gap-1">
          <TokenLogo
            symbol={trade.sell.symbol}
            address={trade.sell.address}
            chain={chainId}
            size="lg"
          />
          {isCompleted ? (
            <DecimalDisplay
              value={formatUnits(trade.soldAmount, trade.sell.decimals)}
              decimals={1}
              compact
              className="font-bold text-2xl"
            />
          ) : (
            <Share share={-delta} />
          )}
        </div>
        {!isCompleted && (
          <ShareRange
            from={
              expectedBasket?.[trade.sell.address]?.currentShares
                ? Number(expectedBasket?.[trade.sell.address]?.currentShares)
                : undefined
            }
            to={
              expectedBasket?.[trade.sell.address]?.targetShares
                ? Number(expectedBasket?.[trade.sell.address]?.currentShares) -
                  delta
                : undefined
            }
          />
        )}
      </div>
      <div className="bg-muted rounded-full p-1 text-legend">
        <ArrowRight size={18} />
      </div>
      <div className="flex flex-col gap-1 items-end">
        <span>
          {isCompleted ? 'Bought' : 'Buy'} ${trade.buy.symbol}
        </span>
        <div className="flex items-center gap-1">
          {isCompleted ? (
            <DecimalDisplay
              value={formatUnits(trade.boughtAmount, trade.buy.decimals)}
              decimals={1}
              compact
              className="font-bold text-2xl"
            />
          ) : (
            <Share share={delta} prefix="+" />
          )}

          <TokenLogo
            symbol={trade.buy.symbol}
            address={trade.buy.address}
            chain={chainId}
            size="lg"
          />
        </div>
        {!isCompleted && (
          <ShareRange
            from={
              expectedBasket?.[trade.buy.address]?.currentShares
                ? Number(expectedBasket?.[trade.buy.address]?.currentShares)
                : undefined
            }
            to={
              expectedBasket?.[trade.buy.address]?.targetShares
                ? Number(expectedBasket?.[trade.buy.address]?.currentShares) +
                  delta
                : undefined
            }
          />
        )}
      </div>
    </div>
  )
}

const AuctionItem = ({ trade }: { trade: AssetTrade }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl border">
    <div className="flex items-center flex-grow flex-wrap gap-2">
      <TradePreview trade={trade} />
      <div className="flex items-center gap-2 w-full md:w-auto">
        <LaunchTradeButton className="ml-auto flex sm:hidden" trade={trade} />
      </div>
    </div>
    <LaunchTradeButton trade={trade} className="hidden sm:flex flex-shrink-0" />
  </div>
)

export default AuctionItem
