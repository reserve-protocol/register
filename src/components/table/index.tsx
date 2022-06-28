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
import { Box, BoxProps, Flex, jsx } from 'theme-ui'
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
  hiddenColumns?: string[]
  skipPageReset?: boolean
  renderRowSubComponent?: (props: { row: Row }) => ReactNode
  sortBy?: Array<SortingRule<any>>
  pagination?: TablePaginationProps | boolean
}

export type TableProps<D extends { [key: string]: any }> = TableOwnProps<D> &
  BoxProps

export function Table<D extends { [key: string]: any }>({
  columns,
  data = [],
  header = true,
  sorting = false,

  hiddenColumns,
  skipPageReset,
  renderRowSubComponent,
  sortBy,
  pagination,
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
      <Box as="table" variant="styles.table" {...getTableProps()} {...rest}>
        {header && (
          <Box as="thead" variant="styles.thead">
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
                    <Flex variant="layout.verticalAlign">
                      <Box sx={{ mr: 1, flex: 1 }}>
                        {column.render('Header')}
                      </Box>
                      {sorting &&
                        column.isSorted &&
                        (column.isSortedDesc ? '.' : 'up')}
                    </Flex>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}
        <Box as="tbody" variant="styles.tbody" {...getTableBodyProps()}>
          {(page || rows).map(
            (
              row: Row &
                UseGroupByRowProps<D> & {
                  isExpanded?: boolean
                }
            ) => {
              prepareRow(row)
              const { key, ...rowProps } = row.getRowProps()
              return (
                <React.Fragment key={key}>
                  <Box variant="styles.tr" as="tr" {...rowProps}>
                    {row.cells.map(
                      (cell: Cell & Partial<UseGroupByCellProps<D>>) => (
                        <Box
                          as="td"
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
          {...pagination}
          pageIndex={statePageIndex}
          pageSize={statePageSize}
          {...tableOptions}
        />
      )}
    </React.Fragment>
  )
}
