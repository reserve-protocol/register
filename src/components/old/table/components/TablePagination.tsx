import { t } from '@lingui/macro'
import { Table } from '@tanstack/react-table'
import { SmallButton } from '@/components/old/button'
import Help from 'components/help'
import { Box, BoxProps, Text } from 'theme-ui'

export interface TablePaginationProps extends BoxProps {
  table: Table<any>
  totalCount: number
}

const TablePagination = ({ table, totalCount }: TablePaginationProps) => {
  const canPreviousPage = table.getCanPreviousPage()
  const canNextPage = table.getCanNextPage()

  return (
    <Box
      mt={4}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      variant="table.pagination.container"
    >
      <Box variant="table.pagination.navigationContainer">
        {(canPreviousPage || canNextPage) && (
          <Box variant="table.pagination.navigation" sx={{ display: 'flex' }}>
            <Box variant="table.pagination.navigation.button" mr={2}>
              <SmallButton
                variant="muted"
                onClick={() => table.setPageIndex(0)}
                disabled={!canPreviousPage}
              >
                {'<<'}
              </SmallButton>
            </Box>
            <Box variant="table.pagination.navigation.button" mr={2}>
              <SmallButton
                variant="accent"
                onClick={() => table.previousPage()}
                disabled={!canPreviousPage}
              >
                {'<'}
              </SmallButton>
            </Box>
            <Box variant="table.pagination.navigation.button" mr={2}>
              <SmallButton
                variant="accent"
                onClick={() => table.nextPage()}
                disabled={!canNextPage}
              >
                {'>'}
              </SmallButton>
            </Box>
            <Box variant="table.pagination.navigation.button">
              <SmallButton
                variant="muted"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!canNextPage}
              >
                {'>>'}
              </SmallButton>
            </Box>
          </Box>
        )}
        {/* <Box variant="table.pagination.pagesize">
          <Select
            aria-label="select number of rows per page"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
            }}
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size} rows
              </option>
            ))}
          </Select>
        </Box> */}
        <Box
          mt={3}
          variant="layout.verticalAlign"
          sx={{ fontSize: 1, justifyContent: 'center', color: 'lightText' }}
        >
          <Text mr={2}>{totalCount} records</Text>
        </Box>
      </Box>
    </Box>
  )
}

export default TablePagination
