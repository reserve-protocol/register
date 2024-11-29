import { t, Trans } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import Help from 'components/help'
import ChainLogo from 'components/icons/ChainLogo'
import { Table } from '@/components/old/table'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useMemo } from 'react'
import { blockTimestampAtom, chainIdAtom, rTokenAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, BoxProps, Flex, Link, Text } from 'theme-ui'
import { StringMap, TransactionRecord } from 'types'
import { formatUsdCurrencyCell, relativeTime, shortenString } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

interface Props extends BoxProps {
  data: TransactionRecord[]
  title?: string
  help?: string
  card?: boolean
  compact?: boolean
  bordered?: boolean
  maxHeight?: number | string
  external?: boolean
  multichain?: boolean
}

const TransactionsTable = ({
  data,
  title,
  help,
  card,
  maxHeight,
  bordered,
  compact,
  multichain = false,
  external = true,
  sx = {},
  ...props
}: Props) => {
  const currentTime = useAtomValue(blockTimestampAtom)
  const chainId = useAtomValue(chainIdAtom)
  const rToken = useAtomValue(rTokenAtom)
  const transactionTypes: StringMap = useMemo(
    () => ({
      MINT: t`Mint`,
      REDEEM: t`Redeem`,
      TRANSFER: t`Transfer`,
      BURN: t`Melt`,
      ISSUE: t`Issue`,
      ISSUE_START: t`Start Issue`,
      CLAIM: t`Claim`,
      CANCEL_ISSUANCE: t`Cancel Issue`,
      STAKE: t`Stake`,
      UNSTAKE: t`Unstake`,
      WITHDRAW: t`Withdraw`,
      DEPOSIT: t`Deposit`,
      WITHDRAWAL: t`Withdraw`,
    }),
    []
  )
  const columnHelper = createColumnHelper<TransactionRecord>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('type', {
        header: t`Type`,
        cell: (data) => (
          <Text>
            <span style={{ textTransform: 'capitalize' }}>
              {transactionTypes[data.getValue()] || data.getValue()}
            </span>{' '}
            {external && data.row.original.symbol}
          </Text>
        ),
      }),
      columnHelper.accessor('amountUSD', {
        header: t`Amount`,
        cell: (data) => {
          if (isNaN(+data.getValue())) {
            return `$${data.getValue()}`
          }

          return formatUsdCurrencyCell(data as any)
        },
      }),
      columnHelper.accessor('timestamp', {
        header: t`Time`,
        cell: (data) => relativeTime(data.getValue(), currentTime),
      }),
      columnHelper.accessor('hash', {
        header: external ? t`Platform` : t`Hash`,
        cell: (data) => {
          const value = data.getValue()

          return (
            <Box variant="layout.verticalAlign">
              {multichain && data.row.original.chain && (
                <ChainLogo
                  style={{ marginRight: 10 }}
                  chain={data.row.original.chain}
                />
              )}
              <Link
                href={getExplorerLink(
                  value,
                  chainId,
                  ExplorerDataType.TRANSACTION
                )}
                target="_blank"
                sx={{ display: ['none', 'inherit'] }}
                onClick={() => {
                  mixpanel.track('Clicked Transaction Viewer', {
                    RToken: rToken?.address.toLowerCase() ?? '',
                    Type: data.row.original.type,
                  })
                }}
              >
                {shortenString(value)}
              </Link>
            </Box>
          )
        },
      }),
    ],
    [currentTime, chainId]
  )

  return (
    <Box
      {...props}
      px={[0, 2]}
      pt={[3, 5]}
      sx={(theme: any) => ({
        backgroundColor: theme.colors.contentBackground,
        border: 'none',
        borderRadius: borderRadius.boxes,
        height: 'fit-content',
        maxHeight: ['360px', 'none'],
        overflow: 'auto',
        ...sx,
      })}
    >
      <Flex variant="layout.verticalAlign" mb={5}>
        {!!title && (
          <Text pl={[3, 4]} variant="title" sx={{ display: 'block' }}>
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
    </Box>
  )
}

export default TransactionsTable
