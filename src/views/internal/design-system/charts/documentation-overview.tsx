import { Trans } from '@lingui/react/macro'
import { ArrowUp, ChevronDown } from 'lucide-react'

import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import {
  v1Typography as type,
  v1TypographyVariants,
} from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import {
  PERFORMANCE_COLORS,
  PERFORMANCE_TEXT_CLASSES,
} from '@/utils/chart-performance-colors'

import { overviewCandles, overviewPoints, photon } from './source-data'

type DocumentationOverviewChartType = 'candles' | 'line'

const WIDTH = 824
const HEIGHT = 320
const PLOT = { left: 24, right: 42, top: 16, bottom: 24 }

const lineValues = overviewPoints.map(({ price }) => price)
const candleValues = overviewCandles.flatMap(({ low, high }) => [low, high])

function scaleY(value: number, values: number[]) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return PLOT.top + ((max - value) / span) * (HEIGHT - PLOT.top - PLOT.bottom)
}

function xAt(index: number, length: number) {
  const width = WIDTH - PLOT.left - PLOT.right
  return PLOT.left + (index / Math.max(length - 1, 1)) * width
}

function DocumentationLinePlot() {
  const path = overviewPoints
    .map(({ price }, index) => {
      const x = xAt(index, overviewPoints.length)
      const y = scaleY(price, lineValues)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
  const latest = overviewPoints.at(-1)

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="block h-80 w-full"
      role="img"
      aria-label="PHOTON year-to-date price history"
      preserveAspectRatio="none"
    >
      <ChartGrid />
      <path
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      {latest ? (
        <circle
          cx={xAt(overviewPoints.length - 1, overviewPoints.length)}
          cy={scaleY(latest.price, lineValues)}
          r="4"
          fill="hsl(var(--primary))"
          stroke="hsl(var(--card))"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
    </svg>
  )
}

function DocumentationCandlestickPlot() {
  const slot =
    (WIDTH - PLOT.left - PLOT.right) / Math.max(overviewCandles.length, 1)
  const candleWidth = Math.max(Math.min(slot * 0.56, 12), 3)

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="block h-80 w-full"
      role="img"
      aria-label="PHOTON year-to-date candlestick price history"
      preserveAspectRatio="none"
    >
      <ChartGrid />
      {overviewCandles.map((candle, index) => {
        const x = PLOT.left + slot * (index + 0.5)
        const highY = scaleY(candle.high, candleValues)
        const lowY = scaleY(candle.low, candleValues)
        const openY = scaleY(candle.open, candleValues)
        const closeY = scaleY(candle.close, candleValues)
        const rising = candle.close >= candle.open
        const color = rising
          ? PERFORMANCE_COLORS.positive.dot
          : PERFORMANCE_COLORS.negative.dot

        return (
          <g key={candle.timestamp}>
            <line
              x1={x}
              x2={x}
              y1={highY}
              y2={lowY}
              stroke={color}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <rect
              x={x - candleWidth / 2}
              y={Math.min(openY, closeY)}
              width={candleWidth}
              height={Math.max(Math.abs(closeY - openY), 1)}
              fill={color}
            />
          </g>
        )
      })}
    </svg>
  )
}

function ChartGrid() {
  return (
    <g aria-hidden="true">
      {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
        <line
          key={ratio}
          x1={PLOT.left}
          x2={WIDTH - PLOT.right}
          y1={PLOT.top + ratio * (HEIGHT - PLOT.top - PLOT.bottom)}
          y2={PLOT.top + ratio * (HEIGHT - PLOT.top - PLOT.bottom)}
          stroke="hsl(var(--border))"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  )
}

export function DocumentationOverviewChart({
  chartType,
}: {
  chartType: DocumentationOverviewChartType
}) {
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
    >
      <div className="px-6 pt-6">
        <div className="mb-6 flex flex-col gap-2">
          <h2
            className={cn(
              'min-w-0',
              v1TypographyVariants.responsivePageTitle,
              roles.text.primary
            )}
          >
            {photon.name}
          </h2>
          <div
            className={cn(
              'flex min-w-0 items-center justify-between gap-3',
              type.body,
              roles.text.supporting
            )}
          >
            <span className="whitespace-nowrap">
              <span className={roles.text.primary}>
                {photon.provenance.overviewHeadline.price}
              </span>{' '}
              · ${photon.symbol}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 whitespace-nowrap tabular-nums',
                PERFORMANCE_TEXT_CLASSES.positive
              )}
            >
              <ArrowUp size={16} aria-hidden="true" />
              {photon.provenance.overviewHeadline.change} (ytd)
            </span>
          </div>
        </div>
      </div>
      <div className="sm:pr-6">
        {isCandles ? (
          <DocumentationCandlestickPlot />
        ) : (
          <DocumentationLinePlot />
        )}
      </div>
      <DocumentationFooter chartType={chartType} />
    </section>
  )
}

function DocumentationFooter({
  chartType,
}: {
  chartType: DocumentationOverviewChartType
}) {
  return (
    <div className="px-6 pb-6 pt-6">
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="flex min-w-0 gap-4 text-sm text-muted-foreground">
          {['24H', '7D', '1M', '3M', 'YTD', '1Y', 'ALL'].map((range) => (
            <span
              key={range}
              className={cn('shrink-0', range === 'YTD' && roles.text.primary)}
            >
              {range}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-4 text-sm text-muted-foreground">
          <span className={cn(chartType === 'line' && roles.text.primary)}>
            <Trans>Line</Trans>
          </span>
          <span className={cn(chartType === 'candles' && roles.text.primary)}>
            <Trans>Candles</Trans>
          </span>
          <ChevronDown className="hidden h-4 w-4" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
