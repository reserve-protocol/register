import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  FEATURE_CARD_CLASS_NAME,
  FEATURE_CARD_HEADER_CLASS_NAME,
  FEATURE_CARD_MEDIA_CLASS_NAME,
  HIGHLIGHTED_LIMIT,
  TRANSCRIPT_LINE_HEIGHT,
} from './constants'
import { FeatureCardAssetTickerSkeleton } from './asset-ticker'
import { PerformanceChartSkeleton } from './performance-chart'
import type { ChartPlacement } from './types'

export const FeatureCardTranscriptSkeleton = () => (
  <div className="flex flex-col items-start gap-2 px-5 py-4 pt-3">
    <div
      className="w-full min-w-0 shrink-0 overflow-hidden"
      style={{ height: TRANSCRIPT_LINE_HEIGHT * 2 }}
    >
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
    <Skeleton className="h-4 w-24" />
  </div>
)

const FeatureCardMarketCapSkeleton = () => (
  <div className="flex w-full items-center justify-between px-5 py-4 pt-3 text-sm">
    <Skeleton className="h-5 w-24" />
    <Skeleton className="h-5 w-16" />
  </div>
)

const IndexDTFFeatureCardSkeleton = ({
  chartPlacement = 'body',
  showTranscript = true,
}: {
  chartPlacement?: ChartPlacement
  showTranscript?: boolean
}) => (
  <div className={FEATURE_CARD_CLASS_NAME} aria-hidden="true">
    <div className={FEATURE_CARD_MEDIA_CLASS_NAME}>
      <div className={FEATURE_CARD_HEADER_CLASS_NAME}>
        <div className="flex min-w-0 items-start justify-between">
          <div className="relative w-fit flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="absolute -bottom-0.5 -right-1 h-4 w-4 rounded-md border-2 border-secondary bg-card" />
          </div>

          <div
            className={cn(
              'relative flex h-8 shrink-0 items-center justify-end',
              chartPlacement === 'header' && 'h-12 w-28'
            )}
          >
            {chartPlacement === 'header' ? (
              <div className="w-28">
                <PerformanceChartSkeleton className="h-12" fadeClassName="" />
              </div>
            ) : (
              <Skeleton className="inline-flex h-8 w-[67px] rounded-full opacity-100 lg:opacity-0" />
            )}
          </div>
        </div>

        <div className="w-full min-w-0">
          <div className="flex min-h-[48px] min-w-0 items-end">
            <div className="flex min-w-0 items-end gap-2">
              <Skeleton className="h-6 w-48 max-w-[70%]" />
            </div>
          </div>
          <div className="mt-1.5 flex w-full min-w-0 items-center justify-between gap-3 text-base text-legend">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-20 shrink-0" />
          </div>
        </div>
      </div>

      {chartPlacement === 'body' && (
        <PerformanceChartSkeleton className="h-52" />
      )}
    </div>
    <FeatureCardAssetTickerSkeleton />
    {showTranscript ? (
      <FeatureCardTranscriptSkeleton />
    ) : (
      <FeatureCardMarketCapSkeleton />
    )}
  </div>
)

export const IndexDTFFeatureCardPlaceholder = ({
  chartPlacement = 'body',
  count = HIGHLIGHTED_LIMIT,
  showTranscript = true,
}: {
  chartPlacement?: ChartPlacement
  count?: number
  showTranscript?: boolean
}) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <IndexDTFFeatureCardSkeleton
        key={index}
        chartPlacement={chartPlacement}
        showTranscript={showTranscript}
      />
    ))}
  </>
)
