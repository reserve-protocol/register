import DecimalDisplay from '@/components/decimal-display'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { indexDTFTransactionsAtom, Transaction } from '@/state/dtf/atoms'
import {
  formatCurrency,
  getCurrentTime,
  relativeTime,
  shortenString,
} from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { ColumnDef } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { ArrowUpRight } from 'lucide-react'
import SectionAnchor from '@/components/section-anchor'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { Trans, useLingui } from '@lingui/react/macro'

const TRANSACTION_TYPE_LABELS: Record<Transaction['type'], MessageDescriptor> =
  {
    Mint: msg`Mint`,
    Redeem: msg`Redeem`,
    Transfer: msg`Transfer`,
  }

const TransactionTypeCell = ({ type }: { type: Transaction['type'] }) => {
  const { t } = useLingui()
  const label = TRANSACTION_TYPE_LABELS[type]
  return <span className="font-medium">{label ? t(label) : type}</span>
}

// Columns type/amount/usdAmount/Time/From/Hash
const columns: ColumnDef<Transaction>[] = [
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
  // {
  //   header: ({ column }) => (
  //     <SorteableButton className="text-sm" column={column}>
  //       USD
  //     </SorteableButton>
  //   ),
  //   accessorKey: 'amountUSD',
  //   cell: ({ row }) => {
  //     return `$${formatCurrency(row.original.amountUSD)}`
  //   },
  // },
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

const TransactionTable = () => {
  const transactions = useAtomValue(indexDTFTransactionsAtom)

  return (
    <DataTable
      columns={columns}
      data={transactions ?? []}
      pagination
      paginationClassName="px-5 pb-3 pt-4 sm:px-6 [&>div:last-child]:w-full md:[&>div:last-child]:w-auto"
      paginationSummaryClassName="hidden md:flex md:opacity-100"
      paginationControlsClassName="w-full gap-1.5 space-x-0 sm:gap-2 md:w-auto"
      paginationButtonClassName="flex-1 md:flex-none"
      className={cn(
        '[&_table]:bg-card [&_table]:text-sm [&_table]:md:text-sm',
        '[&_thead_tr]:h-9 [&_thead_tr]:border-none',
        '[&_tbody_tr]:border-none [&_tbody_tr:hover]:bg-secondary/40',
        '[&_td]:py-3 [&_th]:py-1.5 [&_th]:text-legend'
      )}
    />
  )
}

const IndexTransactionTable = () => {
  return (
    <Card
      className="group/section overflow-hidden pb-2 pt-5 sm:pb-3 sm:pt-6"
      id="transactions"
    >
      <div className="flex items-center gap-1 px-5 sm:px-6">
        <h2 className="text-2xl font-light">
          <Trans>Transactions</Trans>
        </h2>
        <SectionAnchor id="transactions" />
      </div>
      <div className="mt-2 overflow-x-auto">
        <TransactionTable />
      </div>
    </Card>
  )
}

export default IndexTransactionTable
