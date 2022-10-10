import memoize from 'fast-memoize'
import React, { ReactElement, ReactNode } from 'react'
import {
  Cell,
  Column,
  PluginHook,
  Row,
  SortingRule,
  TableOptions,
  TableState,
  UseExpandedRowProps,
  UseGroupByCellProps,
  UseGroupByRowProps,
  usePagination,
  UsePaginationOptions,
  UsePaginationState,
  UseRowSelectState,
  UseRowStateOptions,
  useSortBy,
  UseSortByOptions,
  UseSortByState,
  useTable,
} from 'react-table'
import { borderRadius } from 'theme'
import { Box, BoxProps, Flex } from 'theme-ui'
import {
  TablePagination,
  TablePaginationProps,
} from './components/TablePagination'
import { useTableLayout } from './useTableLayout'

const defaultColumn = memoize(() => ({
  subRows: undefined,
  accessor: '',
}))

export type { Column, Cell, Row, UseExpandedRowProps }
export type SelectedRowIds = Record<number, boolean>
interface TableOwnProps<D extends { [key: string]: any }> {
  columns: any[]
  data?: D[]
  header?: boolean
  sorting?: boolean
  compact?: boolean
  maxHeight?: string | number
  hiddenColumns?: string[]
  skipPageReset?: boolean
  renderRowSubComponent?: (props: { row: Row }) => ReactNode
  sortBy?: Array<SortingRule<any>>
  pagination?: TablePaginationProps | boolean
  onRowClick?(data: any): void
}

export type TableProps<D extends { [key: string]: any }> = TableOwnProps<D> &
  BoxProps

export function Table<D extends { [key: string]: any }>({
  columns,
  data = [],
  header = true,
  sorting = false,
  compact = false,
  maxHeight = 'auto',
  sx = {},
  hiddenColumns,
  skipPageReset,
  renderRowSubComponent,
  sortBy,
  pagination,
  onRowClick,
  ...rest
}: TableProps<D>): ReactElement<any, any> | null {
  const plugins: PluginHook<D>[] = [useTableLayout, useSortBy]
  const initialState: Partial<TableState<D>> &
    Partial<UsePaginationState<D>> &
    Partial<UseSortByState<D>> &
    Partial<UseRowSelectState<Record<number, boolean>>> = {}

  if (hiddenColumns !== undefined) {
    initialState.hiddenColumns = hiddenColumns
  }
  if (Array.isArray(sortBy)) {
    initialState.sortBy = sortBy
  }

  if (pagination) {
    plugins.push(usePagination)
    if (typeof pagination === 'object') {
      if (typeof pagination.pageIndex === 'number') {
        initialState.pageIndex = pagination.pageIndex
      }
      if (typeof pagination.pageSize === 'number') {
        initialState.pageSize = pagination.pageSize
      }
    }
  }

  const options: TableOptions<D> &
    UsePaginationOptions<D> &
    UseSortByOptions<D> &
    UseRowStateOptions<D> = {
    columns,
    data,
    defaultColumn: defaultColumn() as Column<D>,
    initialState,
    autoResetPage: !skipPageReset,
    autoResetSortBy: !skipPageReset,
    autoResetRowState: !skipPageReset,
  }

  const tableOptions = useTable<D>(options, ...plugins) as any
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    visibleColumns,
    rows,
    page, // Instead of using 'rows', when using pagination
    state: { pageIndex: statePageIndex, pageSize: statePageSize },
  } = tableOptions

  return (
    <React.Fragment>
      <Box
        as="table"
        variant="styles.table"
        {...getTableProps()}
        {...rest}
        sx={{ ...sx, maxHeight, borderSpacing: compact ? 0 : undefined }}
      >
        <Box as="tbody" variant="styles.tbody" {...getTableBodyProps()}>
          {headerGroups.map((headerGroup: any) => (
            <Box as="tr" {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any) => (
                <Box
                  as="th"
                  variant="styles.th"
                  {...column.getHeaderProps(
                    sorting ? column.getSortByToggleProps() : undefined
                  )}
                >
                  <Flex pb={compact ? 2 : 0} variant="layout.verticalAlign">
                    <Box sx={{ mr: 1, flex: 1 }}>{column.render('Header')}</Box>
                    {sorting &&
                      column.isSorted &&
                      (column.isSortedDesc ? '.' : 'up')}
                  </Flex>
                </Box>
              ))}
            </Box>
          ))}
          {(page || rows).map(
            (
              row: Row &
                UseGroupByRowProps<D> & {
                  isExpanded?: boolean
                },
              index: number
            ) => {
              prepareRow(row)
              const { key, ...rowProps } = row.getRowProps()
              const last = index === (page || rows).length - 1

              return (
                <React.Fragment key={key}>
                  <Box
                    variant="styles.tr"
                    as="tr"
                    onClick={
                      !!onRowClick ? () => onRowClick(row.original) : undefined
                    }
                    sx={{ cursor: !!onRowClick ? 'pointer' : 'inherit' }}
                    {...rowProps}
                  >
                    {row.cells.map(
                      (
                        cell: Cell & Partial<UseGroupByCellProps<D>>,
                        cellIndex: number
                      ) => (
                        <Box
                          as="td"
                          sx={{
                            borderRadius: compact ? '0 !important' : undefined,
                            borderTopLeftRadius:
                              compact && !index && !cellIndex
                                ? `${borderRadius.boxes}px !important`
                                : undefined,
                            borderTopRightRadius:
                              compact &&
                              !index &&
                              cellIndex === row.cells.length - 1
                                ? `${borderRadius.boxes}px !important`
                                : undefined,
                            borderBottomLeftRadius:
                              compact && last && !cellIndex
                                ? `${borderRadius.boxes}px !important`
                                : undefined,
                            borderBottomRightRadius:
                              compact &&
                              last &&
                              cellIndex === row.cells.length - 1
                                ? `${borderRadius.boxes}px !important`
                                : undefined,
                          }}
                          variant="styles.td"
                          {...cell.getCellProps()}
                        >
                          {cell.render('Cell') as any}
                        </Box>
                      )
                    )}
                  </Box>
                  {row.isExpanded && row.original && (
                    <tr>
                      <td colSpan={visibleColumns.length}>
                        {renderRowSubComponent
                          ? renderRowSubComponent({ row })
                          : null}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            }
          )}
        </Box>
      </Box>
      {pagination && (
        <TablePagination
          // {...pagination}
          pageIndex={statePageIndex}
          pageSize={statePageSize}
          {...tableOptions}
        />
      )}
    </React.Fragment>
  )
}
