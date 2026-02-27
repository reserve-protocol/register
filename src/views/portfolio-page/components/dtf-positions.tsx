import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  formatToSignificantDigits,
  formatUSD,
  getFolioRoute,
  getTokenRoute,
} from '@/utils'
import { ROUTES } from '@/utils/constants'
import { ColumnDef } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowUp, ArrowRight, Globe, Flower } from 'lucide-react'
import { Link } from 'react-router-dom'
import { portfolioIndexDTFsAtom, portfolioYieldDTFsAtom } from '../atoms'
import { PortfolioIndexDTF, PortfolioYieldDTF } from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import SectionHeader from './section-header'

type DTFRow = PortfolioIndexDTF | PortfolioYieldDTF

const columns: ColumnDef<DTFRow, any>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-h-10">
        <TokenLogoWithChain
          symbol={row.original.symbol}
          address={row.original.address}
          chain={row.original.chainId}
        />
        <div className="min-w-0">
          <p className="font-bold text-sm">{row.original.name}</p>
          <p className="text-xs text-legend truncate hidden sm:block">
            ${row.original.symbol}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'performance7d',
    accessorKey: 'performance7d',
    header: ({ column }) => (
      <SorteableButton column={column}>
        Performance <span className="text-legend">(7D)</span>
      </SorteableButton>
    ),
    cell: ({ row }) => {
      const raw = row.original.performance7d
      if (raw == null || isNaN(raw))
        return <span className="text-sm text-legend">—</span>
      const perf = raw * 100
      const abs = Math.abs(perf)
      const isNear0 = abs < 0.01
      let text: string
      if (isNear0) {
        text = '0.00%'
      } else {
        text = `${perf > 0 ? '+' : ''}${formatCurrency(perf)}%`
      }
      return (
        <div
          className={cn(
            'flex items-center gap-0.5 text-sm',
            isNear0 || perf === 0
              ? 'text-legend'
              : perf > 0
                ? 'text-success'
                : 'text-destructive'
          )}
        >
          {!isNear0 && perf > 0 && <ArrowUp size={14} />}
          {!isNear0 && perf < 0 && <ArrowDown size={14} />}
          {text}
        </div>
      )
    },
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'unrealizedPnL',
    accessorKey: 'unrealizedPnL',
    header: ({ column }) => (
      <SorteableButton column={column}>
        Unrealized P/L
      </SorteableButton>
    ),
    cell: ({ row }) => {
      const val = row.original.unrealizedPnL
      if (val == null)
        return <span className="text-sm text-legend">—</span>
      const abs = Math.abs(val)
      const isNear0 = abs < 0.01
      let text: string
      if (isNear0) {
        text = '$0.00'
      } else {
        text = val > 0 ? `+${formatUSD(val)}` : `-${formatUSD(abs)}`
      }
      return (
        <span
          className={cn(
            'text-sm',
            isNear0
              ? 'text-legend'
              : val > 0
                ? 'text-success'
                : 'text-destructive'
          )}
        >
          {text}
        </span>
      )
    },
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'averageCost',
    accessorKey: 'averageCost',
    header: ({ column }) => (
      <SorteableButton column={column}>Avg Cost</SorteableButton>
    ),
    cell: ({ row }) => {
      const val = row.original.averageCost
      return (
        <span className="text-sm">
          {val != null ? formatUSD(val) : '—'}
        </span>
      )
    },
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'marketCap',
    accessorKey: 'marketCap',
    header: ({ column }) => (
      <SorteableButton column={column}>Market Cap</SorteableButton>
    ),
    cell: ({ row }) => (
      <span className="text-sm">{formatUSD(row.original.marketCap)}</span>
    ),
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'balance',
    accessorKey: 'amount',
    header: ({ column }) => (
      <SorteableButton column={column}>Balance</SorteableButton>
    ),
    cell: ({ row }) => {
      const val = Number(row.original.amount)
      return (
        <span className="text-sm">
          {!isNaN(val) ? formatToSignificantDigits(val) : '—'}
        </span>
      )
    },
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: ({ column }) => (
      <SorteableButton column={column}>Value</SorteableButton>
    ),
    cell: ({ row }) => {
      const val = row.original.value
      return (
        <span className="text-sm font-bold">
          {val != null && !isNaN(val) ? formatUSD(val) : '—'}
        </span>
      )
    },
  },
]

const IndexDTFPositions = () => {
  const data = useAtomValue(portfolioIndexDTFsAtom)
  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(data)

  if (!data.length) return null

  return (
    <div>
      <SectionHeader
        icon={Globe}
        title="Index DTF Positions"
        subtitle="Your Decentralized Token Folio investments."
        right={
          <Link
            to={`${ROUTES.HOME}?tab=index`}
            target="_blank"
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            Browse all Index DTFs
            <ArrowRight size={16} />
          </Link>
        }
      />
      <div className="bg-card rounded-[20px] border border-border overflow-hidden">
        <DataTable
          columns={columns}
          data={displayData}
          onRowClick={(row) =>
            window.open(getFolioRoute(row.address, row.chainId), '_blank')
          }
          initialSorting={[{ id: 'value', desc: true }]}
        />
        {hasMore && (
          <ExpandToggle expanded={expanded} total={total} onToggle={toggle} />
        )}
      </div>
    </div>
  )
}

const YieldDTFPositions = () => {
  const data = useAtomValue(portfolioYieldDTFsAtom)
  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(data)

  if (!data.length) return null

  return (
    <div>
      <SectionHeader
        icon={Flower}
        title="Yield DTF Positions"
        subtitle="Your yield-bearing stablecoin holdings."
        right={
          <Link
            to={`${ROUTES.HOME}?tab=yield`}
            target="_blank"
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            Browse all Yield DTFs
            <ArrowRight size={16} />
          </Link>
        }
      />
      <div className="bg-card rounded-[20px] border border-border overflow-hidden">
        <DataTable
          columns={columns}
          data={displayData}
          onRowClick={(row) =>
            window.open(getTokenRoute(row.address, row.chainId), '_blank')
          }
          initialSorting={[{ id: 'value', desc: true }]}
        />
        {hasMore && (
          <ExpandToggle expanded={expanded} total={total} onToggle={toggle} />
        )}
      </div>
    </div>
  )
}

export { IndexDTFPositions, YieldDTFPositions }
