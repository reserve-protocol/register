import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/ui/data-table'
import { getFolioRoute } from '@/utils'
import { discoverColumns, discoverSortOptions } from './discover-columns'
import type { DiscoverRow } from './discover-fixtures'
import { SortMenu } from './sort-menu'
import { useDiscoverPresentation } from './use-discover-presentation'
import { DiscoverCard } from './discover-card'
import type { DiscoverCardLayout } from './discover-card-chart'
import { CollateralAssetAnimationStyles } from '@/views/home/components/highlighted-dtfs/collateral-asset-animation-styles'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'

export function DiscoverTable({
  rows,
  loading,
  cardLayout = 'compact',
}: {
  rows: DiscoverRow[]
  loading: boolean
  cardLayout?: DiscoverCardLayout
}) {
  const columns = useMemo(() => discoverColumns(loading), [loading])
  const navigate = useNavigate()
  const { root, cards } = useDiscoverPresentation()
  return (
    <div
      ref={root}
      data-slot="table-family-container"
      className="min-w-0 [container-type:inline-size]"
    >
      <div role="status" className="sr-only">
        {loading ? 'Loading DTF sample' : `${rows.length} sample DTFs`}
      </div>
      {cards !== null && (
        <DataTable
          ariaLabel="Discover DTF sample"
          columns={columns}
          data={rows}
          expandable={false}
          initialSorting={[{ id: 'marketCap', desc: true }]}
          renderToolbar={
            cards
              ? (table) => (
                  <SortMenu
                    table={table}
                    options={discoverSortOptions}
                    className="flex justify-end px-1 pb-3"
                  />
                )
              : undefined
          }
          renderAlternative={
            cards
              ? (table) => (
                  <>
                    <CollateralAssetAnimationStyles />
                    <ul
                      aria-label="Discover DTF sample"
                      className="grid grid-cols-1 gap-0.5 bg-secondary p-0.5 [@container(min-width:44rem)]:grid-cols-2"
                    >
                      {table.getRowModel().rows.map(({ original: row }) => (
                        <li
                          key={`${row.chainId}-${row.address}`}
                          className="min-w-0"
                        >
                          <DiscoverCard
                            row={row}
                            loading={loading}
                            layout={cardLayout}
                          />
                        </li>
                      ))}
                    </ul>
                  </>
                )
              : undefined
          }
          className="[&_table]:table-fixed [&_thead]:bg-card [&_thead_tr]:h-auto [&_thead_tr]:border-b-0 [&_th]:h-auto [&_th]:pb-4 [&_th]:pt-6"
          getRowClassName={() =>
            cn(
              'group/discover-row border-b-0 [&:not(:first-child)]:!border-t-0 [@container(min-width:72rem)]:[&:not(:first-child)]:!border-t [@container(min-width:72rem)]:[&:not(:first-child)]:!border-secondary',
              loading ? 'hover:bg-transparent' : roles.interaction.contentHover
            )
          }
          onRowClick={
            loading
              ? undefined
              : (row, event) => {
                  if (
                    (event.target as HTMLElement).closest(
                      'a,button,[role="dialog"]'
                    )
                  )
                    return
                  const href = getFolioRoute(row.address, row.chainId)
                  if (event.metaKey || event.ctrlKey)
                    window.open(href, '_blank', 'noopener,noreferrer')
                  else navigate(href)
                }
          }
        />
      )}
    </div>
  )
}
