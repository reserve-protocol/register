import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import DataTable from '@/components/ui/data-table'
import { formatToSignificantDigits, formatUSD } from '@/utils'
import { CHAIN_TAGS } from '@/utils/constants'
import { ColumnDef } from '@tanstack/react-table'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import RsrIcon from '@/components/icons/RsrIcon'
import { portfolioRSRBalancesAtom } from '../atoms'
import { PortfolioRSRBalance } from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import PerformanceCell from './performance-cell'
import SectionHeader from './section-header'

const columns: ColumnDef<PortfolioRSRBalance, any>[] = [
  {
    id: 'name',
    header: () => <Trans>Name</Trans>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-h-10">
        <TokenLogoWithChain symbol="RSR" chain={row.original.chainId} />
        <div>
          <p className="font-bold text-sm">RSR</p>
          <p className="text-xs text-legend hidden sm:block">
            {CHAIN_TAGS[row.original.chainId] || <Trans>Unknown</Trans>}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'performance7d',
    accessorKey: 'performance7d',
    header: () => (
      <>
        <Trans>Performance</Trans> (7D)
      </>
    ),
    cell: ({ row }) => (
      <PerformanceCell value={row.original.performance7d} />
    ),
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'balance',
    accessorKey: 'amount',
    header: () => <Trans>Balance</Trans>,
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
    header: () => <Trans>Value</Trans>,
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

const RSRSection = () => {
  const rsrBalances = useAtomValue(portfolioRSRBalancesAtom)
  const filtered = rsrBalances.filter((r) => Number(r.amount) > 0)
  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(filtered)

  if (!filtered.length) return null

  return (
    <div>
      <SectionHeader
        icon={RsrIcon}
        title="RSR"
        subtitle={
          <Trans>
            Reserve Rights (RSR) is an ERC-20 token that unifies governance,
            risk management, and value accrual across the Reserve ecosystem.
          </Trans>
        }
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
