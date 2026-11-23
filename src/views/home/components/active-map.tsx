import { cn } from '@/lib/utils'
import { useLingui } from '@lingui/react/macro'
import { useEffect, useRef, useState } from 'react'
import {
  COUNTRY_COLORS,
  COUNTRY_COUNT,
  COUNTRY_SERVICE,
} from '../data/countries'
import geography from '../data/geography.json'
import { useReducedMotion } from '../hooks/use-reduced-motion'

const VIEWBOX = '0 20 1000 430'
const DOT_RADIUS = 3.1
const INACTIVE_FILL = 'var(--home-dot-off)'

const CENTROIDS: Record<string, number[] | undefined> = geography.mapCentroids

const ROUTES = [
  ['United States of America', 'Mexico'],
  ['United States of America', 'Philippines'],
  ['United States of America', 'Nigeria'],
  ['Saudi Arabia', 'Pakistan'],
  ['Kenya', 'India'],
  ['Colombia', 'Argentina'],
  ['Ghana', 'Tanzania'],
  ['Vietnam', 'New Zealand'],
].flatMap(([from, to]) => {
  const a = CENTROIDS[from]
  const b = CENTROIDS[to]
  if (!a || !b) return []
  const lift = Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.35
  const mx = (a[0] + b[0]) / 2 + lift * 0.4
  const my = (a[1] + b[1]) / 2 - lift
  return [`M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`]
})

const DOTS = (geography.mapDots as [number, number, string][]).map(
  ([x, y, country]) => ({ x, y, service: COUNTRY_SERVICE[country] })
)

const ActiveMap = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const reduced = useReducedMotion()
  const ref = useRef<SVGSVGElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        io.disconnect()
      },
      { threshold: 0.3 }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  const animate = visible && !reduced

  return (
    <svg
      ref={ref}
      viewBox={VIEWBOX}
      role="img"
      aria-label={t`Map with the ${COUNTRY_COUNT} countries where UGLYCASH is active highlighted`}
      className={cn(
        'h-auto w-full [--home-dot-off:hsl(var(--border-secondary))] dark:[--home-dot-off:hsl(var(--muted-foreground)/0.4)]',
        className
      )}
    >
      <style>{`
        @keyframes home-dot-on { from { fill: ${INACTIVE_FILL}; } to { fill: var(--home-dot-color); } }
        .home-dot-active { fill: var(--home-dot-color); }
        .home-dots-waiting .home-dot-active { fill: ${INACTIVE_FILL}; }
        .home-dots-animate .home-dot-active { fill: ${INACTIVE_FILL}; animation: home-dot-on 420ms ease-out forwards; }
      `}</style>
      <g className={reduced ? undefined : visible ? 'home-dots-animate' : 'home-dots-waiting'}>
        {DOTS.map(({ x, y, service }) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={DOT_RADIUS}
            className={service ? 'home-dot-active' : undefined}
            fill={service ? undefined : INACTIVE_FILL}
            style={
              service &&
              ({
                '--home-dot-color': COUNTRY_COLORS[service],
                animationDelay: `${150 + x * 1.6 + y * 0.6}ms`,
              } as React.CSSProperties)
            }
          />
        ))}
      </g>
      {animate &&
        ROUTES.map((path, i) => (
          <g key={path}>
            <path
              d={path}
              fill="none"
              stroke={COUNTRY_COLORS.custodial}
              strokeOpacity={0.18}
              strokeWidth={1}
            />
            <circle r={2.4} fill={COUNTRY_COLORS.custodial}>
              <animateMotion
                dur="3.2s"
                begin={`${1.6 + i * 0.55}s`}
                repeatCount="indefinite"
                path={path}
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              />
            </circle>
          </g>
        ))}
    </svg>
  )
}

export default ActiveMap
