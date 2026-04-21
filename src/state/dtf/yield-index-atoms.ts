import { atom } from 'jotai'
import { LP_PROJECTS } from '@/utils/constants'
import { COLLATERAL_POOL_MAP, STRATEGY_NAME_MAP } from '@/utils/yield-index'
import { DefiLlamaPool } from '@/types/defillama'
import {
  indexDTFAtom,
  indexDTFExposureDataAtom,
} from './atoms'

export type IndexDTFApyData = {
  collateralAPY: number
  redirectAPY: number
  totalAPY: number
}

export const indexDTFApyAtom = atom<IndexDTFApyData | undefined>(undefined)

export const indexDTFPoolsDataAtom = atom<DefiLlamaPool[] | undefined>(
  undefined
)

// Maps underlying token address (lowercase) → { name, symbol }
export const indexDTFUnderlyingNamesAtom = atom<
  Record<string, { name: string; symbol: string }>
>({})

// TODO: Detect yield DTFs by inspecting the basket's constituents
// (e.g. flag wrapped/pool collateral) rather than hardcoding a DTF address.
export const isYieldIndexDTFAtom = atom((get) => {
  const dtf = get(indexDTFAtom)
  return dtf?.id.toLowerCase() === '0x1d55940cf6eb85321816327aa785006f8dd59ef9'
})

export type CompositionStrategy = {
  name: string
  collateralAddress: string
  weight: number
  protocols: string
  estApy: number
  underlyings: { symbol: string; address: string }[]
}

export type CompositionAsset = {
  name: string
  symbol: string
  address: string
  weight: number
  type: string
  provider: string
}

export type CompositionProtocol = {
  name: string
  project: string
  exposureShare: number
  role: string
  usedIn: number
}

// Map collateral address (lowercase) → matching DefiLlama pool, keyed off
// COLLATERAL_POOL_MAP and the raw pools payload. Shared by the strategy,
// asset and protocol views below.
const poolByCollateralAddressAtom = atom((get) => {
  const exposureData = get(indexDTFExposureDataAtom)
  const poolsData = get(indexDTFPoolsDataAtom)

  if (!exposureData || !poolsData) return null

  const tokens = exposureData.flatMap((g) => g.tokens)
  const poolByAddress: Record<string, DefiLlamaPool> = {}
  for (const token of tokens) {
    const poolId = COLLATERAL_POOL_MAP[token.address.toLowerCase()]
    if (!poolId) continue
    const pool = poolsData.find((p) => p.pool === poolId)
    if (pool) poolByAddress[token.address.toLowerCase()] = pool
  }
  return { tokens, poolByAddress }
})

export const indexDTFStrategiesAtom = atom<CompositionStrategy[] | null>(
  (get) => {
    const ctx = get(poolByCollateralAddressAtom)
    if (!ctx) return null

    return ctx.tokens.map((token) => {
      const pool = ctx.poolByAddress[token.address.toLowerCase()]
      const projectName = pool
        ? (LP_PROJECTS[pool.project]?.name ?? pool.project)
        : '-'
      const venue = pool?.poolMeta
        ? `${pool.poolMeta.replace('V3', '')} → ${projectName}`
        : projectName

      const symbols = pool?.symbol?.split('-') ?? []
      const underlyings = (pool?.underlyingTokens ?? []).map((addr, i) => ({
        symbol: symbols[i] || '',
        address: addr,
      }))

      return {
        name:
          STRATEGY_NAME_MAP[token.address.toLowerCase()] ||
          `${pool?.symbol?.replace('-', ' / ') || token.symbol} Strategy`,
        collateralAddress: token.address,
        weight: token.weight,
        protocols: venue,
        estApy: pool?.apy ?? 0,
        underlyings,
      }
    })
  }
)

export const indexDTFAssetsAtom = atom<CompositionAsset[] | null>((get) => {
  const ctx = get(poolByCollateralAddressAtom)
  if (!ctx) return null
  const underlyingNames = get(indexDTFUnderlyingNamesAtom)

  const underlyingMap = new Map<
    string,
    { symbol: string; totalWeight: number }
  >()
  for (const token of ctx.tokens) {
    const pool = ctx.poolByAddress[token.address.toLowerCase()]
    if (!pool) continue
    const symbols = pool.symbol.split('-')
    const underlyings = pool.underlyingTokens ?? []
    const weightPerUnderlying = token.weight / Math.max(underlyings.length, 1)
    underlyings.forEach((addr, i) => {
      const key = addr.toLowerCase()
      const sym = symbols[i] || ''
      if (underlyingMap.has(key)) {
        underlyingMap.get(key)!.totalWeight += weightPerUnderlying
      } else {
        underlyingMap.set(key, { symbol: sym, totalWeight: weightPerUnderlying })
      }
    })
  }

  return Array.from(underlyingMap.entries()).map(([address, data]) => {
    const resolved = underlyingNames[address]
    return {
      name: resolved?.name || data.symbol,
      symbol: resolved?.symbol || data.symbol,
      address,
      weight: Math.round(data.totalWeight),
      // TODO: Asset type and provider should come from token metadata API
      type: 'Wrapped',
      provider: '-',
    }
  })
})

export const indexDTFProtocolsAtom = atom<CompositionProtocol[] | null>(
  (get) => {
    const ctx = get(poolByCollateralAddressAtom)
    if (!ctx) return null

    const protocolMap = new Map<
      string,
      { project: string; exposureShare: number; role: string; usedIn: number }
    >()
    for (const token of ctx.tokens) {
      const pool = ctx.poolByAddress[token.address.toLowerCase()]
      if (!pool) continue
      const projectName = LP_PROJECTS[pool.project]?.name ?? pool.project
      if (protocolMap.has(projectName)) {
        const existing = protocolMap.get(projectName)!
        existing.exposureShare += token.weight
        existing.usedIn += 1
      } else {
        protocolMap.set(projectName, {
          project: pool.project,
          exposureShare: token.weight,
          // TODO: Role should come from API
          role: pool.poolMeta ? 'Vault Manager' : 'Pool Venue',
          usedIn: 1,
        })
      }
      if (pool.poolMeta) {
        const venueName = pool.poolMeta.replace('V3', ' V3').split(' ')[0]
        if (!protocolMap.has(venueName)) {
          protocolMap.set(venueName, {
            project: pool.poolMeta.toLowerCase().includes('uniswap')
              ? 'uniswap-v3'
              : pool.poolMeta.toLowerCase(),
            exposureShare: token.weight,
            role: 'LP Venue',
            usedIn: 1,
          })
        } else {
          const existing = protocolMap.get(venueName)!
          existing.exposureShare += token.weight
          existing.usedIn += 1
        }
      }
    }

    return Array.from(protocolMap.entries()).map(([name, data]) => ({
      name,
      ...data,
    }))
  }
)
