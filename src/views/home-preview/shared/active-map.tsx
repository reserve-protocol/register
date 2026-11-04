import { cn } from '@/lib/utils'
import { useEffect, useMemo, useRef, useState } from 'react'
import worldLatam from '../mock/world-map.json'
import worldGlobal from '../mock/world-map-global.json'
import geography from '../mock/v26-geography.json'
import { useIsMobile } from '@/hooks/use-media-query'
import { useReducedMotion } from './use-reduced-motion'

type Centroids = Record<string, [number, number]>
type CountryGroups = { custodial: readonly string[]; selfCustody: readonly string[] }


const GLOBAL_ROUTES: [string, string][] = [
  ['United States of America', 'Mexico'],
  ['United States of America', 'Philippines'],
  ['United States of America', 'Nigeria'],
  ['Saudi Arabia', 'Pakistan'],
  ['Kenya', 'India'],
  ['Colombia', 'Argentina'],
  ['Ghana', 'Tanzania'],
  ['Vietnam', 'New Zealand'],
]

const ROUTES: [string, string][] = [
  ['Mexico', 'Colombia'],
  ['Guatemala', 'Dominican Rep.'],
  ['Colombia', 'Argentina'],
  ['Peru', 'Paraguay'],
  ['Ecuador', 'Uruguay'],
  ['Panama', 'Chile'],
]

const VIEWBOX = {
  world: '0 20 1000 430',
  americas: '150 120 280 320',
  focus: '120 40 820 410',
}

const arc = ([x1, y1]: number[], [x2, y2]: number[]) => {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const lift = Math.hypot(x2 - x1, y2 - y1) * 0.35
  return `M${x1},${y1} Q${mx + lift * 0.4},${my - lift} ${x2},${y2}`
}

const ActiveMap = ({
  crop: cropProp = 'world',
  dataset = 'latam',
  highlight,
  countryGroups,
  countryColors = {
    custodial: 'hsl(var(--tvl))',
    selfCustody: 'hsl(160 35% 52%)',
  },
  className,
}: {
  crop?: keyof typeof VIEWBOX
  dataset?: 'latam' | 'global'
  highlight?: string | null
  countryGroups?: CountryGroups
  countryColors?: { custodial: string; selfCustody: string }
  className?: string
}) => {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const world = dataset === 'global' ? worldGlobal : worldLatam
  const routes = dataset === 'global' ? GLOBAL_ROUTES : ROUTES
  const crop = isMobile && dataset === 'latam' ? 'americas' : cropProp
  const ref = useRef<SVGSVGElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  const centroids = world.centroids as unknown as Centroids
  const animate = visible && !reduced
  const dotR = crop === 'americas' ? 1.7 : 3.1
  const dots = useMemo(() => {
    if (countryGroups && dataset === 'global') {
      return (geography.mapDots as [number, number, string][]).map(([x, y, name]) => {
        const selfCustody = countryGroups.selfCustody.includes(name)
        const active = selfCustody || countryGroups.custodial.includes(name)
        return { x, y, active, name, color: selfCustody ? countryColors.selfCustody : countryColors.custodial }
      })
    }
    return (crop === 'americas' ? world.dotsFine : world.dots).map(([x, y, active]) => ({
      x, y, active: !!active, name: undefined, color: countryColors.custodial,
    }))
  }, [countryColors, countryGroups, crop, dataset, world])
  const countryCount = countryGroups
    ? countryGroups.custodial.length + countryGroups.selfCustody.length
    : world.active.length

  return (
    <svg
      ref={ref}
      viewBox={VIEWBOX[crop]}
      role="img"
      aria-label={`Map with the ${countryCount} countries where UGLYCASH is active highlighted`}
      className={cn('h-auto w-full', className)}
    >
      <style>{`
        @keyframes hp-dot-on { from { fill: hsl(var(--border-secondary)); } to { fill: var(--hp-dot-color, hsl(var(--tvl))); } }
        .hp-dot-active { fill: var(--hp-dot-color, hsl(var(--tvl))); }
        .hp-animate .hp-dot-active { fill: hsl(var(--border-secondary)); animation: hp-dot-on 420ms ease-out forwards; }
      `}</style>
      <g className={animate ? 'hp-animate' : undefined}>
        {dots.map(({ x, y, active: a, color, name }) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={dotR}
            data-country={name}
            data-service={a && countryGroups ? (countryGroups.selfCustody.includes(name ?? '') ? 'self-custody' : 'full-service') : undefined}
            className={a ? 'hp-dot-active' : undefined}
            fill={a ? undefined : 'hsl(var(--border-secondary))'}
            style={{
              ...(a ? { '--hp-dot-color': color } : {}),
              ...(a && animate
                ? {
                    animationDelay:
                      dataset === 'global'
                        ? `${150 + x * 1.6 + y * 0.6}ms`
                        : `${200 + (y - 160) * (crop === 'americas' ? 4 : 6) + (x - 200) * 2}ms`,
                  }
                : {}),
            } as React.CSSProperties}
          />
        ))}
      </g>
      {highlight && centroids[highlight] && (
        <circle
          cx={centroids[highlight][0]}
          cy={centroids[highlight][1]}
          r={9}
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth={1.5}
        />
      )}
      {animate &&
        routes.map(([a, b], i) => {
          const d = arc(centroids[a], centroids[b])
          return (
            <g key={a + b}>
              <path
                d={d}
                fill="none"
                stroke="hsl(var(--tvl))"
                strokeOpacity={0.18}
                strokeWidth={1}
              />
              <circle r={2.4} fill="hsl(var(--tvl))">
                <animateMotion
                  dur="3.2s"
                  begin={`${1.6 + i * 0.55}s`}
                  repeatCount="indefinite"
                  path={d}
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1"
                />
              </circle>
            </g>
          )
        })}
    </svg>
  )
}

export default ActiveMap
