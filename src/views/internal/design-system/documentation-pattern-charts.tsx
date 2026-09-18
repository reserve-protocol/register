import { Trans, useLingui } from '@lingui/react/macro'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/button'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'

import { historicalMetrics } from './charts/next-families/fixture-data'
import { MetricLineChart } from './charts/next-families/metric-line-chart'
import {
  PortfolioHistory,
  type PortfolioSourceState,
} from './charts/next-families/portfolio-history'
import {
  DocumentationDiscoverChartCapture,
  DocumentationHomeChartCapture,
  DocumentationOverviewChartCapture,
} from './documentation-chart-captures'
import DocumentationSpecimenCanvas from './documentation-specimen-canvas'
import { useDocumentationSpecimenState } from './use-documentation-specimen-state'

export const CHART_DOCUMENTATION_VIEWPORT_VALUES = [
  'wide',
  'narrow',
  'phone',
] as const

type ChartDocumentationViewport =
  (typeof CHART_DOCUMENTATION_VIEWPORT_VALUES)[number]

const VIEWPORT_DIMENSION = {
  defaultValue: 'wide',
  values: CHART_DOCUMENTATION_VIEWPORT_VALUES,
} as const

const OVERVIEW_SCHEMA = {
  family: {
    defaultValue: 'line',
    values: ['line', 'candles'],
  },
} as const

const YIELD_SCHEMA = {
  viewport: VIEWPORT_DIMENSION,
} as const

const PORTFOLIO_SCHEMA = {
  family: {
    defaultValue: 'total',
    values: ['total', 'composition'],
  },
  viewport: VIEWPORT_DIMENSION,
} as const

export const CHART_DOCUMENTATION_METRICS = historicalMetrics

const viewportWidth = (
  family: 'yield' | 'portfolio',
  viewport: ChartDocumentationViewport
) => {
  if (viewport === 'phone') return 'w-[390px] max-w-none'
  if (viewport === 'narrow') {
    return family === 'yield' ? 'w-[640px] max-w-full' : 'w-[600px] max-w-full'
  }
  return family === 'yield' ? 'w-full max-w-[1120px]' : 'w-full max-w-[824px]'
}

const ChartFamilySection = ({
  id,
  title,
  description,
  primary = false,
  children,
}: {
  id: string
  title: ReactNode
  description: ReactNode
  primary?: boolean
  children: ReactNode
}) => (
  <section
    id={id}
    aria-labelledby={`${id}-title`}
    data-testid="documentation-chart-family"
    data-primary-representative={primary ? 'overview-line' : undefined}
    className="scroll-mt-20 space-y-4 border-b border-border pb-10 md:scroll-mt-6"
  >
    <header className="max-w-3xl space-y-1">
      <h3 id={`${id}-title`} className="text-xl font-light">
        {title}
      </h3>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </header>
    {children}
  </section>
)

const ViewportControl = ({
  value,
  onChange,
}: {
  value: ChartDocumentationViewport
  onChange: (value: ChartDocumentationViewport) => void
}) => {
  const { t } = useLingui()

  return (
    <SegmentedControl
      presentation="text-only"
      textOnlyDensity="compact"
      value={value}
      onValueChange={(nextValue) =>
        onChange(nextValue as ChartDocumentationViewport)
      }
      aria-label={t`Preview viewport`}
      data-testid="chart-documentation-viewport-control"
    >
      <SegmentedControlItem value="wide">
        <Trans>Wide</Trans>
      </SegmentedControlItem>
      <SegmentedControlItem value="narrow">
        <Trans>Narrow</Trans>
      </SegmentedControlItem>
      <SegmentedControlItem value="phone">
        <Trans>Phone 390</Trans>
      </SegmentedControlItem>
    </SegmentedControl>
  )
}

const ResetPreview = ({ onReset }: { onReset: () => void }) => (
  <Button size="compact" tone="quiet" onClick={onReset}>
    <Trans>Reset preview</Trans>
  </Button>
)

const OverviewDocumentation = () => {
  const { t } = useLingui()
  const specimen = useDocumentationSpecimenState(
    'chart-overview',
    OVERVIEW_SCHEMA
  )

  return (
    <div data-testid="chart-overview-documentation">
      <DocumentationSpecimenCanvas
        host={{
          name: t`Index DTF Overview`,
          backdropOwner: t`Documentation contrast canvas`,
          insetOwner: t`Overview chart family`,
        }}
        mode="intrinsic"
        backdrop="neutral"
        padding="contained"
        align="center"
        controls={{
          family: (
            <SegmentedControl
              presentation="text-only"
              textOnlyDensity="compact"
              value={specimen.state.family}
              onValueChange={(value) =>
                specimen.setValue(
                  'family',
                  value as (typeof OVERVIEW_SCHEMA.family.values)[number]
                )
              }
              aria-label={t`Overview chart form`}
            >
              <SegmentedControlItem value="line">
                <Trans>Line</Trans>
              </SegmentedControlItem>
              <SegmentedControlItem value="candles">
                <Trans>Candles</Trans>
              </SegmentedControlItem>
            </SegmentedControl>
          ),
        }}
        reset={
          specimen.isDefault ? undefined : (
            <ResetPreview onReset={specimen.reset} />
          )
        }
        fallbacks={specimen.fallbacks}
        provenance={
          <Trans>
            Source-faithful PHOTON Overview rendering from the accepted owner;
            production data, defaults, and callers are unchanged. Footer ranges
            and Line/Candles labels are frozen context, not live controls.
            Constrained documentation widths scroll the natural-size rendering
            horizontally.
          </Trans>
        }
      >
        <div
          className="w-full max-w-full overflow-x-auto overscroll-x-contain pb-1"
          data-testid="chart-overview-scroll"
        >
          <div
            data-testid="chart-overview-stage"
            className="mx-auto w-[824px] max-w-none"
          >
            <DocumentationOverviewChartCapture family={specimen.state.family} />
          </div>
        </div>
      </DocumentationSpecimenCanvas>
    </div>
  )
}

const HomeDocumentation = () => {
  const { t } = useLingui()

  return (
    <DocumentationSpecimenCanvas
      host={{
        name: t`Home highlighted DTF`,
        backdropOwner: t`Documentation contrast canvas`,
        insetOwner: t`Home card media`,
      }}
      mode="intrinsic"
      backdrop="neutral"
      padding="contained"
      align="center"
      provenance={
        <Trans>
          Source-faithful rendering of the accepted PHOTON highlighted-card
          owner. It uses frozen fixture data without mounting the
          provider-coupled production surface; surrounding ticker and actions
          are intentionally outside this excerpt.
        </Trans>
      }
    >
      <DocumentationHomeChartCapture />
    </DocumentationSpecimenCanvas>
  )
}

const DiscoverDocumentation = () => {
  const { t } = useLingui()

  return (
    <DocumentationSpecimenCanvas
      host={{
        name: t`Discover performance cell`,
        backdropOwner: t`Documentation contrast canvas`,
        insetOwner: t`Table cell`,
      }}
      mode="intrinsic"
      backdrop="neutral"
      padding="contained"
      align="center"
      provenance={
        <Trans>
          Source-faithful LCAP 30-day rendering from the accepted 90 × 40px plot
          owner; the surrounding cell is context, not chart anatomy.
        </Trans>
      }
    >
      <DocumentationDiscoverChartCapture />
    </DocumentationSpecimenCanvas>
  )
}

const YieldDocumentation = () => {
  const { t } = useLingui()
  const specimen = useDocumentationSpecimenState('chart-yield', YIELD_SCHEMA)

  return (
    <div data-testid="chart-yield-documentation">
      <DocumentationSpecimenCanvas
        host={{
          name: t`Yield historical metrics`,
          backdropOwner: t`Documentation contrast canvas`,
          insetOwner: t`Individual metric surface`,
        }}
        mode="host-constrained"
        backdrop="neutral"
        padding="contained"
        align="center"
        controls={{
          viewport: (
            <ViewportControl
              value={specimen.state.viewport}
              onChange={(value) => specimen.setValue('viewport', value)}
            />
          ),
        }}
        reset={
          specimen.isDefault ? undefined : (
            <ResetPreview onReset={specimen.reset} />
          )
        }
        fallbacks={specimen.fallbacks}
        provenance={
          <Trans>
            Accepted Yield family with its captured or explicitly simulated
            source labels; ranges, CSV data, financial formatters, and chart
            calculations remain source-owned.
          </Trans>
        }
      >
        <div
          data-testid="chart-yield-stage"
          data-documentation-viewport={specimen.state.viewport}
          className={viewportWidth('yield', specimen.state.viewport)}
        >
          <div
            className={cn(
              'grid gap-x-8 gap-y-10',
              specimen.state.viewport === 'wide' && 'md:grid-cols-2'
            )}
          >
            {CHART_DOCUMENTATION_METRICS.map((metric) => (
              <article key={metric.id} className="min-w-0 space-y-2">
                <div
                  data-testid={`next-metric-${metric.id}-review-surface`}
                  className={cn('py-6', roles.surface.content)}
                >
                  <MetricLineChart metric={metric} />
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  <Trans>Source: {metric.sourceLabel}.</Trans>
                </p>
              </article>
            ))}
          </div>
        </div>
      </DocumentationSpecimenCanvas>
    </div>
  )
}

const PortfolioDocumentation = () => {
  const { t } = useLingui()
  const specimen = useDocumentationSpecimenState(
    'chart-portfolio',
    PORTFOLIO_SCHEMA
  )

  return (
    <div data-testid="chart-portfolio-documentation">
      <DocumentationSpecimenCanvas
        host={{
          name: t`Portfolio history`,
          backdropOwner: t`Documentation contrast canvas`,
          insetOwner: t`Portfolio chart family`,
        }}
        mode="host-constrained"
        backdrop="neutral"
        padding="contained"
        align="center"
        controls={{
          family: (
            <SegmentedControl
              presentation="text-only"
              textOnlyDensity="compact"
              value={specimen.state.family}
              onValueChange={(value) =>
                specimen.setValue(
                  'family',
                  value as (typeof PORTFOLIO_SCHEMA.family.values)[number]
                )
              }
              aria-label={t`Portfolio presentation`}
            >
              <SegmentedControlItem value="total">
                <Trans>Total area</Trans>
              </SegmentedControlItem>
              <SegmentedControlItem value="composition">
                <Trans>Composition</Trans>
              </SegmentedControlItem>
            </SegmentedControl>
          ),
          viewport: (
            <ViewportControl
              value={specimen.state.viewport}
              onChange={(value) => specimen.setValue('viewport', value)}
            />
          ),
        }}
        reset={
          specimen.isDefault ? undefined : (
            <ResetPreview onReset={specimen.reset} />
          )
        }
        fallbacks={specimen.fallbacks}
        provenance={
          <Trans>
            Accepted simulated Portfolio presentation with explicit known-zero
            pre-holdings history; unknown production history is never converted
            to zero.
          </Trans>
        }
      >
        <div
          data-testid="chart-portfolio-stage"
          data-documentation-viewport={specimen.state.viewport}
          className={cn(
            viewportWidth('portfolio', specimen.state.viewport),
            'py-6',
            roles.surface.content
          )}
        >
          <PortfolioHistory
            sourceState={specimen.state.family as PortfolioSourceState}
            timestampPrecision="day"
          />
        </div>
      </DocumentationSpecimenCanvas>
    </div>
  )
}

export const DocumentationPatternCharts = () => {
  return (
    <div
      data-testid="documentation-pattern-charts"
      className="min-w-0 space-y-10 py-5"
    >
      <ChartFamilySection
        id="chart-overview"
        title={<Trans>Overview</Trans>}
        description={
          <Trans>
            Shows Index DTF price history with precise inspection in the
            accepted Overview surface.
          </Trans>
        }
        primary
      >
        <OverviewDocumentation />
      </ChartFamilySection>

      <ChartFamilySection
        id="chart-home"
        title={<Trans>Home</Trans>}
        description={
          <Trans>
            Shows performance inside the highlighted DTF card context.
          </Trans>
        }
      >
        <HomeDocumentation />
      </ChartFamilySection>

      <ChartFamilySection
        id="chart-discover"
        title={<Trans>Discover</Trans>}
        description={
          <Trans>
            Provides a compact trend cue inside a table performance cell.
          </Trans>
        }
      >
        <DiscoverDocumentation />
      </ChartFamilySection>

      <ChartFamilySection
        id="chart-yield"
        title={<Trans>Yield historical metrics</Trans>}
        description={
          <Trans>
            Shows historical price, APY, supply, and RSR-staked levels with
            source-owned ranges and exports.
          </Trans>
        }
      >
        <YieldDocumentation />
      </ChartFamilySection>

      <ChartFamilySection
        id="chart-portfolio"
        title={<Trans>Portfolio history</Trans>}
        description={
          <Trans>
            Shows total value and category composition across the accepted
            simulated history.
          </Trans>
        }
      >
        <PortfolioDocumentation />
      </ChartFamilySection>

      <p className="text-sm leading-6 text-muted-foreground">
        <Trans>
          Missing-data, interrupted-history, long-value, and other engineering
          pressure fixtures remain outside Canonical.
        </Trans>{' '}
        <Link
          to="/internal/design-system/workbench#pattern-charts"
          className="inline-flex min-h-11 items-center text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trans>Open chart Workbench</Trans>
        </Link>
      </p>
    </div>
  )
}

export default DocumentationPatternCharts
