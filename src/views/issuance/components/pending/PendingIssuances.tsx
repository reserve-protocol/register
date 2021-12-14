import { gql, useSubscription } from '@apollo/client'
import { formatEther } from '@ethersproject/units'
import { Box, Text } from '@theme-ui/components'
import { shortenTransactionHash, useEthers } from '@usedapp/core'
import { SectionCard } from 'components'
import { Table } from 'components/table'
import { formatCurrency } from 'utils'

const COLUMNS = [
  {
    Header: 'Value',
    accessor: 'amount',
    Cell: ({ cell }: { cell: any }) =>
      formatCurrency(parseFloat(formatEther(cell.value))),
  },
  {
    Header: 'Available at',
    accessor: 'availableAt',
  },
  {
    Header: 'Started at',
    accessor: 'transaction.id',
    // TODO: Get etherscan link here
    Cell: ({ cell }: { cell: any }) =>
      cell.value ? shortenTransactionHash(cell.value) : '-',
  },
]

const GET_PENDING_ISSUANCES = gql`
  subscription GetPendingIssuances($userId: String!) {
    entries(user: $userId, where: { type: "Issuance", status: Pending }) {
      id
      type
      amount
      availableAt
      transaction {
        id
      }
      user {
        id
      }
    }
  }
`

const PendingIssuances = (props: any) => {
  const { account } = useEthers()
  const { data, loading } = useSubscription(GET_PENDING_ISSUANCES, {
    variables: {
      orderBy: 'availableAt',
      where: {},
      userId: account,
    },
  })

  return (
    <SectionCard title="Pending issuances" {...props}>
      <Table
        columns={COLUMNS as any}
        data={data && data.entries ? data.entries : []}
      />

      {data && data.entries.length === 0 && (
        <Box sx={{ textAlign: 'center' }} mt={3}>
          <Text>No pending issuances...</Text>
        </Box>
      )}
    </SectionCard>
  )
}

export default PendingIssuances
