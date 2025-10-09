import { mainnet, base, arbitrum, bsc } from 'viem/chains'

export type AvailableChain =
  | typeof mainnet.id
  | typeof base.id
  | typeof arbitrum.id
  | typeof bsc.id

export const ChainId: Record<string, number> = {
  Mainnet: mainnet.id,
  Base: base.id,
  Arbitrum: arbitrum.id,
  BSC: bsc.id,
}

export const supportedChains = new Set(Object.values(ChainId))

const _defaultChain = Number(
  new URL(window.location.href.replace('/#/', '/')).searchParams.get('chainId')
)

export const defaultChain = (
  supportedChains.has(_defaultChain) ? _defaultChain : ChainId.Mainnet
) as AvailableChain
