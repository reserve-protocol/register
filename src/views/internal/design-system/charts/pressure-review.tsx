import { useState } from 'react'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import { Switch } from '@/components/design-system-v1/switch'
import { cn } from '@/lib/utils'
import {
  CAPTURED_DENSE,
  chartSample,
  type ChartRange,
  type ChartScenario,
} from './fixtures'
import { CardChart, CompactChart, FullChart } from './panels'

const SCENARIOS: { id: ChartScenario; label: MessageDescriptor }[] = [
  { id: 'captured', label: msg`Captured history` },
  { id: 'neutral', label: msg`Flat · simulated` },
  { id: 'zero', label: msg`Zero · simulated` },
  { id: 'estimated', label: msg`Estimated segment · simulated` },
  { id: 'loading', label: msg`Loading · simulated` },
  { id: 'empty', label: msg`Empty · simulated` },
  { id: 'unavailable', label: msg`Unavailable · simulated` },
  { id: 'delayed', label: msg`Delayed · simulated` },
  { id: 'gapped', label: msg`Gap · simulated` },
  { id: 'single', label: msg`One point · simulated` },
  { id: 'two', label: msg`Two points · simulated` },
  { id: 'long', label: msg`Long value · simulated` },
]

export default function ChartPressureReview() {
  const { t } = useLingui()
  const [range, setRange] = useState<ChartRange>('1M')
  const [scenario, setScenario] = useState<ChartScenario>('captured')
  const [constrained, setConstrained] = useState(false)
  const [densityOpen, setDensityOpen] = useState(false)
  const sample = chartSample(range, scenario)
  const month = chartSample('1M', 'captured')
  return (
    <section data-testid="chart-pressure-review" className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-medium">
          <Trans>Time-series charts</Trans>
        </h2>
        <p className="max-w-3xl text-sm leading-5 text-muted-foreground">
          <Trans>
            Compare the same supplied history in three sizes. No return
            calculation or data-policy changes.
          </Trans>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={scenario}
          onValueChange={(value) => setScenario(value as ChartScenario)}
        >
          <SelectTrigger
            aria-label={t`Chart review scenario`}
            data-testid="chart-scenario"
            className="w-64 max-w-full"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCENARIOS.map((item) => (
              <SelectItem
                key={item.id}
                value={item.id}
                data-testid={`chart-scenario-${item.id}`}
              >
                {t(item.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
          <Switch
            checked={constrained}
            onCheckedChange={setConstrained}
            data-testid="chart-constrained"
          />
          <Trans>Constrained review</Trans>
        </label>
      </div>
      <p
        data-testid="chart-provenance"
        className="max-w-3xl text-sm leading-5 text-muted-foreground"
      >
        {sample.simulated
          ? t`Lab-simulated state, not an actual LCAP event.`
          : t`LCAP · captured September 13, 2026. Review values, not live prices.`}
      </p>
      <div
        className={cn(
          'w-full min-w-0 space-y-6 [container-type:inline-size]',
          constrained ? 'max-w-[390px]' : 'max-w-6xl'
        )}
      >
        <div className="grid items-start gap-6 [@container(min-width:48rem)]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="min-w-0 space-y-3">
            <h3 className="text-sm text-muted-foreground">
              <Trans>Compact trend</Trans>
            </h3>
            <CompactChart sample={sample} />
            <p
              data-testid="chart-context-compact"
              className="text-sm leading-5 text-muted-foreground"
            >
              Plot-only stress fixture, not a Discover row or a proposed cell
              composition.
            </p>
          </div>
          <div className="min-w-0 space-y-3">
            <h3 className="text-sm text-muted-foreground">
              <Trans>Card</Trans>
            </h3>
            <CardChart sample={sample} />
            <p
              data-testid="chart-context-card"
              className="text-sm leading-5 text-muted-foreground"
            >
              Plot-only stress fixture, not a replacement for the highlighted
              card above. Its neutral frame does not define card insets.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm text-muted-foreground">
            <Trans>Full chart</Trans>
          </h3>
          <FullChart key={scenario} sample={sample} onRange={setRange} />
          <p
            data-testid="chart-context-full"
            className="max-w-3xl text-sm leading-5 text-muted-foreground"
          >
            Technical inspection fixture for supplied edge cases, not the
            proposed Overview composition. These simulated states do not certify
            the existing product renderer or its data adapters.
          </p>
        </div>
      </div>
      <details
        className={cn(
          'space-y-4 [container-type:inline-size]',
          constrained ? 'max-w-[390px]' : 'max-w-6xl'
        )}
        data-testid="chart-density-review"
        onToggle={(event) => setDensityOpen(event.currentTarget.open)}
      >
        <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Trans>Density comparison · same captured month</Trans>
        </summary>
        {densityOpen && (
          <>
            <p className="text-sm text-muted-foreground">
              <Trans>
                Every supplied point is retained. This is not a sampling
                recommendation.
              </Trans>
            </p>
            <p
              data-testid="chart-context-density"
              className="max-w-3xl text-sm leading-5 text-muted-foreground"
            >
              Lab-only comparison: these are not two separate product widgets.
              The same captured month is shown with daily and hourly data to
              judge visual density, not choose a sampling policy.
            </p>
            <div className="grid gap-6 [@container(min-width:48rem)]:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <Trans>Daily · 31 samples</Trans>
                </p>
                <CardChart sample={month} testId="chart-density-daily" />
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <Trans>Hourly · 721 samples</Trans>
                </p>
                <CardChart
                  sample={{ ...month, points: CAPTURED_DENSE }}
                  testId="chart-density-hourly"
                />
              </div>
            </div>
          </>
        )}
      </details>
      <details className="max-w-3xl text-sm leading-5 text-muted-foreground">
        <summary className="min-h-11 cursor-pointer py-3 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Trans>Review boundary and what comes next</Trans>
        </summary>
        <p>
          <Trans>
            Review the line, fill, labels, inspection and narrow layout.
            Candles, monthly bars and composition remain separate patterns. No
            production chart type is being removed.
          </Trans>
        </p>
        <p className="mt-3">
          <Trans>
            Source, return basis and freshness rules remain engineer-owned. No
            shared palette or financial calculation has changed.
          </Trans>
        </p>
      </details>
    </section>
  )
}
