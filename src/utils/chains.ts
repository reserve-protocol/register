import type { AddEthereumChainParameter } from '@web3-react/types'

interface BasicChainInformation {
  urls: string[]
  name: string
}

interface ExtendedChainInformation extends BasicChainInformation {
  nativeCurrency: AddEthereumChainParameter['nativeCurrency']
  blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls']
}

export const ChainId = {
  Mainnet: 1,
  Hardhat: 31337,
}

export const DEFAULT_CHAIN = ChainId.Hardhat

export const CHAIN_ID =
  Number(process.env.REACT_APP_CHAIN_ID) || ChainId.Mainnet

/**
 * Supported chains
 */
export const CHAINS: {
  [chainId: number]: BasicChainInformation | ExtendedChainInformation
} = {
  [ChainId.Mainnet]: {
    urls: ['http://34.171.0.196:8545'],
    name: 'Mainnet',
  },
  // Hardhat
  [ChainId.Hardhat]: {
    urls: ['http://34.171.0.196:8545'],
    name: 'Hardhat',
  },
}

export const URLS: { [chainId: number]: string[] } = Object.keys(
  CHAINS
).reduce<{ [chainId: number]: string[] }>((accumulator, chainId) => {
  const validURLs: string[] = CHAINS[Number(chainId)].urls

  if (validURLs.length) {
    accumulator[Number(chainId)] = validURLs
  }

  return accumulator
}, {})
