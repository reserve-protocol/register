import { formatEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import TransactionsTable from 'components/transactions/table'
import { gql } from 'graphql-request'
import useDebounce from 'hooks/useDebounce'
import useQuery from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rpayTransactionsAtom } from 'state/atoms'
import RSVTxListener from 'state/RSVTxListener'
import { BoxProps } from 'theme-ui'

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
  const { data } = useQuery(
    protocolRecentTxsQuery,
    {},
    { refreshInterval: 5000 }
  )
  const rpayTx = useDebounce(useAtomValue(rpayTransactionsAtom), 1000)

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
    txs.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))

    return txs.slice(0, 20)
  }, [data, rpayTx])

  return (
    <>
      <RSVTxListener />
      <TransactionsTable
        compact
        bordered
        maxHeight={420}
        title={t`Transactions`}
        help={t`This includes on-chain transactions for RTokens and RSV in addition to anonymized RPay transactions to show the full story of the Reserve ecosystem.`}
        data={txs}
        {...props}
      />
    </>
  )
}

export default TransactionsOverview
