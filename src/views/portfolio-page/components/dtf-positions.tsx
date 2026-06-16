import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import {
  formatToSignificantDigits,
  formatUSD,
  getFolioRoute,
  getTokenRoute,
} from '@/utils'
import { ROUTES } from '@/utils/constants'
import { ColumnDef } from '@tanstack/react-table'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ArrowRight, Globe, Flower } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  portfolioIndexDTFPositionsAtom,
  portfolioYieldDTFsAtom,
} from '../atoms'
import { PortfolioIndexDTF, PortfolioYieldDTF } from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import PerformanceCell from './performance-cell'
import SectionHeader from './section-header'

type DTFRow = PortfolioIndexDTF | PortfolioYieldDTF

const columns: ColumnDef<DTFRow, any>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <Trans>Name</Trans>,
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
        <Trans>Performance</Trans> <span className="text-legend">(7D)</span>
      </SorteableButton>
    ),
    cell: ({ row }) => (
      <PerformanceCell value={row.original.performance7d} />
    ),
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'unrealizedPnL',
    accessorKey: 'unrealizedPnL',
    header: ({ column }) => (
      <SorteableButton column={column}>
        <Trans>Unrealized P/L</Trans>
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
      <SorteableButton column={column}>
        <Trans>Avg Cost</Trans>
      </SorteableButton>
    ),
    cell: ({ row }) => {
      const val = row.original.averageCost
      return (
        <span className="text-sm whitespace-nowrap">
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
      <SorteableButton column={column}>
        <Trans>Market Cap</Trans>
      </SorteableButton>
    ),
    cell: ({ row }) => (
      <span className="text-sm whitespace-nowrap">{formatUSD(row.original.marketCap)}</span>
    ),
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'balance',
    accessorKey: 'amount',
    header: ({ column }) => (
      <SorteableButton column={column}>
        <Trans>Balance</Trans>
      </SorteableButton>
    ),
    cell: ({ row }) => {
      const val = Number(row.original.amount)
      return (
        <span className="text-sm whitespace-nowrap">
          {!isNaN(val) ? formatToSignificantDigits(val) : '—'}
        </span>
      )
    },
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: ({ column }) => (
      <SorteableButton column={column}>
        <Trans>Value</Trans>
      </SorteableButton>
    ),
    cell: ({ row }) => {
      const val = row.original.value
      return (
        <span className="text-sm font-bold whitespace-nowrap">
          {val != null && !isNaN(val) ? formatUSD(val) : '—'}
        </span>
      )
    },
  },
]

const IndexDTFPositions = () => {
  const data = useAtomValue(portfolioIndexDTFPositionsAtom)
  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(data)

  if (!data.length) return null

  return (
    <div>
      <SectionHeader
        icon={Globe}
        title={<Trans>Index DTF Positions</Trans>}
        subtitle={<Trans>Your Decentralized Token Folio investments.</Trans>}
        right={
          <Link
            to={`${ROUTES.DISCOVER}?tab=index`}
            target="_blank"
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            <Trans>Browse all Index DTFs</Trans>
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
        title={<Trans>Yield DTF Positions</Trans>}
        subtitle={<Trans>Your yield-bearing stablecoin holdings.</Trans>}
        right={
          <Link
            to={`${ROUTES.DISCOVER}?tab=yield`}
            target="_blank"
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            <Trans>Browse all Yield DTFs</Trans>
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
