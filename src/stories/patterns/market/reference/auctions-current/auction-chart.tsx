import { useEffect, useId, useRef, useState } from 'react'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import type { WorkspaceState } from './model'

export function AuctionChart({
  state,
  selected,
  knownLive,
}: {
  state: WorkspaceState
  selected: number | null
  knownLive: boolean
}) {
  const clipId = useId()
  const canvas = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(480)
  useEffect(() => {
    const element = canvas.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width)
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const x = (t: number) => width * t
  const y = (t: number) =>
    12 + (165 * (1 - Math.exp(-3 * t))) / (1 - Math.exp(-3))
  const path = Array.from(
    { length: 61 },
    (_, i) => `${i ? 'L' : 'M'}${x(i / 60)} ${y(i / 60)}`
  ).join(' ')
  const elapsed = Math.max(
    0,
    Math.min(
      1,
      (state.now - state.auctionStart) / (state.auctionEnd - state.auctionStart)
    )
  )
  const clock = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  return (
    <figure data-testid="current-activity" className="min-w-0 space-y-2">
      <figcaption className={type.label}>
        Dutch Auction · Price vs Time
      </figcaption>
      <svg
        ref={canvas}
        viewBox={`0 0 ${width} 192`}
        role="img"
        aria-label="Schematic auction curve, not execution prices"
        className="h-48 w-full overflow-visible"
      >
        <defs>
          <clipPath id={clipId}>
            <rect width={x(elapsed)} height="192" />
          </clipPath>
        </defs>
        <path
          data-testid="current-chart-axis"
          d={`M0 8V184H${width}`}
          fill="none"
          className="stroke-border"
        />
        <path
          d={path}
          fill="none"
          className="stroke-muted-foreground/40"
          strokeWidth="2"
        />
        <path
          d={path}
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          clipPath={`url(#${clipId})`}
        />
        {knownLive && (
          <>
            <path
              d={`M${x(elapsed)} 8V184`}
              className="stroke-primary/40"
              strokeDasharray="3 4"
            />
            <circle
              data-testid="current-chart-now"
              cx={x(elapsed)}
              cy={y(elapsed)}
              r="5"
              className="fill-primary stroke-card"
              strokeWidth="2"
            />
            <text
              x={x(elapsed)}
              y={y(elapsed) < 40 ? y(elapsed) + 24 : y(elapsed) - 12}
              textAnchor={
                elapsed < 0.1 ? 'start' : elapsed > 0.9 ? 'end' : 'middle'
              }
              className={cn(type.supporting, 'fill-primary')}
            >
              Now
            </text>
          </>
        )}
        {state.hasBids &&
          [1 / 6, 3 / 8].map((t, i) => (
            <g key={i}>
              <circle
                cx={x(t)}
                cy={y(t)}
                r={selected === i + 1 ? 6 : 4}
                className="fill-primary stroke-card"
                strokeWidth="2"
              />
              {selected === i + 1 && (
                <text
                  data-testid="current-chart-selected-bid"
                  x={x(t)}
                  y={y(t) - 16}
                  textAnchor="middle"
                  className={cn(type.supporting, 'fill-primary')}
                >
                  Bid #{i + 1}
                </text>
              )}
            </g>
          ))}
      </svg>
      <div
        className={cn(
          type.supporting,
          'flex justify-between gap-4 text-muted-foreground'
        )}
      >
        <time
          data-testid="current-chart-start"
          dateTime={new Date(state.auctionStart * 1000).toISOString()}
        >
          {clock(state.auctionStart)}
        </time>
        <time
          data-testid="current-chart-end"
          dateTime={new Date(state.auctionEnd * 1000).toISOString()}
        >
          {clock(state.auctionEnd)}
        </time>
      </div>
      <p className={cn(type.supporting, 'text-muted-foreground')}>
        schematic curve, not execution prices. Bid values are illustrative.
      </p>
    </figure>
  )
}
