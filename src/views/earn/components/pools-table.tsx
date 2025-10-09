import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Pool } from 'state/pools/atoms'
import useEarnTableColumns from '../hooks/useEarnTableColumns'
import useRTokenPools from '../hooks/useRTokenPools'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import TableFilters from './table-filters'

interface Props {
  data: Pool[]
  compact?: boolean
}

const LoadingSkeleton = () => {
  return (
    <Table className="border-separate border-spacing-y-1 min-w-[800px]">
      <TableHeader>
        <TableRow className="border-none hover:bg-transparent">
          <TableHead>Pool</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Chain</TableHead>
          <TableHead>APY</TableHead>
          <TableHead>Base APY</TableHead>
          <TableHead>Reward APY</TableHead>
          <TableHead>TVL</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
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
            <TableCell>
              <Skeleton className="h-4 w-[80px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[80px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const PoolsTable = ({ data, compact = false }: Props) => {
  const columns = useEarnTableColumns(compact)
  const { isLoading } = useRTokenPools()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'apy', desc: true },
  ])

  const table = useReactTable({
    columns: columns as any,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <div className="bg-secondary p-1 rounded-4xl">
      {!compact && (
        <div className="mb-1">
          <TableFilters />
        </div>
      )}
      <div className="bg-card rounded-3xl p-2 md:p-3 overflow-x-auto xl:overflow-visible">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <Table className={cn("border-separate border-spacing-y-1", !compact && "min-w-[600px] xl:min-w-[1000px]")}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-none hover:bg-transparent xl:sticky xl:top-0 bg-card xl:z-10 text-legend"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'cursor-pointer text-sm xl:bg-card',
                        header.column.columnDef.meta?.className
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {{
                          asc: <ArrowUp size={14} />,
                          desc: <ArrowDown size={14} />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="bg-card">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-none">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.className}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-none">
                  <TableCell colSpan={columns.length} className="text-center">
                    <p className="text-legend py-8">
                      No yield opportunities found
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

export default PoolsTable
