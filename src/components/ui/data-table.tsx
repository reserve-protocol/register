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
import { Fragment, useState } from 'react'
import React from 'react'
import { Button } from './button'
import { ArrowDown, ArrowUp } from 'lucide-react'
import Spinner from './spinner'
import { Trans } from '@lingui/react/macro'
import { DataTablePagination } from './data-table-pagination'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  expandable?: boolean // Disable expandable default behavior
  allowMultipleExpand?: boolean
  onRowClick?(data: TData, event: React.MouseEvent, row?: Row<TData>): void
  renderSubComponent?(props: { row: Row<TData> }): React.ReactElement
  className?: string
  subComponentClassName?: string
  noResultsClassName?: string
  stickyHeader?: boolean // Enable sticky table header
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
      className={cn(
        'font-light text-legend focus:text-legend text-sm px-0 hover:bg-transparent rounded-xl',
        className
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {children}
      {column.getIsSorted() === 'asc' ? (
        <ArrowUp className="ml-2 h-3 w-3" />
      ) : column.getIsSorted() === 'desc' ? (
        <ArrowDown className="ml-2 h-3 w-3" />
      ) : null}
    </Button>
  )
}

interface DataTableComponentProps<TData, TValue> extends DataTableProps<
  TData,
  TValue
> {
  pagination?: boolean | { pageSize: number }
  showPageSizeSelector?: boolean
  hoverRowComponent?: (props: {
    row: Row<TData>
    children: React.ReactNode
  }) => React.ReactElement
  initialSorting?: SortingState
  loading?: boolean
  loadingSkeleton?: React.ReactNode
  getRowClassName?: (row: Row<TData>) => string | undefined
}

const CustomTableRow = ({
  row,
  handleRowClick,
  renderSubComponent,
  expandable,
  onRowClick,
  expandedRows,
  index,
  hoverRowComponent,
  getRowClassName,
}: {
  row: Row<any>
  handleRowClick: (row: Row<any>, event: React.MouseEvent) => void
  renderSubComponent?: (props: { row: Row<any> }) => React.ReactElement
  expandable: boolean
  onRowClick?: (data: any, event: React.MouseEvent, row?: Row<any>) => void
  expandedRows: boolean[]
  index: number
  hoverRowComponent?: (props: {
    row: Row<any>
    children: React.ReactNode
  }) => React.ReactElement
  getRowClassName?: (row: Row<any>) => string | undefined
}) => {
  const baseRow = (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      onClick={(event) => handleRowClick(row, event)}
      className={cn(
        (!!renderSubComponent && expandable) || onRowClick
          ? 'cursor-pointer border-b-[0]'
          : undefined,
        row.getIsExpanded() &&
          'bg-card border border-border rounded-tl-lg rounded-tr-lg',
        expandedRows[index - 1]
          ? '!border-t-[0]'
          : '[&:not(:first-child)]:!border-t-[1px]',
        getRowClassName?.(row)
      )}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className={cell.column.columnDef.meta?.className}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )

  return hoverRowComponent
    ? hoverRowComponent({ row, children: baseRow })
    : baseRow
}

function DataTable<TData, TValue>({
  columns,
  data,
  className,
  expandable = true,
  allowMultipleExpand = true,
  pagination,
  showPageSizeSelector = false,
  onRowClick,
  hoverRowComponent,
  renderSubComponent,
  subComponentClassName,
  noResultsClassName,
  stickyHeader = false,
  initialSorting = [],
  loading = false,
  loadingSkeleton,
  getRowClassName,
}: DataTableComponentProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const propPageSize =
    typeof pagination === 'object' ? pagination.pageSize || 10 : 10
  const [paginationState, setPaginationState] = React.useState<PaginationState>(
    {
      pageSize: propPageSize,
      pageIndex: 0,
    }
  )
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)

  React.useEffect(() => {
    setPaginationState((prev) =>
      prev.pageSize === propPageSize
        ? prev
        : { pageIndex: 0, pageSize: propPageSize }
    )
  }, [propPageSize])

  const allRowsPagination = React.useMemo(
    () => ({ pageIndex: 0, pageSize: Math.max(data.length, 1) }),
    [data.length]
  )

  // Tanstack row models are create-once: a conditional getPaginationRowModel
  // latches on permanently once truthy, so pagination is toggled via state.
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: !!pagination,
    onPaginationChange: setPaginationState,
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination: pagination ? paginationState : allRowsPagination,
    },
  })

  const expandedRows = table
    .getRowModel()
    .rows.map((row) => row.getIsExpanded())

  const handleRowClick = (row: Row<TData>, event: React.MouseEvent) => {
    onRowClick?.(row.original, event, row)

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
    <div className={cn('w-full overflow-x-auto', className)}>
      <Table className="text-sm md:text-base">
        <TableHeader className="text-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className={cn(
                'hover:bg-transparent h-16 text-legend',
                stickyHeader && 'sticky top-0 bg-card z-10'
              )}
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
                <CustomTableRow
                  row={row}
                  handleRowClick={handleRowClick}
                  renderSubComponent={renderSubComponent}
                  expandable={expandable}
                  onRowClick={onRowClick}
                  expandedRows={expandedRows}
                  index={index}
                  hoverRowComponent={hoverRowComponent}
                  getRowClassName={getRowClassName}
                />
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
          ) : loading ? (
            loadingSkeleton || <LoadingSkeleton columns={columns} />
          ) : (
            <NoResultsRow
              columns={columns}
              noResultsClassName={noResultsClassName}
            />
          )}
        </TableBody>
      </Table>
      {pagination && (
        <DataTablePagination
          table={table}
          showPageSizeSelector={showPageSizeSelector}
        />
      )}
    </div>
  )
}

function LoadingSkeleton<TData, TValue>({
  columns,
}: {
  columns: ColumnDef<TData, TValue>[]
}) {
  return (
    <TableRow data-testid="data-table-loading">
      <TableCell colSpan={columns.length} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center gap-2 text-primary">
          <Spinner size={24} />
        </div>
      </TableCell>
    </TableRow>
  )
}

function NoResultsRow<TData, TValue>({
  columns,
  noResultsClassName,
}: {
  columns: ColumnDef<TData, TValue>[]
  noResultsClassName?: string
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={columns.length}
        className={cn('h-24 text-center', noResultsClassName)}
      >
        <div className="my-auto">
          <Trans>No results.</Trans>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default DataTable
