import { GraphQLClient } from 'graphql-request'
import { atom } from 'jotai'
import { ChainId, defaultChain, SUBGRAPH_URL } from 'utils/chains'
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

export const gqlClientAtom = atom(
  (get) =>
    new GraphQLClient(
      SUBGRAPH_URL[get(chainIdAtom)] || SUBGRAPH_URL[ChainId.Mainnet]
    )
)
