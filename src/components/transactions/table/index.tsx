import styled from '@emotion/styled'
import { t, Trans } from '@lingui/macro'
import Help from 'components/help'
import { Table } from 'components/table'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { blockTimestampAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, BoxProps, Flex, Link, Text } from 'theme-ui'
import { StringMap, TransactionRecord } from 'types'
import { formatUsdCurrencyCell, relativeTime, shortenString } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

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
  external?: boolean
}

const TransactionsTable = ({
  data,
  title,
  help,
  card,
  maxHeight,
  bordered,
  compact,
  external = true,
  sx = {},
  ...props
}: Props) => {
  const currentTime = useAtomValue(blockTimestampAtom)
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
      UNSTAKE: t`Unstake`,
      WITHDRAW: t`Withdraw`,
      DEPOSIT: t`Deposit`,
      WITHDRAWAL: t`Withdrawal`,
    }),
    []
  )

  const columns = useMemo(
    () => [
      {
        Header: t`Type`,
        accessor: 'type',
        Cell: ({ cell }: { cell: any }) => (
          <Text sx={{ textTransform: 'capitalize' }}>
            {transactionTypes[cell.value] || cell.value}
          </Text>
        ),
      },
      {
        Header: t`Amount`,
        id: 'test',
        accessor: 'amountUSD',
        Cell: (cell: any) => {
          if (isNaN(cell.cell.value)) {
            return `$${cell.cell.value}`
          }

          return formatUsdCurrencyCell(cell)
        },
      },
      {
        Header: t`Time`,
        accessor: 'timestamp',
        Cell: ({ cell }: { cell: any }) =>
          relativeTime(cell.value, currentTime),
      },
      {
        Header: external ? t`Platform` : t`Hash`,
        id: 'id',
        accessor: 'hash',
        Cell: ({ cell }: { cell: any }) =>
          cell.value ? (
            <>
              <Link
                href={getExplorerLink(cell.value, ExplorerDataType.TRANSACTION)}
                target="_blank"
                sx={{ display: ['none', 'inherit'] }}
              >
                {shortenString(cell.value)}
              </Link>
            </>
          ) : (
            'RPay'
          ),
      },
    ],
    [currentTime]
  )

  return (
    <Container
      {...props}
      px={3}
      pt={4}
      sx={(theme: any) => ({
        backgroundColor: card ? theme.colors.contentLightBackground : 'none',
        border: bordered ? `1px solid ${theme.colors.border}` : 'none',
        borderRadius: borderRadius.boxes,
        height: 'fit-content',
        ...sx,
      })}
    >
      <Flex variant="layout.verticalAlign" mb={4}>
        {!!title && (
          <Text pl={3} variant="title" sx={{ display: 'block' }}>
            {title}
          </Text>
        )}
        {!!help && <Help ml="2" mt={1} content={help} />}
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
