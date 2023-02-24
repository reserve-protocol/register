import { formatEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import TransactionsTable from 'components/transactions/table'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'

const recentTxsQuery = gql`
  query GetRecentTransactions($tokenId: String!) {
    entries(
      orderBy: timestamp
      where: { token: $tokenId, type_not_in: ["ISSUE", "BURN"] }
      orderDirection: desc
      first: 50
    ) {
      type
      amount
      amountUSD
      hash
      timestamp
    }
  }
`

const RecentTransactions = () => {
  const rToken = useRToken()
  const { data } = useQuery(recentTxsQuery, {
    tokenId: rToken?.address.toLowerCase() ?? '',
  })
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
      bordered
      compact
      maxHeight={809}
      help="Recent on-chain transactions"
      title={t`Transactions`}
      data={txs}
    />
  )
}

export default RecentTransactions
