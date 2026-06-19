export const PATH_START_X = 0
export const DESKTOP_PATH_CENTER_Y = 150
export const MOBILE_PATH_CENTER_Y = 78
export const FADE_IN_PROGRESS = 0.08
export const FADE_OUT_START_PROGRESS = 0.58
export const FADE_OUT_END_PROGRESS = 0.7
export const TICKER_SPACING = 112
export const TICKER_SPEED = 120
export const REVEAL_HOLD_MS = 350
export const REVEAL_EXPAND_MS = 1300
export const REVEAL_TEXT_MS = 2000
export const FINAL_HOLD_MS = 2000
export const COLLAPSE_TEXT_MS = 350
export const COLLAPSE_MS = 850
export const RESET_MS = 250
export const DESKTOP_ANIMATION_HEIGHT = 224
export const MOBILE_ANIMATION_HEIGHT = 152
export const TEXT_PATH_GAP = 10
export const CARD_DETAIL_GAP = 12
export const CARD_RIGHT_EXTRA_PADDING = 12

export type VisualGeometry = {
  logoRadius: number
  trajectoryRadius: number
  cardWidth: number
}

export const DESKTOP_VISUAL_GEOMETRY: VisualGeometry = {
  logoRadius: 24,
  trajectoryRadius: 42,
  cardWidth: 170,
}

export const MOBILE_VISUAL_GEOMETRY: VisualGeometry = {
  logoRadius: 21,
  trajectoryRadius: 37,
  cardWidth: 150,
}
