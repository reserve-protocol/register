import styled from '@emotion/styled'
import { t } from '@lingui/macro'
import { Table } from 'components/table'
import { useMemo } from 'react'
import { Box, BoxProps } from 'theme-ui'
import { TransactionRecord } from 'types'
import { formatCurrency, shortenString } from 'utils'

const Container = styled(Box)`
  max-height: 500px;
  overflow: auto;
`

interface Props extends BoxProps {
  data: TransactionRecord[]
}

const TransactionsTable = ({ data, ...props }: Props) => {
  const columns = useMemo(
    () => [
      {
        Header: t`Type`,
        accessor: 'type',
      },
      {
        Header: t`Amount`,
        accessor: 'amount',
        Cell: ({ cell }: { cell: any }) => formatCurrency(+cell.value),
      },
      {
        Header: t`USD value`,
        accesor: 'amount',
        Cell: ({ cell }: { cell: any }) => formatCurrency(+cell.value),
      },
      {
        Header: 'Explore',
        accessor: 'hash',
        Cell: ({ cell }: { cell: any }) =>
          cell.value ? shortenString(cell.value) : 'RPay TX',
      },
    ],
    []
  )

  return (
    <Container {...props}>
      <Table columns={columns} data={data} />
    </Container>
  )
}

export default TransactionsTable
