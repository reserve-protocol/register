import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { historicalMetrics } from './fixture-data'
import { PORTFOLIO_PRESSURE_PROVENANCE } from './fixtures/portfolio-pressure'
import { MetricLineChart } from './metric-line-chart'
import {
  PortfolioHistory,
  type PortfolioSourceState,
} from './portfolio-history'
import type { HistoricalMetric } from './types'
import { YieldPricePilot } from './yield-price-pilot'

const emptyMetrics: HistoricalMetric[] = historicalMetrics.map((metric) => ({
  ...metric,
  headline: metric.id === 'supply' ? '— hyUSD' : '—',
  sourceLabel: 'Lab-simulated empty state',
  isSynthetic: true,
  points: [],
  csv: undefined,
  csvUnavailableReason: 'Unavailable when no chart data is present',
}))

export function NextChartFamiliesReview() {
  const [state, setState] = useState<'default' | 'empty'>('default')
  const [portfolioSourceState, setPortfolioSourceState] =
    useState<PortfolioSourceState>('total')
  const metrics = state === 'empty' ? emptyMetrics : historicalMetrics

  return (
    <section
      data-testid="next-chart-families-review"
      className="scroll-mt-40 space-y-12 text-foreground"
    >
      <header className="max-w-3xl space-y-3">
        <p className={cn(type.supporting, roles.text.supporting)}>
          Isolated design-system preparation · not production adoption
        </p>
        <h2 className={type.pageTitle}>Next chart families</h2>
        <p className={cn(type.body, roles.text.supporting)}>
          Yield metric levels and Portfolio source states on neutral review
          surfaces.
        </p>
      </header>

      <SegmentedControl
        presentation="text-only"
        value={state}
        onValueChange={(value) => setState(value as 'default' | 'empty')}
        aria-label="Chart review state"
      >
        <SegmentedControlItem value="default">Default</SegmentedControlItem>
        <SegmentedControlItem value="empty">Empty</SegmentedControlItem>
      </SegmentedControl>

      <section data-testid="next-yield-history" className="space-y-6">
        <div className="max-w-3xl">
          <h2 className={type.sectionTitle}>Yield historical metrics</h2>
          <p className={cn('mt-1', type.supporting, roles.text.supporting)}>
            Four chart-only candidates; no product heading, icon or host card is
            included.
          </p>
        </div>
        <div className="grid max-w-[1120px] gap-x-8 gap-y-10 md:grid-cols-2">
          {metrics.map((metric) => {
            const isPrice = metric.id === 'price'
            return (
              <article
                key={metric.id}
                data-testid={
                  isPrice ? 'yield-price-context' : `next-${metric.id}-context`
                }
                className="min-w-0 space-y-3"
              >
                <div
                  data-testid={
                    isPrice
                      ? 'yield-price-review-surface'
                      : `next-metric-${metric.id}-review-surface`
                  }
                  className={cn('py-6', roles.surface.content)}
                >
                  {isPrice ? (
                    <YieldPricePilot metric={metric} />
                  ) : (
                    <MetricLineChart metric={metric} />
                  )}
                </div>
                <div
                  className={cn(
                    'space-y-1',
                    type.supporting,
                    roles.text.supporting
                  )}
                >
                  <p>{metric.sourceLabel}.</p>
                  <p>hyUSD context · {metric.unit}.</p>
                  <p
                    data-testid={
                      isPrice ? 'yield-price-capture-note' : undefined
                    }
                  >
                    {metric.id === 'apy'
                      ? 'CSV unavailable for simulated APY input.'
                      : '24H unavailable in this daily capture.'}
                  </p>
                  {isPrice ? (
                    <p>
                      Touch value inspection is unsupported in this preparation,
                      leaving native page scrolling uninterrupted.
                    </p>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section
        data-testid="next-portfolio-host"
        className="max-w-[824px] space-y-5"
      >
        <div className="max-w-3xl">
          <h2 className={type.sectionTitle}>Portfolio history</h2>
          <p className={cn('mt-1', type.supporting, roles.text.supporting)}>
            Simulated balances with no account identity · presentation-only.
          </p>
        </div>
        <SegmentedControl
          presentation="text-only"
          value={portfolioSourceState}
          onValueChange={(value) =>
            setPortfolioSourceState(value as PortfolioSourceState)
          }
          aria-label="Portfolio source state"
        >
          <SegmentedControlItem value="total">Total area</SegmentedControlItem>
          <SegmentedControlItem value="composition">
            Composition
          </SegmentedControlItem>
        </SegmentedControl>
        <div
          data-testid="next-portfolio-review-surface"
          className={cn('py-6', roles.surface.content)}
        >
          <PortfolioHistory
            empty={state === 'empty'}
            sourceState={portfolioSourceState}
            timestampPrecision="day"
          />
        </div>
        <p className={cn(type.supporting, roles.text.supporting)}>
          {state === 'empty'
            ? 'Lab-simulated empty state.'
            : `${PORTFOLIO_PRESSURE_PROVENANCE} Category colors are a provisional source-aligned token mapping.`}
        </p>
      </section>

      <details className={cn('max-w-3xl', roles.text.supporting)}>
        <summary className={cn(type.supporting, 'cursor-pointer')}>
          Product-behavior and interaction boundaries
        </summary>
        <p className={cn('mt-3', type.supporting)}>
          Existing Portfolio percentage and absolute period-change fields remain
          preserved outside this scoped candidate. The source total-area rest
          and composition inspection states stay separately reviewable here.
          Keyboard and precise pointer inspection are included; touch inspection
          remains unsupported so native page scrolling is uninterrupted.
        </p>
      </details>
    </section>
  )
}
