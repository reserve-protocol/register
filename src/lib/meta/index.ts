export type ComponentToken = {
  id: string
  tokenTicker: string
  name?: string
  addresses?: Record<string, any>
  color?: string
  logo: { url: string }
  rating?: string
  website?: string
  description: string
}

export type Protocol = {
  id: string
  protocolName: string
  protocolDescription: string
  protocolSocials?: string[]
  website: string
  docs?: string
  logo: { url: string }
  color?: string
}

// Normalized type for JSON storage
export type CollateralAssetRaw = {
  name: string
  id: string
  displaySymbol: string
  addresses: Record<string, any>
  protocol: string // Just the ID
  color?: string
  llamaId?: string
  tokenDistribution: { token: string; distribution: number }[]
  description?: string
  underlyings: string[] // Array of token IDs
}

// Denormalized type with joined data
export type CollateralAsset = {
  name: string
  id: string
  displaySymbol: string
  addresses: Record<string, any>
  protocol: Protocol
  color?: string
  llamaId?: string
  tokenDistribution: { token: string; distribution: number }[]
  description?: string
  underlyings: ComponentToken[]
}

export type EarnPool = {
  description: string
  llamaId: string
  url: string
  underlyingTokens: string[] | null
  symbol: string
}

import collateralJson from './collateral-assets.json' with { type: 'json' }
import tokensJson from './component-tokens.json' with { type: 'json' }
import protocolsJson from './protocols.json' with { type: 'json' }
import earnPoolsJson from './earn-pools.json' with { type: 'json' }

const collateralsRaw = collateralJson as unknown as CollateralAssetRaw[]
const tokens = tokensJson as unknown as ComponentToken[]
const protocols = protocolsJson as unknown as Protocol[]

// Create lookup maps for efficient joining
const tokenMap = new Map(tokens.map(t => [t.id, t]))
const protocolMap = new Map(protocols.map(p => [p.id, p]))

export function getCollaterals(): CollateralAsset[] {
  return collateralsRaw.map(collateral => {
    // Join protocol data
    const protocol = protocolMap.get(collateral.protocol)
    if (!protocol) {
      throw new Error(`Protocol ${collateral.protocol} not found for collateral ${collateral.id}`)
    }

    // Join underlying tokens data
    const underlyings = collateral.underlyings.map(tokenId => {
      const token = tokenMap.get(tokenId)
      if (!token) {
        throw new Error(`Token ${tokenId} not found for collateral ${collateral.id}`)
      }
      return token
    })

    return {
      ...collateral,
      protocol,
      underlyings
    }
  })
}

export function getComponentTokens(): ComponentToken[] {
  return tokens
}

export function getProtocols(): Protocol[] {
  return protocols
}

export function getEarnPools(): EarnPool[] {
  return earnPoolsJson as unknown as EarnPool[]
}
