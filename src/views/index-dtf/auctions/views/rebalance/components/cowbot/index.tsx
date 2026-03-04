/**
 * CowBot Widget
 *
 * Self-contained React component for running the Reserve Protocol
 * trusted fillers SDK in-browser during Index DTF rebalancing.
 *
 * Features:
 * - Automatic polling via React Query
 * - Inline card UI with status and controls
 * - Navigation warning when active
 * - Support for "listed" DTFs with external bots
 *
 * Designed to be extractable into @reserve-protocol/cowbot-react
 */

export { default as CowbotWidget } from './cowbot-widget'
export { CowbotProvider, CowbotInlineCard } from './cowbot-widget'
export { default as CowbotAnimation } from './cowbot-animation'
export { default as CowbotCard } from './cowbot-card'
export { useCowbotQuery } from './use-cowbot-query'
export { useIsListedDTF } from './use-is-listed-dtf'
export * from './types'
