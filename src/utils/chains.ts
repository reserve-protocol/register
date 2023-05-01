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
  Goerli: 5,
  Hardhat: 31337,
}

export const CHAIN_ID =
  Number(process.env.REACT_APP_CHAIN_ID) || ChainId.Mainnet

/**
 * Supported chains
 */
export const CHAINS: {
  [chainId: number]: BasicChainInformation | ExtendedChainInformation
} = {
  [ChainId.Mainnet]: {
    urls: [
      'https://cloudflare-eth.com/v1/mainnet',
      'https://rpc.ankr.com/eth',
      'https://eth-mainnet.public.blastapi.io',
    ],
    name: 'Mainnet',
  },
  [ChainId.Goerli]: {
    urls: ['https://rpc.ankr.com/eth_goerli'],
    name: 'Goerli',
  },
  // Hardhat
  [ChainId.Hardhat]: {
    urls: ['http://127.0.0.1:8546/'],
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
