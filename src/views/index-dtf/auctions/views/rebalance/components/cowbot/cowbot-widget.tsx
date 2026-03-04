import { createContext, ReactNode, useContext, useEffect } from 'react'
import { PublicClient } from 'viem'
import { usePublicClient } from 'wagmi'
import CowbotCard from './cowbot-card'
import { CowbotConfig, CowbotStatus } from './types'
import { useCowbotQuery } from './use-cowbot-query'

interface CowbotContextValue {
  status: CowbotStatus
  totalOrders: number
  error: Error | null
  isSupportedChain: boolean
  isAuctionActive: boolean
  start: () => void
  stop: () => void
}

const CowbotContext = createContext<CowbotContextValue | null>(null)

const useCowbotContext = () => {
  const context = useContext(CowbotContext)
  if (!context) {
    throw new Error('useCowbotContext must be used within CowbotProvider')
  }
  return context
}

interface CowbotProviderProps {
  config: CowbotConfig
  publicClient?: PublicClient
  children: ReactNode
}

/**
 * Provider that manages CowBot state and shares it with children.
 * Handles SDK polling, navigation warnings, and state reset.
 */
const CowbotProvider = ({
  config,
  publicClient,
  children,
}: CowbotProviderProps) => {
  const wagmiClient = usePublicClient()
  const client = publicClient ?? wagmiClient

  const { status, totalOrders, error, isSupportedChain, start, stop, reset } =
    useCowbotQuery({ config, client })

  const isActive = status === 'running' || status === 'initializing'

  // Reset state when component mounts (entering rebalance view)
  useEffect(() => {
    reset()
  }, [reset])

  // Navigation warning when bot is running
  useEffect(() => {
    if (!isActive) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = 'CowBot is running. Are you sure you want to leave?'
      return event.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isActive])

  return (
    <CowbotContext.Provider
      value={{
        status,
        totalOrders,
        error,
        isSupportedChain,
        isAuctionActive: config.isAuctionActive,
        start,
        stop,
      }}
    >
      {children}
    </CowbotContext.Provider>
  )
}

/**
 * Inline card component that reads from CowbotContext.
 * Place this inside CowbotProvider where you want the card to appear.
 * Returns null if used outside of CowbotProvider.
 */
const CowbotInlineCard = () => {
  const context = useContext(CowbotContext)

  // Gracefully handle missing provider (e.g., when dtf is not loaded yet)
  if (!context) return null

  const { status, totalOrders, isAuctionActive, start, stop } = context
  return (
    <CowbotCard
      status={status}
      totalOrders={totalOrders}
      isAuctionActive={isAuctionActive}
      onStart={start}
      onStop={stop}
    />
  )
}

interface CowbotWidgetProps {
  config: CowbotConfig
  /** Optional: Override public client (for testing) */
  publicClient?: PublicClient
}

/**
 * Self-contained CowBot widget that handles:
 * - SDK polling via React Query
 * - Inline card display
 * - Navigation warning (beforeunload)
 * - State reset on mount
 *
 * Usage:
 * ```tsx
 * // Simple usage
 * <CowbotWidget config={{...}} />
 *
 * // With provider for custom placement
 * <CowbotProvider config={{...}}>
 *   <CowbotInlineCard />
 * </CowbotProvider>
 * ```
 */
const CowbotWidget = ({ config, publicClient }: CowbotWidgetProps) => {
  return (
    <CowbotProvider config={config} publicClient={publicClient}>
      <CowbotInlineCard />
    </CowbotProvider>
  )
}

export default CowbotWidget
export { CowbotProvider, CowbotInlineCard }
