import { useMemo, type ReactNode } from 'react'
import DataTable from '@/components/ui/data-table'
import { earnColumns } from './earn-columns'
import type { EarnFamily, EarnRow, EarnState } from './earn-fixtures'
import { SortMenu, type SortMenuPresentation } from './sort-menu'
import { useProjectionFocus } from './use-projection-focus'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { EmptyState } from '@/components/empty-state'

export function EarnTable({
  rows,
  state,
  family,
  wallet,
  onOpen,
  onHelp,
  sortMenuPresentation = 'inline',
  noResults = <EmptyState title="No opportunities to show" />,
}: {
  rows: EarnRow[]
  state: EarnState
  family: EarnFamily
  wallet: boolean
  onOpen: (row: EarnRow, trigger: HTMLElement) => void
  onHelp: () => void
  sortMenuPresentation?: SortMenuPresentation
  noResults?: ReactNode
}) {
  const root = useProjectionFocus()
  const columns = useMemo(
    () => earnColumns({ state, family, wallet, onOpen, onHelp }),
    [state, family, wallet, onOpen, onHelp]
  )
  return (
    <div
      ref={root}
      data-slot="table-family-container"
      className="min-w-0 pt-[var(--screen-content-inset,theme(spacing.6))] [container-type:inline-size]"
    >
      <DataTable
        key={family}
        columns={columns}
        data={rows}
        ariaLabel="Earn opportunities"
        noResults={noResults}
        expandable={false}
        initialSorting={[{ id: 'rate', desc: true }]}
        renderToolbar={(table) => (
          <SortMenu
            table={table}
            presentation={sortMenuPresentation}
            options={[
              ['tvl', 'TVL'],
              ['rate', 'Avg. 30d%'],
              family === 'index'
                ? ['identity', 'Gov. Token']
                : ['governs', 'Governs'],
            ]}
            className="flex justify-end px-[var(--screen-content-inset,theme(spacing.6))] pb-2 [@container(min-width:64rem)]:hidden"
          />
        )}
        className="[&_table]:table-fixed [&_thead]:hidden [@container(min-width:64rem)]:[&_thead]:table-header-group [&_thead_tr]:h-auto [&_thead_tr]:border-b-0 [&_th]:h-auto [&_th]:pb-4 [&_th]:pt-0 [&_tr:last-child_[data-slot=row-seam]]:hidden"
        getRowClassName={() =>
          `group/earn border-b-0 [&:not(:first-child)]:!border-t-0 [@container(min-width:64rem)]:[&:not(:first-child)]:!border-t [@container(min-width:64rem)]:[&:not(:first-child)]:!border-secondary ${state === 'loading' ? 'hover:bg-transparent' : `cursor-pointer ${roles.interaction.contentHover}`}`
        }
        onRowClick={
          state === 'loading'
            ? undefined
            : (row, event) => {
                if (
                  !(event.target as HTMLElement).closest(
                    'a,button,input,select,[role="dialog"]'
                  )
                ) {
                  const trigger = [
                    ...event.currentTarget.querySelectorAll<HTMLElement>(
                      '[data-table-focus]'
                    ),
                  ].find((element) => element.getClientRects().length)
                  if (trigger) onOpen(row, trigger)
                }
              }
        }
      />
    </div>
  )
}
