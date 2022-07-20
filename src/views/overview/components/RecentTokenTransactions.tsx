import { formatEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import TransactionsTable from 'components/transactions/table'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'

const tokenRecentTxsQuery = gql`
  query GetTokenRecentTransactions($tokenId: String!) {
    entries(
      orderBy: timestamp
      where: { token: $tokenId, type_in: ["TRANSFER", "MINT", "BURN"] }
      orderDirection: desc
      first: 20
    ) {
      type
      amount
      amountUSD
      hash
      timestamp
    }
  }
`

const RecentTokenTransactions = () => {
  const rToken = useRToken()
  const { data } = useQuery(tokenRecentTxsQuery, {
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
      maxHeight={420}
      help="TODO"
      title={t`Transactions`}
      data={txs}
    />
  )
}

export default RecentTokenTransactions
