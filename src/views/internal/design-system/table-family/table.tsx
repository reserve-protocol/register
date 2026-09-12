import { type Column, type ColumnDef } from '@tanstack/react-table'
import { type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react'
import { Button, InlineAction } from '@/components/button'
import DataTable from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { SortMenu } from './sort-menu'
import { useProjectionFocus } from './use-projection-focus'

export const desktopCell =
  'hidden px-3 py-4 text-right [@container(min-width:64rem)]:table-cell'
export const mobileCell = 'px-6 py-6 [@container(min-width:64rem)]:hidden'

export function Sort<T>({
  column,
  label,
  id,
}: {
  column: Column<T>
  label: string
  id: string
}) {
  return (
    <InlineAction
      data-testid={`sort-${id}`}
      data-table-focus="sort"
      aria-description={
        column.getIsSorted()
          ? column.getIsSorted() === 'asc'
            ? 'ascending'
            : 'descending'
          : undefined
      }
      className={cn(type.supporting, 'ml-auto text-supporting-foreground')}
      onClick={() =>
        column.toggleSorting(
          column.getIsSorted()
            ? column.getIsSorted() === 'asc'
            : (column.columnDef.sortDescFirst ?? false)
        )
      }
    >
      {label}
      {column.getIsSorted() &&
        (column.getIsSorted() === 'asc' ? (
          <ArrowUp aria-hidden className="ml-1 size-3.5" />
        ) : (
          <ArrowDown aria-hidden className="ml-1 size-3.5" />
        ))}
    </InlineAction>
  )
}

export function FamilyTable<T>({
  label,
  columns,
  data,
  onRowClick,
  children,
  sortMenu = false,
  rowLimit,
}: {
  label: string
  columns: ColumnDef<T>[]
  data: T[]
  children?: ReactNode
  sortMenu?: boolean
  rowLimit?: number
  onRowClick?: (row: T) => void
}) {
  const root = useProjectionFocus()
  return (
    <div
      ref={root}
      data-slot="table-family-container"
      className="min-w-0 bg-card [container-type:inline-size]"
    >
      <DataTable
        ariaLabel={label}
        columns={columns}
        data={data}
        rowLimit={rowLimit}
        expandable={false}
        initialSorting={[{ id: 'value', desc: true }]}
        renderToolbar={
          sortMenu ? (table) => <SortMenu table={table} /> : undefined
        }
        className="[&_thead]:hidden [@container(min-width:64rem)]:[&_thead]:table-header-group [&_thead_tr]:h-auto [&_thead_tr]:border-b-0 [&_th]:h-auto [&_th]:pb-4 [&_th]:pt-0"
        getRowClassName={() =>
          'border-b-0 [&:not(:first-child)]:!border-t-0 hover:bg-transparent [@container(min-width:64rem)]:hover:bg-muted/50'
        }
        onRowClick={
          onRowClick
            ? (row, event) => {
                if (
                  !(event.target as HTMLElement).closest(
                    'a,button,input,select'
                  )
                )
                  onRowClick(row)
              }
            : undefined
        }
      />
      {children}
    </div>
  )
}

export const FamilyHeader = ({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children?: ReactNode
}) => (
  <div className="flex flex-wrap items-baseline justify-between gap-4 px-6 py-6">
    <div className="min-w-0 space-y-1">
      <h3 className={type.panelTitle}>{title}</h3>
      <p className={cn(type.supporting, 'text-supporting-foreground')}>
        {subtitle}
      </p>
    </div>
    {children}
  </div>
)

export const ExpandRows = ({
  expanded,
  total,
  onToggle,
}: {
  expanded: boolean
  total: number
  onToggle: () => void
}) => (
  <div className="flex justify-center px-6 pb-4 pt-2">
    <Button
      data-testid="table-expand"
      tone="quiet"
      onClick={onToggle}
      trailingIcon={expanded ? <ChevronUp /> : <ChevronDown />}
    >
      {expanded ? 'Show less' : `Show all (${total})`}
    </Button>
  </div>
)
