import TokenLogo from '@/components/token-logo'
import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/ui/data-table'
import { formatCurrency, formatToSignificantDigits, formatUSD } from '@/utils'
import {
  ExplorerDataType,
  getExplorerLink,
} from '@/utils/getExplorerLink'
import {
  portfolioStTokenAtom,
  stakingSidebarOpenAtom,
} from '@/views/index-dtf/overview/components/staking/atoms'
import { ColumnDef } from '@tanstack/react-table'
import { useAtomValue, useSetAtom } from 'jotai'
import { ExternalLink, Lock } from 'lucide-react'
import { portfolioVoteLocksAtom } from '../atoms'
import { PortfolioVoteLock } from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import GovernsCell from './governs-cell'
import SectionHeader from './section-header'

const ModifyButton = ({ voteLock }: { voteLock: PortfolioVoteLock }) => {
  const setStakingSidebarOpen = useSetAtom(stakingSidebarOpenAtom)
  const setPortfolioStToken = useSetAtom(portfolioStTokenAtom)

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full text-primary border-primary hover:text-primary"
      onClick={(e) => {
        e.stopPropagation()
        setStakingSidebarOpen(true)
        setPortfolioStToken({
          id: voteLock.stTokenAddress,
          token: {
            name: voteLock.name,
            symbol: voteLock.symbol,
            decimals: 18,
            totalSupply: '',
          },
          underlying: {
            name: voteLock.underlying.name,
            symbol: voteLock.underlying.symbol,
            address: voteLock.underlying.address,
            decimals: 18,
          },
          legacyGovernance: [],
          rewardTokens: [],
          chainId: voteLock.chainId,
        })
      }}
    >
      Modify
    </Button>
  )
}

const columns: ColumnDef<PortfolioVoteLock, any>[] = [
  {
    id: 'stTokenName',
    accessorKey: 'stTokenName',
    header: 'Governance Token',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-h-10">
        <TokenLogoWithChain
          symbol={row.original.underlying.symbol}
          address={row.original.underlying.address}
          chain={row.original.chainId}
        />
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
    id: 'underlying',
    header: 'Underlying',
    cell: ({ row }) => {
      const u = row.original.underlying
      if (!u) return <span className="text-sm text-legend">—</span>
      return (
        <div className="flex items-center gap-2">
          <TokenLogo
            symbol={u.symbol}
            address={u.address}
            chain={row.original.chainId}
            size="md"
          />
          <span className="text-sm">{u.symbol}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(
                getExplorerLink(
                  u.address,
                  row.original.chainId,
                  ExplorerDataType.TOKEN
                ),
                '_blank'
              )
            }}
            className="text-legend hover:text-primary"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      )
    },
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'governs',
    header: 'Governs',
    cell: ({ row }) => (
      <GovernsCell dtfs={row.original.dtfs} chainId={row.original.chainId} />
    ),
    meta: { className: 'hidden md:table-cell' },
  },
  {
    id: 'apy',
    accessorKey: 'apy',
    header: 'APY',
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
  {
    id: 'action',
    header: () => <span className="flex justify-end">Action</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <ModifyButton voteLock={row.original} />
      </div>
    ),
  },
]

const VoteLockedPositions = () => {
  const voteLocks = useAtomValue(portfolioVoteLocksAtom)
  const filtered = voteLocks.filter((v) => Number(v.amount) > 0)
  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(filtered)

  if (!filtered.length) return null

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
