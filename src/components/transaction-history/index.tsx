import { SectionCard } from 'components'
import { Text, Box } from '@theme-ui/components'
import { Table } from 'components/table'
import { useTransactionsState } from 'state/context/TransactionManager'
import { shortenTransactionHash } from '@usedapp/core'
import { formatCurrency } from 'utils'

const columns = [
  {
    Header: 'Status',
    accessor: 'status',
  },
  {
    Header: 'Description',
    accessor: 'description',
  },
  {
    Header: 'Value',
    accessor: 'value',
    Cell: ({ cell }: { cell: any }) => formatCurrency(cell.value),
  },
  {
    Header: 'TX Hash',
    accessor: 'hash',
    // TODO: Get etherscan link here
    Cell: ({ cell }: { cell: any }) =>
      cell.value ? shortenTransactionHash(cell.value) : '-',
  },
]

const TransactionHistory = () => {
  const [state] = useTransactionsState()

  const dataset = state.list.slice().reverse()

  return (
    <SectionCard title="Your transactions">
      <Table columns={columns as any} data={dataset} />

      {dataset.length === 0 && (
        <Box sx={{ textAlign: 'center' }} mt={3}>
          <Text>No recent transactions...</Text>
        </Box>
      )}
    </SectionCard>
  )
}

export default TransactionHistory
