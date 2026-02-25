import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import DataTable from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { formatCurrency, formatToSignificantDigits, formatUSD } from '@/utils'
import { CHAIN_TAGS } from '@/utils/constants'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'
import RsrIcon from '@/components/icons/RsrIcon'
import { PortfolioRSRBalance } from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import SectionHeader from './section-header'

const columns: ColumnDef<PortfolioRSRBalance, any>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          <TokenLogo symbol="RSR" size="lg" />
          <ChainLogo
            chain={row.original.chainId}
            className="absolute -bottom-0.5 -right-0.5"
            width={12}
            height={12}
          />
        </div>
        <div>
          <p className="font-bold text-sm">RSR</p>
          <p className="text-xs text-legend hidden sm:block">
            {CHAIN_TAGS[row.original.chainId] || 'Unknown'}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'performance7d',
    accessorKey: 'performance7d',
    header: 'Performance (7D)',
    cell: ({ row }) => {
      const perf = row.original.performance7d
      if (perf == null)
        return <span className="text-sm text-legend">—</span>
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
    id: 'balance',
    accessorKey: 'amount',
    header: 'Balance',
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
    header: 'Value',
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

const RSRSection = ({
  rsrBalances,
}: {
  rsrBalances: PortfolioRSRBalance[]
}) => {
  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(rsrBalances)

  if (!rsrBalances.length) return null

  return (
    <div>
      <SectionHeader
        icon={RsrIcon}
        title="RSR"
        subtitle="Reserve Rights (RSR) is an ERC-20 token that unifies governance, risk management, and value accrual across the Reserve ecosystem."
      />
      <div className="bg-card rounded-[20px] border border-border overflow-hidden">
        <DataTable columns={columns} data={displayData} />
        {hasMore && (
          <ExpandToggle expanded={expanded} total={total} onToggle={toggle} />
        )}
      </div>
    </div>
  )
}

export default RSRSection
