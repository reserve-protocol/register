import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { Address } from 'viem'
import { RESERVE_API } from '@/utils/constants'

dayjs.extend(utc)
dayjs.extend(timezone)

const US_MARKET_TZ = 'America/New_York'

// Next regular US equity market open (Mon–Fri 9:30 AM ET) as an absolute Date.
// Skips weekends; ignores holidays — a "roughly when to come back" hint for the
// asset-paused case, where Ondo gives the next session name but no timestamp.
export const getNextUsMarketOpen = (from: Date = new Date()): Date => {
  const nowEt = dayjs(from).tz(US_MARKET_TZ)
  const openToday = nowEt.hour(9).minute(30).second(0).millisecond(0)
  let target = nowEt.isBefore(openToday) ? openToday : openToday.add(1, 'day')
  while (target.day() === 0 || target.day() === 6) {
    target = target.add(1, 'day')
  }
  return target.toDate()
}

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

export type OndoSession = keyof OndoSessionLimits

const SESSION_CYCLE: OndoSession[] = [
  'premarket',
  'regular',
  'postmarket',
  'overnight',
]

// Max USD of DTF mintable/redeemable per transaction: each asset absorbs its
// basket-weight fraction of the order, so the binding constraint is
// min(capacityUsd / weight). `shares` maps lowercase address -> percent string
// ("24.80"). Assets without a reported cap or a positive weight are skipped;
// undefined when none qualify.
export const getOndoWeightedMaxUsd = (
  assets: OndoAssetLimit[],
  shares: Record<string, string>
): number | undefined => {
  const maxes = assets.flatMap((asset) => {
    if (asset.capacityUsd === undefined) return []
    const weight = Number(shares[asset.address.toLowerCase()])
    if (!(weight > 0)) return []
    return [asset.capacityUsd / (weight / 100)]
  })

  return maxes.length > 0 ? Math.min(...maxes) : undefined
}

// Displayed cap is a conservative round number: $10k steps, $1k under $10k.
export const floorOndoMaxUsd = (value: number): number => {
  const step = value >= 10_000 ? 10_000 : 1_000
  return Math.floor(value / step) * step
}

// Minting through the underlying basket needs the market open and every
// reported asset cap above zero.
export const isOndoMintingAvailable = (
  market: OndoMarketStatus | null,
  assets: OndoAssetLimit[]
): boolean =>
  assets.length > 0 &&
  market?.isOpen === true &&
  assets.every(
    (asset) => asset.capacityUsd === undefined || asset.capacityUsd > 0
  )

// Not the negation of available: with missing market data and healthy caps,
// neither holds (fails open). A paused asset flags unavailable regardless.
export const isOndoMintingUnavailable = (
  market: OndoMarketStatus | null,
  assets: OndoAssetLimit[]
): boolean =>
  assets.length > 0 &&
  (market?.isOpen === false ||
    assets.some((asset) => asset.capacityUsd === 0))

// First session after `session` (wrapping; the current session is checked
// last, since an asset can be halted within an otherwise open session and
// resume tomorrow) where every asset has a positive limit. Undefined for
// unknown sessions ("closed") or when no session qualifies.
export const getNextTradableSession = (
  session: string,
  assets: OndoAssetLimit[]
): OndoSession | undefined => {
  const start = SESSION_CYCLE.indexOf(session as OndoSession)
  if (start === -1) return undefined

  for (let i = 1; i <= SESSION_CYCLE.length; i++) {
    const candidate = SESSION_CYCLE[(start + i) % SESSION_CYCLE.length]
    // A missing bucket falls back to the regular cap — same convention as the
    // API's sessionCapacity, which produces capacityUsd from these limits.
    const tradable = assets.every(
      (asset) =>
        (asset.sessionLimits?.[candidate] ??
          asset.sessionLimits?.regular ??
          0) > 0
    )
    if (tradable) return candidate
  }

  return undefined
}

// Rough time-until as "2 hours" / "45 minutes"; null when unknown or already
// past. Used to tell the user how long until the US market reopens.
export const formatRetryIn = (
  iso: string | null | undefined
): string | null => {
  if (!iso) return null
  const ms = new Date(iso).getTime() - Date.now()
  if (Number.isNaN(ms) || ms <= 0) return null
  const minutes = Math.ceil(ms / 60_000)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`
  const hours = Math.round(minutes / 60)
  return `${hours} hour${hours === 1 ? '' : 's'}`
}

// "Jul 6, 9:30 AM" in the viewer's locale and timezone; null when unknown.
export const formatOndoTime = (iso: string | null | undefined): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
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
