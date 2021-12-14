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

const GET_PENDING_UNSTAKE = gql`
  subscription GetPendingUnstake($userId: String!) {
    entries(user: $userId, where: { type: "Unstake", status: Pending }) {
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

const PendingUnstake = (props: any) => {
  const { account } = useEthers()
  const { data } = useSubscription(GET_PENDING_UNSTAKE, {
    variables: {
      orderBy: 'availableAt',
      where: {},
      userId: account,
    },
  })

  return (
    <SectionCard title="Pending Withdrawals" {...props}>
      <Table
        columns={COLUMNS as any}
        data={data && data.entries ? data.entries : []}
      />

      {data && data.entries.length === 0 && (
        <Box sx={{ textAlign: 'center' }} mt={3}>
          <Text>No pending withdrawals...</Text>
        </Box>
      )}
    </SectionCard>
  )
}

export default PendingUnstake
