import { GraphQLClient } from 'graphql-request'
import { atom } from 'jotai'
import { ChainId, defaultChain } from 'utils/chains'
import { formatEther } from 'viem'
import { Address, PublicClient, WalletClient } from 'wagmi'

/**
 * #########################
 * Chain state related atoms
 * #########################
 */
export const chainIdAtom = atom<number>(defaultChain)
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

export const SUBGRAPH_URL = {
  [ChainId.Mainnet]:
    'https://api.thegraph.com/subgraphs/name/lcamargof/reserve',
  [ChainId.BaseGoerli]:
    'https://api.studio.thegraph.com/query/11653/reserve-base-testnet/v0.0.3',
  [ChainId.Hardhat]:
    'https://api.thegraph.com/subgraphs/name/lcamargof/cryptoasdf',
}

export const gqlClientAtom = atom(
  (get) =>
    new GraphQLClient(
      import.meta.env.VITE_SUBGRAPH_URL ||
        SUBGRAPH_URL[get(chainIdAtom)] ||
        SUBGRAPH_URL[ChainId.Mainnet]
    )
)
