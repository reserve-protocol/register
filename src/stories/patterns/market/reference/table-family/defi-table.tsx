import { useMemo } from 'react'
import DataTable from '@/components/ui/data-table'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { defiColumns } from './defi-columns'
import { DefiHelp } from './defi-cells'
import { defiSortOptions, previewDefi } from './defi-fixtures'
import type { EarnState } from './earn-fixtures'
import { SortMenu } from './sort-menu'
import { useProjectionFocus } from './use-projection-focus'

export function DefiTable({ state }: { state: EarnState }) {
  const root = useProjectionFocus()
  const columns = useMemo(() => defiColumns(state === 'loading'), [state])
  const rows = useMemo(() => previewDefi(state), [state])
  return (
    <div
      ref={root}
      data-slot="table-family-container"
      className="min-w-0 pt-6 [container-type:inline-size]"
    >
      <DataTable
        ariaLabel="DeFi Yield"
        columns={columns}
        data={rows}
        expandable={false}
        initialSorting={[{ id: 'apy', desc: true }]}
        renderToolbar={(table) => (
          <div
            className="flex flex-wrap items-center justify-between gap-6 px-6 pb-2 [@container(min-width:64rem)]:justify-end [@container(min-width:64rem)]:pb-4"
            data-slot="defi-toolbar"
          >
            <div
              className={`${type.supporting} flex items-center gap-1 text-supporting-foreground [@container(min-width:64rem)]:hidden`}
            >
              <span data-slot="defi-toolbar-apy-label">APY</span>
              <DefiHelp />
            </div>
            <SortMenu
              table={table}
              options={defiSortOptions}
              className="flex justify-end [&_[data-testid=table-sort-menu]]:before:-inset-y-3 [@container(min-width:64rem)]:[&_[data-testid=table-sort-menu]]:before:-inset-y-1"
            />
          </div>
        )}
        renderAlternative={
          state === 'empty'
            ? () => (
                <p role="status" className={`${type.supporting} p-6`}>
                  No yield opportunities found
                </p>
              )
            : undefined
        }
        className="[@container(min-width:64rem)]:pb-3 [&_table]:table-fixed [&_thead]:hidden [@container(min-width:64rem)]:[&_thead]:table-header-group [&_thead_tr]:h-auto [&_thead_tr]:border-b-0 [&_th]:h-auto [&_th]:pb-4 [&_th]:pt-0 [&_tr:last-child_[data-slot=row-seam]]:hidden"
        getRowClassName={() =>
          'border-b-0 [&:not(:first-child)]:!border-t-0 hover:bg-transparent'
        }
      />
    </div>
  )
}
