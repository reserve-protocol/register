import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const Top100TablePlaceholder = () => (
  <div className="p-2 bg-card rounded-[20px]">
    <div className="grid grid-cols-[1fr_1fr_100px_120px_80px_100px] text-legend gap-4 px-6 py-4 border-b">
      <div>Name</div>
      <div>Backing</div>
      <div className="text-right">Price</div>
      <div className="text-right">Market Cap</div>
      <div className="text-right">Holders</div>
      <div className="text-right">Created</div>
    </div>
    {Array.from({ length: 10 }).map((_, index) => (
      <div
        key={index}
        className={cn(
          'grid grid-cols-[1fr_1fr_100px_120px_80px_100px] gap-4 py-5 px-6',
          index !== 9 && 'border-b'
        )}
      >
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[60px]" />
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-6 w-6 rounded-full border-2 border-background"
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Skeleton className="h-5 w-[80px]" />
        </div>
        <div className="flex items-center justify-end">
          <Skeleton className="h-5 w-[90px]" />
        </div>
        <div className="flex items-center justify-end">
          <Skeleton className="h-5 w-[40px]" />
        </div>
        <div className="flex items-center justify-end">
          <Skeleton className="h-5 w-[70px]" />
        </div>
      </div>
    ))}
  </div>
)

export default Top100TablePlaceholder
