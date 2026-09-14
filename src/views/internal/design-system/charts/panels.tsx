import { useState } from 'react'
import { Trans, useLingui } from '@lingui/react/macro'
import { Skeleton } from '@/components/design-system-v1/loading'
import { v1SemanticRoles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { ChartPlot } from './plot'
import type { ChartSample, ChartRange } from './fixtures'

export function CompactChart({ sample }: { sample: ChartSample }) {
  return (
    <section
      data-testid="chart-pressure-compact"
      className="min-w-0 bg-card p-6"
    >
      <div className="w-28 shrink-0">
        <ChartPlot sample={sample} className="h-12" />
      </div>
    </section>
  )
}

export function CardChart({
  sample,
  testId = 'chart-pressure-card',
}: {
  sample: ChartSample
  testId?: string
}) {
  return (
    <section data-testid={testId} className="min-w-0 space-y-6 bg-card p-6">
      <ChartPlot sample={sample} className="h-52" />
      <Annotation sample={sample} />
    </section>
  )
}

export function FullChart({
  sample,
  onRange,
}: {
  sample: ChartSample
  onRange: (range: ChartRange) => void
}) {
  const { t } = useLingui()
  const [selected, setSelected] = useState<number | undefined>()
  const currentIndex = selected ?? sample.points.length - 1
  const current = sample.points[currentIndex]
  return (
    <section data-testid="chart-full" className="min-w-0 space-y-6 bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h3 className="text-sm text-muted-foreground">
            <Trans>Price</Trans> · {sample.name}
          </h3>
          <div
            data-testid="chart-current-value"
            className="min-h-8 whitespace-nowrap text-xl font-medium leading-8 tabular-nums [@container(min-width:30rem)]:text-2xl"
          >
            {sample.scenario === 'loading' ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              (current?.valueLabel ?? '—')
            )}
          </div>
          {sample.scenario === 'estimated' && (
            <p className="min-h-5 text-sm text-muted-foreground">
              {current?.estimated && (
                <span data-testid="chart-current-quality">
                  <Trans>Est. Historical Price ✱</Trans>
                </span>
              )}
            </p>
          )}
        </div>
        <SegmentedControl
          presentation="text-only"
          value={sample.range}
          onValueChange={(value) => {
            setSelected(undefined)
            onRange(value as ChartRange)
          }}
          aria-label={t`Price`}
        >
          <SegmentedControlItem value="7D" data-testid="chart-range-7d">
            7D
          </SegmentedControlItem>
          <SegmentedControlItem value="1M" data-testid="chart-range-1m">
            1M
          </SegmentedControlItem>
        </SegmentedControl>
      </div>
      <p
        data-testid="chart-current-time"
        className="min-w-0 text-sm leading-5 text-muted-foreground tabular-nums"
      >
        {sample.scenario === 'loading' ? (
          <Skeleton className="h-5 w-48" />
        ) : (
          (current?.timeLabel ?? '—')
        )}
      </p>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3">
        <div
          data-testid="chart-inspection"
          role={current ? 'slider' : undefined}
          tabIndex={current ? 0 : undefined}
          aria-label={
            current
              ? `${t`Price`} · ${sample.name} · ${sample.range}`
              : undefined
          }
          aria-valuemin={current ? 0 : undefined}
          aria-valuemax={current ? sample.points.length - 1 : undefined}
          aria-valuenow={current ? currentIndex : undefined}
          aria-valuetext={
            current
              ? `${current.timeLabel} · ${current.valueLabel}${current.estimated ? ` · ${t`Est. Historical Price ✱`}` : ''}`
              : undefined
          }
          className={cn(
            'min-w-0 outline-none',
            v1SemanticRoles.focus.visibleOnContent
          )}
          onKeyDown={(event) => {
            if (!current) return
            const destinations: Record<string, number> = {
              ArrowLeft: currentIndex - 1,
              ArrowDown: currentIndex - 1,
              ArrowRight: currentIndex + 1,
              ArrowUp: currentIndex + 1,
              Home: 0,
              End: sample.points.length - 1,
            }
            const next = destinations[event.key]
            if (next === undefined) return
            event.preventDefault()
            setSelected(Math.max(0, Math.min(sample.points.length - 1, next)))
          }}
          onBlur={() => setSelected(undefined)}
          onPointerLeave={(event) => {
            if (
              event.pointerType === 'mouse' &&
              !event.currentTarget.matches(':focus-visible')
            )
              setSelected(undefined)
          }}
        >
          <ChartPlot
            sample={sample}
            selected={selected}
            onInspect={setSelected}
            className="h-[280px]"
          />
        </div>
        <div
          aria-hidden="true"
          className="flex w-12 flex-col justify-between py-2 text-right text-xs text-muted-foreground tabular-nums"
        >
          {sample.axisValues.map((label) => (
            <span key={label}>{sample.points.length ? label : '—'}</span>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="flex justify-between gap-2 text-xs text-muted-foreground"
        >
          {sample.points.length > 1 ? (
            <>
              <span>{sample.points[0].axisLabel}</span>
              <span>{sample.points.at(-1)!.axisLabel}</span>
            </>
          ) : (
            <span>{sample.points[0]?.axisLabel ?? '—'}</span>
          )}
        </div>
      </div>
      <Annotation sample={sample} />
    </section>
  )
}

function Annotation({ sample }: { sample: ChartSample }) {
  if (sample.scenario !== 'estimated' && sample.scenario !== 'delayed')
    return null
  return (
    <p
      data-testid="chart-annotation"
      className="text-sm leading-5 text-muted-foreground"
    >
      {sample.scenario === 'estimated' ? (
        <Trans>Est. Historical Price ✱</Trans>
      ) : (
        sample.points.at(-1)?.timeLabel
      )}
    </p>
  )
}
