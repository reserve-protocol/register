import { Table } from 'components/table'
import { Box, Text } from '@theme-ui/components'
import { gql, useSubscription } from '@apollo/client'
import { formatEther } from '@ethersproject/units'
import { formatCurrency } from 'utils'
import { shortenTransactionHash } from '@usedapp/core'

const GET_TRANSACTIONS = gql`
  subscription GetTransactions($tokenId: String!) {
    entries(
      first: 50
      where: { token: $tokenId }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      type
      amount
      token {
        id
      }
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
    Header: 'Tx Hash',
    accessor: 'transaction.id',
    Cell: ({ cell }: { cell: any }) =>
      cell.value ? shortenTransactionHash(cell.value) : 'RPay TX',
  },
]

const TransactionsTable = ({ tokenId }: { tokenId: string }) => {
  const { data, loading } = useSubscription(GET_TRANSACTIONS, {
    variables: {
      orderBy: 'id',
      first: 50,
      tokenId,
      where: {},
    },
  })

  if (!loading && !(data?.entries ?? []).length) {
    return (
      <Box>
        <Text p={3}>No transactions...</Text>
      </Box>
    )
  }

  return (
    <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
      <Table columns={columns} data={!loading ? data?.entries ?? [] : []} />
    </Box>
  )
}

export default TransactionsTable
