import { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/components/ui/data-table'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { useProjectionFocus } from '../table-family/use-projection-focus'
import {
  CurrentIdentity,
  CurrentStatus,
  CurrentRound,
  CurrentDetails,
} from './cells'
import type { TableRow } from './model'

const desktop =
  'hidden px-3 py-5 text-left [@container(min-width:64rem)]:table-cell'

export function CurrentRebalancesTable({
  rows,
  hrefFor,
}: {
  rows: TableRow[]
  hrefFor: (row: TableRow) => string
}) {
  const root = useProjectionFocus()
  const dismissingHelp = useRef(false)
  const navigate = useNavigate()
  const columns = useMemo(() => tableColumns(hrefFor), [hrefFor])
  return (
    <div
      ref={root}
      data-testid="current-rebalances-table"
      className="min-w-0 bg-card [container-type:inline-size]"
      onPointerDownCapture={(event) => {
        // Remember the outside tap before Radix closes the tooltip on pointerdown.
        dismissingHelp.current =
          event.pointerType === 'touch' &&
          !(event.target as Element).closest(
            'a,button,input,select,textarea'
          ) &&
          !!event.currentTarget.querySelector(
            '[data-testid="current-table-launcher-help"] button[data-state$="open"]'
          )
      }}
    >
      <DataTable
        ariaLabel="Current Rebalances"
        columns={columns}
        data={rows}
        expandable={false}
        className="[&_table]:table-fixed [&_tbody]:bg-inherit [&_thead]:hidden [@container(min-width:64rem)]:[&_thead]:table-header-group [&_thead_tr]:h-auto [&_thead_tr]:border-0 [&_thead_tr]:hover:bg-transparent [&_th]:h-auto [&_th]:pb-1 [&_th]:pt-6 [&_th]:text-muted-foreground"
        getRowClassName={() =>
          `border-0 [&:not(:first-child)]:!border-t-0 ${roles.interaction.contentHover}`
        }
        onRowClick={(row, event) => {
          const dismissOnly = dismissingHelp.current && event.detail > 0
          dismissingHelp.current = false
          if (
            dismissOnly ||
            (event.target as HTMLElement).closest('a,button,input,select') ||
            window.getSelection()?.toString()
          )
            return
          if (event.metaKey || event.ctrlKey)
            window.open(hrefFor(row), '_blank', 'noopener,noreferrer')
          else navigate(hrefFor(row), { state: { currentTableOrigin: true } })
        }}
      />
    </div>
  )
}

function tableColumns(
  hrefFor: (row: TableRow) => string
): ColumnDef<TableRow>[] {
  return [
    {
      id: 'compact',
      header: () => null,
      enableSorting: false,
      meta: { className: 'px-6 py-6 [@container(min-width:64rem)]:hidden' },
      cell: ({ row: { original: row } }) => (
        <div className="space-y-5">
          <CurrentIdentity row={row} />
          <div className="space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4">
              {row.round !== null && (
                <div className="col-start-1 row-start-1 min-w-0 self-center [@container(min-width:22rem)]:col-span-2">
                  <CurrentRound row={row} />
                </div>
              )}
              <div
                className={cn(
                  'min-w-0',
                  row.round === null
                    ? 'col-start-1 row-start-1 pt-2'
                    : 'col-span-2 row-start-2 [@container(min-width:22rem)]:col-span-1 [@container(min-width:22rem)]:pt-2'
                )}
              >
                <CurrentStatus row={row} />
              </div>
              <div
                className={cn(
                  'col-start-2 row-start-1 -mr-1.5',
                  row.round === null
                    ? 'self-start'
                    : 'self-center [@container(min-width:22rem)]:row-start-2 [@container(min-width:22rem)]:self-start'
                )}
              >
                <CurrentDetails row={row} href={hrefFor(row)} />
              </div>
            </div>
            <div
              data-testid="current-table-expiry"
              className={cn(
                type.supporting,
                'flex items-baseline justify-between gap-3 text-muted-foreground'
              )}
            >
              <span>
                <>Rebalance expires in</>
              </span>
              <span
                data-testid="current-table-expiry-value"
                className="shrink-0 whitespace-nowrap font-medium tabular-nums text-foreground"
              >
                {row.expiry}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'rebalance',
      header: 'Rebalance',
      enableSorting: false,
      meta: { className: cn(desktop, 'pl-6') },
      cell: ({ row }) => <CurrentIdentity row={row.original} />,
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      meta: { className: cn(desktop, 'w-[25%]') },
      cell: ({ row }) => <CurrentStatus row={row.original} />,
    },
    {
      id: 'auction',
      header: 'Auction',
      enableSorting: false,
      meta: { className: cn(desktop, 'w-[23%]') },
      cell: ({ row }) => <CurrentRound row={row.original} />,
    },
    {
      id: 'expiry',
      header: () => <>Rebalance expires in</>,
      enableSorting: false,
      meta: { className: cn(desktop, 'w-[10%]') },
      cell: ({ row }) => (
        <span className={cn(type.body, 'whitespace-nowrap tabular-nums')}>
          {row.original.expiry}
        </span>
      ),
    },
    {
      id: 'details',
      header: () => null,
      enableSorting: false,
      meta: { className: cn(desktop, 'w-20 pr-6 text-right') },
      cell: ({ row }) => (
        <CurrentDetails row={row.original} href={hrefFor(row.original)} />
      ),
    },
  ]
}
