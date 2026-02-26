import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import DataTable from '@/components/ui/data-table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getFolioRoute, getTokenRoute, shortenString } from '@/utils'
import {
  ExplorerDataType,
  getExplorerLink,
} from '@/utils/getExplorerLink'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { ArrowUpRight, History } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Address } from 'viem'
import { PortfolioTransaction } from '../types'
import { useTransactions } from '../hooks/use-transactions'
import { ExpandToggle, useExpandable } from './expand-toggle'
import SectionHeader from './section-header'

const TokenCell = ({ tx }: { tx: PortfolioTransaction }) => {
  if (!tx.token) return <span className="text-sm text-legend">—</span>

  const underlying = tx.token.underlying
  const logoSymbol = underlying?.symbol ?? tx.token.symbol
  const logoAddress = (underlying?.address ?? tx.token.address) as Address
  const route =
    tx.protocol === 'index'
      ? getFolioRoute(tx.token.address, tx.chainId)
      : getTokenRoute(tx.token.address, tx.chainId)

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-shrink-0">
        <TokenLogo
          symbol={logoSymbol}
          address={logoAddress}
          chain={tx.chainId}
          size="md"
        />
        <ChainLogo
          chain={tx.chainId}
          className="absolute -bottom-0.5 -right-0.5"
          width={10}
          height={10}
        />
      </div>
      <Link
        to={route}
        className="text-sm text-primary hover:underline truncate max-w-[120px]"
        target="_blank"
        onClick={(e) => e.stopPropagation()}
      >
        {tx.token.symbol}
      </Link>
    </div>
  )
}

const columns: ColumnDef<PortfolioTransaction, any>[] = [
  {
    id: 'date',
    accessorKey: 'timestamp',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-sm text-legend whitespace-nowrap h-10 flex items-center">
        {dayjs.unix(row.original.timestamp).format('MMM D, YYYY HH:mm')}
      </span>
    ),
  },
  {
    id: 'token',
    header: 'Token',
    cell: ({ row }) => <TokenCell tx={row.original} />,
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <span className="text-sm whitespace-nowrap">{row.original.title}</span>
    ),
    meta: { className: 'hidden md:table-cell' },
  },
  {
    id: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const desc = row.original.description
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm truncate max-w-[400px] block cursor-default">
              {desc}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[400px]">
            {desc}
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    id: 'explorer',
    header: 'Explorer',
    cell: ({ row }) => (
      <a
        href={getExplorerLink(
          row.original.txHash,
          row.original.chainId,
          ExplorerDataType.TRANSACTION
        )}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        {shortenString(row.original.txHash)}
        <ArrowUpRight size={14} />
      </a>
    ),
  },
]

const Transactions = ({ address }: { address: Address }) => {
  const { data, isLoading } = useTransactions(address)
  const { displayData, expanded, toggle, hasMore, total } = useExpandable(
    data ?? [],
    5
  )

  if (!isLoading && (!data || !data.length)) return null

  return (
    <div>
      <SectionHeader
        icon={History}
        title="Transactions"
        subtitle="Your recent on-chain activity."
      />
      <div className="bg-card rounded-[20px] border border-border overflow-hidden">
        <DataTable
          columns={columns}
          data={displayData}
          loading={isLoading}
          onRowClick={(row) =>
            window.open(
              getExplorerLink(
                row.txHash,
                row.chainId,
                ExplorerDataType.TRANSACTION
              ),
              '_blank'
            )
          }
        />
        {hasMore && (
          <ExpandToggle expanded={expanded} total={total} onToggle={toggle} />
        )}
      </div>
    </div>
  )
}

export default Transactions
