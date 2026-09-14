import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react'
import { useAtomValue } from 'jotai'
import { Curve } from 'recharts'
import { themeModeAtom } from '@/components/dark-mode-toggle/atoms'
import { getPerformanceColorSet } from '@/utils/chart-performance-colors'
import { Skeleton } from '@/components/design-system-v1/loading'
import { Trans } from '@lingui/react/macro'
import { cn } from '@/lib/utils'
import type { ChartPoint, ChartSample } from './fixtures'

const TOP = 8

export function ChartPlot({
  sample,
  selected,
  onInspect,
  className,
}: {
  sample: ChartSample
  selected?: number
  onInspect?: (index: number) => void
  className: string
}) {
  const id = useId().replace(/:/g, '')
  const root = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 1000, height: 240 })
  useLayoutEffect(() => {
    if (!root.current) return
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    )
    observer.observe(root.current)
    return () => observer.disconnect()
  }, [])
  const width = Math.max(size.width, 1)
  const height = Math.max(size.height, 24)
  const bottom = height - 8
  const mode = useAtomValue(themeModeAtom)
  const colors = getPerformanceColorSet(
    mode === 'dark' ? 'darkSurface' : 'default'
  )
  const { points, domain, direction } = sample
  const first = points[0]?.timestamp ?? 0
  const last = points.at(-1)?.timestamp ?? first
  const coordinates = points.map((point) => ({
    x:
      last === first
        ? width / 2
        : ((point.timestamp - first) / (last - first)) * width,
    y:
      bottom -
      ((point.value - domain[0]) / (domain[1] - domain[0])) * (bottom - TOP),
  }))
  const groups = pointGroups(points)
  const chosen = selected === undefined ? undefined : coordinates[selected]
  const dot = colors[direction].dot
  const stroke =
    direction === 'neutral' ? colors.neutral.stroke : `url(#${id}-stroke)`
  const inspect = (event: PointerEvent<SVGSVGElement>) => {
    if (!onInspect || !points.length) return
    const box = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - box.left) / box.width) * width
    let nearest = 0
    for (let i = 1; i < coordinates.length; i++) {
      if (Math.abs(coordinates[i].x - x) < Math.abs(coordinates[nearest].x - x))
        nearest = i
    }
    onInspect(nearest)
  }
  return (
    <div
      ref={root}
      data-testid="chart-plot"
      data-point-count={points.length}
      className={cn('relative w-full', className)}
    >
      {sample.scenario === 'loading' ? (
        <Skeleton className="h-full w-full" />
      ) : !points.length ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          {sample.scenario === 'unavailable' ? (
            <Trans>Unavailable</Trans>
          ) : (
            <Trans>No data</Trans>
          )}
        </div>
      ) : (
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
          onPointerDown={inspect}
          onPointerMove={(event) => {
            if (event.pointerType === 'mouse' || event.buttons) inspect(event)
          }}
        >
          <defs>
            {direction !== 'neutral' && (
              <linearGradient id={`${id}-stroke`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={colors[direction].end} />
                <stop offset="100%" stopColor={colors[direction].start} />
              </linearGradient>
            )}
            <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dot} stopOpacity="0.16" />
              <stop offset="100%" stopColor={dot} stopOpacity="0" />
            </linearGradient>
            <pattern
              id={`${id}-dots`}
              width="5"
              height="5"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.65" fill={dot} opacity="0.22" />
            </pattern>
          </defs>
          {groups.map((group, groupIndex) => {
            const segment = group.map((index) => coordinates[index])
            const estimated = points[group.at(-1)!].estimated
            return (
              <g
                key={groupIndex}
                data-testid="chart-segment"
                data-estimated={!!estimated}
              >
                {segment.length > 1 && (
                  <>
                    <Curve
                      type="monotone"
                      layout="horizontal"
                      points={segment}
                      baseLine={bottom}
                      stroke="none"
                      fill={estimated ? `url(#${id}-dots)` : `url(#${id}-fade)`}
                    />
                    <Curve
                      data-testid="chart-stroke"
                      type="monotone"
                      layout="horizontal"
                      points={segment}
                      fill="none"
                      stroke={estimated ? colors.preLaunch.stroke : stroke}
                      strokeDasharray={estimated ? '3 4' : undefined}
                      strokeWidth={2}
                      vectorEffect="non-scaling-stroke"
                    />
                  </>
                )}
                {segment.length === 1 && (
                  <circle
                    data-testid="chart-single-point"
                    cx={segment[0].x}
                    cy={segment[0].y}
                    r="3"
                    fill={dot}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </g>
            )
          })}
          {chosen && (
            <g data-testid="chart-inspection-marker">
              <line
                x1={chosen.x}
                x2={chosen.x}
                y1={TOP}
                y2={bottom}
                className="stroke-muted-foreground"
                strokeDasharray="3 4"
                strokeOpacity="0.5"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={chosen.x}
                cy={chosen.y}
                r="4"
                fill={dot}
                className="stroke-card"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )}
        </svg>
      )}
    </div>
  )
}

function pointGroups(points: ChartPoint[]) {
  const groups: number[][] = []
  points.forEach((point, index) => {
    if (!index || point.breakBefore) groups.push([index])
    else if (point.estimated !== points[index - 1].estimated)
      groups.push([index - 1, index])
    else groups.at(-1)!.push(index)
  })
  return groups
}
