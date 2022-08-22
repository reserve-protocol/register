import { formatEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import TransactionsTable from 'components/transactions/table'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useMemo } from 'react'
import { BoxProps } from 'theme-ui'

const protocolRecentTxsQuery = gql`
  query GetProtocolRecentTransactions {
    entries(orderBy: timestamp, orderDirection: desc, first: 10) {
      type
      amount
      amountUSD
      hash
      timestamp
    }
  }
`

const TransactionsOverview = (props: BoxProps) => {
  // TODO: poll on blocknumber change
  const { data } = useQuery(protocolRecentTxsQuery)
  const txs = useMemo(() => {
    if (!data?.entries) {
      return []
    }

    // TODO: Parse type depending on lang
    return data.entries.map((tx: any) => ({
      ...tx,
      amount: Number(formatEther(tx.amount)),
    }))
  }, [data])

  return (
    <TransactionsTable
      compact
      card
      maxHeight={420}
      title={t`Transactions`}
      help="TODO"
      data={txs}
      {...props}
    />
  )
}

export default TransactionsOverview
