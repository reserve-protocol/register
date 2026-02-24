import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import { formatCurrency } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { Lock } from 'lucide-react'
import { PortfolioVoteLock } from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import SectionHeader from './section-header'

const columns: ColumnDef<PortfolioVoteLock, any>[] = [
  {
    id: 'stTokenName',
    accessorKey: 'stTokenName',
    header: 'Governance Token',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          <TokenLogo
            symbol={row.original.symbol}
            address={row.original.stTokenAddress}
            chain={row.original.chainId}
            size="lg"
          />
          <ChainLogo
            chain={row.original.chainId}
            className="absolute -bottom-0.5 -right-0.5"
            width={12}
            height={12}
          />
        </div>
        <div>
          <p className="font-bold text-sm">{row.original.symbol}</p>
          <p className="text-xs text-legend hidden sm:block">
            {row.original.name}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'governs',
    header: 'Governs',
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.dtfs?.map((d) => d.symbol).join(', ') || '—'}
      </span>
    ),
    meta: { className: 'hidden md:table-cell' },
  },
  {
    id: 'apy',
    accessorKey: 'apy',
    header: ({ column }) => (
      <SorteableButton column={column}>APY</SorteableButton>
    ),
    cell: ({ row }) => {
      const val = row.original.apy
      return (
        <span className="text-sm">
          {val != null && !isNaN(val) ? `${formatCurrency(val)}%` : '—'}
        </span>
      )
    },
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
          {!isNaN(val) ? formatCurrency(val) : '—'}
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
          {val != null && !isNaN(val) ? `$${formatCurrency(val)}` : '—'}
        </span>
      )
    },
  },
]

const VoteLockedPositions = ({
  voteLocks,
}: {
  voteLocks: PortfolioVoteLock[]
}) => {
  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(voteLocks)

  if (!voteLocks.length) return null

  return (
    <div>
      <SectionHeader
        icon={Lock}
        title="Vote-locked positions"
        subtitle={
          <>
            Participate in governance with any ERC-20 token and earn APY
            rewards.{' '}
            <a
              href="https://reserve.org/protocol/"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Learn more
            </a>
            .
          </>
        }
      />
      <div className="bg-card rounded-[20px] border border-border overflow-hidden">
        <DataTable
          columns={columns}
          data={displayData}
          initialSorting={[{ id: 'value', desc: true }]}
        />
        {hasMore && (
          <ExpandToggle expanded={expanded} total={total} onToggle={toggle} />
        )}
      </div>
    </div>
  )
}

export default VoteLockedPositions
