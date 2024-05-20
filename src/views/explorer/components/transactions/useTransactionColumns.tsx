import { t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import ChainLogo from 'components/icons/ChainLogo'
import DebankIcon from 'components/icons/DebankIcon'
import TokenItem from 'components/token-item'
import dayjs from 'dayjs'
import useRTokenLogo from 'hooks/useRTokenLogo'
import { useMemo } from 'react'
import { Box, Link, Text } from 'theme-ui'
import { StringMap } from 'types'
import {
  formatCurrency,
  formatUsdCurrencyCell,
  getTokenRoute,
  shortenAddress,
  shortenString,
} from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { formatEther } from 'viem'
import { TransactionRecord } from './useTransactionData'

const useTransactionColumns = () => {
  const columnHelper = createColumnHelper<TransactionRecord>()
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
      UNSTAKE_CANCELLED: t`Unstake Cancelled`,
    }),
    []
  )

  return useMemo(
    () => [
      columnHelper.accessor('token.symbol', {
        header: t`Token`,
        cell: (data) => {
          const logo = useRTokenLogo(
            data.row.original.tokenAddress,
            data.row.original.chain
          )

          return (
            <Link
              href={getTokenRoute(
                data.row.original.tokenAddress,
                data.row.original.chain
              )}
              target="_blank"
              sx={{ textDecoration: 'underline' }}
            >
              <TokenItem symbol={data.getValue()} logo={logo} />
            </Link>
          )
        },
      }),
      columnHelper.accessor('type', {
        header: t`Type`,
        cell: (data) => (
          <Text variant="bold" sx={{ textTransform: 'capitalize' }}>
            {transactionTypes[data.getValue()] || data.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('amount', {
        header: t`Amount`,
        cell: (data) => {
          const parsed = formatEther(data.getValue())
          let symbol = data.row.original.token.symbol

          if (
            data.row.original.type === 'STAKE' ||
            data.row.original.type === 'UNSTAKE' ||
            data.row.original.type === 'WITHDRAW' ||
            data.row.original.type === 'DEPOSIT' ||
            data.row.original.type === 'WITHDRAWAL'
          ) {
            symbol = 'RSR'
          }
          return `${formatCurrency(+parsed)} ${symbol}`
        },
      }),
      columnHelper.accessor('amountUSD', {
        header: t`USD Value`,
        cell: (data) => {
          if (isNaN(+data.getValue())) {
            return `$${data.getValue()}`
          }

          return formatUsdCurrencyCell(data as any)
        },
      }),
      columnHelper.accessor('timestamp', {
        header: t`Time`,
        cell: (data) => dayjs.unix(data.getValue()).format('YYYY-M-D HH:mm'),
      }),
      columnHelper.accessor('from.id', {
        header: t`From`,
        cell: (data) => {
          const address =
            data.row.original.type === 'MINT' ||
            data.row.original.type === 'ISSUE'
              ? data.row.original.to.id
              : data.getValue()

          return (
            <Box variant="layout.verticalAlign">
              <Link
                href={`https://debank.com/profile/${address}`}
                target="_blank"
                mr="2"
              >
                {shortenAddress(address)}
              </Link>
              <DebankIcon />
            </Box>
          )
        },
      }),
      columnHelper.accessor('chain', {
        header: t`Platform`,
        cell: (data) => {
          return (
            <Link
              href={getExplorerLink(
                data.row.original.hash,
                data.row.original.chain,
                ExplorerDataType.TRANSACTION
              )}
              target="_blank"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <ChainLogo style={{ marginRight: 10 }} chain={data.getValue()} />

              {shortenString(data.row.original.hash)}
            </Link>
          )
        },
      }),
    ],
    []
  )
}

export default useTransactionColumns
