import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'

interface BasketSkeletonProps {
  isExposure?: boolean
}

export const BasketSkeleton = ({ isExposure = false }: BasketSkeletonProps) =>
  Array.from({ length: 10 }).map((_, i) => (
    <TableRow key={i}>
      <TableCell className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-12 lg:w-[120px]" />
          <Skeleton className="h-3 w-8 lg:w-[80px]" />
        </div>
      </TableCell>
      {!isExposure && (
        <TableCell className="text-center">
          <Skeleton className="h-4 w-[60px] mx-auto" />
        </TableCell>
      )}
      {isExposure && (
        <TableCell className="text-center">
          <Skeleton className="h-4 w-[80px] mx-auto" />
        </TableCell>
      )}
      <TableCell className="text-center">
        <Skeleton className="h-4 w-[60px] mx-auto" />
      </TableCell>
      {isExposure && (
        <TableCell className="text-right">
          <Skeleton className="h-4 w-[60px] ml-auto" />
        </TableCell>
      )}
      {!isExposure && (
        <TableCell className="text-right">
          <Skeleton className="h-4 w-[60px] ml-auto" />
        </TableCell>
      )}
      {!isExposure && (
        <TableCell>
          <Skeleton className="h-4 w-4" />
        </TableCell>
      )}
    </TableRow>
  ))