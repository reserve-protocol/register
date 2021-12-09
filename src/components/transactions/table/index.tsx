import { Table } from 'components/table'
import { shortenAddress } from '@usedapp/core'
import { gql, useSubscription } from '@apollo/client'
import { formatEther } from '@ethersproject/units'
import { formatCurrency } from 'utils'

const GET_TRANSACTIONS = gql`
  subscription GetTransactions {
    entries {
      id
      type
      amount
      transaction {
        id
      }
    }
  }
`

// TODO: Internationalization
// TODO: Question: do we want to show all the RTokens activity or only the specified RToken
const columns = [
  {
    Header: 'Type',
    accessor: 'type',
  },
  {
    Header: 'Amount',
    accessor: 'amount',
    Cell: ({ cell }: { cell: any }) =>
      formatCurrency(parseFloat(formatEther(cell.value))),
  },
  {
    Header: 'USD $',
    accessor: 'amount',
    id: 'usd',
    Cell: ({ cell }: { cell: any }) =>
      `$${formatCurrency(parseFloat(formatEther(cell.value)))}`,
  },
  {
    Header: 'Chain',
    Cell: ({ cell }: { cell: any }) => 'TODO',
  },
]

const TransactionsTable = () => {
  const { data, loading } = useSubscription(GET_TRANSACTIONS, {
    variables: { orderBy: 'id', where: {} },
  })

  return (
    <Table columns={columns} data={!loading ? data.entries : []} pagination />
  )
}

export default TransactionsTable
