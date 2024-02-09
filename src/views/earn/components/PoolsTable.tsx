import { Table, TableProps } from 'components/table'
import { Pool } from 'state/pools/atoms'
import useEarnTableColumns, {
  columnVisibility,
} from '../hooks/useEarnTableColumns'
import useRTokenPools from '../hooks/useRTokenPools'

interface Props extends Partial<TableProps> {
  data: Pool[]
}

const PoolsTable = ({ data, ...props }: Props) => {
  const columns = useEarnTableColumns()
  const { isLoading } = useRTokenPools()

  return (
    <Table
      sorting
      sortBy={[{ id: 'apy', desc: true }]}
      isLoading={isLoading}
      compact
      columns={columns}
      data={data}
      columnVisibility={columnVisibility}
      sx={{ borderRadius: '0 0 20px 20px', overflow: 'hidden' }}
      {...props}
    />
  )
}

export default PoolsTable
