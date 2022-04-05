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
  Hardhat: 1337,
}

export const CHAIN_ID =
  Number(process.env.REACT_APP_CHAIN_ID) || ChainId.Mainnet

export const CHAINS: {
  [chainId: number]: BasicChainInformation | ExtendedChainInformation
} = {
  [ChainId.Mainnet]: {
    urls: ['https://cloudflare-eth.com'],
    name: 'Mainnet',
  },
  // Hardhat
  [ChainId.Hardhat]: {
    urls: ['http://192.168.3.51:8545'],
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
