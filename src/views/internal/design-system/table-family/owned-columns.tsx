import type { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { desktopCell, mobileCell, Sort } from './table'
import type { OwnedFamily, OwnedPosition } from './owned-fixtures'
import {
  OwnedIdentity,
  OwnedModify,
  OwnedBalance,
  OwnedNumber,
  OwnedUnderlying,
  OwnedFact,
  type ModifyOwned,
} from './owned-cells'
import { OwnedGoverns } from './owned-governs'

export const ownedColumns = (
  family: OwnedFamily,
  loading: boolean,
  onModify: ModifyOwned
): ColumnDef<OwnedPosition>[] => [
  {
    id: 'mobile',
    enableSorting: false,
    header: () => null,
    meta: { className: mobileCell },
    cell: ({ row: { original: row } }) => (
      <div className="relative space-y-4" data-owned-row={row.id}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <OwnedIdentity row={row} loading={loading} mobile />
          </div>
          <OwnedModify row={row} loading={loading} onModify={onModify} />
        </div>
        <div className="grid grid-cols-2 items-start gap-x-4 gap-y-4">
          <OwnedFact label="Balance">
            <OwnedBalance row={row} loading={loading} />
          </OwnedFact>
          <OwnedFact label="Value" end>
            <OwnedNumber row={row} field="value" loading={loading} />
          </OwnedFact>
          <OwnedFact label="Governs">
            <OwnedGoverns row={row} loading={loading} />
          </OwnedFact>
          <OwnedFact label="APY" end>
            <OwnedNumber row={row} field="apy" loading={loading} />
          </OwnedFact>
        </div>
        <span
          data-slot="row-seam"
          className="absolute -bottom-6 -right-6 left-0 border-b border-border"
        />
      </div>
    ),
  },
  {
    id: 'name',
    header: family === 'stake' ? 'Position' : 'Governance Token',
    enableSorting: false,
    meta: {
      className: cn(
        desktopCell,
        'pl-6 text-left',
        family === 'lock' ? 'w-[24%]' : 'w-[30%]'
      ),
    },
    cell: ({ row }) => <OwnedIdentity row={row.original} loading={loading} />,
  },
  ...(family === 'lock'
    ? [
        {
          id: 'underlying',
          header: 'Underlying',
          enableSorting: false,
          meta: { className: cn(desktopCell, 'w-[10%] text-left') },
          cell: ({ row }) => (
            <OwnedUnderlying row={row.original} loading={loading} />
          ),
        } satisfies ColumnDef<OwnedPosition>,
      ]
    : []),
  {
    id: 'governs',
    header: 'Governs',
    enableSorting: false,
    meta: {
      className: cn(
        desktopCell,
        'text-left',
        family === 'lock' ? 'w-[16%]' : 'w-1/5'
      ),
    },
    cell: ({ row }) => <OwnedGoverns row={row.original} loading={loading} />,
  },
  ...(['apy', 'balance', 'value'] as const).map(
    (id) =>
      ({
        id,
        accessorFn: (row: OwnedPosition) => row[id]?.order,
        enableSorting: family === 'stake' || id === 'value',
        sortingFn: 'basic' as const,
        sortUndefined: 'last' as const,
        sortDescFirst: false,
        header: ({ column }) =>
          family === 'stake' ? (
            <Sort
              column={column}
              id={id}
              label={{ apy: 'APY', balance: 'Balance', value: 'Value' }[id]}
            />
          ) : (
            <span>
              {{ apy: 'APY', balance: 'Balance', value: 'Value' }[id]}
            </span>
          ),
        meta: {
          className: cn(
            desktopCell,
            family === 'lock'
              ? { apy: 'w-[9%]', balance: 'w-[19%]', value: 'w-[10%]' }[id]
              : { apy: 'w-[10%]', balance: 'w-[16%]', value: 'w-[12%]' }[id]
          ),
        },
        cell: ({ row }) =>
          id === 'balance' ? (
            <OwnedBalance row={row.original} loading={loading} />
          ) : (
            <OwnedNumber row={row.original} field={id} loading={loading} />
          ),
      }) satisfies ColumnDef<OwnedPosition>
  ),
  {
    id: 'action',
    header: 'Action',
    enableSorting: false,
    meta: { className: cn(desktopCell, 'w-[12%] pr-6') },
    cell: ({ row }) => (
      <OwnedModify row={row.original} loading={loading} onModify={onModify} />
    ),
  },
]
