import TokenLogo from '@/components/token-logo'
import { useIsDesktop } from '@/hooks/use-media-query'
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

const PATH_START_X = 0
const DESKTOP_PATH_CENTER_Y = 150
const MOBILE_PATH_CENTER_Y = 78
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
const DESKTOP_ANIMATION_HEIGHT = 224
const MOBILE_ANIMATION_HEIGHT = 152
const DESKTOP_VISUAL_GEOMETRY = {
  logoRadius: 24,
  trajectoryRadius: 42,
  cardWidth: 170,
}
const MOBILE_VISUAL_GEOMETRY = {
  logoRadius: 21,
  trajectoryRadius: 37,
  cardWidth: 150,
}
const TEXT_PATH_GAP = 10
const CARD_DETAIL_GAP = 12
const CARD_RIGHT_EXTRA_PADDING = 12

type VisualGeometry = {
  logoRadius: number
  trajectoryRadius: number
  cardWidth: number
}

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

const getGeometry = (
  width: number,
  centerY: number,
  visual: VisualGeometry
): Geometry => {
  const safeWidth = Math.max(width, 320)
  const centerX = safeWidth / 2
  const textPathRadius = visual.trajectoryRadius + TEXT_PATH_GAP
  const cardPadding = visual.trajectoryRadius - visual.logoRadius

  const orbitBottomY = centerY + visual.trajectoryRadius
  const textOrbitBottomY = centerY + textPathRadius
  const textOrbitTopY = centerY - textPathRadius
  const textOrbitRightX = centerX + textPathRadius
  const textOrbitLeftX = centerX - textPathRadius

  const pathLength =
    Math.max(0, centerX - PATH_START_X) + Math.PI * 2 * textPathRadius

  const cardHeight = visual.trajectoryRadius * 2
  const cardWidth = Math.min(
    visual.cardWidth,
    Math.max(visual.trajectoryRadius * 2, safeWidth - 16)
  )
  const cardX = centerX - cardWidth / 2
  const cardY = centerY - cardHeight / 2
  const finalLogoX = cardX + cardPadding + visual.logoRadius

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
  return {
    cycleTime,
    tickerMs,
    travelMs,
    spacingMs,
    isReveal,
    morphProgress,
    textOpacity,
    trajectoryOpacity: isReveal ? 1 - clamp(revealTime / REVEAL_HOLD_MS) : 1,
  }
}

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
  const isDesktop = useIsDesktop()
  const id = useId().replace(/:/g, '')
  const pathId = `${id}-packing-path`
  const tickerLineGradientId = `${id}-ticker-line-gradient`

  const basket = useMemo(() => cmc20?.basket ?? [], [cmc20?.basket])
  const animationHeight = isDesktop
    ? DESKTOP_ANIMATION_HEIGHT
    : MOBILE_ANIMATION_HEIGHT
  const pathCenterY = isDesktop ? DESKTOP_PATH_CENTER_Y : MOBILE_PATH_CENTER_Y
  const visual = isDesktop ? DESKTOP_VISUAL_GEOMETRY : MOBILE_VISUAL_GEOMETRY
  const textPathRadius = visual.trajectoryRadius + TEXT_PATH_GAP
  const cardPadding = visual.trajectoryRadius - visual.logoRadius
  const cardRightPadding = cardPadding + CARD_RIGHT_EXTRA_PADDING
  const geometry = useMemo(
    () => getGeometry(width, pathCenterY, visual),
    [pathCenterY, visual, width]
  )
  const cycle = getCycleState(time, basket.length, geometry.pathLength)

  const borderX =
    geometry.centerX -
    visual.trajectoryRadius +
    (geometry.cardX - (geometry.centerX - visual.trajectoryRadius)) *
      cycle.morphProgress

  const borderWidth =
    visual.trajectoryRadius * 2 +
    (geometry.cardWidth - visual.trajectoryRadius * 2) * cycle.morphProgress

  const logoX =
    geometry.centerX +
    (geometry.finalLogoX - geometry.centerX) * cycle.morphProgress

  const logoStyle = {
    left: logoX - visual.logoRadius,
    top: geometry.centerY - visual.logoRadius,
    width: visual.logoRadius * 2,
    height: visual.logoRadius * 2,
  } satisfies CSSProperties

  const detailStyle = {
    left: logoX + visual.logoRadius + CARD_DETAIL_GAP,
    top: geometry.centerY - 22,
    maxWidth:
      geometry.cardX +
      geometry.cardWidth -
      cardRightPadding -
      logoX -
      visual.logoRadius -
      CARD_DETAIL_GAP,
    opacity: cycle.textOpacity,
  } satisfies CSSProperties

  const pathD = [
    `M ${PATH_START_X} ${geometry.textOrbitBottomY}`,
    `L ${geometry.centerX} ${geometry.textOrbitBottomY}`,
    `A ${textPathRadius} ${textPathRadius} 0 0 0 ${geometry.textOrbitRightX} ${geometry.centerY}`,
    `A ${textPathRadius} ${textPathRadius} 0 0 0 ${geometry.centerX} ${geometry.textOrbitTopY}`,
    `A ${textPathRadius} ${textPathRadius} 0 0 0 ${geometry.textOrbitLeftX} ${geometry.centerY}`,
    `A ${textPathRadius} ${textPathRadius} 0 0 0 ${geometry.centerX} ${geometry.textOrbitBottomY}`,
  ].join(' ')

  const price = cmc20
    ? `$${formatCurrency(cmc20.price, cmc20.price >= 1 ? 2 : 5)}`
    : ''

  return (
    <div
      ref={ref}
      className={cn(
        'relative h-[152px] w-full overflow-hidden text-foreground lg:h-56',
        className
      )}
      aria-label="CMC20 packs multiple collateral assets into one DTF token"
    >
      {cmc20 && width > 0 && (
        <>
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            width={geometry.width}
            height={animationHeight}
            viewBox={`0 0 ${geometry.width} ${animationHeight}`}
            role="img"
            aria-hidden="true"
          >
            <defs>
              <path id={pathId} d={pathD} pathLength={100} />
              <linearGradient
                id={tickerLineGradientId}
                gradientUnits="userSpaceOnUse"
                x1={PATH_START_X}
                y1={geometry.orbitBottomY}
                x2={geometry.centerX}
                y2={geometry.orbitBottomY}
              >
                <stop
                  offset="0%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity="0"
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity="1"
                />
              </linearGradient>
            </defs>

            <g opacity={cycle.trajectoryOpacity}>
              <line
                x1={PATH_START_X}
                y1={geometry.orbitBottomY}
                x2={geometry.centerX}
                y2={geometry.orbitBottomY}
                stroke={`url(#${tickerLineGradientId})`}
                strokeWidth="1.5"
              />
              <circle
                cx={geometry.centerX}
                cy={geometry.centerY}
                r={visual.trajectoryRadius}
                className="fill-primary/10 stroke-primary"
                fill="none"
                strokeWidth="1.5"
              />
            </g>

            <rect
              x={borderX}
              y={geometry.cardY}
              width={borderWidth}
              height={geometry.cardHeight}
              rx={geometry.cardHeight / 2}
              className="fill-primary/10 stroke-primary"
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
            className="pointer-events-none absolute rounded-full"
            style={logoStyle}
          >
            <TokenLogo
              src={cmc20.brand?.icon || undefined}
              symbol={cmc20.symbol}
              width={visual.logoRadius * 2}
              height={visual.logoRadius * 2}
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
