import { Trans, t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import ChainLogo from 'components/icons/ChainLogo'
import DebankIcon from 'components/icons/DebankIcon'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { Table } from 'components/table'
import TokenItem from 'components/token-item'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useMemo } from 'react'
import { Box, Link, Text } from 'theme-ui'
import { StringMap } from 'types'
import {
  formatCurrency,
  formatUsdCurrencyCell,
  shortenAddress,
  shortenString,
} from 'utils'
import { supportedChainList } from 'utils/constants'
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
  chain: number
}

const explorerTransactionsQuery = gql`
  query Transactions {
    entries(
      orderBy: timestamp
      where: { type_not: "TRANSFER" }
      orderDirection: desc
      first: 500
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

const useTransactions = () => {
  const { data } = useMultichainQuery(explorerTransactionsQuery)

  return useMemo(() => {
    if (!data) return []

    const tx: TransactionRecord[] = []

    for (const chain of supportedChainList) {
      if (data[chain]) {
        tx.push(
          ...data[chain].entries.map((entry: any) => ({ ...entry, chain }))
        )
      }
    }

    return tx
  }, [data])
}

const ExploreTransactions = () => {
  const data = useTransactions()
  const columnHelper = createColumnHelper<TransactionRecord>()
  const transactionTypes: StringMap = useMemo(
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
  const columns = useMemo(
    () => [
      columnHelper.accessor('token.symbol', {
        header: t`Token`,
        cell: (data) => (
          <Box sx={{ minWidth: 150 }}>
            <TokenItem
              symbol={data.getValue()}
              logo={'/svgs/defaultLogo.svg'}
            />
          </Box>
        ),
      }),
      columnHelper.accessor('type', {
        header: t`Type`,
        cell: (data) => (
          <Text variant="bold" sx={{ textTransform: 'capitalize' }}>
            {transactionTypes[data.getValue()] || data.getValue()}
          </Text>
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
      columnHelper.accessor('timestamp', {
        header: t`Time`,
        cell: (data) => dayjs.unix(data.getValue()).format('YYYY-M-D HH:mm'),
      }),
      columnHelper.accessor('from.id', {
        header: t`From`,
        cell: (data) => {
          const address =
            data.row.original.type === 'MINT' ||
            data.row.original.type === 'ISSUE'
              ? data.row.original.to.id
              : data.getValue()

          return (
            <Box variant="layout.verticalAlign">
              <Link
                href={`https://debank.com/profile/${address}`}
                target="_blank"
                mr="2"
              >
                {shortenAddress(address)}
              </Link>
              <DebankIcon />
            </Box>
          )
        },
      }),
      columnHelper.accessor('chain', {
        header: t`Platform`,
        cell: (data) => {
          return (
            <Link
              href={getExplorerLink(
                data.row.original.hash,
                data.row.original.chain,
                ExplorerDataType.TRANSACTION
              )}
              target="_blank"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <ChainLogo style={{ marginRight: 10 }} chain={data.getValue()} />

              {shortenString(data.row.original.hash)}
            </Link>
          )
        },
      }),
    ],
    []
  )

  return (
    <Box mt={5}>
      <Box variant="layout.verticalAlign" mb={5}>
        <TransactionsIcon fontSize={32} />
        <Text ml="2" as="h2" variant="title" sx={{ fontSize: 4 }}>
          <Trans>Transactions</Trans>
        </Text>
      </Box>
      <Table
        sorting
        sortBy={[{ id: 'timestamp', desc: true }]}
        data={data}
        pagination={{ pageSize: 10 }}
        columns={columns}
        sx={{ borderRadius: '0 0 20px 20px', overflow: 'hidden' }}
        compact
      />
    </Box>
  )
}

export default ExploreTransactions
