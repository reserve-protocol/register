import {
  CARD_DETAIL_GAP,
  CARD_RIGHT_EXTRA_PADDING,
  COLLAPSE_MS,
  COLLAPSE_TEXT_MS,
  FADE_IN_PROGRESS,
  FADE_OUT_END_PROGRESS,
  FADE_OUT_START_PROGRESS,
  FINAL_HOLD_MS,
  PATH_START_X,
  RESET_MS,
  REVEAL_EXPAND_MS,
  REVEAL_HOLD_MS,
  REVEAL_TEXT_MS,
  TEXT_PATH_GAP,
  TICKER_SPACING,
  TICKER_SPEED,
  type VisualGeometry,
} from './constants'

export type Geometry = {
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

export const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value))

const easeInOut = (value: number) =>
  value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2

const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 3)

export const getGeometry = (
  width: number,
  centerY: number,
  visual: VisualGeometry
): Geometry => {
  const safeWidth = width
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

export const getCycleState = (
  time: number,
  itemCount: number,
  pathLength: number
) => {
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

  return {
    cycleTime,
    tickerMs,
    travelMs,
    spacingMs,
    isReveal,
    morphProgress: expandingProgress * (1 - collapseProgress),
    textOpacity: isReveal ? textProgress * (1 - collapseTextProgress) : 0,
    trajectoryOpacity: isReveal ? 1 - clamp(revealTime / REVEAL_HOLD_MS) : 1,
  }
}

export type PackingTickerFrame = {
  opacity: number
  visibleProgress: number
}

export type PackingFrame = {
  trajectoryOpacity: number
  cardOpacity: number
  isReveal: boolean
  borderX: number
  borderWidth: number
  logoLeft: number
  detailLeft: number
  detailMaxWidth: number
  detailOpacity: number
  tickers: PackingTickerFrame[]
}

// WHY: single source of truth for the per-frame values. Used both for the
// initial (time=0) render and for the imperative ref writes in the RAF loop, so
// the visual output is identical to the previous state-driven implementation.
export const computePackingFrame = (
  time: number,
  geometry: Geometry,
  visual: VisualGeometry,
  itemCount: number
): PackingFrame => {
  const cycle = getCycleState(time, itemCount, geometry.pathLength)

  const trajectoryStartX = geometry.centerX - visual.trajectoryRadius
  const borderX =
    trajectoryStartX + (geometry.cardX - trajectoryStartX) * cycle.morphProgress
  const borderWidth =
    visual.trajectoryRadius * 2 +
    (geometry.cardWidth - visual.trajectoryRadius * 2) * cycle.morphProgress
  const logoX =
    geometry.centerX +
    (geometry.finalLogoX - geometry.centerX) * cycle.morphProgress

  const cardPadding = visual.trajectoryRadius - visual.logoRadius
  const cardRightPadding = cardPadding + CARD_RIGHT_EXTRA_PADDING
  const detailMaxWidth =
    geometry.cardX +
    geometry.cardWidth -
    cardRightPadding -
    logoX -
    visual.logoRadius -
    CARD_DETAIL_GAP

  const tickers = Array.from({ length: itemCount }, (_, index) => {
    const itemTime = cycle.cycleTime - index * cycle.spacingMs
    const progress = itemTime / cycle.travelMs
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
    return { opacity, visibleProgress }
  })

  return {
    trajectoryOpacity: cycle.trajectoryOpacity,
    cardOpacity: cycle.isReveal ? 1 : 0,
    isReveal: cycle.isReveal,
    borderX,
    borderWidth,
    logoLeft: logoX - visual.logoRadius,
    detailLeft: logoX + visual.logoRadius + CARD_DETAIL_GAP,
    detailMaxWidth,
    detailOpacity: cycle.textOpacity,
    tickers,
  }
}
