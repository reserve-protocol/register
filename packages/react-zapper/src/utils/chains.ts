import { mainnet, base, arbitrum } from 'viem/chains'
export type AvailableChain =
  | typeof mainnet.id
  | typeof base.id
  | typeof arbitrum.id

export const ChainId = {
  Mainnet: mainnet.id,
  Base: base.id,
  Arbitrum: arbitrum.id,
} as const

// Supported chains set - kept for future chain validation
// export const supportedChains = new Set(Object.values(ChainId))
