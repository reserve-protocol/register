import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import React from 'react'
import { ArrowDown, ArrowUp } from 'react-feather'
import { borderRadius } from 'theme'
import { Box, BoxProps, Flex } from 'theme-ui'
import { StringMap } from 'types'

export interface TableProps extends BoxProps {
  columns: any[] // figure out proper type
  data: StringMap[]
  compact?: boolean
  sorting?: boolean
  onRowClick?(data: any): void
  sortBy?: SortingState
  maxHeight?: string | number
}

export function Table({
  columns,
  data = [],
  sorting = false,
  compact = false,
  maxHeight = 'auto',
  sx = {},
  sortBy = [],
  // pagination,
  onRowClick,
  ...props
}: TableProps) {
  const [sortingState, setSorting] = React.useState<SortingState>(sortBy)

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
    state: {
      sorting: sortingState,
    },
    onSortingChange: setSorting,
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
            const last = index === table.getRowModel().rows.length - 1
            const cellCount = row.getVisibleCells().length - 1

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
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <Box
                    as="td"
                    key={cell.id}
                    sx={{
                      borderRadius: compact ? '0 !important' : undefined,
                      borderTopLeftRadius:
                        compact && !index && !cellIndex
                          ? `${borderRadius.boxes}px !important`
                          : undefined,
                      borderTopRightRadius:
                        compact && !index && cellIndex === cellCount
                          ? `${borderRadius.boxes}px !important`
                          : undefined,
                      borderBottomLeftRadius:
                        compact && last && !cellIndex
                          ? `${borderRadius.boxes}px !important`
                          : undefined,
                      borderBottomRightRadius:
                        compact && last && cellIndex === cellCount
                          ? `${borderRadius.boxes}px !important`
                          : undefined,
                    }}
                    variant="styles.td"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Box>
                ))}
              </Box>
            )
          })}
        </Box>
      </Box>
      {/* {pagination && (
        <TablePagination
          // {...pagination}
          pageIndex={statePageIndex}
          pageSize={statePageSize}
          {...tableOptions}
        />
      )} */}
    </React.Fragment>
  )
}
