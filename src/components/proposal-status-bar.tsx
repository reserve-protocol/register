import { cn } from '@/lib/utils'
import {
  RefObject,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

export type ProposalStageStatus = 'completed' | 'in-progress' | 'pending'

export type ProposalStage = {
  key: string
  duration: number
  status: ProposalStageStatus
  progress?: number
}

export interface ProposalStatusBarProps {
  stages: ProposalStage[]
  className?: string
}

const HEIGHT = 10
const RADIUS = 3
const SLANT = 8
const VISUAL_GAP = 4
// Adjacent slants point the same direction, so frames must overlap by
// SLANT to bring the slanted edges flush; VISUAL_GAP then opens the seam back up.
const FRAME_OFFSET = VISUAL_GAP - SLANT
// Floor for any single stage so tiny durations (e.g. 5-min execution delay
// next to a 24h voting window) don't collapse into an invisible sliver.
const MIN_SEGMENT_WIDTH = 36

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

const useElementWidth = (ref: RefObject<HTMLElement | null>) => {
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.getBoundingClientRect().width)
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return width
}

const buildPath = (
  w: number,
  isFirst: boolean,
  isLast: boolean
): string => {
  const r = Math.min(RADIUS, w / 2)

  if (isFirst && isLast) {
    return [
      `M${r} 0`,
      `H${w - r}`,
      `A${r} ${r} 0 0 1 ${w - r} ${HEIGHT}`,
      `H${r}`,
      `A${r} ${r} 0 0 1 ${r} 0`,
      'Z',
    ].join(' ')
  }

  const s = Math.min(SLANT, w)

  if (isFirst) {
    return [
      `M${r} 0`,
      `H${w}`,
      `L${w - s} ${HEIGHT}`,
      `H${r}`,
      `A${r} ${r} 0 0 1 ${r} 0`,
      'Z',
    ].join(' ')
  }

  if (isLast) {
    return [
      `M${s} 0`,
      `H${w - r}`,
      `A${r} ${r} 0 0 1 ${w - r} ${HEIGHT}`,
      `L0 ${HEIGHT}`,
      'Z',
    ].join(' ')
  }

  return `M${s} 0 H${w} L${w - s} ${HEIGHT} L0 ${HEIGHT} Z`
}

const buildProgressPath = (w: number, progress: number): string | null => {
  const fillW = progress * w
  if (fillW <= 0) return null

  const s = Math.min(SLANT, fillW)
  return `M0 0 H${fillW} L${Math.max(0, fillW - s)} ${HEIGHT} H0 Z`
}

const allocateWidths = (durations: number[], drawable: number): number[] => {
  const min = Math.min(MIN_SEGMENT_WIDTH, drawable / durations.length)
  const pinned = new Set<number>()
  const widths = new Array<number>(durations.length).fill(0)

  let changed = true
  while (changed) {
    changed = false
    const remainingDrawable =
      drawable - [...pinned].length * min
    const remainingDuration = durations.reduce(
      (acc, d, i) => acc + (pinned.has(i) ? 0 : d),
      0
    )
    durations.forEach((d, i) => {
      widths[i] = pinned.has(i)
        ? min
        : remainingDuration > 0
          ? (d / remainingDuration) * remainingDrawable
          : 0
      if (!pinned.has(i) && widths[i] < min) {
        pinned.add(i)
        changed = true
      }
    })
  }

  return widths
}

const ProposalStatusBar = ({ stages, className }: ProposalStatusBarProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const containerWidth = useElementWidth(containerRef)
  const rawId = useId()
  const filterId = rawId.replace(/:/g, '-')

  const segments = useMemo(() => {
    const visible = stages.filter((s) => s.duration > 0)
    const total = visible.reduce((acc, s) => acc + s.duration, 0)
    if (containerWidth <= 0 || total <= 0 || visible.length === 0) return []

    const totalGap = FRAME_OFFSET * (visible.length - 1)
    const drawable = Math.max(0, containerWidth - totalGap)
    const widths = allocateWidths(
      visible.map((s) => s.duration),
      drawable
    )

    let x = 0
    return visible.map((stage, index) => {
      const width = widths[index]
      const isFirst = index === 0
      const isLast = index === visible.length - 1
      const progress = clamp01(stage.progress ?? 0)
      const path = buildPath(width, isFirst, isLast)
      const isActive = stage.status === 'in-progress'
      const segment = {
        ...stage,
        x,
        width,
        progress,
        isFirst,
        isLast,
        path,
        progressPath: isActive ? buildProgressPath(width, progress) : null,
        activeClipId: isActive ? `${filterId}-active-${stage.key}` : null,
      }
      x += width + FRAME_OFFSET
      return segment
    })
  }, [stages, containerWidth, filterId])

  return (
    <div ref={containerRef} className={cn('h-2.5 w-full', className)}>
      {containerWidth > 0 && (
        <svg
          aria-hidden="true"
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${containerWidth} ${HEIGHT}`}
          preserveAspectRatio="none"
          fill="none"
          focusable="false"
          shapeRendering="geometricPrecision"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
        >
          <defs>
            <filter id={filterId} colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feColorMatrix
                in="SourceAlpha"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="0.4" />
              <feGaussianBlur stdDeviation="1" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
              <feBlend in2="shape" />
            </filter>
            <linearGradient id={`${filterId}-shimmer`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="hsl(var(--primary) / 0)" />
              <stop offset="0.5" stopColor="hsl(var(--primary) / 0.25)" />
              <stop offset="1" stopColor="hsl(var(--primary) / 0)" />
            </linearGradient>
            {segments.map(
              (seg) =>
                seg.activeClipId && (
                  <clipPath key={seg.key} id={seg.activeClipId}>
                    <path d={seg.path} />
                  </clipPath>
                )
            )}
          </defs>
          {segments.map((seg) => {
            const bgFill =
              seg.status === 'completed'
                ? 'hsl(var(--primary))'
                : 'hsl(var(--muted))'

            return (
              <g key={seg.key} transform={`translate(${seg.x} 0)`}>
                <path d={seg.path} fill={bgFill} filter={`url(#${filterId})`} />
                {seg.activeClipId && (
                  <>
                    {seg.progressPath && (
                      <g clipPath={`url(#${seg.activeClipId})`}>
                        <path
                          d={seg.progressPath}
                          fill="hsl(var(--primary) / 0.3)"
                        />
                      </g>
                    )}
                    <g clipPath={`url(#${seg.activeClipId})`}>
                      <rect
                        x={0}
                        y={0}
                        width={seg.width}
                        height={HEIGHT}
                        fill={`url(#${filterId}-shimmer)`}
                        className="motion-safe:animate-proposal-bar-sweep [transform-box:fill-box]"
                      />
                    </g>
                  </>
                )}
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

export default ProposalStatusBar
