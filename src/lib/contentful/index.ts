export type ComponentToken = {
  id?: string
  tokenTicker: string
  name?: string
  addresses?: Record<string, any>
  color?: string
  logo?: { url: string }
  rating?: string
  website?: string
  description: string
}

export type Protocol = {
  id: string
  protocolName: string
  protocolDescription?: string
  protocolSocials?: string[]
  website?: string
  docs?: string
  logo?: { url: string }
  color?: string
}

export type CollateralAsset = {
  name?: string
  id: string
  displaySymbol?: string
  addresses?: Record<string, any>
  protocol?: Protocol
  color?: string
  llamaId?: string
  tokenDistribution?: Record<string, any>
  description?: string
  tokensCollection?: { items: ComponentToken[] }
}

export type EarnPool = {
  description: string
  llamaId: string
  url: string
  underlyingTokens: string[]
  symbol: string
}

import collateralJson from './collateral-assets.json' assert { type: 'json' }
import tokensJson from './component-tokens.json' assert { type: 'json' }
import protocolsJson from './protocols.json' assert { type: 'json' }
import earnPoolsJson from './earn-pools.json' assert { type: 'json' }

export function getCollaterals(): CollateralAsset[] {
  return collateralJson as unknown as CollateralAsset[]
}
export function getComponentTokens(): ComponentToken[] {
  return tokensJson as unknown as ComponentToken[]
}
export function getProtocols(): Protocol[] {
  return protocolsJson as unknown as Protocol[]
}
export function getEarnPools(): EarnPool[] {
  return earnPoolsJson as unknown as EarnPool[]
}
