import { useState } from 'react'
import { Switch } from '@/components/design-system-v1/switch'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { cn } from '@/lib/utils'
import ChartPressureReview from './pressure-review'
import { SourceCompactChart, SourceHomeChart } from './source-small'
import { SourceOverviewChart } from './source-overview'

export default function ChartReview() {
  const [mode, setMode] = useState('header')
  const [constrained, setConstrained] = useState(false)
  const [pressureOpen, setPressureOpen] = useState(false)
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
          value={mode}
          onValueChange={setMode}
          aria-label="Overview inspection comparison"
        >
          <SegmentedControlItem value="header" data-testid="chart-mode-header">
            Header inspection
          </SegmentedControlItem>
          <SegmentedControlItem
            value="current"
            data-testid="chart-mode-current"
          >
            Existing tooltip
          </SegmentedControlItem>
        </SegmentedControl>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
          <Switch
            checked={constrained}
            onCheckedChange={setConstrained}
            data-testid="chart-source-constrained"
          />
          Constrained review
        </label>
      </div>
      <div
        className={cn(
          'min-w-0 space-y-3',
          constrained ? 'max-w-[390px]' : 'max-w-[824px]'
        )}
      >
        <h3 className="text-base font-medium">
          Index DTF Overview · YTD line chart
        </h3>
        <SourceOverviewChart inspectHeader={mode === 'header'} />
        <p className="text-sm leading-5 text-muted-foreground">
          Actual Overview plot renderer: existing line, fill and desktop axes;
          the launch label uses a compact V1 text annotation. Hover, touch or
          focus the plot and use ← / → to inspect a price in the header.
          “Existing tooltip” uses the same inputs and geometry with the original
          inspection behavior.
        </p>
        <p className="text-sm leading-5 text-muted-foreground">
          Frozen YTD line replay; footer labels show existing placement and are
          not controls here. The plot keeps Overview’s height; the flat square
          surface uses V1’s 24px content inset, not a universal chart inset.
          Address control and outer background treatment are intentionally
          omitted.
        </p>
      </div>
      <div
        className={cn(
          'grid min-w-0 items-start gap-8',
          constrained ? 'max-w-[390px]' : 'max-w-[824px] md:grid-cols-2'
        )}
      >
        <div className="min-w-0 space-y-3">
          <h3 className="text-base font-medium">
            Discover · table-cell sparkline
          </h3>
          <SourceCompactChart />
          <p className="max-w-sm text-sm leading-5 text-muted-foreground">
            90 × 40px, line only, as in the performance column. No invented
            identity or price. The white cell frame is context only; its padding
            is not chart policy. Dated LCAP 30-day sample.
          </p>
        </div>
        <div className="min-w-0 space-y-3">
          <h3 className="text-base font-medium">
            Home · highlighted-card excerpt
          </h3>
          <SourceHomeChart />
          <p className="max-w-sm text-sm leading-5 text-muted-foreground">
            Existing chart renderer, 208px high and edge-to-edge within the
            media. Home’s identity and supplied return use the accepted V1 card
            treatment: square shell, 8px inset/media corners and 24px content
            axis. This is the media/header excerpt, not a replacement for the
            full card, its ticker or its actions.
          </p>
        </div>
      </div>
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
          candle charts, metric tabs or other chart families. Those need their
          own source-context review. Existing production callers retain their
          tooltip and launch pill; the header readout and unboxed launch label
          are opt-in for this lab.
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
    </section>
  )
}
