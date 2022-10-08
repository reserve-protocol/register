import { formatEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import TransactionsTable from 'components/transactions/table'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rpayTransactionsAtom } from 'state/atoms'
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
  const rpayTx = useAtomValue(rpayTransactionsAtom)

  const txs = useMemo(() => {
    if (!data?.entries) {
      return []
    }

    const txs = [...rpayTx]

    // TODO: Parse type depending on lang
    txs.push(
      ...data.entries.map((tx: any) => ({
        ...tx,
        amount: Number(formatEther(tx.amount)),
      }))
    )

    txs.sort((a, b) => +b.timestamp - +a.timestamp)

    return txs.slice(0, 50)
  }, [data, rpayTx])

  return (
    <>
      <RSVTxListener />
      <TransactionsTable
        compact
        card
        maxHeight={400}
        help="This includes on-chain transactions in addition to anonymized RPay transactions to show the full story of the RSV ecosystem."
        title={t`Transactions`}
        data={txs}
        {...props}
      />
    </>
  )
}

export default RecentRSVTransactions
