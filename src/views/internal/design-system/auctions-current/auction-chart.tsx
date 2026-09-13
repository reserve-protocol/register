import { useEffect, useId, useRef, useState } from 'react'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import type { WorkspaceState } from './model'

export function AuctionChart({
  state,
  selected,
}: {
  state: WorkspaceState
  selected: number | null
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
  const x = (t: number) => 20 + (width - 32) * t
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
      <figcaption className={cn(type.supporting, 'text-muted-foreground')}>
        Dutch Auction · Price vs Time
      </figcaption>
      <svg
        ref={canvas}
        viewBox={`0 0 ${width} 208`}
        role="img"
        aria-label="Schematic auction curve, not execution prices"
        className="h-52 w-full"
      >
        <defs>
          <clipPath id={clipId}>
            <rect width={x(elapsed)} height="208" />
          </clipPath>
        </defs>
        <path
          d={`M20 8V184H${width - 12}`}
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
        <path
          d={`M${x(elapsed)} 8V184`}
          className="stroke-muted-foreground/40"
          strokeDasharray="3 4"
        />
        {state.hasBids &&
          [1 / 6, 3 / 8].map((t, i) => (
            <circle
              key={i}
              cx={x(t)}
              cy={y(t)}
              r={selected === i + 1 ? 6 : 4}
              className="fill-primary stroke-card"
              strokeWidth="2"
            />
          ))}
      </svg>
      <div
        className={cn(
          type.supporting,
          'flex justify-between gap-4 text-muted-foreground'
        )}
      >
        <time dateTime={new Date(state.auctionStart * 1000).toISOString()}>
          {clock(state.auctionStart)}
        </time>
        <time dateTime={new Date(state.auctionEnd * 1000).toISOString()}>
          {clock(state.auctionEnd)}
        </time>
      </div>
      <p className={cn(type.supporting, 'text-muted-foreground')}>
        Lab: schematic curve, not execution prices. Bid values are illustrative.
      </p>
    </figure>
  )
}
