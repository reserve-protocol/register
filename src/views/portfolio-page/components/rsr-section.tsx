import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import DataTable from '@/components/ui/data-table'
import { formatToSignificantDigits, formatUSD } from '@/utils'
import { CHAIN_TAGS } from '@/utils/constants'
import { ColumnDef } from '@tanstack/react-table'
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
