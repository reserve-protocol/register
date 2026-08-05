import DecimalDisplay from '@/components/decimal-display'
import { Button } from '@/components/ui/button'
import { SorteableButton } from '@/components/ui/data-table'
import {
  formatCurrency,
  getCurrentTime,
  relativeTime,
  shortenString,
} from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpRight } from 'lucide-react'
import { TransactionRow } from './swap-transactions'

// Mirrors the columns in ../index-transaction-table.tsx (retyped for the
// widened Buy/Sell row type) — keep visual parity if that file changes.

const TRANSACTION_TYPE_LABELS: Record<TransactionRow['type'], MessageDescriptor> =
  {
    Mint: msg`Mint`,
    Redeem: msg`Redeem`,
    Transfer: msg`Transfer`,
    Buy: msg`Buy`,
    Sell: msg`Sell`,
  }

const TransactionTypeCell = ({ type }: { type: TransactionRow['type'] }) => {
  const { t } = useLingui()
  const label = TRANSACTION_TYPE_LABELS[type]
  return <span className="font-medium">{label ? t(label) : type}</span>
}

// Columns type/amount/usdAmount/Time/From/Hash
export const columns: ColumnDef<TransactionRow>[] = [
  {
    header: ({ column }) => (
      <SorteableButton className="text-sm" column={column}>
        <Trans>Type</Trans>
      </SorteableButton>
    ),
    accessorKey: 'type',
    cell: ({ row }) => <TransactionTypeCell type={row.original.type} />,
    meta: {
      className: 'pl-5 sm:pl-6',
    },
  },
  {
    header: ({ column }) => (
      <SorteableButton className="ml-auto text-sm" column={column}>
        <Trans>Amount</Trans>
      </SorteableButton>
    ),
    accessorKey: 'amount',
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end gap-1">
          <span>${formatCurrency(row.original.amountUSD)}</span>
          <span className="text-legend">
            (<DecimalDisplay value={row.original.amount} />)
          </span>
        </div>
      )
    },
    meta: {
      className: 'text-right',
    },
  },
  {
    header: ({ column }) => (
      <SorteableButton className="ml-auto text-sm" column={column}>
        <Trans>Time</Trans>
      </SorteableButton>
    ),
    accessorKey: 'timestamp',
    cell: ({ row }) => {
      return relativeTime(row.original.timestamp, getCurrentTime())
    },
    meta: {
      className: 'text-right',
    },
  },
  {
    header: () => (
      <span className="ml-auto block text-right text-sm">
        <Trans>Explore</Trans>
      </span>
    ),
    accessorKey: 'hash',
    cell: ({ row }) => {
      return (
        <a
          href={getExplorerLink(
            row.original.hash,
            row.original.chain,
            ExplorerDataType.TRANSACTION
          )}
          className="ml-auto flex w-fit items-center"
          target="_blank"
          rel="noreferrer"
        >
          <span className="sr-only md:hidden">
            <Trans>View transaction on explorer</Trans>
          </span>
          <span className="hidden text-legend underline hover:text-primary md:block">
            {shortenString(row.original.hash)}
          </span>
          <Button variant="muted" size="icon-rounded" asChild>
            <span className="md:hidden">
              <ArrowUpRight size={14} />
            </span>
          </Button>
          <span className="hidden md:ml-1 md:block">
            <ArrowUpRight size={14} />
          </span>
        </a>
      )
    },
    meta: {
      className: 'pr-5 text-right sm:pr-6',
    },
  },
]
