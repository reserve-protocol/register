import styled from '@emotion/styled'
import { t, Trans } from '@lingui/macro'
import Help from 'components/help'
import { Table } from 'components/table'
import { useMemo } from 'react'
import { borderRadius } from 'theme'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { StringMap, TransactionRecord } from 'types'
import { formatCurrencyCell, formatUsdCurrencyCell, shortenString } from 'utils'

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
  // TODO: update changing lang
  const transactionTypes: StringMap = useMemo(
    () => ({
      MINT: t`Mint`,
      REDEEM: t`Redeem`,
      TRANSFER: t`Transfer`,
      BURN: t`Burn`,
      ISSUE: t`Issue`,
      ISSUE_START: t`Start Issue`,
      CLAIM: t`Claim`,
      CANCEL_ISSUANCE: t`Cancel Issue`,
      STAKE: t`Stake`,
      UNSTAKE: t`UnStake`,
      WITHDRAW: t`Withdraw`,
    }),
    []
  )

  const columns = useMemo(
    () => [
      {
        Header: t`Type`,
        accessor: 'type',
        Cell: ({ cell }: { cell: any }) =>
          transactionTypes[cell.value] || cell.value,
      },
      {
        Header: t`Amount`,
        accessor: 'amount',
        Cell: formatCurrencyCell,
      },
      {
        Header: t`USD value`,
        id: 'test',
        accessor: 'amountUSD',
        Cell: formatUsdCurrencyCell,
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
      pt={4}
      sx={(theme: any) => ({
        backgroundColor: card ? theme.colors.contentLightBackground : 'none',
        border: bordered ? `1px solid ${theme.colors.darkBorder}` : 'none',
        borderRadius: borderRadius.boxes,
        height: 'fit-content',
        ...sx,
      })}
    >
      <Flex variant="layout.verticalAlign">
        {!!title && (
          <Text mb={4} pl={3} sx={{ fontSize: 3, display: 'block' }}>
            {title}
          </Text>
        )}
        {!!help && <Help ml="4" mb={4} content={help} />}
      </Flex>
      <Table
        maxHeight={maxHeight}
        compact={compact}
        pb={compact ? 3 : 0}
        columns={columns}
        data={data}
      />
      {!data?.length && (
        <Box mb={5} sx={{ textAlign: 'center' }}>
          <Text variant="legend">
            <Trans>No transactions</Trans>
          </Text>
        </Box>
      )}
    </Container>
  )
}

export default TransactionsTable
