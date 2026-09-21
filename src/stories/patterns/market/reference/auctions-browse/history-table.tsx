import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/components/ui/data-table'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import { useProjectionFocus } from '../table-family/use-projection-focus'
import type { HistoricalRebalance } from './history-model'
import { HistoryMetricLabel } from './history-metric-label'
import {
  HistoryAuctions,
  HistoryFact,
  HistoryIdentity,
  HistoryNumber,
  HistoryPriceImpactUsd,
  HistoryStatus,
} from './history-cells'

const desktopCell = 'hidden px-3 py-4 [@container(min-width:56rem)]:table-cell'

export function HistoricalRebalancesTable({
  rows,
  loading = false,
}: {
  rows: HistoricalRebalance[]
  loading?: boolean
}) {
  const root = useProjectionFocus()
  const columns = useMemo(() => historyColumns(loading), [loading])
  return (
    <div
      ref={root}
      data-testid="historical-rebalances-table"
      aria-busy={loading || undefined}
      className={cn(
        'min-w-0 [container-type:inline-size]',
        roles.surface.content
      )}
    >
      <DataTable
        ariaLabel="Historical Rebalances"
        columns={columns}
        data={rows}
        expandable={false}
        className="[@container(min-width:56rem)]:pb-2 [&_table]:table-fixed [&_tbody]:bg-inherit [&_thead]:hidden [@container(min-width:56rem)]:[&_thead]:table-header-group [&_thead_tr]:h-auto [&_thead_tr]:border-0 [&_thead_tr]:hover:bg-transparent [&_th]:h-auto [&_th]:pb-3 [&_th]:pt-6 [&_th]:text-supporting-foreground"
        getRowClassName={() =>
          'border-0 hover:bg-transparent [&:not(:first-child)]:!border-t-0'
        }
      />
    </div>
  )
}

function historyColumns(loading: boolean): ColumnDef<HistoricalRebalance>[] {
  return [
    {
      id: 'mobile',
      header: () => null,
      enableSorting: false,
      meta: { className: 'px-6 py-6 [@container(min-width:56rem)]:hidden' },
      cell: ({ row: { original: row } }) => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 items-start gap-3 [@container(min-width:32rem)]:grid-cols-[minmax(0,1fr)_auto]">
            <HistoryIdentity row={row} loading={loading} />
            <HistoryStatus row={row} loading={loading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <HistoryFact label={<HistoryMetricLabel field="accuracy" />}>
              <HistoryNumber row={row} field="accuracy" loading={loading} />
            </HistoryFact>
            <HistoryFact label={<HistoryMetricLabel field="navChange" />} end>
              <HistoryNumber row={row} field="navChange" loading={loading} />
            </HistoryFact>
            <HistoryFact label="Traded">
              <HistoryNumber row={row} field="traded" loading={loading} />
              <HistoryAuctions row={row} loading={loading} />
            </HistoryFact>
            <HistoryFact label="Total price impact" end>
              <HistoryNumber row={row} field="priceImpact" loading={loading} />
              <HistoryPriceImpactUsd row={row} loading={loading} />
            </HistoryFact>
          </div>
        </div>
      ),
    },
    {
      id: 'rebalance',
      header: 'Rebalance',
      enableSorting: false,
      meta: { className: cn(desktopCell, 'pl-6 text-left') },
      cell: ({ row }) => (
        <HistoryIdentity row={row.original} loading={loading} />
      ),
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      meta: { className: cn(desktopCell, 'w-28 text-left') },
      cell: ({ row }) => <HistoryStatus row={row.original} loading={loading} />,
    },
    ...(['accuracy', 'navChange', 'priceImpact', 'traded'] as const).map(
      (field) =>
        ({
          id: field,
          enableSorting: false,
          header: () =>
            field === 'accuracy' || field === 'navChange' ? (
              <HistoryMetricLabel field={field} />
            ) : (
              {
                accuracy: 'Rebalance accuracy',
                navChange: 'NAV Change',
                priceImpact: 'Total price impact',
                traded: 'Traded',
              }[field]
            ),
          meta: {
            className: cn(
              desktopCell,
              type.supporting,
              'text-right',
              field === 'traded'
                ? 'w-[16%] pr-6'
                : field === 'navChange'
                  ? 'w-[12%]'
                  : 'w-[15%]'
            ),
          },
          cell: ({ row }) => (
            <div className="space-y-1">
              <HistoryNumber
                row={row.original}
                field={field}
                loading={loading}
              />
              {field === 'priceImpact' && (
                <HistoryPriceImpactUsd row={row.original} loading={loading} />
              )}
              {field === 'traded' && (
                <HistoryAuctions row={row.original} loading={loading} />
              )}
            </div>
          ),
        }) satisfies ColumnDef<HistoricalRebalance>
    ),
  ]
}
