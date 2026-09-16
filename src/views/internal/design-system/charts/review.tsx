import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { Trans, useLingui } from '@lingui/react/macro'
import { themeModeAtom } from '@/components/dark-mode-toggle/atoms'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import ChartPressureReview from './pressure-review'
import { ChartSourceSet } from './source-set'
import { NextChartFamiliesResponsiveReview } from './next-families/responsive-review'

export default function ChartReview() {
  const [mode, setMode] = useState('header')
  const [chartType, setChartType] = useState<'candles' | 'line'>('line')
  const [viewport, setViewport] = useState<'normal' | 'narrow' | 'mobile'>(
    'normal'
  )
  const [mobileWidth, setMobileWidth] = useState<320 | 390>(390)
  const [pressureOpen, setPressureOpen] = useState(false)
  const theme = useAtomValue(themeModeAtom)
  const { t } = useLingui()
  const isLocalPreview = ['127.0.0.1', '[::1]', 'localhost'].includes(
    window.location.hostname
  )
  const previewUrl = `/src/views/internal/design-system/charts/mobile-preview.html#theme=${theme}&inspection=${mode}&chart=${chartType}`
  return (
    <section
      id="chart-first-review"
      data-testid="chart-first-review"
      className="space-y-8"
    >
      <div className="max-w-3xl space-y-2">
        <h2 className="text-xl font-medium">
          Charts · starting from the product
        </h2>
        <p className="text-sm leading-5 text-muted-foreground">
          Preserve Overview and Home’s existing visual language. Review the
          chart treatment and the header inspection change below—not a redesign
          of their cards, data or controls.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <SegmentedControl
          presentation="text-only"
          value={chartType}
          onValueChange={(value) => setChartType(value as 'candles' | 'line')}
          aria-label={t`Overview chart type`}
        >
          <SegmentedControlItem value="line" data-testid="chart-type-line">
            <Trans>Line</Trans>
          </SegmentedControlItem>
          <SegmentedControlItem
            value="candles"
            data-testid="chart-type-candles"
          >
            <Trans>Candles</Trans>
          </SegmentedControlItem>
        </SegmentedControl>
        {chartType === 'line' && (
          <div className="min-w-0 max-w-full overflow-x-auto">
            <SegmentedControl
              presentation="text-only"
              value={mode}
              onValueChange={setMode}
              aria-label="Line inspection comparison"
            >
              <SegmentedControlItem
                value="header"
                data-testid="chart-mode-header"
              >
                Header inspection
              </SegmentedControlItem>
              <SegmentedControlItem
                value="current"
                data-testid="chart-mode-current"
              >
                Floating tooltip · provisional
              </SegmentedControlItem>
            </SegmentedControl>
          </div>
        )}
        <div className="min-w-0 max-w-full overflow-x-auto">
          <SegmentedControl
            presentation="text-only"
            value={viewport}
            onValueChange={(value) =>
              setViewport(value as 'normal' | 'narrow' | 'mobile')
            }
            aria-label={t`Chart preview viewport`}
          >
            <SegmentedControlItem
              value="normal"
              data-testid="chart-viewport-normal"
            >
              <Trans>Normal</Trans>
            </SegmentedControlItem>
            <SegmentedControlItem
              value="narrow"
              data-testid="chart-viewport-narrow"
            >
              <Trans>Narrow desktop container</Trans>
            </SegmentedControlItem>
            {isLocalPreview && (
              <SegmentedControlItem
                value="mobile"
                data-testid="chart-viewport-mobile"
              >
                <Trans>Mobile preview</Trans>
              </SegmentedControlItem>
            )}
          </SegmentedControl>
        </div>
      </div>
      {viewport === 'mobile' ? (
        <div className="space-y-4">
          <SegmentedControl
            presentation="text-only"
            value={String(mobileWidth)}
            onValueChange={(value) =>
              setMobileWidth(Number(value) as 320 | 390)
            }
            aria-label={t`Mobile preview width`}
          >
            <SegmentedControlItem
              value="320"
              data-testid="chart-mobile-width-320"
            >
              320px
            </SegmentedControlItem>
            <SegmentedControlItem
              value="390"
              data-testid="chart-mobile-width-390"
            >
              390px
            </SegmentedControlItem>
          </SegmentedControl>
          <iframe
            data-testid="chart-mobile-preview"
            title={t`Mobile chart preview`}
            src={previewUrl}
            width={mobileWidth}
            className="h-[960px] max-w-full border-0 bg-background"
          />
        </div>
      ) : (
        <ChartSourceSet
          chartType={chartType}
          inspectHeader={mode === 'header'}
          narrow={viewport === 'narrow'}
        />
      )}
      <details className="max-w-3xl text-sm leading-5 text-muted-foreground">
        <summary className="min-h-11 cursor-pointer py-3 font-medium text-foreground">
          Source context and approval boundary
        </summary>
        <p>
          PHOTON snapshots captured September 13, 2026, not live data. Home uses
          the featured response; Overview uses the captured history and a
          separately captured headline. Their values were captured at different
          times and are not being reconciled or recalculated here.
        </p>
        <p className="mt-3">
          Approval covers these named visual changes only. It does not replace
          card defaults, return calculations, history sampling, data sources,
          metric tabs or other chart families. Those need their own
          source-context review. Existing production callers retain their
          tooltip and launch pill; the header readout, provisional V1 line
          tooltip alternative, compact V1 candle tooltip and unboxed launch
          label are opt-in for this lab. The floating line treatment is
          selectable review evidence, not an accepted replacement. The candle
          replay is a staging API capture from September 14 with its original
          seven-day OHLC buckets; its final bucket was partial when captured.
          Its date and values remain separate from the older headline and
          line-history snapshots above.
        </p>
      </details>
      <details
        data-testid="chart-pressure-toggle"
        onToggle={(event) => setPressureOpen(event.currentTarget.open)}
        className="space-y-6"
      >
        <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">
          Technical pressure tests · not proposed product layouts
        </summary>
        {pressureOpen && <ChartPressureReview />}
      </details>
      <div className="pt-8">
        <NextChartFamiliesResponsiveReview
          isLocalPreview={isLocalPreview}
          theme={theme}
        />
      </div>
    </section>
  )
}
