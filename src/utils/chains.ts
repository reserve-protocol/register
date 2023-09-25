export const ChainId = {
  Mainnet: 1,
  Tenderly: 3,
  Goerli: 5,
  Base: 8453,
  BaseGoerli: 84531,
  Hardhat: 31337,
}

export const supportedChains = new Set(Object.values(ChainId))

export const SUBGRAPH_URL = {
  // Dev node
  [ChainId.Mainnet]: 'http://127.0.0.1:8000/subgraphs/name/lcamargof/reserve',
  // 'https://api.thegraph.com/subgraphs/name/lcamargof/reserve',
  [ChainId.Tenderly]: 'http://127.0.0.1:8000/subgraphs/name/lcamargof/reserve',
  [ChainId.BaseGoerli]:
    'https://api.studio.thegraph.com/query/11653/reserve-base-testnet/v0.0.3',
  [ChainId.Goerli]:
    'https://api.thegraph.com/subgraphs/name/lcamargof/reserve-goerli',
  [ChainId.Hardhat]:
    'https://api.thegraph.com/subgraphs/name/lcamargof/cryptoasdf',
}

const _defaultChain = Number(
  new URL(window.location.href.replace('/#/', '/')).searchParams.get('chainId')
)

export const defaultChain = supportedChains.has(_defaultChain)
  ? _defaultChain
  : ChainId.Mainnet
