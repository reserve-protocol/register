import DecimalDisplay from '@/components/decimal-display'
import DebankIcon from '@/components/icons/DebankIcon'
import { Card } from '@/components/ui/card'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
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
    to?: { id: string }
    from?: { id: string }
    type: 'MINT' | 'REDEEM' | 'TRANSFER'
  }[]
}

type Transaction = {
  id: string
  hash: string
  amount: number
  amountUSD: number
  timestamp: number
  chain: number
  to?: Address
  from?: Address
  type: 'Mint' | 'Redeem' | 'Transfer'
}

const query = `
  query ($dtf: String!) {
    transferEvents(where: { token: $dtf, type_not: "TRANSFER" }, orderBy: timestamp, orderDirection: desc) {
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
      type
    }
  }
`

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
      return <DecimalDisplay value={row.original.amount} />
    },
  },
  {
    header: ({ column }) => (
      <SorteableButton className="text-sm" column={column}>
        USD
      </SorteableButton>
    ),
    accessorKey: 'amountUSD',
    cell: ({ row }) => {
      return `$${formatCurrency(row.original.amountUSD)}`
    },
  },
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

      return data.transferEvents.map((event) => ({
        id: event.id,
        hash: event.hash,
        amount: Number(formatEther(BigInt(event.amount))),
        amountUSD: Number(formatEther(BigInt(event.amount))) * (price || 0),
        timestamp: Number(event.timestamp),
        chain,
        to: event.to?.id,
        from: event.from?.id,
        type:
          event.type.charAt(0).toUpperCase() +
          event.type.slice(1).toLowerCase(),
      })) as Transaction[]
    },
    enabled: Boolean(dtf && chain && price),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
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
      <h2 className="text-2xl font-semibold mb-2">Transactions</h2>
      <div className="flex flex-col gap-2 -mx-6 sm:-mx-4 overflow-x-auto max-w-[calc(100vw-10px)]">
        <TransactionTable />
      </div>
    </Card>
  )
}

export default IndexTransactionTable
