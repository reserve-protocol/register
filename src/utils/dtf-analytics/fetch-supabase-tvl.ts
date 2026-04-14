import { PriceMap } from './types'

const SUPABASE_OVERRIDE_FROM = '2026-03-01T00:00:00Z'

interface SupabaseAsset {
  id: number
}

interface SupabaseTvlSnapshot {
  ts: string
  internal_tvl_usd: string
  price_usd: string
}

function timestampToDateKey(ts: string): string {
  const date = new Date(ts)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function supabaseGet<T>(
  supabaseUrl: string,
  supabaseKey: string,
  path: string
): Promise<T | null> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })
    if (!res.ok) {
      console.error(
        `[DTF Analytics] Supabase request failed: ${res.status} ${res.statusText}`
      )
      return null
    }
    return res.json()
  } catch (error) {
    console.error('[DTF Analytics] Supabase request error:', error)
    return null
  }
}

/**
 * Fetches internal TVL data from Supabase for a DTF.
 * Looks up asset by contract_address, then fetches tvl_snapshots from March 2026.
 * Returns a PriceMap of dateKey -> internal balance in tokens.
 */
export async function fetchSupabaseTvl(
  dtfAddress: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<PriceMap> {
  const address = dtfAddress.toLowerCase()

  // Look up asset_id by contract_address
  const assets = await supabaseGet<SupabaseAsset[]>(
    supabaseUrl,
    supabaseKey,
    `assets?contract_address=ilike.${address}&select=id`
  )

  if (!assets || assets.length === 0) {
    return {}
  }

  const assetId = assets[0].id

  // Fetch tvl_snapshots from March 2026 onwards
  const snapshots = await supabaseGet<SupabaseTvlSnapshot[]>(
    supabaseUrl,
    supabaseKey,
    `tvl_snapshots?asset_id=eq.${assetId}&ts=gte.${SUPABASE_OVERRIDE_FROM}&select=ts,internal_tvl_usd,price_usd&order=ts.asc`
  )

  if (!snapshots || snapshots.length === 0) {
    return {}
  }

  // Average multiple snapshots per day (data is every 4 hours)
  const dailyAccum: Record<string, { sum: number; count: number }> = {}
  for (const snapshot of snapshots) {
    const dateKey = timestampToDateKey(snapshot.ts)
    const internalTvlUsd = Number(snapshot.internal_tvl_usd)
    const priceUsd = Number(snapshot.price_usd)

    if (priceUsd > 0) {
      const tokens = internalTvlUsd / priceUsd
      if (!dailyAccum[dateKey]) {
        dailyAccum[dateKey] = { sum: 0, count: 0 }
      }
      dailyAccum[dateKey].sum += tokens
      dailyAccum[dateKey].count += 1
    }
  }

  const map: PriceMap = {}
  for (const [dateKey, { sum, count }] of Object.entries(dailyAccum)) {
    map[dateKey] = sum / count
  }

  console.log(
    `[DTF Analytics] Supabase TVL: ${Object.keys(map).length} days for asset ${assetId} (${address})`
  )

  return map
}

/**
 * Merges Supabase TVL data into the internal balance map.
 * Removes subgraph entries from March 2026 onwards and replaces with Supabase data.
 */
export function overrideInternalBalanceMap(
  subgraphMap: PriceMap,
  supabaseMap: PriceMap
): PriceMap {
  if (Object.keys(supabaseMap).length === 0) {
    return subgraphMap
  }

  const cutoffDateKey = '2026-03-01'
  const merged: PriceMap = {}

  // Keep subgraph entries before cutoff
  for (const [dateKey, value] of Object.entries(subgraphMap)) {
    if (dateKey < cutoffDateKey) {
      merged[dateKey] = value
    }
  }

  // Add all Supabase entries
  for (const [dateKey, value] of Object.entries(supabaseMap)) {
    merged[dateKey] = value
  }

  return merged
}
