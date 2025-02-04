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
}: {
  column: Column<any, any>
  children: React.ReactNode
}) => {
  return (
    <Button
      variant="ghost"
      className="font-light text-legend text-base"
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

function DataTable<TData, TValue>({
  columns,
  data,
  className,
  expandable = true,
  allowMultipleExpand = true,
  onRowClick,
  renderSubComponent,
  subComponentClassName,
  noResultsClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
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
    <>
      <Table className={cn('', className)}>
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
    </>
  )
}

export default DataTable
