import { Table } from 'components/table'
import { shortenAddress } from '@usedapp/core'
import { gql, useSubscription } from '@apollo/client'
import { formatEther } from '@ethersproject/units'

const GET_TRANSACTIONS = gql`
  subscription GetTransactions {
    transactions {
      id
      transactionType
      fromAddr {
        address
      }
      toAddr {
        address
      }
      token {
        symbol
      }
      block
      timestamp
      amount
    }
  }
`

// TODO: Internationalization
// TODO: Question: do we want to show all the RTokens activity or only the specified RToken
const columns = [
  {
    Header: 'Type',
    accessor: 'transactionType',
  },
  {
    Header: 'Token',
    accessor: 'token.symbol',
  },
  {
    Header: 'From',
    accessor: 'fromAddr.address',
    Cell: ({ cell }: { cell: any }) => shortenAddress(cell.value),
  },
  {
    Header: 'To',
    accessor: 'toAddr.address',
    Cell: ({ cell }: { cell: any }) => shortenAddress(cell.value),
  },
  {
    Header: 'Block #',
    accessor: 'block',
  },
  {
    Header: 'Amount',
    accessor: 'amount',
    Cell: ({ cell }: { cell: any }) => `$${formatEther(cell.value)}`,
  },
]

const TransactionsTable = () => {
  const { data, loading } = useSubscription(GET_TRANSACTIONS, {
    variables: { orderBy: 'symbol', where: {} },
  })

  return (
    <Table
      columns={columns}
      data={!loading ? data.transactions : []}
      pagination
    />
  )
}

export default TransactionsTable
