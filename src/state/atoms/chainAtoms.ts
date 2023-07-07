import { providers } from 'ethers'
import { GraphQLClient } from 'graphql-request'
import { atom } from 'jotai'
import { ChainId, supportedChains } from 'utils/chains'
import { Address, PublicClient, WalletClient } from 'wagmi'

/**
 * #########################
 * Chain state related atoms
 * #########################
 */
export const chainIdAtom = atom<number>(1)
export const blockAtom = atom<number | undefined>(undefined)
export const blockTimestampAtom = atom<number>(0)
export const walletAtom = atom<Address | null>(null)
export const providerAtom = atom(
  undefined as undefined | providers.Web3Provider
)

export const walletClientAtom = atom<WalletClient | undefined>(undefined)
export const publicClientAtom = atom<PublicClient | undefined>(undefined)

export const clientAtom = atom((get) =>
  get(walletClientAtom || get(publicClientAtom))
)

export const getValidWeb3Atom = atom((get) => {
  const provider = get(providerAtom)
  const account = get(walletAtom)
  const chainId = get(chainIdAtom)

  if (!provider || !supportedChains.has(chainId)) {
    return { provider: null, account: null, chainId: null }
  }

  return { provider, account, chainId }
})

export const web3Atom = atom((get) => {
  const account = get(walletAtom)
  const publicClient = get(publicClientAtom)
  const walletClient = get(walletClientAtom)
  const chainId = get(chainIdAtom)

  if (account && walletClient) {
    return { chainId, client: walletClient, account }
  }

  return {
    chainId,
    client: publicClient,
  }
})

const SUBGRAPH_URL = {
  // Dev node
  // [ChainId.Mainnet]: 'http://127.0.0.1:8000/subgraphs/name/lcamargof/reserve',
  [ChainId.Mainnet]:
    'https://api.thegraph.com/subgraphs/name/lcamargof/cryptoasdf', // TODO: CHange to mainnet
  [ChainId.Goerli]:
    'https://api.thegraph.com/subgraphs/name/lcamargof/reserve-goerli',
}

export const gqlClientAtom = atom(
  (get) =>
    new GraphQLClient(
      SUBGRAPH_URL[get(chainIdAtom)] || SUBGRAPH_URL[ChainId.Mainnet]
    )
)
