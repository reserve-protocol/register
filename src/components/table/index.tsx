import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from '@tanstack/react-table'
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Box, BoxProps, Flex } from 'theme-ui'
import { StringMap } from 'types'
import TablePagination from './components/TablePagination'
import Skeleton from 'react-loading-skeleton'

export interface TableProps extends BoxProps {
  columns: any[] // figure out proper type
  data: StringMap[]
  compact?: boolean
  sorting?: boolean
  pagination?: boolean | { pageSize: number }
  onSort?(state: SortingState): void
  defaultPageSize?: number
  onRowClick?(data: any, row: Row<any>): void
  sortBy?: SortingState
  maxHeight?: string | number
  isLoading?: boolean
  columnVisibility?: (string | string[])[]
  renderSubComponent?: (props: { row: Row<any> }) => React.ReactElement
}

export function Table({
  columns,
  data = [],
  sorting = false,
  compact = false,
  pagination,
  isLoading = false,
  defaultPageSize = 10,
  maxHeight = 'auto',
  sx = {},
  columnVisibility,
  renderSubComponent,
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
    getExpandedRowModel: getExpandedRowModel(),
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
              {headerGroup.headers.map((header, index) => (
                <Box
                  as="th"
                  variant="styles.th"
                  key={header.id}
                  sx={{
                    ...(sorting
                      ? { cursor: 'pointer', userSelect: 'none' }
                      : {}),
                    display: columnVisibility?.[index]
                      ? columnVisibility[index]
                      : 'table-cell',
                  }}
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
          {table.getRowModel().rows.map((row) => {
            return (
              <Fragment key={row.id}>
                <Box
                  variant="styles.tr"
                  as="tr"
                  onClick={
                    !!onRowClick
                      ? () => onRowClick(row.original, row)
                      : undefined
                  }
                  sx={{ cursor: !!onRowClick ? 'pointer' : 'inherit' }}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <Box
                      sx={{
                        display: columnVisibility?.[index]
                          ? columnVisibility[index]
                          : 'table-cell',
                        ...(compact
                          ? {
                              '&:first-of-type': {
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                              },
                              '&:last-of-type': {
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                              },
                            }
                          : {}),
                      }}
                      as="td"
                      key={cell.id}
                      variant="styles.td"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Box>
                  ))}
                </Box>
                {!!renderSubComponent && row.getIsExpanded() && (
                  <tr>
                    {/* 2nd row is a custom 1 cell row */}
                    <td colSpan={row.getVisibleCells().length}>
                      {renderSubComponent({ row })}
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </Box>
      </Box>
      {isLoading && (
        <Skeleton count={5} height={40} style={{ marginTop: 10 }} />
      )}
      {pagination && <TablePagination table={table} totalCount={data.length} />}
    </React.Fragment>
  )
}
