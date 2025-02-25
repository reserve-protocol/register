import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  SortingState,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  Column,
  Table as TableType,
  PaginationState,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Fragment, useMemo, useState } from 'react'
import React from 'react'
import { Button } from './button'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  expandable?: boolean // Disable expandable default behavior
  allowMultipleExpand?: boolean
  onRowClick?(data: TData, row: Row<TData>): void
  renderSubComponent?(props: { row: Row<TData> }): React.ReactElement
  className?: string
  subComponentClassName?: string
  noResultsClassName?: string
}

export const SorteableButton = ({
  column,
  children,
  className,
}: {
  column: Column<any, any>
  children: React.ReactNode
  className?: string
}) => {
  return (
    <Button
      variant="ghost"
      className={cn('font-light text-legend text-base', className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {children}
      {column.getIsSorted() === 'asc' ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === 'desc' ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : null}
    </Button>
  )
}

const Pagination = ({ table }: { table: TableType<any> }) => {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-muted-foreground ml-6">
        Showing {table.getState().pagination.pageSize} out of{' '}
        {table.getFilteredRowModel().rows.length}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={16} />
          </Button>
          <div className="flex items-center gap-2">
            {(() => {
              const pageCount = table.getPageCount()
              const currentPage = table.getState().pagination.pageIndex + 1
              const pages = []

              // Always show first page
              pages.push(1)

              if (pageCount <= 5) {
                // Show all pages if 5 or fewer
                for (let i = 2; i <= pageCount; i++) {
                  pages.push(i)
                }
              } else {
                // Show current page and surrounding pages
                if (currentPage > 3) {
                  pages.push('...')
                }

                for (
                  let i = Math.max(2, currentPage - 1);
                  i <= Math.min(currentPage + 1, pageCount - 1);
                  i++
                ) {
                  pages.push(i)
                }

                if (currentPage < pageCount - 2) {
                  pages.push('...')
                }

                // Always show last page
                pages.push(pageCount)
              }

              return pages.map((pageNumber) =>
                pageNumber === '...' ? (
                  <span key={`ellipsis-${pageNumber}`}>...</span>
                ) : (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? undefined : 'ghost'}
                    size="sm"
                    onClick={() => table.setPageIndex(Number(pageNumber) - 1)}
                  >
                    {pageNumber}
                  </Button>
                )
              )
            })()}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      <div className="w-[200px]" /> {/* Spacer to balance the layout */}
    </div>
  )
}

interface DataTableComponentProps<TData, TValue>
  extends DataTableProps<TData, TValue> {
  className?: string
  expandable?: boolean
  allowMultipleExpand?: boolean
  pagination?: boolean | { pageSize: number }
  onRowClick?: (data: TData, row: Row<TData>) => void
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement
  subComponentClassName?: string
  noResultsClassName?: string
}

function DataTable<TData, TValue>({
  columns,
  data,
  className,
  expandable = true,
  allowMultipleExpand = true,
  pagination,
  onRowClick,
  renderSubComponent,
  subComponentClassName,
  noResultsClassName,
}: DataTableComponentProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [paginationState, setPaginationState] = React.useState<PaginationState>(
    {
      pageSize:
        typeof pagination === 'boolean' ? 10 : pagination?.pageSize || 10,
      pageIndex: 0,
    }
  )
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: !!pagination ? getPaginationRowModel() : undefined,
    onPaginationChange: setPaginationState,
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination: paginationState,
    },
  })

  const expandedRows = table
    .getRowModel()
    .rows.map((row) => row.getIsExpanded())

  const handleRowClick = (row: Row<TData>) => {
    onRowClick && onRowClick(row.original, row)

    if (!expandable || !renderSubComponent) return

    if (allowMultipleExpand) {
      row.toggleExpanded()
      return
    }

    if (expandedRowId === row.id) {
      row.toggleExpanded(false)
      setExpandedRowId(null)
      return
    }

    table.getRowModel().rows.forEach((r) => {
      if (r.getIsExpanded()) r.toggleExpanded(false)
    })
    row.toggleExpanded(true)
    setExpandedRowId(row.id)
  }

  return (
    <div className={cn('w-full', className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="hover:bg-transparent h-16"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.columnDef.meta?.className,
                      'font-light'
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="bg-card">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <Fragment key={row.id}>
                <TableRow
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => handleRowClick(row)}
                  className={cn(
                    (!!renderSubComponent && expandable) || onRowClick
                      ? 'cursor-pointer border-b-[0]'
                      : undefined,
                    row.getIsExpanded() &&
                      'bg-card border border-border rounded-tl-lg rounded-tr-lg',
                    expandedRows[index - 1]
                      ? '!border-t-[0]'
                      : '[&:not(:first-child)]:!border-t-[1px]'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {!!renderSubComponent && row.getIsExpanded() && (
                  <tr
                    className={cn(
                      'bg-card w-full !py-0 rounded-bl-lg rounded-br-lg',
                      subComponentClassName
                    )}
                  >
                    {/* 2nd row is a custom 1 cell row */}
                    <td
                      colSpan={row.getVisibleCells().length}
                      className="w-full border-b border-l border-r border-border rounded-bl-lg rounded-br-lg"
                    >
                      <div>{renderSubComponent({ row })}</div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className={cn('h-24 text-center', noResultsClassName)}
              >
                <div className="my-auto">No results.</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pagination && <Pagination table={table} />}
    </div>
  )
}

export default DataTable
