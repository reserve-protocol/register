export const ChainId = {
  Mainnet: 1,
  Tenderly: 3,
  Goerli: 5,
  Base: 8453,
  BaseGoerli: 84531,
  Hardhat: 31337,
}

export const supportedChains = new Set(Object.values(ChainId))

const _defaultChain = Number(
  new URL(window.location.href.replace('/#/', '/')).searchParams.get('chainId')
)

export const defaultChain = supportedChains.has(_defaultChain)
  ? _defaultChain
  : ChainId.Mainnet
