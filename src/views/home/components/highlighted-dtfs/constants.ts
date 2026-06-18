export const HIGHLIGHTED_LIMIT = 5
export const BACKING_LIMIT = 7
export const COLLATERAL_GAP = 8
export const COLLATERAL_SCROLL_RAMP_PERCENT = 12
export const COLLATERAL_SCROLL_RAMP_DISTANCE_PERCENT = 4
export const COLLATERAL_SCROLL_RAMP_GAP_OFFSET =
  (COLLATERAL_GAP / 2) * (COLLATERAL_SCROLL_RAMP_DISTANCE_PERCENT / 50)
export const ASSET_CHAIN_EXIT_MS = 180
export const ASSET_CHAIN_ENTER_MS = 220
export const TRANSCRIPT_PREVIEW =
  'A short walkthrough of this portfolio, the assets it tracks, how the basket is weighted, and why investors may use it for broad tokenized market exposure. The explainer will cover the core thesis, recent performance drivers, liquidity considerations, and the role each major component plays inside the DTF.'
export const TRANSCRIPT_WORDS = TRANSCRIPT_PREVIEW.split(' ')
export const TRANSCRIPT_WORD_DELAY_MS = 280
export const TRANSCRIPT_LINE_HEIGHT = 18
export const END_FADE_DISTANCE = 160
export const FEATURE_CARD_CLASS_NAME =
  'group flex w-full shrink-0 flex-col gap-1 rounded-3xl bg-card p-1 lg:bg-background lg:hover:bg-card'
export const FEATURE_CARD_MEDIA_CLASS_NAME =
  'flex flex-col overflow-hidden rounded-t-2xl bg-gradient-to-b from-secondary to-card lg:from-secondary/80 lg:group-hover:from-card'
export const FEATURE_CARD_HEADER_CLASS_NAME =
  'flex min-w-0 flex-col gap-3 p-5 pb-2'
export const FEATURE_CARD_ASSET_TICKER_CLASS_NAME =
  'relative overflow-hidden rounded-full border border-card bg-card p-2 pl-0 pr-0.5 lg:border-secondary lg:group-hover:border-card'
export const FEATURE_CARD_GRID_CLASS_NAME =
  'grid grid-cols-1 gap-1 pb-0 will-change-transform md:auto-rows-fr md:grid-cols-2'
