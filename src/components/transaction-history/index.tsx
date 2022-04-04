import { SectionCard } from 'components'
import { Text, Box } from '@theme-ui/components'
import { Table } from 'components/table'
import {
  TX_STATUS,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { formatCurrency, shortenString } from 'utils'
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
          hash: hash ? shortenString(hash) : '-',
        }))
        .reverse(),
      ...history.map(({ transaction, amount, type }) => ({
        status: TX_STATUS.CONFIRMED,
        description: type,
        value: formatCurrency(+formatEther(amount)),
        hash: shortenString(transaction.id),
      })),
    ],
    [state.list, history.length]
  )

  if (!dataset.length) {
    return (
      <Box sx={{ textAlign: 'center' }} mt={3}>
        <Text>No recent transactions...</Text>
      </Box>
    )
  }

  return (
    <Table
      columns={columns as any}
      pagination={{ pageSize: 10 }}
      data={dataset}
    />
  )
}

export default TransactionHistory
