import { cn } from '@/lib/utils'
import { SourceCompactChart, SourceHomeChart } from './source-small'
import {
  SourceOverviewChart,
  type SourceOverviewChartType,
} from './source-overview'

export function ChartSourceSet({
  chartType,
  inspectHeader,
  narrow,
}: {
  chartType: SourceOverviewChartType
  inspectHeader: boolean
  narrow: boolean
}) {
  return (
    <div
      data-testid={narrow ? 'chart-review-narrow' : 'chart-review-normal'}
      className={cn('space-y-8', narrow ? 'max-w-[390px]' : 'max-w-[824px]')}
    >
      <div className="min-w-0 space-y-3">
        <h3 className="text-base font-medium">
          Index DTF Overview · YTD {chartType === 'line' ? 'line' : 'candles'}
          {' chart'}
        </h3>
        <SourceOverviewChart
          chartType={chartType}
          inspectHeader={inspectHeader}
        />
        <p className="text-sm leading-5 text-muted-foreground">
          Actual Overview {chartType === 'line' ? 'line' : 'candlestick'} plot
          renderer, with axes following the viewport; the launch label uses a
          compact V1 text annotation.{' '}
          {chartType === 'line'
            ? 'Hover, touch or focus the plot and use ← / → to inspect a price in the header. “Existing tooltip” uses the same inputs and geometry with the original inspection behavior.'
            : 'Hover a candle to inspect all four OHLC values in the compact V1 tooltip candidate. The production tooltip is unchanged. Header inspection remains a line-only comparison; stable touch and keyboard candle selection are unresolved.'}
        </p>
        <p className="text-sm leading-5 text-muted-foreground">
          Frozen YTD {chartType === 'line' ? 'line' : '7-day candle'} replay;
          footer labels show existing placement and are not controls here.{' '}
          {chartType === 'candles' &&
            'The final candle is a partial captured bucket, not a completed seven-day return. '}
          The plot keeps Overview’s height; the flat square surface uses V1’s
          24px content inset, not a universal chart inset. Address control and
          outer background treatment are intentionally omitted.
        </p>
      </div>
      <div
        className={cn(
          'grid min-w-0 items-start gap-8',
          !narrow && 'md:grid-cols-2'
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
            Home · chart in highlighted-card context
          </h3>
          <SourceHomeChart />
          <p className="max-w-sm text-sm leading-5 text-muted-foreground">
            Existing chart renderer, 208px high and edge-to-edge within the
            media. Home retains square outer and inner corners, 4px surround and
            24px content axis; its lighter 20px name is a title-weight
            candidate. The gradient starts inside the surround; framing and
            content insets belong to the highlighted card, not the chart. This
            excerpt does not replace the full card, its ticker or its actions.
          </p>
        </div>
      </div>
    </div>
  )
}
