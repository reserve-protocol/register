import TokenLogo from '@/components/token-logo'
import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import {
  formatCurrency,
  formatToSignificantDigits,
  formatUSD,
  getTokenRoute,
} from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { HandCoins } from 'lucide-react'
import { Link } from 'react-router-dom'
import { portfolioStakedRSRAtom } from '../atoms'
import { PortfolioStakedRSR } from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import SectionHeader from './section-header'

const columns: ColumnDef<PortfolioStakedRSR, any>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Position',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-h-10">
        <TokenLogoWithChain symbol="RSR" chain={row.original.chainId} />
        <div>
          <p className="font-bold text-sm">
            {row.original.symbol.toLowerCase()}RSR
          </p>
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
      <div className="flex items-center gap-1.5">
        <TokenLogo
          symbol={row.original.symbol}
          address={row.original.address}
          chain={row.original.chainId}
          size="sm"
        />
        <Link
          to={getTokenRoute(row.original.address, row.original.chainId)}
          className="text-sm text-primary hover:underline"
          target="_blank"
          onClick={(e) => e.stopPropagation()}
        >
          {row.original.symbol}
        </Link>
      </div>
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
  {
    id: 'action',
    header: () => <span className="flex justify-end">Action</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-primary border-primary hover:text-primary"
          onClick={(e) => {
            e.stopPropagation()
            window.open(
              getTokenRoute(
                row.original.address,
                row.original.chainId,
                'staking'
              ),
              '_blank'
            )
          }}
        >
          Modify
        </Button>
      </div>
    ),
  },
]

const StakedPositions = () => {
  const stakedRSR = useAtomValue(portfolioStakedRSRAtom)
  const filtered = stakedRSR.filter((s) => Number(s.amount) > 0)
  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(filtered)

  if (!filtered.length) return null

  return (
    <div>
      <SectionHeader
        icon={HandCoins}
        title="Staked RSR Positions"
        subtitle={
          <>
            Stake your RSR and earn APY rewards.{' '}
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
          onRowClick={(row) =>
            window.open(
              getTokenRoute(row.address, row.chainId, 'staking'),
              '_blank'
            )
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

export default StakedPositions
