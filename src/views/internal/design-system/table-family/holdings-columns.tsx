import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import {
  v1Typography as type,
  v1TypographyVariants,
} from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { Fact } from './cells'
import { Sort } from './table'
import {
  Allocation,
  Capitalization,
  HoldingIdentity,
  HoldingName,
  HoldingMark,
  HoldingMetadata,
  HoldingPerformance,
  type BridgeHandler,
} from './holdings-cells'
import type { Holding, HoldingsState, HoldingsTab } from './holdings-fixtures'

const desktop =
  'hidden px-3 py-3 text-right [@container(min-width:48rem)]:table-cell'

export function holdingsColumns(
  tab: HoldingsTab,
  state: HoldingsState,
  onBridge: BridgeHandler,
  tabs: ReactNode
): ColumnDef<Holding>[] {
  const loading = state === 'loading'
  const performanceLoading = loading || state === 'performance-loading'
  const cap = (row: Holding) =>
    tab === 'exposure' ? row.exposureCap : row.marketCap
  return [
    {
      id: 'identity',
      header: () => tabs,
      meta: { className: cn(desktop, 'w-[51%] pl-6 text-left') },
      cell: ({ row }) => (
        <HoldingIdentity
          row={row.original}
          tab={tab}
          loading={loading}
          onBridge={onBridge}
        />
      ),
    },
    {
      id: 'weight',
      accessorFn: (row) => row.weight,
      sortDescFirst: true,
      header: ({ column }) => (
        <Sort column={column} label="Weight" id="weight" />
      ),
      meta: { className: cn(desktop, 'w-[12%]') },
      cell: ({ row }) => (
        <Allocation value={row.original.weight} loading={loading} />
      ),
    },
    {
      id: 'change',
      accessorFn: (row) => row.change ?? undefined,
      sortDescFirst: true,
      sortUndefined: 'last',
      header: ({ column }) => (
        <Sort column={column} label="Price Change (7d)" id="change" />
      ),
      meta: { className: cn(desktop, 'w-[20%]') },
      cell: ({ row }) => (
        <HoldingPerformance row={row.original} loading={performanceLoading} />
      ),
    },
    {
      id: 'cap',
      header: () => (
        <span className={cn(type.supporting, 'text-supporting-foreground')}>
          Market Cap
        </span>
      ),
      meta: { className: cn(desktop, 'w-[17%] pr-6') },
      cell: ({ row }) => (
        <Capitalization value={cap(row.original)} loading={loading} />
      ),
    },
    {
      id: 'record',
      header: () => null,
      meta: {
        className: 'relative px-6 py-6 [@container(min-width:48rem)]:hidden',
      },
      cell: ({ row: { original: row } }) => (
        <>
          <div
            className="space-y-2 [@container(min-width:32rem)]:space-y-4"
            data-testid={`holding-record-${row.symbol}`}
          >
            <div
              className="flex items-start justify-between gap-4"
              data-slot="holding-summary"
            >
              <div
                className={cn(
                  v1TypographyVariants.compactItemTitle,
                  'min-h-6 min-w-0 flex-1 break-words text-foreground'
                )}
                data-slot="entity-identity-name"
              >
                <HoldingName row={row} tab={tab} loading={loading} />
              </div>
              <div
                className="shrink-0 text-right"
                data-slot="holding-allocation"
              >
                <span className="sr-only">Weight</span>
                <Allocation value={row.weight} loading={loading} emphasized />
              </div>
            </div>
            <div
              className="grid grid-cols-[minmax(0,1fr)_max-content] gap-x-6 gap-y-4 [@container(min-width:32rem)]:grid-cols-[minmax(0,1fr)_max-content_max-content]"
              data-slot="holding-details"
            >
              <div
                className="col-span-2 min-w-0 space-y-1 [@container(min-width:32rem)]:col-span-1"
                data-slot="holding-symbol"
              >
                <div
                  className={cn(
                    type.supporting,
                    'hidden text-supporting-foreground [@container(min-width:32rem)]:block'
                  )}
                >
                  Symbol
                </div>
                <div
                  className={cn(
                    type.supporting,
                    'flex min-w-0 items-start gap-2 text-supporting-foreground'
                  )}
                >
                  <HoldingMark
                    row={row}
                    tab={tab}
                    size="md"
                    loading={loading}
                  />
                  <div className="min-w-0 break-words">
                    <HoldingMetadata
                      row={row}
                      tab={tab}
                      onBridge={onBridge}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
              <div
                className="[@container(min-width:32rem)]:[&>div]:items-end [@container(min-width:32rem)]:text-right"
                data-slot="holding-price-change"
              >
                <Fact label="Price Change (7d)">
                  <HoldingPerformance row={row} loading={performanceLoading} />
                </Fact>
              </div>
              <div
                className="text-right [&>div]:items-end"
                data-slot="holding-market-cap"
              >
                <Fact label="Market Cap">
                  <Capitalization value={cap(row)} loading={loading} />
                </Fact>
              </div>
            </div>
          </div>
          <div
            aria-hidden
            data-slot="row-seam"
            className="absolute bottom-0 left-6 right-0 border-b border-border"
          />
        </>
      ),
    },
  ]
}
