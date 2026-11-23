import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import TokenItem from 'components/token-item'
import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatCurrency, getTokenRoute } from 'utils'
import { ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import ExplorerTable from '../kit/explorer-table'
import { TokenCell } from '../kit/token-cell'
import { type RevenueCollateral } from './use-available-revenue'

const isRunnable = (trade: RevenueCollateral) => trade.surplus >= trade.minTrade

const openAuctions = (rToken: string, chain: number) =>
  window.open(getTokenRoute(rToken, chain, ROUTES.AUCTIONS), '_blank')

export const RunButton = ({
  rToken,
  chain,
  emphasized,
}: {
  rToken: string
  chain: number
  emphasized: boolean
}) => (
  <Button
    variant={emphasized ? 'accent' : 'outline'}
    className={cn(
      'h-11 rounded-full font-semibold sm:h-9',
      !emphasized && 'bg-card text-legend'
    )}
    onClick={(event) => {
      // WHY: in the Yield list the whole row toggles its trades.
      event.stopPropagation()
      openAuctions(rToken, chain)
    }}
  >
    <Trans>Run</Trans>
  </Button>
)

const TokenLink = ({
  address,
  chain,
  symbol,
  logo,
}: {
  address: string
  chain: number
  symbol: string
  logo?: string
}) => (
  <a
    href={getExplorerLink(address, chain, ExplorerDataType.TOKEN)}
    target="_blank"
    rel="noreferrer"
    className="inline-flex text-foreground hover:text-primary"
  >
    <TokenItem symbol={symbol} logo={logo} className="font-medium" />
  </a>
)

const MinTrade = ({ trade }: { trade: RevenueCollateral }) => (
  <>
    {formatCurrency(trade.minTrade)} {trade.symbol}
    <span className="text-legend"> · </span>
    {isRunnable(trade) ? (
      <span className="font-semibold text-primary">
        <Trans>Met</Trans>
      </span>
    ) : (
      <span className="text-legend">
        <Trans>Not met</Trans>
      </span>
    )}
  </>
)

const TradeItem = ({ trade }: { trade: RevenueCollateral }) => (
  <div className="flex items-center gap-3 tabular-nums">
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="flex items-center gap-1.5 font-semibold">
        {trade.symbol}
        <ArrowRight size={14} className="text-legend" aria-hidden />
        {trade.buy}
      </span>
      <span className="text-[13px] text-legend">
        <Trans>Surplus</Trans>{' '}
        <span className="font-medium text-foreground">
          {formatCurrency(trade.surplus)} {trade.symbol}
        </span>
      </span>
      <span className="text-[13px]">
        <span className="text-legend">
          <Trans>Min. trade</Trans>{' '}
        </span>
        <MinTrade trade={trade} />
      </span>
    </div>
    <span className="ml-auto shrink-0 font-semibold">
      ${formatCurrency(trade.value)}
    </span>
    <RunButton
      rToken={trade.rTokenAddress}
      chain={trade.chain}
      emphasized={isRunnable(trade)}
    />
  </div>
)

const Trades = ({
  trades,
  nested = false,
  isLoading = false,
}: {
  trades: RevenueCollateral[]
  nested?: boolean
  isLoading?: boolean
}) => {
  const { t } = useLingui()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'value', desc: true },
  ])

  const columns = useMemo<ColumnDef<RevenueCollateral>[]>(() => {
    const dtfColumn: ColumnDef<RevenueCollateral> = {
      id: 'dtf',
      header: 'DTF',
      accessorFn: (trade) => trade.rTokenSymbol,
      cell: ({ row }) => (
        <TokenCell
          symbol={row.original.rTokenSymbol}
          address={row.original.rTokenAddress}
          chain={row.original.chain}
          logo={row.original.rTokenLogo}
        />
      ),
    }

    return [
      ...(nested ? [] : [dtfColumn]),
      {
        id: 'buy',
        header: t`Buy`,
        accessorFn: (trade) => trade.buy,
        cell: ({ row }) => (
          <TokenLink
            address={row.original.buyAddress}
            chain={row.original.chain}
            symbol={row.original.buy}
            logo={row.original.buyLogo}
          />
        ),
      },
      {
        id: 'sell',
        header: t`Sell`,
        accessorFn: (trade) => trade.symbol,
        cell: ({ row }) => (
          <TokenLink
            address={row.original.address}
            chain={row.original.chain}
            symbol={row.original.symbol}
            logo={row.original.sellLogo}
          />
        ),
      },
      {
        id: 'surplus',
        header: t`Surplus`,
        accessorFn: (trade) => trade.surplus,
        meta: { className: 'text-right whitespace-nowrap' },
        cell: ({ row }) =>
          `${formatCurrency(row.original.surplus)} ${row.original.symbol}`,
      },
      {
        id: 'minTrade',
        header: t`Min. trade`,
        accessorFn: (trade) => trade.minTrade,
        meta: { className: 'whitespace-nowrap' },
        cell: ({ row }) => <MinTrade trade={row.original} />,
      },
      {
        id: 'value',
        header: t`Amount`,
        accessorFn: (trade) => trade.value,
        meta: { className: 'text-right' },
        cell: ({ row }) => `$${formatCurrency(row.original.value)}`,
      },
      {
        id: 'action',
        header: '',
        enableSorting: false,
        meta: { className: 'w-0 text-right' },
        cell: ({ row }) => (
          <RunButton
            rToken={row.original.rTokenAddress}
            chain={row.original.chain}
            emphasized={isRunnable(row.original)}
          />
        ),
      },
    ]
  }, [nested, t])

  return (
    <ExplorerTable
      data={trades}
      columns={columns}
      getRowId={(trade) =>
        `${trade.chain}-${trade.rTokenAddress}-${trade.address}-${trade.trader}`
      }
      renderItem={(trade) => <TradeItem trade={trade} />}
      pageSize={nested ? undefined : 10}
      sorting={sorting}
      onSortingChange={setSorting}
      isLoading={isLoading}
      emptyLabel={<Trans>No trades</Trans>}
    />
  )
}

export default Trades
