import styled from '@emotion/styled'
import { t } from '@lingui/macro'
import Help from 'components/help'
import { Table } from 'components/table'
import { useMemo } from 'react'
import { borderRadius } from 'theme'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { TransactionRecord } from 'types'
import { formatCurrency, shortenString } from 'utils'

const Container = styled(Box)`
  overflow: auto;
`

interface Props extends BoxProps {
  data: TransactionRecord[]
  title?: string
  help?: string
  card?: boolean
  compact?: boolean
  bordered?: boolean
  maxHeight?: number | string
}

const TransactionsTable = ({
  data,
  title,
  help,
  card,
  maxHeight,
  bordered,
  compact,
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
      <Flex variant="layout.verticalAlign">
        {!!title && (
          <Text mb={3} sx={{ fontSize: 3, display: 'block' }}>
            {title}
          </Text>
        )}
        {!!help && (
          <Box ml="auto">
            <Help content={help} />
          </Box>
        )}
      </Flex>

      <Table
        maxHeight={maxHeight}
        compact={compact}
        pb={compact ? 3 : 0}
        columns={columns}
        data={data}
      />
    </Container>
  )
}

export default TransactionsTable
