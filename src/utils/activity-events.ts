import { RESERVE_API } from '@/utils/constants'
import type { Address, Hash } from 'viem'

const ACTIVITY_SESSION_KEY = 'reserve.activity-session'
const ACTIVITY_ENDPOINT = `${RESERVE_API}v1/activity-events`

let fallbackSessionId: string | undefined

const getSessionId = () => {
  try {
    const stored = window.sessionStorage.getItem(ACTIVITY_SESSION_KEY)
    if (stored) return stored
    const created = crypto.randomUUID()
    window.sessionStorage.setItem(ACTIVITY_SESSION_KEY, created)
    return created
  } catch {
    fallbackSessionId ??= crypto.randomUUID()
    return fallbackSessionId
  }
}

type WalletConnectedEvent = {
  type: 'wallet_connected'
  wallet: Address
  chainId: number
  connector?: string
}

type VideoPlayedEvent = {
  type: 'video_played'
  wallet?: Address
  chainId: number
  dtfAddress: Address
  dtfSymbol?: string
  videoId: string
}

type TradeEvent = {
  type: 'dtf_buy' | 'dtf_sell'
  wallet: Address
  chainId: number
  dtfAddress: Address
  dtfSymbol?: string
  transactionHash: Hash
  amount?: string
  usdValue?: number
}

export type ActivityEvent =
  | WalletConnectedEvent
  | VideoPlayedEvent
  | TradeEvent

export const trackActivityEvent = async (event: ActivityEvent): Promise<void> => {
  if (typeof window === 'undefined') return

  try {
    await fetch(ACTIVITY_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...event, sessionId: getSessionId() }),
      keepalive: true,
    })
  } catch {
    // Activity alerts must never interrupt wallet, video, or transaction UX.
  }
}
