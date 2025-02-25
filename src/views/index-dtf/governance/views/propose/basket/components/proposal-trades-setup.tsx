import TokenLogo from '@/components/token-logo'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Auction } from '@/lib/index-rebalance/types'
import { getBasketPortion } from '@/lib/index-rebalance/utils'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { formatPercentage } from '@/utils'
import { atom, useAtom, useAtomValue } from 'jotai'
import {
  priceMapAtom,
  proposedIndexBasketAtom,
  proposedInxexTradesAtom,
  tradeVolatilityAtom,
} from '../atoms'
import { iTokenAddressAtom } from '@/state/dtf/atoms'

type ProposedTradeWithMeta = Auction & {
  index: number
  token: Token
  shares: number
}

type SellData = {
  token: Token
  amount: bigint
  percent: number
  shares: string
}

type IProposedTradeGroup = {
  sell: SellData
  trades: ProposedTradeWithMeta[]
}

type OrganizedTrades = Record<string, IProposedTradeGroup>

const organizedTradesAtom = atom((get) => {
  const dtf = get(iTokenAddressAtom)
  const basket = get(proposedIndexBasketAtom)
  const trades = get(proposedInxexTradesAtom)
  const priceMap = get(priceMapAtom)
  const dtfPrice = priceMap[dtf?.toLowerCase() ?? '']

  if (!basket || !trades || !trades.length || !dtfPrice) return undefined

  // Group trades by sell token
  return trades.reduce((acc, trade, index) => {
    if (!acc[trade.sell]) {
      acc[trade.sell] = {
        trades: [],
        sell: {
          token: basket[trade.sell].token,
          amount: 0n,
          percent: 0,
          shares: basket[trade.sell].currentShares,
        },
      }
    }

    acc[trade.sell].trades.push({
      ...trade,
      index,
      token: basket[trade.buy].token,
      shares:
        getBasketPortion(
          trade.buyLimit.spot,
          BigInt(basket[trade.buy].token.decimals),
          priceMap[trade.buy],
          dtfPrice
        )[0] *
          100 -
        Number(basket[trade.buy].currentShares),
    })
    acc[trade.sell].sell.amount += trade.sellLimit.spot
    acc[trade.sell].sell.percent =
      getBasketPortion(
        trade.sellLimit.spot,
        BigInt(basket[trade.sell].token.decimals),
        priceMap[trade.sell],
        dtfPrice
      )[0] * 100

    return acc
  }, {} as OrganizedTrades)
})

const Row = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={cn('grid grid-cols-[248px_auto] gap-2', className)}>
      {children}
    </div>
  )
}

const VOLATILITY_OPTIONS = ['Low', 'Medium', 'High']

const ProposedTradeVolatility = ({ index }: { index: number }) => {
  const [volatility, setVolatility] = useAtom(tradeVolatilityAtom)

  return (
    <ToggleGroup
      type="single"
      className="bg-muted-foreground/10 p-1 rounded-xl text-sm"
      value={volatility[index]?.toString() || '0'}
      onValueChange={(value) => {
        setVolatility((prev) => {
          const newVolatility = [...prev]
          newVolatility[index] = Number(value)
          return newVolatility
        })
      }}
    >
      {VOLATILITY_OPTIONS.map((option, index) => (
        <ToggleGroupItem
          key={option}
          value={index.toString()}
          className="px-2 h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
        >
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

const ProposedTradeItem = ({
  trade,
  className,
}: {
  trade: ProposedTradeWithMeta
  className?: string
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div
      className={cn('flex flex-wrap gap-2 items-center py-4 pl-2', className)}
    >
      <TokenLogo
        chain={chainId}
        symbol={trade.token.symbol}
        address={trade.token.address}
      />
      <div className="mr-auto text-primary">
        <span>Buy {trade.token.symbol}</span>
        <h4 className="text-xl font-bold">+{formatPercentage(trade.shares)}</h4>
      </div>
      <ProposedTradeVolatility index={trade.index} />
    </div>
  )
}

const ProposedTradeSold = ({
  sell,
  multiple,
}: {
  sell: SellData
  multiple: boolean
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 rounded-xl bg-destructive/10 text-destructive p-4',
        !multiple ? 'items-center' : undefined
      )}
    >
      <div className={multiple ? 'w-52' : undefined}>
        <TokenLogo
          chain={chainId}
          symbol={sell.token?.symbol}
          address={sell.token?.address}
          size="lg"
        />
      </div>
      <div className="flex flex-col justify-end flex-grow">
        <h3 className="text-sm">Sell ${sell.token.symbol}</h3>
        <div className="flex items-center gap-2">
          <h4 className="text-xl font-bold mr-auto">
            {formatPercentage(Number(sell.shares) - sell.percent).replace(
              '-',
              ''
            )}
          </h4>
          <span className="text-sm text-right">
            From {formatPercentage(Number(sell.shares))} to{' '}
            {formatPercentage(sell.percent)}
          </span>
        </div>
      </div>
    </div>
  )
}

const ProposedTradeGroup = ({ group }: { group: IProposedTradeGroup }) => (
  <Row className="border-b p-2">
    <ProposedTradeSold sell={group.sell} multiple={group.trades.length > 1} />
    <div className="flex flex-col">
      {group.trades.map((trade, index) => (
        <ProposedTradeItem
          key={index}
          trade={trade}
          className={index ? 'border-t' : undefined}
        />
      ))}
    </div>
  </Row>
)

const OrganizedTrades = () => {
  const organizedTrades = useAtomValue(organizedTradesAtom)

  if (!organizedTrades) {
    return (
      <div className="p-4 text-legend text-center">No trades available</div>
    )
  }

  return (
    <>
      {Object.keys(organizedTrades).map((key) => (
        <ProposedTradeGroup key={key} group={organizedTrades[key]} />
      ))}
    </>
  )
}

const ProposalTradesSetup = () => {
  return (
    <div className="flex flex-col gap-2 overflow-auto">
      <Row>
        <div className="p-4 text-legend">Selling</div>
        <div className="flex items-center gap-2 flex-wrap p-4 flex-grow border-b text-legend">
          <span className="mr-auto">Buying</span>
          <span className="hidden sm:block">Expected volatility</span>
        </div>
      </Row>
      <OrganizedTrades />
    </div>
  )
}

export default ProposalTradesSetup
