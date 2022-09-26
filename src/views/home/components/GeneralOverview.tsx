import { formatEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import TransactionsTable from 'components/transactions/table'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rpayTransactionsAtom } from 'state/atoms'
import { BoxProps } from 'theme-ui'
import { TransactionRecord } from 'types'

const protocolRecentTxsQuery = gql`
  query GetProtocolRecentTransactions {
    entries(orderBy: timestamp, orderDirection: desc, first: 25) {
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
  const { data } = useQuery(
    protocolRecentTxsQuery,
    {},
    { refreshInterval: 5000 }
  )
  const rpayTx = useAtomValue(rpayTransactionsAtom)

  const txs = useMemo(() => {
    if (!data?.entries) {
      return []
    }

    const txs = [...(Object.values(rpayTx) as TransactionRecord[])]

    // TODO: Parse type depending on lang
    txs.push(
      ...data.entries.map((tx: any) => ({
        ...tx,
        amount: Number(formatEther(tx.amount)),
      }))
    )

    txs.sort((a, b) => +b.timestamp - +a.timestamp)

    return txs
  }, [data, rpayTx])

  console.log('final tx', txs)

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
