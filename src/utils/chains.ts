export const ChainId = {
  Mainnet: 1,
  Tenderly: 3,
  Goerli: 5,
  Hardhat: 31337,
}

export const supportedChains = new Set(Object.values(ChainId))
