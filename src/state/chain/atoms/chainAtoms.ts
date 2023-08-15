import { GraphQLClient } from 'graphql-request'
import { atom } from 'jotai'
import { ChainId } from 'utils/chains'
import { formatEther } from 'viem'
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

export const walletClientAtom = atom<WalletClient | undefined>(undefined)
export const publicClientAtom = atom<PublicClient | undefined>(undefined)

export const clientAtom = atom((get) =>
  get(walletClientAtom || get(publicClientAtom))
)

/**
 * ##################
 * Price related atom
 * ##################
 */

export const ethPriceAtom = atom(1)
export const gasFeeAtom = atom<bigint | null>(null)
export const gasPriceAtom = atom((get) =>
  Number(formatEther(get(gasFeeAtom) || 0n))
)

const SUBGRAPH_URL = {
  // Dev node
  [ChainId.Mainnet]:
    'https://api.thegraph.com/subgraphs/name/lcamargof/cryptoasdf', // TODO: CHange to mainnet
  [ChainId.Tenderly]: 'http://127.0.0.1:8000/subgraphs/name/lcamargof/reserve',
  [ChainId.Goerli]:
    'https://api.thegraph.com/subgraphs/name/lcamargof/reserve-goerli',
}

export const gqlClientAtom = atom(
  (get) =>
    new GraphQLClient(
      SUBGRAPH_URL[get(chainIdAtom)] || SUBGRAPH_URL[ChainId.Mainnet]
    )
)