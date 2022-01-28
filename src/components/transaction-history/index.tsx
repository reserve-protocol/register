import { SectionCard } from 'components'
import { Text, Box } from '@theme-ui/components'
import { Table } from 'components/table'
import {
  TX_STATUS,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { shortenTransactionHash } from '@usedapp/core'
import { formatCurrency } from 'utils'
import { useMemo } from 'react'
import { formatEther } from '@ethersproject/units'

const columns = [
  {
    Header: 'Status',
    accessor: 'status',
    Cell: ({ cell }: { cell: any }) =>
      cell.value[0].toUpperCase() + cell.value.substr(1).toLowerCase(),
  },
  {
    Header: 'Description',
    accessor: 'description',
  },
  {
    Header: 'Value',
    accessor: 'value',
  },
  {
    Header: 'TX Hash',
    accessor: 'hash',
  },
]

interface IPreviousTransaction {
  transaction: { id: string }
  amount: string
  type: string
}

const TransactionHistory = ({
  history = [],
}: {
  history: IPreviousTransaction[]
}) => {
  const [state] = useTransactionsState()
  const dataset = useMemo(
    () => [
      ...state.list
        .map(({ status, description, value, hash }) => ({
          status,
          description,
          value: formatCurrency(+value),
          hash: hash ? shortenTransactionHash(hash) : '-',
        }))
        .reverse(),
      ...history.map(({ transaction, amount, type }) => ({
        status: TX_STATUS.SUBMITTED,
        description: type,
        value: formatCurrency(+formatEther(amount)),
        hash: shortenTransactionHash(transaction.id),
      })),
    ],
    [state.list, history.length]
  )

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
