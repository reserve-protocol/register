import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'

interface BasketSkeletonProps {
  isExposure?: boolean
}

export const BasketSkeleton = ({ isExposure = false }: BasketSkeletonProps) =>
  Array.from({ length: 10 }).map((_, i) => (
    <TableRow key={i} className="border-none hover:bg-transparent">
      <TableCell className="py-3 pl-0 pr-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-col gap-1">
            <Skeleton className="h-4 w-20 sm:w-32 lg:w-36" />
            <Skeleton className="h-3 w-12 sm:w-20" />
          </div>
        </div>
      </TableCell>
      {!isExposure && (
        <TableCell className="py-3 pl-2 pr-0 text-right">
          <Skeleton className="ml-auto h-4 w-10 sm:w-[60px]" />
        </TableCell>
      )}
      {isExposure && (
        <TableCell className="py-3 pl-2 pr-0 text-right">
          <Skeleton className="ml-auto h-4 w-10 sm:w-[60px]" />
        </TableCell>
      )}
      <TableCell className="py-3 pl-2 pr-0 text-right">
        <Skeleton className="ml-auto h-4 w-12 sm:w-[72px]" />
      </TableCell>
      {isExposure && (
        <TableCell className="hidden py-3 pl-2 pr-0 text-right sm:table-cell">
          <Skeleton className="ml-auto h-4 w-16 sm:w-[84px]" />
        </TableCell>
      )}
    </TableRow>
  ))
