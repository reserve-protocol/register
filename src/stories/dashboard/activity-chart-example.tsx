import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useState, type ReactNode } from 'react'

import { CategoryBarChart } from '@/components/design-system-v1/category-bar-chart'
import {
  bucketsForPeriod,
  bucketTotal,
  formatCompactValue,
  MAX_DAILY_BUCKETS,
  summarizeBuckets,
} from '@/components/design-system-v1/category-bar-chart-data'
import {
  ChartLegend,
  ChartPanel,
  useChartInspection,
  type ChartPanelHeadline,
  type ChartPanelState,
} from '@/components/design-system-v1/chart-panel'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { formatCurrency } from '@/utils'
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_COUNT,
  ACTIVITY_RANGES,
  ACTIVITY_VOLUME,
  type ActivityRange,
} from './activity-chart-fixtures'

dayjs.extend(utc)

export type ActivityMeasure = 'volume' | 'count'
export type ActivityLayout = 'stacked' | 'diverging'

const measures = {
  volume: {
    label: 'Transaction volume',
    history: ACTIVITY_VOLUME,
    format: (value: number) => formatCompactValue(value, { currency: true }),
    formatAxis: (value: number) =>
      formatCompactValue(Math.abs(value), { currency: true }),
  },
  count: {
    label: 'Transactions',
    history: ACTIVITY_COUNT,
    format: (value: number) => formatCurrency(value, 0),
    formatAxis: (value: number) => formatCompactValue(Math.abs(value)),
  },
}

export interface ActivityChartProps {
  measure: ActivityMeasure
  layout: ActivityLayout
  state: ChartPanelState
  range: ActivityRange
  headline?: ChartPanelHeadline
  controls?: ReactNode
}

export function ActivityChart({
  measure,
  layout,
  state,
  range,
  headline,
  controls,
}: ActivityChartProps) {
  const config = measures[measure]
  const period = ACTIVITY_RANGES.find((option) => option.value === range)!
  const buckets =
    state === 'empty' ? [] : bucketsForPeriod(config.history, period.days)
  const isWeekly = period.days > MAX_DAILY_BUCKETS
  const inspection = useChartInspection(
    buckets.length,
    `${measure}-${range}-${state}`
  )
  const selected =
    inspection.selectedIndex === undefined
      ? undefined
      : buckets[inspection.selectedIndex]
  const summary = selected
    ? {
        total: bucketTotal(selected, ACTIVITY_CATEGORIES),
        byCategory: selected.values,
      }
    : summarizeBuckets(buckets, ACTIVITY_CATEGORIES)
  const caption = selected
    ? describeBucket(selected.start, isWeekly, selected.partial)
    : period.caption

  return (
    <ChartPanel
      label={config.label}
      value={state === 'unavailable' ? '—' : config.format(summary.total)}
      caption={caption}
      headline={headline}
      state={state}
      emptyMessage="No activity in this period"
      plotLabel={`${config.label} by category, ${isWeekly ? 'weekly' : 'daily'}`}
      inspection={inspection}
      summary={`${caption}: ${config.label} ${config.format(summary.total)}. ${ACTIVITY_CATEGORIES.map(
        (category) =>
          `${category.label} ${config.format(summary.byCategory[category.key] ?? 0)}`
      ).join(', ')}.`}
      controls={controls}
      legend={
        <ChartLegend
          items={ACTIVITY_CATEGORIES.map((category) => ({
            key: category.key,
            label: category.label,
            slot: category.slot,
            value: config.format(summary.byCategory[category.key] ?? 0),
          }))}
        />
      }
    >
      <CategoryBarChart
        buckets={buckets}
        categories={ACTIVITY_CATEGORIES}
        below={layout === 'diverging' ? ['withdrawals'] : []}
        selectedIndex={inspection.selectedIndex}
        isTouchInput={inspection.isTouchInput}
        onInspect={inspection.inspect}
        formatAxisValue={config.formatAxis}
        formatTick={(start) =>
          dayjs
            .unix(start)
            .utc()
            .format(isWeekly ? 'MMM YYYY' : 'D MMM')
        }
      />
    </ChartPanel>
  )
}

export function ActivityRangeControl({
  value,
  onChange,
}: {
  value: ActivityRange
  onChange: (range: ActivityRange) => void
}) {
  return (
    <SegmentedControl
      presentation="text-only"
      textOnlyDensity="compact"
      size="compact"
      aria-label="Period"
      value={value}
      onValueChange={(next) => onChange(next as ActivityRange)}
    >
      {ACTIVITY_RANGES.map((option) => (
        <SegmentedControlItem key={option.value} value={option.value}>
          {option.label}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  )
}

export interface ActivityChartExampleProps {
  measure: ActivityMeasure
  layout: ActivityLayout
  state: ChartPanelState
  initialRange?: ActivityRange
}

export function ActivityChartExample({
  initialRange = '30d',
  ...props
}: ActivityChartExampleProps) {
  const [range, setRange] = useState(initialRange)
  return (
    <ActivityChart
      {...props}
      range={range}
      controls={<ActivityRangeControl value={range} onChange={setRange} />}
    />
  )
}

function describeBucket(start: number, isWeekly: boolean, partial?: boolean) {
  const date = dayjs.unix(start).utc().format('D MMM YYYY')
  const label = isWeekly ? `Week of ${date}` : date
  return partial ? `${label} · so far` : label
}
