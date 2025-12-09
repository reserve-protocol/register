import DataTable from '@/components/ui/data-table'
import { Trans, t } from '@lingui/macro'
import { ColumnDef } from '@tanstack/react-table'
import ChainLogo from 'components/icons/ChainLogo'
import DebankIcon from 'components/icons/DebankIcon'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import {
  formatCurrency,
  getCurrentTime,
  relativeTime,
  shortenAddress,
  shortenString,
} from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { formatEther } from 'viem'

export interface TransactionRecord {
  id: string
  type: string
  amount: bigint
  amountUSD: number | string
  timestamp: number
  symbol?: string
  hash: string
  from: {
    id: string
  }
  to: {
    id: string
  }
  token: {
    symbol: string
  }
  chain?: number
}

const rTokenTransactionsQuery = gql`
  query GetRecentTransactions($tokenId: String!) {
    entries(
      orderBy: timestamp
      where: { token: $tokenId, type_not: "TRANSFER" }
      orderDirection: desc
      first: 200
    ) {
      id
      type
      amount
      amountUSD
      hash
      from {
        id
      }
      to {
        id
      }
      token {
        symbol
      }
      timestamp
    }
  }
`

const useTransactionColumns = (): ColumnDef<TransactionRecord>[] => {
  const chainId = useAtomValue(chainIdAtom)
  const transactionTypes: Record<string, string> = useMemo(
    () => ({
      MINT: t`Mint`,
      REDEEM: t`Redeem`,
      TRANSFER: t`Transfer`,
      BURN: t`Melt`,
      ISSUE: t`Issue`,
      ISSUE_START: t`Start Issue`,
      CLAIM: t`Claim`,
      CANCEL_ISSUANCE: t`Cancel Issue`,
      STAKE: t`Stake`,
      UNSTAKE: t`Unstake`,
      WITHDRAW: t`Withdraw`,
      DEPOSIT: t`Deposit`,
      WITHDRAWAL: t`Withdraw`,
      UNSTAKE_CANCELLED: t`Unstake Cancelled`,
    }),
    []
  )

  return useMemo(
    (): ColumnDef<TransactionRecord>[] => [
      {
        accessorKey: 'type',

        header: t`Type`,
        cell: ({ getValue }) => {
          const value = getValue() as string
          return (
            <span className="font-semibold">
              {transactionTypes[value] || value}
            </span>
          )
        },
      },
      {
        accessorKey: 'amount',
        header: t`Amount`,
        cell: ({ getValue, row }) => {
          const parsed = formatEther(getValue() as bigint)
          let symbol = row.original.token.symbol

          if (
            row.original.type === 'STAKE' ||
            row.original.type === 'UNSTAKE' ||
            row.original.type === 'WITHDRAW' ||
            row.original.type === 'DEPOSIT' ||
            row.original.type === 'WITHDRAWAL'
          ) {
            symbol = 'RSR'
          }

          const amountUSD = row.original.amountUSD
          const usdDisplay = isNaN(+amountUSD)
            ? `$${amountUSD}`
            : `$${formatCurrency(+amountUSD)}`

          return (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="">{usdDisplay}</span>
              <span className="text-legend text-xs">
                ({`${formatCurrency(+parsed)} ${symbol}`})
              </span>
            </div>
          )
        },
      },
      // {
      //   accessorKey: 'id',
      //   header: t`Chain`,
      //   cell: () => <ChainLogo chain={chainId} />,
      // },
      {
        accessorKey: 'timestamp',
        header: t`Time`,
        cell: ({ getValue }) =>
          relativeTime(getValue() as number, getCurrentTime()),
      },
      {
        accessorKey: 'from.id',
        header: t`From`,
        cell: ({ getValue, row }) => {
          const address =
            row.original.type === 'MINT' || row.original.type === 'ISSUE'
              ? row.original.to.id
              : (getValue() as string)

          return (
            <div className="flex items-center">
              <a
                href={`https://debank.com/profile/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mr-2 underline hover:no-underline text-legend"
              >
                {shortenAddress(address)}
              </a>
              <DebankIcon />
            </div>
          )
        },
      },
      {
        accessorKey: 'hash',
        header: t`Tx Hash`,
        cell: ({ getValue }) => (
          <a
            href={getExplorerLink(
              getValue() as string,
              chainId,
              ExplorerDataType.TRANSACTION
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline text-legend"
          >
            {shortenString(getValue() as string)}
          </a>
        ),
      },
    ],
    [chainId, transactionTypes]
  )
}

const TransactionsTable = () => {
  const rToken = useAtomValue(selectedRTokenAtom)
  const { data } = useQuery(rTokenTransactionsQuery, {
    tokenId: rToken?.toLowerCase() ?? '',
  })
  const columns = useTransactionColumns()

  return (
    <DataTable
      columns={columns}
      data={data?.entries || []}
      pagination={{ pageSize: 10 }}
      className="rounded-3xl pt-5 bg-card border-[4px] border-secondary text-sm [&_table_tr]:border-none"
      initialSorting={[{ id: 'timestamp', desc: true }]}
    />
  )
}

const RTokenTransactions = () => {
  return (
    <div className="w-full">
      <div className="flex items-center ml-4 mb-5 mt-6 text-primary">
        <TransactionsIcon fontSize={24} />
        <h2 className="ml-2 text-2xl font-semibold">
          <Trans>Transactions</Trans>
        </h2>
      </div>
      <TransactionsTable />
    </div>
  )
}

export default RTokenTransactions
