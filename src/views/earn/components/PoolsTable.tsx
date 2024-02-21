import { Table, TableProps } from 'components/table'
import { Pool } from 'state/pools/atoms'
import useEarnTableColumns, {
  columnVisibility,
  compactColumnVisibility,
} from '../hooks/useEarnTableColumns'
import useRTokenPools from '../hooks/useRTokenPools'
import { Box, Text } from 'theme-ui'
import { useMemo } from 'react'

interface Props extends Partial<TableProps> {
  data: Pool[]
  compact?: boolean
}

const PoolsTable = ({ data, compact = false, ...props }: Props) => {
  const columns = useEarnTableColumns(compact)
  const { isLoading } = useRTokenPools()
  const visibility = useMemo(
    () => (compact ? compactColumnVisibility : columnVisibility),
    [compact]
  )

  return (
    <>
      <Table
        sorting
        sortBy={[{ id: 'apy', desc: true }]}
        isLoading={isLoading}
        compact
        columns={columns}
        data={data}
        columnVisibility={visibility}
        sx={{ borderRadius: '0 0 20px 20px', overflow: 'hidden' }}
        {...props}
      />
      {!isLoading && !data.length && (
        <Box mt={5} sx={{ textAlign: 'center' }}>
          <Text variant="legend">No yield opportunities found</Text>
        </Box>
      )}
    </>
  )
}

export default PoolsTable
