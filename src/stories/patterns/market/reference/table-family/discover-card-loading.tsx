import { Skeleton } from '@/components/design-system-v1/loading'
import {
  BACKING_LIMIT,
  FEATURE_CARD_ASSET_TICKER_CLASS_NAME,
} from '@/views/home/components/highlighted-dtfs/constants'

export function DiscoverCardTickerSkeleton() {
  return (
    <div className={FEATURE_CARD_ASSET_TICKER_CLASS_NAME}>
      <div className="pointer-events-none absolute inset-y-0 -right-px z-10 w-20 bg-gradient-to-l from-card via-card to-transparent" />
      <div className="flex overflow-hidden pl-2 pr-12">
        <div className="flex w-max">
          {Array.from({ length: BACKING_LIMIT }, (_, index) => (
            <div
              key={index}
              className="flex shrink-0 items-center gap-1 px-1.5 py-1"
            >
              <Skeleton className="ml-1 h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="absolute right-2 top-1/2 z-20 size-8 -translate-y-1/2 rounded-full" />
    </div>
  )
}
