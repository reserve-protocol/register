import TokenLogo from '@/components/token-logo'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import useIndexDTFList, { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

const LOGO_RADIUS = 24
const TRAJECTORY_RADIUS = 42
const TEXT_PATH_RADIUS = TRAJECTORY_RADIUS + 10
const CARD_PADDING = TRAJECTORY_RADIUS - LOGO_RADIUS
const CARD_RIGHT_PADDING = CARD_PADDING + 12
const PATH_START_X = 0
const PATH_CENTER_Y = 150
const FADE_IN_PROGRESS = 0.08
const FADE_OUT_START_PROGRESS = 0.58
const FADE_OUT_END_PROGRESS = 0.7
const TICKER_SPACING = 112
const TICKER_SPEED = 120
const REVEAL_HOLD_MS = 350
const REVEAL_EXPAND_MS = 1300
const REVEAL_TEXT_MS = 2000
const FINAL_HOLD_MS = 2000
const COLLAPSE_TEXT_MS = 350
const COLLAPSE_MS = 850
const RESET_MS = 250
const ANIMATION_HEIGHT = 224
const CARD_WIDTH = 170

type Geometry = {
  width: number
  centerX: number
  centerY: number
  orbitBottomY: number
  textOrbitBottomY: number
  textOrbitTopY: number
  textOrbitRightX: number
  textOrbitLeftX: number
  pathLength: number
  cardWidth: number
  cardHeight: number
  cardX: number
  cardY: number
  finalLogoX: number
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value))

const easeInOut = (value: number) =>
  value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2

const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 3)

const formatWeight = (weight?: string) => {
  const value = Number.parseFloat(weight ?? '0')
  if (!Number.isFinite(value)) return `${weight ?? '0'}%`
  return `${formatCurrency(value, value < 1 ? 2 : 1, {
    minimumFractionDigits: 0,
  })}%`
}

const useElementWidth = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => setWidth(el.getBoundingClientRect().width)
    update()

    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return { ref, width }
}

const useAnimationTime = () => {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches) return

    let raf = 0
    let start = 0

    const tick = (timestamp: number) => {
      if (!start) start = timestamp
      setTime(timestamp - start)
      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [])

  return time
}

const getCMC20 = (dtfs?: IndexDTFItem[]) =>
  dtfs?.find((dtf) => dtf.symbol.toUpperCase() === 'CMC20')

const getGeometry = (width: number): Geometry => {
  const safeWidth = Math.max(width, 320)
  const centerX = safeWidth / 2
  const centerY = PATH_CENTER_Y

  const orbitBottomY = centerY + TRAJECTORY_RADIUS
  const textOrbitBottomY = centerY + TEXT_PATH_RADIUS
  const textOrbitTopY = centerY - TEXT_PATH_RADIUS
  const textOrbitRightX = centerX + TEXT_PATH_RADIUS
  const textOrbitLeftX = centerX - TEXT_PATH_RADIUS

  const pathLength =
    Math.max(0, centerX - PATH_START_X) + Math.PI * 2 * TEXT_PATH_RADIUS

  const cardHeight = TRAJECTORY_RADIUS * 2
  const cardWidth = Math.min(
    CARD_WIDTH,
    Math.max(TRAJECTORY_RADIUS * 2, safeWidth - 16)
  )
  const cardX = centerX - cardWidth / 2
  const cardY = centerY - cardHeight / 2
  const finalLogoX = cardX + CARD_PADDING + LOGO_RADIUS

  return {
    width: safeWidth,
    centerX,
    centerY,
    orbitBottomY,
    textOrbitBottomY,
    textOrbitTopY,
    textOrbitRightX,
    textOrbitLeftX,
    pathLength,
    cardWidth,
    cardHeight,
    cardX,
    cardY,
    finalLogoX,
  }
}

const getCycleState = (time: number, itemCount: number, pathLength: number) => {
  const travelMs = (pathLength / TICKER_SPEED) * 1000
  const spacingMs = (TICKER_SPACING / TICKER_SPEED) * 1000

  const tickerMs =
    travelMs * FADE_OUT_END_PROGRESS + Math.max(0, itemCount - 1) * spacingMs

  const revealMs =
    REVEAL_HOLD_MS +
    REVEAL_EXPAND_MS +
    REVEAL_TEXT_MS +
    FINAL_HOLD_MS +
    COLLAPSE_TEXT_MS +
    COLLAPSE_MS +
    RESET_MS

  const totalMs = tickerMs + revealMs
  const cycleTime = totalMs > 0 ? time % totalMs : 0
  const revealTime = Math.max(0, cycleTime - tickerMs)
  const isReveal = cycleTime >= tickerMs

  const expandRaw = clamp((revealTime - REVEAL_HOLD_MS) / REVEAL_EXPAND_MS)
  const expandingProgress = easeInOut(expandRaw)

  const textProgress = easeOut(
    clamp(
      (revealTime - REVEAL_HOLD_MS - REVEAL_EXPAND_MS * 0.62) / REVEAL_TEXT_MS
    )
  )

  const collapseTextProgress = easeOut(
    clamp(
      (revealTime - REVEAL_HOLD_MS - REVEAL_EXPAND_MS - REVEAL_TEXT_MS) /
        COLLAPSE_TEXT_MS
    )
  )

  const collapseProgress = easeInOut(
    clamp(
      (revealTime -
        REVEAL_HOLD_MS -
        REVEAL_EXPAND_MS -
        REVEAL_TEXT_MS -
        COLLAPSE_TEXT_MS) /
        COLLAPSE_MS
    )
  )

  const morphProgress = expandingProgress * (1 - collapseProgress)
  const textOpacity = isReveal ? textProgress * (1 - collapseTextProgress) : 0
  const crossfadeProgress = isReveal
    ? easeOut(clamp(revealTime / REVEAL_HOLD_MS))
    : 0

  return {
    cycleTime,
    tickerMs,
    travelMs,
    spacingMs,
    isReveal,
    morphProgress,
    textOpacity,
    trajectoryOpacity: isReveal ? 1 - clamp(revealTime / REVEAL_HOLD_MS) : 1,
    placeholderOpacity: 1 - crossfadeProgress,
    logoOpacity: crossfadeProgress,
    gradientRotation: (time / 80) % 360,
  }
}

const AnimatedGradient = ({
  id,
  rotation,
}: {
  id: string
  rotation: number
}) => (
  <linearGradient
    id={id}
    x1="0"
    y1="0"
    x2="1"
    y2="1"
    gradientTransform={`rotate(${rotation} 0.5 0.5)`}
  >
    <stop offset="0%" stopColor="hsl(var(--primary))" />
    <stop offset="100%" stopColor="hsl(var(--primary-foreground))" />
  </linearGradient>
)

const PackingTickerText = ({
  asset,
  index,
  pathId,
  cycleTime,
  travelMs,
  spacingMs,
}: {
  asset: IndexDTFItem['basket'][number]
  index: number
  pathId: string
  cycleTime: number
  travelMs: number
  spacingMs: number
}) => {
  const itemTime = cycleTime - index * spacingMs
  const progress = itemTime / travelMs
  const visibleProgress = clamp(progress)

  const fadeIn = clamp(visibleProgress / FADE_IN_PROGRESS)
  const fadeOut =
    1 -
    clamp(
      (visibleProgress - FADE_OUT_START_PROGRESS) /
        (FADE_OUT_END_PROGRESS - FADE_OUT_START_PROGRESS)
    )

  const opacity =
    progress < 0 || progress > FADE_OUT_END_PROGRESS ? 0 : fadeIn * fadeOut

  return (
    <text
      className="fill-foreground text-xs font-normal"
      opacity={opacity}
      dominantBaseline="middle"
    >
      <textPath href={`#${pathId}`} startOffset={`${visibleProgress * 100}%`}>
        <tspan>{asset.symbol}</tspan>
        <tspan className="fill-muted-foreground" dx="4">
          {formatWeight(asset.weight)}
        </tspan>
      </textPath>
    </text>
  )
}

const DTFPackingAnimation = ({ className }: { className?: string }) => {
  const { data } = useIndexDTFList()
  const cmc20 = getCMC20(data)
  const { ref, width } = useElementWidth()
  const time = useAnimationTime()
  const id = useId().replace(/:/g, '')
  const pathId = `${id}-packing-path`
  const gradientId = `${id}-packing-gradient`

  const basket = useMemo(() => cmc20?.basket ?? [], [cmc20?.basket])
  const geometry = useMemo(() => getGeometry(width), [width])
  const cycle = getCycleState(time, basket.length, geometry.pathLength)

  const borderX =
    geometry.centerX -
    TRAJECTORY_RADIUS +
    (geometry.cardX - (geometry.centerX - TRAJECTORY_RADIUS)) *
      cycle.morphProgress

  const borderWidth =
    TRAJECTORY_RADIUS * 2 +
    (geometry.cardWidth - TRAJECTORY_RADIUS * 2) * cycle.morphProgress

  const logoX =
    geometry.centerX +
    (geometry.finalLogoX - geometry.centerX) * cycle.morphProgress

  const logoStyle = {
    left: logoX - LOGO_RADIUS,
    top: geometry.centerY - LOGO_RADIUS,
    width: LOGO_RADIUS * 2,
    height: LOGO_RADIUS * 2,
    opacity: cycle.logoOpacity,
  } satisfies CSSProperties

  const detailStyle = {
    left: logoX + LOGO_RADIUS + 12,
    top: geometry.centerY - 22,
    maxWidth:
      geometry.cardX +
      geometry.cardWidth -
      CARD_RIGHT_PADDING -
      logoX -
      LOGO_RADIUS -
      12,
    opacity: cycle.textOpacity,
  } satisfies CSSProperties

  const pathD = [
    `M ${PATH_START_X} ${geometry.textOrbitBottomY}`,
    `L ${geometry.centerX} ${geometry.textOrbitBottomY}`,
    `A ${TEXT_PATH_RADIUS} ${TEXT_PATH_RADIUS} 0 0 0 ${geometry.textOrbitRightX} ${geometry.centerY}`,
    `A ${TEXT_PATH_RADIUS} ${TEXT_PATH_RADIUS} 0 0 0 ${geometry.centerX} ${geometry.textOrbitTopY}`,
    `A ${TEXT_PATH_RADIUS} ${TEXT_PATH_RADIUS} 0 0 0 ${geometry.textOrbitLeftX} ${geometry.centerY}`,
    `A ${TEXT_PATH_RADIUS} ${TEXT_PATH_RADIUS} 0 0 0 ${geometry.centerX} ${geometry.textOrbitBottomY}`,
  ].join(' ')

  const price = cmc20
    ? `$${formatCurrency(cmc20.price, cmc20.price >= 1 ? 2 : 5)}`
    : ''

  return (
    <div
      ref={ref}
      className={cn(
        'relative h-56 w-full overflow-hidden text-foreground',
        className
      )}
      aria-label="CMC20 packs multiple collateral assets into one DTF token"
    >
      {cmc20 && width > 0 && (
        <>
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            width={geometry.width}
            height={ANIMATION_HEIGHT}
            viewBox={`0 0 ${geometry.width} ${ANIMATION_HEIGHT}`}
            role="img"
            aria-hidden="true"
          >
            <defs>
              <path id={pathId} d={pathD} pathLength={100} />
              <AnimatedGradient
                id={gradientId}
                rotation={cycle.gradientRotation}
              />
            </defs>

            <g opacity={cycle.trajectoryOpacity}>
              <line
                x1={PATH_START_X}
                y1={geometry.orbitBottomY}
                x2={geometry.centerX}
                y2={geometry.orbitBottomY}
                className="stroke-primary/40"
                strokeWidth="1.5"
                strokeDasharray="2 7"
                strokeLinecap="round"
              />
              <circle
                cx={geometry.centerX}
                cy={geometry.centerY}
                r={TRAJECTORY_RADIUS}
                className="stroke-primary/40"
                fill="none"
                strokeWidth="1.5"
                strokeDasharray="2 7"
                strokeLinecap="round"
              />
            </g>

            <g opacity={cycle.placeholderOpacity}>
              <circle
                cx={geometry.centerX}
                cy={geometry.centerY}
                r={LOGO_RADIUS}
                fill={`url(#${gradientId})`}
              />
            </g>

            <rect
              x={borderX}
              y={geometry.cardY}
              width={borderWidth}
              height={geometry.cardHeight}
              rx={geometry.cardHeight / 2}
              className="fill-card/50 stroke-card"
              strokeWidth="1.5"
              opacity={cycle.isReveal ? 1 : 0}
            />

            {!cycle.isReveal && (
              <g>
                {basket.map((asset, index) => (
                  <PackingTickerText
                    key={`${asset.address}-${index}`}
                    asset={asset}
                    index={index}
                    pathId={pathId}
                    cycleTime={cycle.cycleTime}
                    travelMs={cycle.travelMs}
                    spacingMs={cycle.spacingMs}
                  />
                ))}
              </g>
            )}
          </svg>

          <div
            className="pointer-events-none absolute rounded-full transition-opacity"
            style={logoStyle}
          >
            <TokenLogo
              src={cmc20.brand?.icon || undefined}
              symbol={cmc20.symbol}
              width={LOGO_RADIUS * 2}
              height={LOGO_RADIUS * 2}
              loading="eager"
              fetchPriority="high"
            />
          </div>

          <div
            className="pointer-events-none absolute min-w-0 text-left"
            style={detailStyle}
          >
            <div className="text-base font-normal leading-tight text-foreground">
              {cmc20.symbol}
            </div>
            <div className="mt-1 text-sm font-normal leading-tight text-primary">
              {price}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DTFPackingAnimation
