import { formatEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import TransactionsTable from 'components/transactions/table'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'
import { BoxProps } from 'theme-ui'

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

const RecentTokenTransactions = (props: BoxProps) => {
  const rToken = useRToken()
  const { data } = useQuery(
    tokenRecentTxsQuery,
    {
      tokenId: rToken?.address.toLowerCase() ?? '',
    },
    { refreshInterval: 10000 }
  )
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
      bordered
      maxHeight={400}
      help="RToken related on-chain transactions"
      title={t`Transactions`}
      data={txs}
      {...props}
    />
  )
}

export default RecentTokenTransactions
