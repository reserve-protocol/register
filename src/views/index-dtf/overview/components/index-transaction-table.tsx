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

// Columns type/amount/usdAmount/Time/From/Hash
const columns: ColumnDef<Transaction>[] = [
  {
    header: ({ column }) => (
      <SorteableButton className="text-sm" column={column}>
        Type
      </SorteableButton>
    ),
    accessorKey: 'type',
    cell: ({ row }) => {
      return <div className="font-semibold">{row.original.type}</div>
    },
  },
  {
    header: ({ column }) => (
      <SorteableButton className="text-sm" column={column}>
        Amount
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
        Time
      </SorteableButton>
    ),
    accessorKey: 'timestamp',
    cell: ({ row }) => {
      return relativeTime(row.original.timestamp, getCurrentTime())
    },
  },
  {
    header: () => <span className="hidden md:block">Explore</span>,
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
    <Card className="p-6 pb-2">
      <div className="flex items-center gap-1">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <ArrowDownUp size={14} />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4"></div>
      <h2 className="text-xl font-semibold">Transactions</h2>
      <div className="flex flex-col gap-2 -mx-6 sm:-mx-4 overflow-x-auto max-w-[calc(100vw-10px)]">
        <TransactionTable />
      </div>
    </Card>
  )
}

export default IndexTransactionTable
