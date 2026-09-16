import { useState } from 'react'
import { Provider } from 'jotai'
import { Trans } from '@lingui/react/macro'
import { ArrowUp, ChevronDown } from 'lucide-react'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils'
import {
  v1Typography as type,
  v1TypographyVariants,
} from '@/components/design-system-v1/typography'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { formatToSignificantDigits } from '@/utils'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'
import PriceChartBody from '@/views/index-dtf/overview/components/charts/price-chart-body'
import type { ChartInspection } from '@/views/index-dtf/overview/components/charts/chart-inspection'
import CandlestickChartBody from '@/views/index-dtf/overview/components/charts/candlestick-chart-body'
import { SourceCandlestickTooltip } from './source-candlestick-tooltip'
import { SourceLineTooltip } from './source-line-tooltip'
import {
  launchTimestamp,
  overviewCandles,
  overviewPoints,
  photon,
} from './source-data'

export type SourceOverviewChartType = 'candles' | 'line'

export function SourceOverviewChart({
  chartType,
  inspectHeader,
}: {
  chartType: SourceOverviewChartType
  inspectHeader: boolean
}) {
  return (
    <Provider>
      <OverviewReplay
        key={`${chartType}-${String(inspectHeader)}`}
        chartType={chartType}
        inspectHeader={inspectHeader}
      />
    </Provider>
  )
}

function OverviewReplay({
  chartType,
  inspectHeader,
}: {
  chartType: SourceOverviewChartType
  inspectHeader: boolean
}) {
  const [selected, setSelected] = useState<ChartInspection>()
  const headline = photon.provenance.overviewHeadline
  const isCandles = chartType === 'candles'
  return (
    <section
      data-testid={
        isCandles ? 'chart-candlestick-source' : 'chart-overview-source'
      }
      className={cn(
        'min-w-0 [container-type:inline-size]',
        roles.surface.content
      )}
      onBlur={() => setSelected(undefined)}
    >
      <div className="px-6 pt-6">
        <div className="mb-6 flex flex-col gap-2">
          <h2
            data-testid="chart-source-title"
            className={cn(
              'min-w-0',
              v1TypographyVariants.responsivePageTitle,
              roles.text.primary
            )}
          >
            {photon.name}
          </h2>
          <div
            data-testid="chart-source-financial-row"
            className={cn(
              'relative flex min-h-[52px] min-w-0 flex-wrap content-start items-start justify-between gap-x-3 gap-y-1 [@container(min-width:22rem)]:min-h-6',
              type.body,
              roles.text.supporting
            )}
          >
            <div
              data-testid="chart-source-market-identity"
              className="flex shrink-0 items-center gap-2 whitespace-nowrap"
            >
              <span
                data-testid="chart-source-value"
                className="text-foreground tabular-nums"
              >
                {selected
                  ? `$${formatToSignificantDigits(selected.value)}`
                  : headline.price}
              </span>
              <span data-testid="chart-source-separator" aria-hidden="true">
                ·
              </span>
              <span data-testid="chart-source-ticker">${photon.symbol}</span>
              {!selected && (
                <SourceReturn
                  withSeparator
                  className="hidden [@container(min-width:40rem)]:flex"
                />
              )}
            </div>
            {selected ? (
              <time
                data-testid="chart-source-time"
                dateTime={new Date(selected.timestamp * 1000).toISOString()}
                title={dayjs
                  .unix(selected.timestamp)
                  .format('YYYY-MM-DD HH:mm Z')}
                className="basis-full shrink-0 text-sm leading-6 tabular-nums [@container(min-width:22rem)]:basis-auto"
              >
                {dayjs.unix(selected.timestamp).format('D MMM · HH:mm')}
              </time>
            ) : (
              <SourceReturn className="[@container(min-width:40rem)]:hidden" />
            )}
            {selected &&
              launchTimestamp !== undefined &&
              selected.timestamp < launchTimestamp && (
                <span
                  data-testid="chart-source-estimate"
                  className="absolute left-0 top-full text-xs text-muted-foreground"
                >
                  <Trans>Est. Historical Price ✱</Trans>
                </span>
              )}
          </div>
        </div>
      </div>
      <div
        data-testid="chart-source-plot"
        data-interval={isCandles ? '7d' : undefined}
        aria-label="PHOTON YTD price history"
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') setSelected(undefined)
        }}
        onPointerDown={(event) => {
          // Touch already supplies a sample; compatibility mouse/focus events can replace it.
          if (!isCandles && inspectHeader && event.pointerType === 'touch')
            event.preventDefault()
        }}
        className={cn(
          'sm:pr-6',
          (inspectHeader || isCandles) &&
            'focus-within:ring-2 focus-within:ring-ring focus-within:ring-inset'
        )}
      >
        {isCandles ? (
          <CandlestickChartBody
            candles={overviewCandles}
            range="ytd"
            dtfStart={photon.createdAt}
            launchTimestamp={launchTimestamp}
            useLaunchLabel
            launchMarkerVariant="annotation"
            tooltipContent={<SourceCandlestickTooltip />}
            intervalSeconds={604_800}
            className="h-72 sm:h-[332px]"
            yAxisPresentation="compact"
          />
        ) : (
          <PriceChartBody
            chartData={overviewPoints}
            range="ytd"
            dtfStart={photon.createdAt}
            launchTimestamp={launchTimestamp}
            useLaunchLabel
            launchMarkerVariant="annotation"
            className="h-72 sm:h-[332px]"
            onInspect={inspectHeader ? setSelected : undefined}
            latestPointMarker={{ ringColor: 'hsl(var(--card))' }}
            tooltipContent={inspectHeader ? undefined : <SourceLineTooltip />}
            yAxisPresentation="compact"
          />
        )}
      </div>
      {inspectHeader && !isCandles && (
        <output
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
          data-testid="chart-source-accessible-value"
        >
          {selected
            ? `$${formatToSignificantDigits(selected.value)} · ${dayjs.unix(selected.timestamp).format('D MMM YYYY HH:mm Z')}${launchTimestamp !== undefined && selected.timestamp < launchTimestamp ? ' · Est. Historical Price' : ''}`
            : `${headline.price} · $${photon.symbol} · ${headline.change} (ytd)`}
        </output>
      )}
      <FrozenFooter chartType={chartType} />
    </section>
  )
}

function SourceReturn({
  className,
  withSeparator = false,
}: {
  className: string
  withSeparator?: boolean
}) {
  return (
    <span
      data-testid="chart-source-return"
      className={cn(
        'flex shrink-0 items-center gap-2 whitespace-nowrap leading-6 tabular-nums',
        PERFORMANCE_TEXT_CLASSES.positive,
        className
      )}
    >
      {withSeparator && (
        <span
          data-testid="chart-source-return-separator"
          className={roles.text.supporting}
          aria-hidden="true"
        >
          ·
        </span>
      )}
      <span
        data-testid="chart-source-return-change"
        className="inline-flex items-center gap-1"
      >
        <ArrowUp size={16} aria-hidden="true" />
        {photon.provenance.overviewHeadline.change}
      </span>
      <span>(ytd)</span>
    </span>
  )
}

function FrozenFooter({ chartType }: { chartType: SourceOverviewChartType }) {
  return (
    <div
      data-testid="chart-source-footer"
      aria-label={`Existing control placement — frozen YTD ${chartType} replay`}
      data-chart-type={chartType}
      className="px-6 pb-6 pt-6"
    >
      <div className="flex min-w-0 items-center gap-4 [@container(min-width:40rem)]:justify-between">
        <div className="flex shrink-0 items-center gap-4 text-sm text-muted-foreground [@container(min-width:40rem)]:order-2 [@container(min-width:40rem)]:text-base">
          <span
            data-testid="chart-footer-mobile-type"
            className="inline-flex items-center gap-1 text-foreground [@container(min-width:40rem)]:hidden"
          >
            {chartType === 'line' ? (
              <Trans>Line</Trans>
            ) : (
              <Trans>Candles</Trans>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground [@container(min-width:40rem)]:hidden" />
          </span>
          <div className="hidden items-center gap-4 [@container(min-width:40rem)]:flex">
            <span
              data-testid="chart-footer-line"
              className={cn(chartType === 'line' && 'text-foreground')}
            >
              <Trans>Line</Trans>
            </span>
            <span
              data-testid="chart-footer-candles"
              className={cn(chartType === 'candles' && 'text-foreground')}
            >
              <Trans>Candles</Trans>
            </span>
          </div>
        </div>
        <span className="h-4 w-px shrink-0 bg-border [@container(min-width:40rem)]:hidden" />
        <div className="flex min-w-0 flex-1 justify-between gap-2 overflow-x-auto text-sm text-muted-foreground [@container(min-width:40rem)]:flex-none [@container(min-width:40rem)]:justify-start [@container(min-width:40rem)]:gap-4 [@container(min-width:40rem)]:text-base">
          {['24H', '7D', '1M', '3M', 'YTD', '1Y', 'ALL'].map((range) => (
            <span
              key={range}
              className={cn(
                'shrink-0',
                range === 'YTD' && 'text-foreground',
                range === '3M' && 'hidden [@container(min-width:40rem)]:inline'
              )}
            >
              {range}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
