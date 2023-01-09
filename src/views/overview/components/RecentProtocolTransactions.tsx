import { formatEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import TransactionsTable from 'components/transactions/table'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'

// TODO: Refactor this in favor of a hook
// TODO: Copy/paste on all transaction tables need to refactor
// TOOD: RSV transactions needs to be merged into this one
const tokenRecentTxsQuery = gql`
  query GetRTokenRecentTransactions($tokenId: String!) {
    entries(
      orderBy: timestamp
      where: { token: $tokenId, type_not_in: ["TRANSFER", "MINT", "BURN"] }
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

const RecentProtocolTransactions = () => {
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
      maxHeight={rToken?.isRSV ? 525 : 810}
      help="Protocol on-chain transactions related to RTokens"
      title={t`Protocol Transactions`}
      data={txs}
    />
  )
}

export default RecentProtocolTransactions
