import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Link } from '@/components/design-system-v1/link'
import { cn } from '@/lib/utils'
import { Fact, IdentityCell, NumericCell, PerformanceCell } from './cells'
import { type PositionFixture } from './fixtures'
import {
  desktopCell,
  mobileCell,
  ExpandRows,
  FamilyHeader,
  FamilyTable,
  Sort,
} from './table'

const PositionIdentity = ({
  row,
  loading,
}: {
  row: PositionFixture
  loading: boolean
}) =>
  loading ? (
    <IdentityCell {...row} loading />
  ) : (
    <Link
      href={row.href}
      data-table-focus={`identity-${row.id}`}
      target="_blank"
      treatment="contextual"
      className="block min-w-0 flex-1 basis-40 hover:no-underline"
    >
      <IdentityCell {...row} />
    </Link>
  )

export function Positions({
  rows,
  loading = false,
  family = 'index',
}: {
  rows: PositionFixture[]
  loading?: boolean
  family?: 'index' | 'yield'
}) {
  const [expanded, setExpanded] = useState(false)
  const columns = useMemo<ColumnDef<PositionFixture>[]>(
    () => [
      {
        id: 'mobile',
        enableSorting: false,
        header: () => null,
        meta: { className: mobileCell },
        cell: ({ row: { original: row }, table }) => (
          <div className="relative space-y-4">
            <PositionIdentity row={row} loading={loading} />
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <Fact label="Balance">
                <NumericCell
                  loading={loading}
                  value={
                    row.balance && {
                      ...row.balance,
                      text: `${row.balance.text} ${row.symbol}`,
                    }
                  }
                />
              </Fact>
              <Fact label="Value">
                <NumericCell value={row.value} loading={loading} />
              </Fact>
            </div>
            <SupportingFacts
              row={row}
              loading={loading}
              sort={table.getState().sorting[0]?.id}
            />
            <span
              data-slot="row-seam"
              className="absolute -bottom-6 -right-6 left-0 border-b border-border"
            />
          </div>
        ),
      },
      {
        id: 'name',
        header: 'Name',
        enableSorting: false,
        meta: { className: cn(desktopCell, 'w-1/4 pl-6 text-left') },
        cell: ({ row }) => (
          <PositionIdentity row={row.original} loading={loading} />
        ),
      },
      {
        id: 'performance',
        accessorFn: (row) => row.performance ?? undefined,
        sortUndefined: 'last',
        header: ({ column }) => (
          <Sort column={column} id="performance" label="Performance (7D)" />
        ),
        meta: { className: desktopCell },
        cell: ({ row }) => (
          <PerformanceCell value={row.original.performance} loading={loading} />
        ),
      },
      ...(['pnl', 'cost', 'cap', 'balance', 'value'] as const).map((id) => ({
        id,
        accessorFn: (row: PositionFixture) => row[id]?.order,
        sortingFn: 'basic' as const,
        sortUndefined: 'last' as const,
        sortDescFirst: false,
        header: ({
          column,
        }: {
          column: Parameters<typeof Sort<PositionFixture>>[0]['column']
        }) => (
          <Sort
            column={column}
            id={id}
            label={
              {
                pnl: 'Unrealized P/L',
                cost: 'Avg Cost',
                cap: 'Market Cap',
                balance: 'Balance',
                value: 'Value',
              }[id]
            }
          />
        ),
        meta: { className: cn(desktopCell, id === 'value' && 'pr-6') },
        cell: ({ row }: { row: { original: PositionFixture } }) => (
          <NumericCell
            value={row.original[id]}
            performance={id === 'pnl'}
            loading={loading}
          />
        ),
      })),
    ],
    [loading]
  )
  const eligibleRows =
    family === 'index'
      ? rows.filter((row) => row.balance && row.balance.order > 0n)
      : rows
  if (!eligibleRows.length) return null
  return (
    <section
      data-testid="table-family-positions"
      className="min-w-0 bg-card"
      aria-busy={loading || undefined}
    >
      <FamilyHeader
        title={
          family === 'index' ? 'Index DTF Positions' : 'Yield DTF Positions'
        }
        subtitle={
          family === 'index'
            ? 'Your Decentralized Token Fund investments.'
            : 'Your yield-bearing stablecoin holdings.'
        }
      >
        <Link
          href={`/discover?tab=${family}`}
          target="_blank"
          treatment="standalone"
        >
          {family === 'index'
            ? 'Browse all Index DTFs'
            : 'Browse all Yield DTFs'}
        </Link>
      </FamilyHeader>
      <FamilyTable
        sortMenu
        label={
          family === 'index' ? 'Index DTF Positions' : 'Yield DTF Positions'
        }
        columns={columns}
        data={eligibleRows}
        rowLimit={expanded ? undefined : 5}
        onRowClick={
          loading
            ? undefined
            : (row) => window.open(row.href, '_blank', 'noopener,noreferrer')
        }
      >
        {eligibleRows.length > 5 && !loading && (
          <ExpandRows
            expanded={expanded}
            total={eligibleRows.length}
            onToggle={() => setExpanded(!expanded)}
          />
        )}
      </FamilyTable>
    </section>
  )
}

function SupportingFacts({
  row,
  loading,
  sort,
}: {
  row: PositionFixture
  loading: boolean
  sort?: string
}) {
  const fields = [
    ['performance', 'Performance (7D)'],
    ['pnl', 'Unrealized P/L'],
    ['cost', 'Avg Cost'],
    ['cap', 'Market Cap'],
  ] as const
  return (
    <div
      className={cn(
        'grid-cols-2 gap-x-6 gap-y-3 [@container(min-width:40rem)]:grid',
        fields.some(([id]) => id === sort) ? 'grid' : 'hidden'
      )}
    >
      {fields.map(([id, label]) => (
        <div
          key={id}
          data-slot={`supporting-fact-${id}`}
          className={cn(
            sort !== id && 'hidden [@container(min-width:40rem)]:block',
            '[@container(min-width:40rem)]:even:[&>div]:items-end [@container(min-width:40rem)]:even:text-right'
          )}
        >
          <Fact label={label}>
            {id === 'performance' ? (
              <PerformanceCell value={row.performance} loading={loading} />
            ) : (
              <NumericCell
                value={row[id]}
                performance={id === 'pnl'}
                loading={loading}
              />
            )}
          </Fact>
        </div>
      ))}
    </div>
  )
}
