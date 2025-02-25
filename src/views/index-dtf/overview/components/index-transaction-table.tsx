import DecimalDisplay from '@/components/decimal-display'
import DebankIcon from '@/components/icons/DebankIcon'
import { Card } from '@/components/ui/card'
import DataTable from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { chainIdAtom, INDEX_DTF_SUBGRAPH_URL } from '@/state/atoms'
import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import {
  formatCurrency,
  getCurrentTime,
  relativeTime,
  shortenAddress,
  shortenString,
} from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { request } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { ArrowDownUp } from 'lucide-react'
import { Address, formatEther, zeroAddress } from 'viem'

type Response = {
  transferEvents: {
    id: string
    hash: string
    amount: string
    timestamp: string
    to: { id: string }
    from: { id: string }
  }[]
}

type Transaction = {
  id: string
  hash: string
  amount: number
  amountUSD: number
  timestamp: number
  chain: number
  to: Address
  from: Address
  type: 'Mint' | 'Redeem' | 'Transfer'
}

const query = `
  query ($dtf: String!) {
    transferEvents(where: { token: $dtf }) {
      id
      hash
      amount
      timestamp
      to {
        id
      }
      from {
        id
      }
    }
  }
`

// Columns type/amount/usdAmount/Time/From/Hash
const columns: ColumnDef<Transaction>[] = [
  {
    header: 'Type',
    accessorKey: 'type',
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    cell: ({ row }) => {
      return <DecimalDisplay value={row.original.amount} />
    },
  },
  {
    header: 'USD',
    accessorKey: 'amountUSD',
    cell: ({ row }) => {
      return `$${formatCurrency(row.original.amountUSD)}`
    },
  },
  {
    header: 'Time',
    accessorKey: 'timestamp',
    cell: ({ row }) => {
      return relativeTime(row.original.timestamp, getCurrentTime())
    },
  },
  {
    header: 'From',
    accessorKey: 'from',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <a
            href={`https://debank.com/profile/${row.original.from}`}
            target="_blank"
            className="text-legend underline"
          >
            {shortenAddress(row.original.from)}
          </a>
          <DebankIcon />
        </div>
      )
    },
  },
  {
    header: 'Hash',
    accessorKey: 'hash',
    cell: ({ row }) => {
      return (
        <a
          href={getExplorerLink(
            row.original.hash,
            row.original.chain,
            ExplorerDataType.TRANSACTION
          )}
          className="text-legend underline"
          target="_blank"
        >
          {shortenString(row.original.hash)}
        </a>
      )
    },
  },
]

const useTransactions = (dtf: Address, chain: number) => {
  const price = useAtomValue(indexDTFPriceAtom) // TODO: temp

  return useQuery({
    queryKey: ['transactions', dtf, chain, price],
    queryFn: async () => {
      const data = await request<Response>(
        INDEX_DTF_SUBGRAPH_URL[chain],
        query,
        {
          dtf: dtf.toLowerCase(),
        }
      )

      console.log(data)

      return data.transferEvents.map((event) => ({
        id: event.id,
        hash: event.hash,
        amount: Number(formatEther(BigInt(event.amount))),
        amountUSD: Number(formatEther(BigInt(event.amount))) * (price || 0),
        timestamp: Number(event.timestamp),
        chain,
        to: event.to.id,
        from: event.from.id,
        type:
          event.to.id === zeroAddress
            ? 'Redeem'
            : event.from.id === zeroAddress
              ? 'Mint'
              : 'Transfer',
      })) as Transaction[]
    },
    enabled: Boolean(dtf && chain && price),
  })
}

const TransactionTable = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const chain = useAtomValue(chainIdAtom)
  const { data, isLoading } = useTransactions(dtf?.id as Address, chain)

  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      pagination
      className={cn(
        'hidden lg:block',
        '[&_table]:bg-card [&_table]:rounded-[20px] [&_table]:text-base',
        '[&_table_thead_th]:px-6',
        '[&_table_tbody_td]:px-6',
        '[&_table_tbody]:rounded-[20px] [&_table_tbody_tr:last-child_td]:rounded-bl-[20px] [&_table_tbody_tr:last-child_td:last-child]:rounded-br-[20px]'
      )}
    />
  )
}

const IndexTransactionTable = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-1">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <ArrowDownUp size={14} />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4"></div>
      <h2 className="text-2xl font-semibold mb-2">Transactions</h2>
      <div className="flex flex-col gap-2 -mx-6">
        <TransactionTable />
      </div>
    </Card>
  )
}

export default IndexTransactionTable
