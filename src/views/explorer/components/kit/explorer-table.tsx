import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { Trans } from '@lingui/react/macro'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import ExplorerPager from './explorer-pager'
import LoadingBar from './loading-bar'

type ColumnMeta = { className?: string }

// One shared array: a fresh `[]` per render recomputes the sorted rows and re-arms the page reset.
const NO_SORTING: SortingState = []

const metaClassName = (meta: unknown) => (meta as ColumnMeta | undefined)?.className

const LoadingRows = () => (
  <div className="flex flex-col gap-3 border-t border-border p-5" data-testid="explorer-loading">
    {Array.from({ length: 6 }, (_, index) => (
      <Skeleton key={index} className="h-10 w-full" />
    ))}
  </div>
)

const ExplorerTable = <T,>({
  data,
  columns,
  renderItem,
  getRowId,
  pageSize,
  sorting,
  onSortingChange,
  manualSorting = false,
  isLoading = false,
  isFetching = false,
  emptyLabel,
  footerNote,
}: {
  data: T[]
  columns: ColumnDef<T>[]
  renderItem: (item: T) => ReactNode
  getRowId?: (item: T) => string
  pageSize?: number
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  manualSorting?: boolean
  isLoading?: boolean
  isFetching?: boolean
  emptyLabel?: ReactNode
  footerNote?: ReactNode
}) => {
  const isMobile = useIsMobile()
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize ?? 0,
  })
  // The library resets the page when rows recompute; a reset to the same page must not re-render.
  const keepSamePage: OnChangeFn<PaginationState> = (updater) =>
    setPagination((previous) => {
      const next = typeof updater === 'function' ? updater(previous) : updater
      return next.pageIndex === previous.pageIndex &&
        next.pageSize === previous.pageSize
        ? previous
        : next
    })
  const table = useReactTable({
    data,
    columns,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(pageSize
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          onPaginationChange: keepSamePage,
        }
      : {}),
    autoResetPageIndex: !!pageSize,
    enableSorting: !!sorting,
    enableSortingRemoval: false,
    manualSorting,
    onSortingChange,
    state: {
      sorting: sorting ?? NO_SORTING,
      ...(pageSize ? { pagination } : {}),
    },
  })
  const rows = table.getRowModel().rows

  if (isLoading) {
    return (
      <>
        <LoadingBar active />
        <LoadingRows />
      </>
    )
  }

  if (!rows.length) {
    return (
      <>
        <LoadingBar active={isFetching} />
        <div
          className="border-t border-border px-6 py-16 text-center text-legend"
          data-testid="explorer-empty"
        >
          {isFetching ? (
            <Trans>Loading...</Trans>
          ) : (
            (emptyLabel ?? <Trans>No results</Trans>)
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <LoadingBar active={isFetching} />
      {isMobile ? (
        <ul data-testid="explorer-list">
          {rows.map((row) => (
            <li
              key={row.id}
              className="border-t border-border px-5 py-3.5"
              data-testid="explorer-row"
            >
              {renderItem(row.original)}
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full tabular-nums" data-testid="explorer-table">
            <thead>
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id} className="border-t border-border">
                  {group.headers.map((header) => {
                    const sorted = header.column.getIsSorted()
                    const label = flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={
                          sorted === 'asc'
                            ? 'ascending'
                            : sorted === 'desc'
                              ? 'descending'
                              : undefined
                        }
                        className={cn(
                          'whitespace-nowrap px-3 py-2.5 text-left text-[13px] font-normal text-legend first:pl-6 last:pr-6',
                          metaClassName(header.column.columnDef.meta)
                        )}
                      >
                        {header.column.getCanSort() ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              'inline-flex items-center gap-1.5 hover:text-foreground',
                              sorted && 'font-semibold text-primary hover:text-primary'
                            )}
                          >
                            {label}
                            {sorted === 'asc' && <ArrowUp size={14} aria-hidden />}
                            {sorted === 'desc' && <ArrowDown size={14} aria-hidden />}
                          </button>
                        ) : (
                          label
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-border"
                  data-testid="explorer-row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-3 py-3 first:pl-6 last:pr-6',
                        cell.column.getIsSorted() && 'font-semibold text-primary',
                        metaClassName(cell.column.columnDef.meta)
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pageSize ? (
        <ExplorerPager
          pageIndex={pagination.pageIndex}
          pageCount={table.getPageCount()}
          pageSize={pagination.pageSize}
          total={data.length}
          onPageChange={table.setPageIndex}
          note={footerNote}
        />
      ) : (
        footerNote && (
          <p className="border-t border-border px-6 py-3 text-sm text-legend">
            {footerNote}
          </p>
        )
      )}
    </>
  )
}

export default ExplorerTable
