import { Address } from 'viem'
import { RESERVE_API } from '@/utils/constants'

// Client for the reserve-api GET /dtf/ondo endpoint: the Ondo tokenized
// equities in a DTF basket with their current per-session order limits and
// market status. Used to feed the async zapper's maxOrderValueUsd and to warn
// when trading is paused.

export type OndoSessionLimits = {
  premarket?: number
  regular?: number
  postmarket?: number
  overnight?: number
}

export type OndoAssetLimit = {
  address: Address
  symbol: string
  name: string
  sessionLimits: OndoSessionLimits | null
  // Cap for the active session; 0 means trading is blocked, absent = unknown.
  capacityUsd?: number
}

export type OndoMarketStatus = {
  isOpen: boolean
  session: string
  nextOpen: string | null
  nextClose: string | null
  timestamp: string
}

export type DtfOndoLimits = {
  market: OndoMarketStatus | null
  assets: OndoAssetLimit[]
}

// Most constrained per-transaction cap across the basket's Ondo assets.
// Assets without a reported cap are skipped; undefined when none report one.
export const getMinOndoCapacityUsd = (
  assets: OndoAssetLimit[]
): number | undefined => {
  const caps = assets
    .map((asset) => asset.capacityUsd)
    .filter((cap): cap is number => cap !== undefined)

  return caps.length > 0 ? Math.min(...caps) : undefined
}

export const fetchDtfOndoLimits = async (
  chainId: number,
  address: string
): Promise<DtfOndoLimits> => {
  const params = new URLSearchParams({ chainId: String(chainId), address })
  const response = await fetch(`${RESERVE_API}dtf/ondo?${params}`, {
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) throw new Error(`dtf ondo ${response.status}`)

  return response.json()
}
