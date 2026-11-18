import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { Plural, Trans, useLingui } from '@lingui/react/macro'
import type {
  ColumnDef,
  OnChangeFn,
  SortingState,
} from '@tanstack/react-table'
import dayjs from 'dayjs'
import useIndexDTFList from 'hooks/useIndexDTFList'
import { useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { getFolioRoute, getTokenRoute, shortenString } from 'utils'
import { formatEther } from 'viem'
import {
  ExplorerCard,
  ExplorerHeader,
  ExplorerSubtitle,
} from '../kit/explorer-layout'
import ExplorerTable from '../kit/explorer-table'
import { SelectPill } from '../kit/filter-pill'
import InactiveTag from '../kit/inactive-tag'
import MobileField from '../kit/mobile-field'
import { TokenCell } from '../kit/token-cell'
import { sortByAtom } from './atoms'
import {
  ExternalLink,
  TypeLabel,
  WalletLink,
  getAmount,
  getTxLink,
  getUsd,
  getWallet,
} from './display'
import TransactionFilters from './Filters'
import useTransactionData, { type TransactionRecord } from './useTransactionData'

// Time is the only field both the Yield and the Index subgraph can order by.
const MOBILE_SORTS = {
  newest: { id: 'timestamp', desc: true },
  oldest: { id: 'timestamp', desc: false },
} as const

type MobileSort = keyof typeof MOBILE_SORTS

const MOBILE_SORT_LABELS: Record<MobileSort, MessageDescriptor> = {
  newest: msg`Newest`,
  oldest: msg`Oldest`,
}

const formatTime = (timestamp: number) => {
  const date = dayjs.unix(timestamp)
  return date.format(
    date.year() === dayjs().year() ? 'MMM D, HH:mm' : 'MMM D, YYYY HH:mm'
  )
}

const ExploreTransactions = () => {
  const { t } = useLingui()
  const { transactions, isLoading, isFetching } = useTransactionData()
  const { data: indexDTFs } = useIndexDTFList()
  const setQuerySort = useSetAtom(sortByAtom)
  const [sorting, setSorting] = useState<SortingState>([
    MOBILE_SORTS.newest,
  ])

  const indexAddresses = useMemo(
    () => new Set((indexDTFs ?? []).map((dtf) => dtf.address.toLowerCase())),
    [indexDTFs]
  )
  const getTokenLink = (tx: TransactionRecord) =>
    indexAddresses.has(tx.tokenAddress.toLowerCase())
      ? getFolioRoute(tx.tokenAddress, tx.chain)
      : getTokenRoute(tx.tokenAddress, tx.chain)

  const handleSorting: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater
    setSorting(next)
    const [first] = next
    if (first?.id === 'timestamp') {
      setQuerySort({ id: 'timestamp', desc: first.desc })
    }
  }

  const mobileSort =
    (Object.keys(MOBILE_SORTS) as MobileSort[]).find(
      (key) =>
        MOBILE_SORTS[key].id === sorting[0]?.id &&
        MOBILE_SORTS[key].desc === sorting[0]?.desc
    ) ?? 'newest'

  const columns: ColumnDef<TransactionRecord>[] = [
    {
      id: 'type',
      header: t`Type`,
      enableSorting: false,
      accessorFn: (tx) => tx.type,
      cell: ({ row }) => <TypeLabel type={row.original.type} />,
    },
    {
      id: 'token',
      header: t`Token`,
      enableSorting: false,
      accessorFn: (tx) => tx.token.symbol,
      cell: ({ row }) => (
        <a
          href={getTokenLink(row.original)}
          target="_blank"
          rel="noreferrer"
          className="text-foreground hover:text-primary"
        >
          <TokenCell
            symbol={row.original.token.symbol}
            address={row.original.tokenAddress}
            chain={row.original.chain}
          />
        </a>
      ),
    },
    {
      id: 'amount',
      header: t`Amount`,
      enableSorting: false,
      accessorFn: (tx) => +formatEther(tx.amount),
      meta: { className: 'text-right whitespace-nowrap' },
      cell: ({ row }) => getAmount(row.original),
    },
    {
      id: 'amountUSD',
      header: t`USD value`,
      enableSorting: false,
      accessorFn: (tx) => (tx.amountUSD === null ? -1 : +tx.amountUSD || 0),
      meta: { className: 'text-right whitespace-nowrap' },
      cell: ({ row }) => getUsd(row.original),
    },
    {
      id: 'timestamp',
      header: t`Time`,
      accessorFn: (tx) => tx.timestamp,
      meta: { className: 'whitespace-nowrap' },
      cell: ({ row }) => formatTime(row.original.timestamp),
    },
    {
      id: 'wallet',
      header: t`Wallet`,
      enableSorting: false,
      accessorFn: (tx) => getWallet(tx),
      cell: ({ row }) => <WalletLink tx={row.original} />,
    },
    {
      id: 'transaction',
      header: t`Transaction`,
      enableSorting: false,
      cell: ({ row }) => (
        <ExternalLink href={getTxLink(row.original)}>
          {shortenString(row.original.hash)}
        </ExternalLink>
      ),
    },
  ]

  const renderItem = (tx: TransactionRecord) => (
    <div className="flex flex-col gap-2 tabular-nums">
      <div className="flex items-center gap-3">
        <a
          href={getTokenLink(tx)}
          target="_blank"
          rel="noreferrer"
          aria-label={tx.token.symbol}
          className="shrink-0"
        >
          <TokenLogoWithChain
            symbol={tx.token.symbol}
            address={tx.tokenAddress}
            chain={tx.chain}
            width={36}
            height={36}
          />
        </a>
        <div className="flex min-w-0 flex-col">
          <span className="text-[17px]">
            <TypeLabel type={tx.type} compact />
          </span>
          <span className="truncate text-[13px] text-legend">
            {tx.token.symbol}
          </span>
          <InactiveTag address={tx.tokenAddress} className="mt-0.5" />
        </div>
        <div className="ml-auto flex flex-col text-right">
          <span className="text-[17px] font-semibold text-primary">
            {getAmount(tx)}
          </span>
          <span className="text-[13px] text-legend">{getUsd(tx)}</span>
        </div>
      </div>
      <div className="grid grid-cols-[1.1fr_1.1fr_1fr] gap-2">
        <MobileField label={<Trans>Time</Trans>}>
          {formatTime(tx.timestamp)}
        </MobileField>
        <MobileField label={<Trans>Wallet</Trans>}>
          <WalletLink tx={tx} />
        </MobileField>
        <MobileField label={<Trans>Transaction</Trans>} className="items-end">
          <ExternalLink href={getTxLink(tx)}>
            <Trans>View tx</Trans>
          </ExternalLink>
        </MobileField>
      </div>
    </div>
  )

  return (
    <>
      <ExplorerHeader
        title={<Trans>Transactions</Trans>}
        subtitle={
          !isLoading && (
            <ExplorerSubtitle
              value={
                <Plural
                  value={transactions.length}
                  one="Latest # transaction"
                  other="Latest # transactions"
                />
              }
            />
          )
        }
      />
      <ExplorerCard>
        <TransactionFilters>
          <SelectPill
            className="sm:hidden"
            label={<Trans>Sort</Trans>}
            value={mobileSort}
            options={(Object.keys(MOBILE_SORTS) as MobileSort[]).map((key) => ({
              value: key,
              label: t(MOBILE_SORT_LABELS[key]),
            }))}
            onChange={(key) => handleSorting([MOBILE_SORTS[key]])}
            highlighted
          />
        </TransactionFilters>
        <ExplorerTable
          data={transactions}
          columns={columns}
          getRowId={(tx) => `${tx.chain}-${tx.id}`}
          renderItem={renderItem}
          pageSize={10}
          sorting={sorting}
          onSortingChange={handleSorting}
          isLoading={isLoading}
          isFetching={isFetching}
          emptyLabel={<Trans>No transactions match these filters</Trans>}
        />
      </ExplorerCard>
    </>
  )
}

export default ExploreTransactions
