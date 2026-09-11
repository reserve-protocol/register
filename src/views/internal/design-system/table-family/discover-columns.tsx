import type { ColumnDef } from '@tanstack/react-table'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { Sort } from './table'
import {
  DiscoverIdentity,
  DiscoverBasket,
  DiscoverMoney,
} from './discover-cells'
import { DiscoverPerformance } from './discover-performance'
import { type DiscoverRow, finiteValue } from './discover-fixtures'

const desktop = 'px-3 py-6'

export const discoverSortOptions = [
  ['name', 'Name'],
  ['marketCap', 'Market Cap'],
  ['price', 'Price'],
  ['change', 'Performance (Last 30 Days)'],
] as const

export function discoverColumns(loading: boolean): ColumnDef<DiscoverRow>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <div className="flex">
          <Sort column={column} label="Name" id="name" />
        </div>
      ),
      meta: {
        className: cn(desktop, 'w-[38%] pl-6 text-left [&_button]:ml-0'),
      },
      cell: ({ row }) => (
        <DiscoverIdentity row={row.original} loading={loading} />
      ),
    },
    {
      id: 'basket',
      header: () => (
        <span className={cn(type.supporting, 'text-supporting-foreground')}>
          Basket
        </span>
      ),
      meta: {
        className: cn(
          desktop,
          'w-[14%] [&_[data-slot=token-stack-trigger]]:-ml-2.5'
        ),
      },
      cell: ({ row }) => (
        <DiscoverBasket row={row.original} loading={loading} />
      ),
    },
    {
      id: 'marketCap',
      accessorFn: (row) => finiteValue(row.marketCap) ?? undefined,
      sortUndefined: 'last',
      header: ({ column }) => (
        <Sort column={column} label="Market Cap" id="marketCap" />
      ),
      meta: { className: cn(desktop, 'w-[12%] text-right') },
      cell: ({ row }) => (
        <DiscoverMoney
          value={row.original.marketCap}
          compact
          loading={loading}
        />
      ),
    },
    {
      id: 'price',
      accessorFn: (row) => finiteValue(row.price) ?? undefined,
      sortUndefined: 'last',
      header: ({ column }) => <Sort column={column} label="Price" id="price" />,
      meta: { className: cn(desktop, 'w-[12%] text-right') },
      cell: ({ row }) => (
        <DiscoverMoney value={row.original.price} loading={loading} />
      ),
    },
    {
      id: 'change',
      accessorFn: (row) => finiteValue(row.change) ?? undefined,
      sortUndefined: 'last',
      header: ({ column }) => (
        <Sort column={column} label="Performance (Last 30 Days)" id="change" />
      ),
      meta: { className: cn(desktop, 'w-[24%] pr-6 text-right') },
      cell: ({ row }) => (
        <DiscoverPerformance row={row.original} loading={loading} />
      ),
    },
  ]
}
