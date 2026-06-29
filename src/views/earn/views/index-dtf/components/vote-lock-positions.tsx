import DecimalDisplay from '@/components/decimal-display'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'
import {
  ExternalVoteLockDrawer,
  type StTokenExtended,
} from '@/components/vote-lock'
import { walletAtom } from '@/state/atoms'
import { formatCurrency, getFolioRoute } from '@/utils'
import {
  EarnGovernanceTokenCell,
  EarnGovernanceTokenSkeleton,
  EarnMetricCtaCell,
  EarnMetricCtaSkeleton,
} from '@/views/earn/components/earn-table-cells'
import {
  earnGovernsColumnClassName,
  earnMetricColumnClassName,
  earnTableClassName,
  earnTableRowClassName,
  earnTokenColumnClassName,
  earnTvlColumnClassName,
  earnWalletColumnClassName,
} from '@/views/earn/components/earn-table-styles'
import PositionBalance from '@/views/earn/components/position-balance'
import { Trans, useLingui } from '@lingui/react/macro'
import { createColumnHelper } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Address } from 'viem'
import { dtfDataMapAtom, filteredVoteLockPositionsAtom } from '../atoms'
import { VoteLockPosition } from '../hooks/use-vote-lock-positions'
import TableFilters from './table-filters'

const columnHelper = createColumnHelper<VoteLockPosition>()

const GovernedDtfsCell = ({
  dtfs,
  chainId,
}: {
  dtfs: VoteLockPosition['dtfs']
  chainId: number
}) => {
  const [open, setOpen] = useState(false)
  const dtfDataMap = useAtomValue(dtfDataMapAtom)
  const sortedDtfs = useMemo(
    () =>
      [...dtfs].sort(
        (a, b) =>
          (dtfDataMap.get(b.symbol)?.marketCap ?? 0) -
          (dtfDataMap.get(a.symbol)?.marketCap ?? 0)
      ),
    [dtfs, dtfDataMap]
  )
  const [largestDtf, ...otherDtfs] = sortedDtfs

  if (!largestDtf) {
    return <span className="text-legend">-</span>
  }

  if (sortedDtfs.length <= 3) {
    return (
      <span className="text-legend">
        {sortedDtfs.map((dtf, index) => (
          <span key={dtf.address}>
            <span>${dtf.symbol}</span>
            {index < sortedDtfs.length - 1 && ', '}
          </span>
        ))}
      </span>
    )
  }

  return (
    <div className="flex min-w-0 items-center text-legend">
      <span className="font-semibold">${largestDtf.symbol}</span>
      {otherDtfs.length > 0 && (
        <>
          <span className="mx-1">+</span>
          <HoverCard open={open} onOpenChange={setOpen} openDelay={150}>
            <HoverCardTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex items-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:text-primary ${
                  open ? 'text-primary' : 'text-legend hover:text-primary'
                }`}
              >
                <span>
                  {otherDtfs.length}{' '}
                  {otherDtfs.length === 1 ? (
                    <Trans>other DTF</Trans>
                  ) : (
                    <Trans>other DTFs</Trans>
                  )}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className={`transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>
            </HoverCardTrigger>
            <HoverCardContent align="start" className="w-72 p-1">
              <div className="mb-2 text-xs px-3 pt-3 font-semibold uppercase tracking-wide text-legend">
                <Trans>Governed DTFs</Trans>
              </div>
              <div>
                {otherDtfs.map((dtf) => (
                  <a
                    key={dtf.address}
                    href={getFolioRoute(dtf.address, chainId)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="group block rounded-xl px-3 py-2 transition-colors hover:bg-muted"
                  >
                    <span className="block text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      ${dtf.symbol}
                    </span>
                    <span className="block truncate text-xs text-legend transition-colors group-hover:text-primary">
                      {dtf.name}
                    </span>
                  </a>
                ))}
              </div>
            </HoverCardContent>
          </HoverCard>
        </>
      )}
    </div>
  )
}

const useColumns = () => {
  const { t } = useLingui()
  const wallet = useAtomValue(walletAtom)

  return useMemo(() => {
    return [
      columnHelper.accessor('underlying.token.symbol', {
        header: ({ column }) => (
          <SorteableButton column={column}>
            <Trans>Gov. Token</Trans>
          </SorteableButton>
        ),
        meta: {
          className: earnTokenColumnClassName,
        },
        cell: (data) => (
          <EarnGovernanceTokenCell
            symbol={data.row.original.underlying.token.symbol}
            address={data.row.original.underlying.token.address}
            chainId={data.row.original.chainId}
            secondarySymbol={data.row.original.token.symbol}
          />
        ),
      }),
      columnHelper.accessor('lockedAmountUsd', {
        header: ({ column }) => (
          <SorteableButton column={column}>TVL</SorteableButton>
        ),
        meta: {
          className: earnTvlColumnClassName,
        },
        cell: (data) => (
          <div className="flex flex-col">
            <span>${formatCurrency(data.row.original.lockedAmountUsd, 0)}</span>
            <span className="text-xs whitespace-nowrap sm:text-sm text-legend">
              <DecimalDisplay
                value={data.row.original.lockedAmount}
                decimals={2}
                compact={true}
              />{' '}
              {data.row.original.underlying.token.symbol}
            </span>
          </div>
        ),
      }),
      ...(wallet
        ? [
            columnHelper.accessor('lockedAmount', {
              header: t`Your lock`,
              meta: {
                className: earnWalletColumnClassName,
              },
              cell: (data) => (
                <PositionBalance
                  address={data.row.original.token.address as Address}
                  chain={data.row.original.chainId}
                  price={data.row.original.token.price}
                  symbol={data.row.original.underlying.token.symbol}
                  decimals={data.row.original.token.decimals}
                />
              ),
            }),
          ]
        : []),
      columnHelper.accessor('dtfs', {
        header: t`Governs`,
        meta: {
          className: earnGovernsColumnClassName,
        },
        cell: (data) => (
          <GovernedDtfsCell
            dtfs={data.row.original.dtfs}
            chainId={data.row.original.chainId}
          />
        ),
      }),
      columnHelper.accessor('apr', {
        header: ({ column }) => (
          <SorteableButton column={column}>
            <Trans>Avg. 30d%</Trans>
          </SorteableButton>
        ),
        meta: {
          className: earnMetricColumnClassName,
        },
        cell: (data) => {
          return <EarnMetricCtaCell value={data.getValue()} label="APR" />
        },
      }),
    ]
  }, [t, wallet])
}

const VoteLockPositionsSkeleton = ({
  showWalletPosition,
}: {
  showWalletPosition: boolean
}) => {
  const skeletonRows = Array.from({ length: 5 }, (_, index) => index)

  return (
    <>
      {skeletonRows.map((rowIndex) => (
        <TableRow
          key={`skeleton-${rowIndex}`}
          className="border-none hover:bg-transparent"
        >
          <TableCell>
            <EarnGovernanceTokenSkeleton />
          </TableCell>

          <TableCell className="hidden min-[420px]:table-cell">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </TableCell>

          {showWalletPosition && (
            <TableCell className="hidden lg:table-cell">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </TableCell>
          )}

          <TableCell>
            <div className="flex">
              <Skeleton className="h-4 w-32" />
            </div>
          </TableCell>

          <TableCell className="text-right">
            <EarnMetricCtaSkeleton />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

const VoteLockPositions = () => {
  const data = useAtomValue(filteredVoteLockPositionsAtom)
  const wallet = useAtomValue(walletAtom)
  const columns = useColumns()
  const [currentVoteLock, setCurrentVoteLock] =
    useState<StTokenExtended | null>(null)

  const handleRowClick = (position: VoteLockPosition) => {
    // Convert VoteLockPosition to StTokenExtended format
    const stToken: StTokenExtended = {
      id: position.token.address as Address, // Using the vote-locked token address as the staking vault address
      chainId: position.chainId as StTokenExtended['chainId'],
      dtfAddress: position.dtfs[0]?.address as Address | undefined,
      token: {
        address: position.token.address as Address,
        name: position.token.name,
        symbol: position.token.symbol,
        decimals: position.token.decimals,
      },
      underlying: {
        address: position.underlying.token.address as Address,
        name: position.underlying.token.name,
        symbol: position.underlying.token.symbol,
        decimals: position.underlying.token.decimals,
      },
    }
    setCurrentVoteLock(stToken)
  }

  return (
    <>
      <div className="mt-4 bg-secondary p-1 rounded-4xl md:mt-10">
        <TableFilters />
        <DataTable<VoteLockPosition, any>
          columns={columns}
          data={data || []}
          onRowClick={handleRowClick}
          initialSorting={[{ id: 'apr', desc: true }]}
          loading={data === undefined}
          loadingSkeleton={
            <VoteLockPositionsSkeleton showWalletPosition={!!wallet} />
          }
          getRowClassName={() => earnTableRowClassName}
          className={earnTableClassName}
        />
      </div>
      {currentVoteLock && (
        <ExternalVoteLockDrawer
          stToken={currentVoteLock}
          dtfAddress={currentVoteLock.dtfAddress}
          open={!!currentVoteLock}
          onOpenChange={(open) => !open && setCurrentVoteLock(null)}
          onClose={() => setCurrentVoteLock(null)}
        />
      )}
    </>
  )
}

export default VoteLockPositions
