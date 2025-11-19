import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { VoteLockPosition } from '../hooks/use-vote-lock-positions'
import { useMemo, useState } from 'react'
import TokenLogo from '@/components/token-logo'
import { formatPercentage } from '@/utils'
import { useAtomValue } from 'jotai'
import { voteLockPositionsAtom } from '../atoms'
import { TableCell, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import DataTable from '@/components/ui/data-table'

const TableFilters = () => {
  return <div className="flex items-center gap-2">Filters</div>
}

const useColumns = () => {
  const columnHelper = createColumnHelper<VoteLockPosition>()
  return useMemo(() => {
    return [
      columnHelper.accessor('underlying.token.symbol', {
        header: 'Gov. Token',
        cell: (data) => (
          <div className="flex items-center gap-2">
            <TokenLogo
              symbol={data.getValue()}
              address={data.row.original.underlying.token.address}
              chain={data.row.original.chainId}
            />
            <span className="text-sm">{data.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('underlying.token.symbol', {
        header: 'Governs',
        cell: (data) => (
          <span className="text-legend">
            {data.row.original.dtfs.map((dtf) => dtf.symbol).join(', ')}
          </span>
        ),
      }),
      columnHelper.accessor('apr', {
        header: 'Avg. 30d%',
        cell: (data) => {
          return (
            <div className="text-primary font-semibold">
              {formatPercentage(data.getValue())} APR
            </div>
          )
        },
      }),
      columnHelper.accessor('token.symbol', {
        header: 'Rewards',
        cell: (data) => (
          <span className="min-w-[80px] inline-block text-sm">Manage</span>
        ),
      }),
    ]
  }, [])
}

const TableSkeleton = () => {
  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <TableRow key={index} className="border-none">
          <TableCell>
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="flex -space-x-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-6 w-6 rounded-full border-2 border-background"
                  />
                ))}
              </div>
              <Skeleton className="h-4 w-[120px]" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2 min-w-[120px]">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2 min-w-[100px]">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[80px]" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

const VoteLockPositions = () => {
  const data = useAtomValue(voteLockPositionsAtom)
  const columns = useColumns()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'apr', desc: true },
  ])

  return (
    <div className="bg-card rounded-3xl border-2 border-secondary p-2">
      <DataTable
        columns={columns as any}
        data={data || []}
        // loading={!data}
        // loadingSkeleton={<TableSkeleton />}
      />
    </div>
  )
}

export default VoteLockPositions
