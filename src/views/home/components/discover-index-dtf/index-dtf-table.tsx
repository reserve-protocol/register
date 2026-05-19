import DataTable from '@/components/ui/data-table'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { cn } from '@/lib/utils'
import { getFolioRoute } from '@/utils'
import { useNavigate } from 'react-router-dom'
import { indexDTFColumns } from './index-dtf-table-columns'
import IndexDTFTablePlaceholder from './index-dtf-table-placeholder'

const IndexDTFTable = ({
  data,
  isLoading,
}: {
  data: IndexDTFItem[]
  isLoading: boolean
}) => {
  const navigate = useNavigate()

  const handleRowClick = (row: IndexDTFItem, event: React.MouseEvent) => {
    event.stopPropagation()
    navigate(getFolioRoute(row.address, row.chainId))
  }

  if (isLoading) {
    return <IndexDTFTablePlaceholder />
  }

  return (
    <DataTable
      columns={indexDTFColumns}
      data={data}
      pagination={data.length > 20 ? { pageSize: 20 } : undefined}
      onRowClick={handleRowClick}
      getRowClassName={(row) =>
        isInactiveDTF(row.original.status) ? 'opacity-60' : undefined
      }
      className={cn(
        'hidden lg:block',
        '[&_table]:bg-card [&_table]:rounded-[20px] [&_table]:text-base',
        '[&_table_thead_th]:px-6',
        '[&_table_tbody_td]:px-6',
        '[&_table_tbody]:rounded-[20px] [&_table_tbody_tr:last-child_td]:rounded-bl-[20px] [&_table_tbody_tr:last-child_td:last-child]:rounded-br-[20px]'
      )}
    />
  )
}

export default IndexDTFTable
