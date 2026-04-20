import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const IndexDTFTablePlaceholder = () => (
  <div className="hidden lg:block w-full overflow-x-auto [&_table]:bg-card [&_table]:rounded-[20px] [&_table_thead_th]:px-6 [&_table_tbody_td]:px-6">
    <Table className="text-sm md:text-base">
      <TableHeader className="text-sm">
        <TableRow className="h-16 text-legend hover:bg-transparent">
          <TableHead className="font-light">Name</TableHead>
          <TableHead className="font-light">Backing</TableHead>
          <TableHead className="font-light text-center">Tags</TableHead>
          <TableHead className="font-light">Performance (Last 7 Days)</TableHead>
          <TableHead className="font-light text-right">Market Cap</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-card">
        {Array.from({ length: 15 }).map((_, index) => (
          <TableRow key={index} className="hover:bg-transparent">
            <TableCell>
              <div className="flex items-center gap-3 min-w-[320px]">
                <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[180px]" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex -space-x-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background"
                  />
                ))}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex justify-center">
                <Skeleton className="h-6 w-[150px]" />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-[80px]" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
                <Skeleton className="h-10 w-[80px]" />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex justify-end items-center">
                <Skeleton className="h-6 w-[100px]" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)

export default IndexDTFTablePlaceholder
