import { useState } from 'react'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { cn } from '@/lib/utils'
import { NextChartFamiliesReview } from './review'

type PreviewWidth = 'normal' | 'narrow' | '390' | '320'

export function NextChartFamiliesResponsiveReview({
  isLocalPreview,
  theme,
}: {
  isLocalPreview: boolean
  theme: string
}) {
  const [width, setWidth] = useState<PreviewWidth>('normal')
  const mobileWidth = width === '390' ? 390 : 320

  return (
    <section id="chart-next-families-review" className="space-y-6">
      <div className="min-w-0 max-w-full overflow-x-auto">
        <SegmentedControl
          presentation="text-only"
          value={width}
          onValueChange={(value) => setWidth(value as PreviewWidth)}
          aria-label="Preview viewport"
        >
          <SegmentedControlItem value="normal">Normal</SegmentedControlItem>
          <SegmentedControlItem value="narrow">Narrow</SegmentedControlItem>
          {isLocalPreview ? (
            <>
              <SegmentedControlItem value="390">390px</SegmentedControlItem>
              <SegmentedControlItem value="320">320px</SegmentedControlItem>
            </>
          ) : null}
        </SegmentedControl>
      </div>

      {width === 'normal' || width === 'narrow' || !isLocalPreview ? (
        <div
          data-testid={`next-families-preview-${width}`}
          className={cn(
            'transition-[max-width]',
            width === 'narrow' && 'max-w-[824px]'
          )}
        >
          <NextChartFamiliesReview />
        </div>
      ) : (
        <iframe
          key={`${mobileWidth}-${theme}`}
          title={`${mobileWidth}px mobile chart preview`}
          data-testid={`next-families-mobile-preview-${mobileWidth}`}
          src={`/src/views/internal/design-system/charts/next-families/preview.html#embedded=true&theme=${theme}`}
          width={mobileWidth}
          className="block min-h-[2200px] max-w-full border border-border bg-background"
        />
      )}
    </section>
  )
}
