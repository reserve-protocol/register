import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import React, { useCallback, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp } from 'react-feather'
import { Box, BoxProps, Flex } from 'theme-ui'
import { StringMap } from 'types'
import TablePagination from './components/TablePagination'

export interface TableProps extends BoxProps {
  columns: any[] // figure out proper type
  data: StringMap[]
  compact?: boolean
  sorting?: boolean
  pagination?: boolean | { pageSize: number }
  onSort?(state: SortingState): void
  defaultPageSize?: number
  onRowClick?(data: any): void
  sortBy?: SortingState
  maxHeight?: string | number
}

export function Table({
  columns,
  data = [],
  sorting = false,
  compact = false,
  pagination,
  defaultPageSize = 10,
  maxHeight = 'auto',
  sx = {},
  sortBy = [],
  onRowClick,
  onSort,
  ...props
}: TableProps) {
  const [sortingState, setSorting] = useState<SortingState>(sortBy)
  const paginationState = useMemo(
    () => ({ pageSize: defaultPageSize, pageIndex: 0 }),
    [defaultPageSize]
  )

  const handleSort = useCallback(
    (state: any) => {
      setSorting(state)
      onSort?.(state)
    },
    [onSort, setSorting]
  )

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: !!pagination ? getPaginationRowModel() : undefined,
    enableSorting: sorting,
    initialState: {
      pagination: paginationState,
    },
    state: {
      sorting: sortingState,
    },
    onSortingChange: handleSort,
  })

  return (
    <React.Fragment>
      <Box
        as="table"
        variant="styles.table"
        {...props}
        sx={{
          ...sx,
          maxHeight: ['none', maxHeight],
          borderSpacing: compact ? 0 : undefined,
        }}
      >
        <Box as="tbody" variant="styles.tbody">
          {table.getHeaderGroups().map((headerGroup) => (
            <Box as="tr" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Box
                  as="th"
                  variant="styles.th"
                  key={header.id}
                  sx={
                    sorting
                      ? { cursor: 'pointer', userSelect: 'none' }
                      : undefined
                  }
                  onClick={
                    sorting
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                >
                  <Flex pb={compact ? 2 : 0} variant="layout.verticalAlign">
                    <Box sx={{ mr: 1, flex: 1 }}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </Box>
                    {{
                      asc: <ArrowUp size={14} />,
                      desc: <ArrowDown size={14} />,
                    }[header.column.getIsSorted() as string] ?? null}
                  </Flex>
                </Box>
              ))}
            </Box>
          ))}
          {table.getRowModel().rows.map((row, index) => {
            return (
              <Box
                key={row.id}
                variant="styles.tr"
                as="tr"
                onClick={
                  !!onRowClick ? () => onRowClick(row.original) : undefined
                }
                sx={{ cursor: !!onRowClick ? 'pointer' : 'inherit' }}
              >
                {row.getVisibleCells().map((cell) => (
                  <Box as="td" key={cell.id} variant="styles.td">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Box>
                ))}
              </Box>
            )
          })}
        </Box>
      </Box>
      {pagination && <TablePagination table={table} totalCount={data.length} />}
    </React.Fragment>
  )
}
