import styled from '@emotion/styled'
import { t } from '@lingui/macro'
import { Table } from 'components/table'
import { useMemo } from 'react'
import { borderRadius } from 'theme'
import { Box, BoxProps, Text } from 'theme-ui'
import { TransactionRecord } from 'types'
import { formatCurrency, shortenString } from 'utils'

const Container = styled(Box)`
  max-height: 500px;
  overflow: auto;
`

interface Props extends BoxProps {
  data: TransactionRecord[]
  title?: string
  help?: string
  card?: boolean
  bordered?: boolean
}

const TransactionsTable = ({
  data,
  title,
  help,
  card,
  bordered,
  sx = {},
  ...props
}: Props) => {
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
        id: 'test',
        accessor: 'amount',
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
    <Container
      {...props}
      px={3}
      pt={3}
      sx={(theme: any) => ({
        backgroundColor: card ? theme.colors.contentBackground : 'none',
        border: bordered ? `1px solid ${theme.colors.border}` : 'none',
        borderRadius: borderRadius.boxes,
        ...sx,
      })}
    >
      {!!title && (
        <Text mb={3} sx={{ fontSize: 3, display: 'block' }}>
          {title}
        </Text>
      )}

      <Table columns={columns} data={data} />
    </Container>
  )
}

export default TransactionsTable
