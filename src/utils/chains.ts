export type AvailableChain = 1 | 8453 | 42161

export const ChainId = {
  Mainnet: 1,
  Base: 8453,
  Arbitrum: 42161,
}

export const supportedChains = new Set(Object.values(ChainId))

const _defaultChain = Number(
  new URL(window.location.href.replace('/#/', '/')).searchParams.get('chainId')
)

export const defaultChain = (
  supportedChains.has(_defaultChain) ? _defaultChain : ChainId.Mainnet
) as AvailableChain
