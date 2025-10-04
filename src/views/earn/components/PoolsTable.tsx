import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

interface Props {
  data: Pool[]
  compact?: boolean
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
    <div className="border-[3px] border-secondary rounded-[20px] bg-cardBackground overflow-auto">
      <Table className="border-separate border-spacing-y-2">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-none hover:bg-transparent sticky top-0 bg-cardBackground z-10"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    'cursor-pointer',
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
        <TableBody className="bg-cardBackground">
          {!isLoading && table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="border-none">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.columnDef.meta?.className}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="border-none">
              <TableCell colSpan={columns.length} className="text-center">
                <p className="text-legend py-8">No yield opportunities found</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default PoolsTable
