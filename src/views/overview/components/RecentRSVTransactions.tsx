import { formatEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import TransactionsTable from 'components/transactions/table'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'
import RSVTxListener from 'state/RSVTxListener'
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

const RecentRSVTransactions = (props: BoxProps) => {
  const rToken = useRToken()
  const { data } = useQuery(tokenRecentTxsQuery, {
    tokenId: rToken?.address.toLowerCase() ?? '',
  })

  const txs = useMemo(() => {
    if (!data?.entries) {
      return []
    }

    return data.entries.map((tx: any) => ({
      ...tx,
      amount: Number(formatEther(tx.amount)),
    }))
  }, [data])

  return (
    <>
      <RSVTxListener />
      <TransactionsTable
        compact
        bordered
        maxHeight={520}
        help="Recent on-chain RSV transactions."
        title={t`User Transactions`}
        data={txs}
        {...props}
      />
    </>
  )
}

export default RecentRSVTransactions
