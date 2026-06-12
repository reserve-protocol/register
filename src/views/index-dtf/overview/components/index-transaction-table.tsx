import DecimalDisplay from '@/components/decimal-display'
import { Card } from '@/components/ui/card'
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
import { ArrowDownUp, ArrowUpRight } from 'lucide-react'
import SectionAnchor from '@/components/section-anchor'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { Trans, useLingui } from '@lingui/react/macro'

const TRANSACTION_TYPE_LABELS: Record<Transaction['type'], MessageDescriptor> = {
  Mint: msg`Mint`,
  Redeem: msg`Redeem`,
  Transfer: msg`Transfer`,
}

const TransactionTypeCell = ({ type }: { type: Transaction['type'] }) => {
  const { t } = useLingui()
  const label = TRANSACTION_TYPE_LABELS[type]
  return <div className="font-semibold">{label ? t(label) : type}</div>
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
  },
  {
    header: ({ column }) => (
      <SorteableButton className="text-sm" column={column}>
        <Trans>Amount</Trans>
      </SorteableButton>
    ),
    accessorKey: 'amount',
    cell: ({ row }) => {
      return (
        <div>
          ${formatCurrency(row.original.amountUSD)}{' '}
          <span className="text-legend text-xs">
            (<DecimalDisplay value={row.original.amount} />)
          </span>
        </div>
      )
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
      <SorteableButton className="text-sm" column={column}>
        <Trans>Time</Trans>
      </SorteableButton>
    ),
    accessorKey: 'timestamp',
    cell: ({ row }) => {
      return relativeTime(row.original.timestamp, getCurrentTime())
    },
  },
  {
    header: () => (
      <span className="hidden md:block">
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
          className="text-legend underline bg-muted rounded-full w-fit p-1 block md:p-0 md:bg-transparent"
          target="_blank"
        >
          <span className="hidden md:block">
            {shortenString(row.original.hash)}
          </span>
          <span className="block md:hidden">
            <ArrowUpRight size={14} />
          </span>
        </a>
      )
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
      className={cn(
        '[&_table]:bg-card [&_table]:rounded-[20px] [&_table]:text-sm [&_table_tr]:border-none [&_table_th]:text-legend [&_table_th]:border-b'
      )}
    />
  )
}

const IndexTransactionTable = () => {
  return (
    <Card className="p-6 pb-2 group/section" id="transactions">
      <div className="flex items-center gap-1">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <ArrowDownUp size={14} />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4"></div>
      <div className="flex items-center gap-1">
        <h2 className="text-2xl font-light">
          <Trans>Transactions</Trans>
        </h2>
        <SectionAnchor id="transactions" />
      </div>
      <div className="flex flex-col gap-2 -mx-6 sm:-mx-4 overflow-x-auto max-w-[calc(100vw-10px)]">
        <TransactionTable />
      </div>
    </Card>
  )
}

export default IndexTransactionTable
