import { useMemo, useState } from 'react'
import DataTable from '@/components/ui/data-table'
import { FamilyHeader, ExpandRows } from './table'
import { SortMenu } from './sort-menu'
import { useProjectionFocus } from './use-projection-focus'
import type { ModifyOwned } from './owned-cells'
import { ownedColumns } from './owned-columns'
import type { OwnedFamily, OwnedPosition } from './owned-fixtures'
import { Link } from '@/components/design-system-v1/link'

type OwnedTableProps = {
  family: OwnedFamily
  rows: OwnedPosition[]
  loading?: boolean
  onModify: ModifyOwned
}

export function OwnedTable(props: OwnedTableProps) {
  const rows = props.rows.filter((row) => row.activeShares > 0n)
  return rows.length ? <OwnedTableContent {...props} rows={rows} /> : null
}

function OwnedTableContent({
  family,
  rows,
  loading = false,
  onModify,
}: OwnedTableProps) {
  const [expanded, setExpanded] = useState(false)
  const root = useProjectionFocus()
  const columns = useMemo(
    () => ownedColumns(family, loading, onModify),
    [family, loading, onModify]
  )
  const title =
    family === 'lock' ? 'Vote-locked positions' : 'Staked RSR Positions'
  return (
    <section
      data-testid="owned-table"
      data-family={family}
      aria-busy={loading || undefined}
      className="min-w-0 bg-card [&_tr:last-child_[data-slot=row-seam]]:hidden"
    >
      <FamilyHeader
        title={title}
        subtitle={
          family === 'lock'
            ? 'Participate in governance with any ERC-20 token and earn APY rewards.'
            : 'Stake your RSR and earn APY rewards.'
        }
      >
        <Link
          href={
            family === 'lock'
              ? 'https://docs.reserve.org/core-components/index-dtfs/roles'
              : 'https://docs.reserve.org/core-components/rsr-reserve-rights'
          }
          external
          externalAnnouncement="opens in a new tab"
          treatment="standalone"
        >
          Learn more
        </Link>
      </FamilyHeader>
      <div
        ref={root}
        data-slot="table-family-container"
        className="min-w-0 [container-type:inline-size]"
      >
        <DataTable
          ariaLabel={title}
          columns={columns}
          data={rows}
          expandable={false}
          rowLimit={expanded ? undefined : 5}
          initialSorting={[{ id: 'value', desc: true }]}
          renderToolbar={
            family === 'stake'
              ? (table) => (
                  <SortMenu
                    table={table}
                    options={[
                      ['balance', 'Balance'],
                      ['value', 'Value'],
                      ['apy', 'APY'],
                    ]}
                    className="px-6 pb-2 [@container(min-width:64rem)]:hidden"
                  />
                )
              : undefined
          }
          className="[&_table]:table-fixed [&_thead]:hidden [@container(min-width:64rem)]:[&_thead]:table-header-group [&_thead_tr]:h-auto [&_thead_tr]:border-b-0 [&_th]:h-auto [&_th]:pb-4 [&_th]:pt-0"
          getRowClassName={() =>
            'border-b-0 [&:not(:first-child)]:!border-t-0 hover:bg-transparent'
          }
        />
        {rows.length > 5 && (
          <ExpandRows
            expanded={expanded}
            total={rows.length}
            onToggle={() => setExpanded(!expanded)}
          />
        )}
      </div>
      <div
        aria-hidden
        className="hidden h-2 [@container(min-width:64rem)]:block"
      />
    </section>
  )
}
