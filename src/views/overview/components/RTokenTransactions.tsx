import { Trans, t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { Table } from 'components/table'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { selectedRTokenAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { formatCurrency, formatUsdCurrencyCell, shortenString } from 'utils'
import { formatEther } from 'viem'

export interface TransactionRecord {
  type: string
  amount: bigint
  amountUSD: number | string
  timestamp: number
  symbol?: string
  hash: string
  from: {
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
      where: { token: $tokenId }
      orderDirection: desc
      first: 200
    ) {
      type
      amount
      amountUSD
      hash
      from {
        id
      }
      token {
        symbol
      }
      timestamp
    }
  }
`

const useTransactionColumns = () => {
  const columnHelper = createColumnHelper<TransactionRecord>()
  const transactionTypes: Record<string, string> = useMemo(
    () => ({
      MINT: t`Mint`,
      REDEEM: t`Redeem`,
      TRANSFER: t`Transfer`,
      BURN: t`Redeem`,
      ISSUE: t`Issue`,
      ISSUE_START: t`Start Issue`,
      CLAIM: t`Claim`,
      CANCEL_ISSUANCE: t`Cancel Issue`,
      STAKE: t`Stake`,
      UNSTAKE: t`Unstake`,
      WITHDRAW: t`Withdraw`,
      DEPOSIT: t`Deposit`,
      WITHDRAWAL: t`Withdraw`,
    }),
    []
  )

  return useMemo(() => {
    return [
      columnHelper.accessor('type', {
        header: t`Type`,
        cell: (data) => (
          <Text>{transactionTypes[data.getValue()] || data.getValue()}</Text>
        ),
      }),
      columnHelper.accessor('amount', {
        header: t`Amount`,
        cell: (data) => {
          const parsed = formatEther(data.getValue())
          let symbol = data.row.original.token.symbol

          if (
            data.row.original.type === 'STAKE' ||
            data.row.original.type === 'UNSTAKE' ||
            data.row.original.type === 'WITHDRAW' ||
            data.row.original.type === 'DEPOSIT' ||
            data.row.original.type === 'WITHDRAWAL'
          ) {
            symbol = 'RSR'
          }
          return `${formatCurrency(+parsed)} ${symbol}`
        },
      }),
      columnHelper.accessor('amountUSD', {
        header: t`USD Value`,
        cell: (data) => {
          if (isNaN(+data.getValue())) {
            return `$${data.getValue()}`
          }

          return formatUsdCurrencyCell(data as any)
        },
      }),
      columnHelper.accessor('from.id', {
        header: t`From`,
        cell: (data) => <Text>{shortenString(data.getValue())}</Text>,
      }),
      columnHelper.accessor('hash', {
        header: t`Tx Hash`,
        cell: (data) => <Text>{shortenString(data.getValue())}</Text>,
      }),
    ]
  }, [])
}

const TransactionsTable = () => {
  const rToken = useAtomValue(selectedRTokenAtom)
  const { data } = useQuery(rTokenTransactionsQuery, {
    tokenId: rToken?.toLowerCase() ?? '',
  })
  const columns = useTransactionColumns()

  return (
    <Table
      compact
      pagination
      columns={columns}
      sx={{ borderRadius: '0 0 20px 20px' }}
      data={data?.entries || []}
    />
  )
}

const RTokenTransactions = () => {
  return (
    <Box>
      <Box
        variant="layout.verticalAlign"
        ml="4"
        mb={5}
        sx={{ color: 'accent' }}
      >
        <TransactionsIcon fontSize={24} />
        <Text ml="3" as="h2" variant="heading">
          <Trans>Transactions</Trans>
        </Text>
      </Box>
      <TransactionsTable />
    </Box>
  )
}

export default RTokenTransactions
