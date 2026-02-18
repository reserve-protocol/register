import { t, Trans } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import Help from 'components/help'
import ChainLogo from 'components/icons/ChainLogo'
import { Table } from '@/components/ui/legacy-table'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useMemo } from 'react'
import { blockTimestampAtom, chainIdAtom, rTokenAtom } from 'state/atoms'
import { cn } from '@/lib/utils'
import { StringMap, TransactionRecord } from 'types'
import { formatUsdCurrencyCell, relativeTime, shortenString } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

interface Props {
  data: TransactionRecord[]
  title?: string
  help?: string
  card?: boolean
  compact?: boolean
  bordered?: boolean
  maxHeight?: number | string
  external?: boolean
  multichain?: boolean
  className?: string
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
  className,
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
          <span>
            <span className="capitalize">
              {transactionTypes[data.getValue()] || data.getValue()}
            </span>{' '}
            {external && data.row.original.symbol}
          </span>
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
            <div className="flex items-center">
              {multichain && data.row.original.chain && (
                <ChainLogo
                  style={{ marginRight: 10 }}
                  chain={data.row.original.chain}
                />
              )}
              <a
                href={getExplorerLink(
                  value,
                  chainId,
                  ExplorerDataType.TRANSACTION
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline text-primary hover:underline"
                onClick={() => {
                  mixpanel.track('Clicked Transaction Viewer', {
                    RToken: rToken?.address.toLowerCase() ?? '',
                    Type: data.row.original.type,
                  })
                }}
              >
                {shortenString(value)}
              </a>
            </div>
          )
        },
      }),
    ],
    [currentTime, chainId]
  )

  return (
    <div
      className={cn(
        'px-0 sm:px-2 pt-4 sm:pt-8 bg-card rounded-3xl h-fit max-h-[360px] sm:max-h-none overflow-auto',
        className
      )}
    >
      <div className="flex items-center mb-8">
        {!!title && (
          <span className="pl-4 sm:pl-6 block text-xl font-medium">{title}</span>
        )}
        {!!help && <Help className="ml-2 mt-1" content={help} />}
      </div>
      <Table
        maxHeight={maxHeight}
        compact={compact}
        pb={compact ? 3 : 0}
        columns={columns}
        data={data}
      />
      {!data?.length && (
        <div className="mb-8 text-center">
          <span className="text-legend">
            <Trans>No transactions</Trans>
          </span>
        </div>
      )}
    </div>
  )
}

export default TransactionsTable
