import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'
import { Skeleton } from './loading'
import { v1SemanticRoles as roles } from './semantic-roles'
import { v1Typography as type, v1TypographyVariants } from './typography'

export type ChartPanelState = 'ready' | 'loading' | 'empty' | 'unavailable'

export type ChartSeriesSlot = 1 | 2 | 3 | 4 | 5 | 6

export const chartSeriesFill: Record<ChartSeriesSlot, string> = {
  1: 'hsl(var(--series-1))',
  2: 'hsl(var(--series-2))',
  3: 'hsl(var(--series-3))',
  4: 'hsl(var(--series-4))',
  5: 'hsl(var(--series-5))',
  6: 'hsl(var(--series-6))',
}

const seriesSwatch: Record<ChartSeriesSlot, string> = {
  1: 'bg-series-1',
  2: 'bg-series-2',
  3: 'bg-series-3',
  4: 'bg-series-4',
  5: 'bg-series-5',
  6: 'bg-series-6',
}

const inspectionKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']

export function useChartInspection(count: number, resetKey?: unknown) {
  const [selectedIndex, setSelectedIndex] = useState<number>()
  const isTouchInput = useRef(false)
  useEffect(() => setSelectedIndex(undefined), [count, resetKey])

  const clamp = useCallback(
    (index: number) => Math.min(count - 1, Math.max(0, index)),
    [count]
  )
  const inspect = useCallback(
    (index?: number) =>
      setSelectedIndex(index === undefined ? undefined : clamp(index)),
    [clamp]
  )
  const trackPointer = (event: PointerEvent) => {
    isTouchInput.current = event.pointerType === 'touch'
  }

  return {
    selectedIndex,
    inspect,
    isTouchInput,
    plotProps: {
      onKeyDown: (event: KeyboardEvent) => {
        if (!count || !inspectionKeys.includes(event.key)) return
        event.preventDefault()
        setSelectedIndex((current) => {
          if (event.key === 'Home') return 0
          if (event.key === 'End' || current === undefined) return count - 1
          return clamp(current + (event.key === 'ArrowLeft' ? -1 : 1))
        })
      },
      onBlur: () => setSelectedIndex(undefined),
      onPointerDownCapture: trackPointer,
      onPointerMoveCapture: trackPointer,
      onPointerLeave: (event: PointerEvent) => {
        if (event.pointerType === 'mouse') setSelectedIndex(undefined)
      },
    },
  }
}

export type ChartInspection = ReturnType<typeof useChartInspection>

export type ChartPanelHeadline = 'page' | 'panel'

const headlineType: Record<ChartPanelHeadline, string> = {
  page: v1TypographyVariants.responsivePageTitle,
  panel: v1TypographyVariants.lightPanelTitle,
}

export interface ChartPanelProps {
  label: ReactNode
  value: ReactNode
  caption: ReactNode
  controls?: ReactNode
  headline?: ChartPanelHeadline
  state?: ChartPanelState
  emptyMessage?: ReactNode
  unavailableMessage?: ReactNode
  plotLabel: string
  inspection: ChartInspection
  summary: string
  legend?: ReactNode
  className?: string
  children: ReactNode
}

export function ChartPanel({
  label,
  value,
  caption,
  controls,
  headline = 'page',
  state = 'ready',
  emptyMessage = 'No data available',
  unavailableMessage = 'Data unavailable',
  plotLabel,
  inspection,
  summary,
  legend,
  className,
  children,
}: ChartPanelProps) {
  const isLoading = state === 'loading'
  const message = state === 'empty' ? emptyMessage : unavailableMessage

  return (
    <section
      data-testid="chart-panel"
      data-state={state}
      aria-busy={isLoading || undefined}
      className={cn(
        'min-w-0 py-5 [container-type:inline-size] lg:py-6',
        roles.text.primary,
        className
      )}
    >
      <header className="grid gap-4 px-5 lg:px-6 [@container(min-width:40rem)]:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <p className={cn(type.body, roles.text.supporting)}>{label}</p>
          {isLoading ? (
            <>
              <Skeleton
                className={cn(
                  'mt-2 w-40 max-w-full',
                  headline === 'page' ? 'h-[38px]' : 'h-[26px]'
                )}
              />
              <Skeleton className="mt-2 h-5 w-24" />
            </>
          ) : (
            <>
              <p
                data-testid="chart-panel-value"
                className={cn(
                  'mt-2 break-words tabular-nums',
                  headlineType[headline],
                  roles.text.pageHeadline
                )}
              >
                {value}
              </p>
              <p
                className={cn(
                  'mt-2 min-h-5 tabular-nums',
                  type.supporting,
                  roles.text.supporting
                )}
              >
                {caption}
              </p>
            </>
          )}
        </div>
        {controls ? (
          <div className="min-w-0 [@container(min-width:40rem)]:justify-self-end">
            {controls}
          </div>
        ) : null}
      </header>

      {state === 'ready' ? (
        <div
          role="group"
          tabIndex={0}
          aria-label={`${plotLabel}. Use left and right arrow keys to inspect values.`}
          {...inspection.plotProps}
          className={cn(
            'mt-4 h-72 w-full touch-auto focus-visible:outline-none sm:h-80',
            roles.focus.visibleInset
          )}
        >
          {children}
        </div>
      ) : (
        <div
          className={cn(
            'mt-4 flex h-72 items-center justify-center px-5 text-center sm:h-80 lg:px-6',
            type.supporting,
            roles.text.supporting
          )}
        >
          {isLoading ? <PlotSkeleton /> : message}
        </div>
      )}

      {state === 'ready' ? legend : null}
      <output aria-live="polite" aria-atomic="true" className="sr-only">
        {state === 'ready' ? summary : ''}
      </output>
    </section>
  )
}

const SKELETON_BARS = [42, 56, 50, 64, 58, 70, 62, 74, 68, 78, 72, 82]

function PlotSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full items-end justify-between gap-2 border-b border-border"
    >
      {[25, 50, 75].map((top) => (
        <span
          key={top}
          className="absolute inset-x-0 border-t border-border"
          style={{ top: `${top}%` }}
        />
      ))}
      {SKELETON_BARS.map((height, index) => (
        <Skeleton
          key={index}
          className="relative w-full max-w-6"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}

export interface ChartLegendItem {
  key: string
  label: ReactNode
  slot: ChartSeriesSlot
  value: ReactNode
}

export function ChartLegend({ items }: { items: ChartLegendItem[] }) {
  const legendId = useId()
  return (
    <dl className="flex flex-col items-stretch gap-3 px-5 pt-4 lg:px-6 [@container(min-width:32rem)]:flex-row [@container(min-width:32rem)]:flex-wrap [@container(min-width:32rem)]:gap-x-6">
      {items.map((item) => {
        const labelId = `${legendId}-${item.key}`
        return (
          <div
            key={item.key}
            data-category={item.key}
            className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2 [@container(min-width:32rem)]:w-auto [@container(min-width:32rem)]:grid-cols-[auto_auto]"
          >
            <dt id={labelId} className="flex min-w-0 items-baseline gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  'size-2.5 shrink-0 self-center',
                  seriesSwatch[item.slot]
                )}
              />
              <span
                className={cn(
                  'min-w-0 [@container(min-width:32rem)]:whitespace-nowrap',
                  type.supporting,
                  roles.text.supporting
                )}
              >
                {item.label}
              </span>
            </dt>
            <dd
              aria-labelledby={labelId}
              className={cn(
                'm-0 justify-self-end whitespace-nowrap tabular-nums [@container(min-width:32rem)]:justify-self-auto',
                type.label
              )}
            >
              {item.value}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
