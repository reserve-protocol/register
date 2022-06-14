import { Text, Box } from 'theme-ui'
import { Table } from 'components/table'
import { formatCurrency, shortenString } from 'utils'
import { useMemo } from 'react'
import { formatEther } from '@ethersproject/units'
import { useAtomValue } from 'jotai'
import { currentTxAtom } from 'state/atoms'
import { TRANSACTION_STATUS } from 'utils/constants'

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
  const txs = useAtomValue(currentTxAtom)
  const dataset = useMemo(
    () => [
      ...txs
        .map(({ status, description, value, hash }) => ({
          status,
          description,
          value: formatCurrency(+value),
          hash: hash ? shortenString(hash) : '-',
        }))
        .reverse(),
      ...history.map(({ transaction, amount, type }) => ({
        status: TRANSACTION_STATUS.CONFIRMED,
        description: type,
        value: formatCurrency(+formatEther(amount)),
        hash: shortenString(transaction.id),
      })),
    ],
    [txs, history.length]
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
