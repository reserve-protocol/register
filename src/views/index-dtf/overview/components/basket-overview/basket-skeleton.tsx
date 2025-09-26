import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'

interface BasketSkeletonProps {
  isExposure?: boolean
}

export const BasketSkeleton = ({ isExposure = false }: BasketSkeletonProps) =>
  Array.from({ length: 10 }).map((_, i) => (
    <TableRow key={i} className="border-none">
      <TableCell>
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full flex-shrink-0" />
          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
            <Skeleton className="h-3.5 w-14 sm:w-24 lg:w-[120px]" />
            <Skeleton className="h-3 w-8 sm:w-16 lg:w-[80px]" />
          </div>
        </div>
      </TableCell>
      {!isExposure && (
        <TableCell className="text-center px-1 sm:px-3">
          <Skeleton className="h-4 w-7 sm:w-[60px] mx-auto" />
        </TableCell>
      )}
      {isExposure && (
        <TableCell className="text-center hidden sm:table-cell">
          <Skeleton className="h-4 w-[80px] mx-auto" />
        </TableCell>
      )}
      <TableCell className="text-center px-1 sm:px-3">
        <Skeleton className="h-4 w-8 sm:w-[60px] mx-auto" />
      </TableCell>
      {isExposure && (
        <TableCell className="text-right px-1 sm:px-3">
          <Skeleton className="h-4 w-7 sm:w-[60px] ml-auto" />
        </TableCell>
      )}
      {!isExposure && (
        <TableCell className="text-right px-1 sm:px-3">
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded-full flex-shrink-0" />
          </div>
        </TableCell>
      )}
    </TableRow>
  ))