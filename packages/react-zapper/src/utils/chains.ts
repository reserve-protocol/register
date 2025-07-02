import { mainnet, base, arbitrum } from 'viem/chains'
export type AvailableChain =
  | typeof mainnet.id
  | typeof base.id
  | typeof arbitrum.id

export const ChainId: Record<string, number> = {
  Mainnet: mainnet.id,
  Base: base.id,
  Arbitrum: arbitrum.id,
} as const
