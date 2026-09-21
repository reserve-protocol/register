import type { ColumnDef } from '@tanstack/react-table'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { Sort } from './table'
import {
  DefiHelp,
  DefiIdentity,
  DefiPlatform,
  DefiPoolAction,
  DefiValue,
} from './defi-cells'
import { DefiYield, DefiYieldTotal, DefiYieldBreakdown } from './defi-yield'
import type { DefiRow } from './defi-fixtures'

const desktop = 'hidden px-3 py-3 [@container(min-width:64rem)]:table-cell'

export function defiColumns(loading: boolean): ColumnDef<DefiRow>[] {
  return [
    {
      id: 'symbol',
      accessorKey: 'symbol',
      sortDescFirst: false,
      header: ({ column }) => <Sort column={column} label="Pool" id="symbol" />,
      meta: {
        className: cn(desktop, 'w-[26%] pl-6 text-left [&_button]:ml-0'),
      },
      cell: ({ row }) => <DefiIdentity row={row.original} loading={loading} />,
    },
    {
      id: 'projectName',
      accessorKey: 'projectName',
      sortDescFirst: false,
      header: ({ column }) => (
        <Sort column={column} label="Platform" id="projectName" />
      ),
      meta: { className: cn(desktop, 'w-[18%] text-left [&_button]:ml-0') },
      cell: ({ row }) => <DefiPlatform row={row.original} loading={loading} />,
    },
    ...(['apy', 'tvlUsd'] as const).map(
      (field): ColumnDef<DefiRow> => ({
        id: field,
        accessorFn: (row) => row[field] ?? undefined,
        sortDescFirst: true,
        sortUndefined: 'last',
        header: ({ column }) => (
          <div className="flex items-center justify-end gap-3">
            <Sort
              column={column}
              label={field === 'apy' ? 'APY' : 'TVL'}
              id={field}
            />
            {field === 'apy' && <DefiHelp />}
          </div>
        ),
        meta: {
          className: cn(
            desktop,
            'text-right',
            field === 'apy' ? 'w-[25%]' : 'w-[15%]'
          ),
        },
        cell: ({ row, table }) =>
          field === 'apy' ? (
            <DefiYield
              row={row.original}
              loading={loading}
              sortField={table.getState().sorting[0]?.id}
            />
          ) : (
            <DefiValue row={row.original} field={field} loading={loading} />
          ),
      })
    ),
    {
      id: 'action',
      enableSorting: false,
      header: () => <span className="sr-only">View pool</span>,
      meta: { className: cn(desktop, 'w-[16%] pr-6 text-right') },
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DefiPoolAction row={row.original} loading={loading} />
        </div>
      ),
    },
    ...(['chain', 'apyBase', 'apyReward'] as const).map(
      (field): ColumnDef<DefiRow> => ({
        id: field,
        accessorFn: (row) => row[field] ?? undefined,
        sortDescFirst: field !== 'chain',
        sortUndefined: 'last',
        header: () => null,
        cell: () => null,
        meta: { className: 'hidden' },
      })
    ),
    {
      id: 'record',
      header: () => null,
      meta: {
        className: 'relative px-6 py-6 [@container(min-width:64rem)]:hidden',
      },
      cell: ({ row: { original: row }, table }) => (
        <>
          <div className="space-y-4" data-slot="defi-record">
            <div
              className="grid grid-cols-[minmax(0,1fr)_2rem] items-start gap-4"
              data-slot="defi-record-header"
            >
              <DefiIdentity row={row} loading={loading} includePlatform />
              <DefiPoolAction row={row} loading={loading} iconOnly />
            </div>
            <div className="space-y-1" data-slot="defi-metrics">
              <div className="grid grid-cols-2 gap-6">
                {(['apy', 'tvlUsd'] as const).map((field) => (
                  <div
                    key={field}
                    className="min-w-0 space-y-1 even:text-right"
                    data-slot="defi-fact"
                  >
                    <div
                      className={cn(
                        type.supporting,
                        'flex items-center gap-1 text-supporting-foreground',
                        field === 'tvlUsd' && 'justify-end'
                      )}
                    >
                      <span data-slot="defi-fact-label">
                        {field === 'apy' ? 'APY' : 'TVL'}
                      </span>
                    </div>
                    {field === 'apy' ? (
                      <DefiYieldTotal
                        row={row}
                        loading={loading}
                        alignEnd={false}
                      />
                    ) : (
                      <div className="flex h-6 items-center justify-end">
                        <DefiValue row={row} field={field} loading={loading} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <DefiYieldBreakdown
                row={row}
                loading={loading}
                sortField={table.getState().sorting[0]?.id}
              />
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
