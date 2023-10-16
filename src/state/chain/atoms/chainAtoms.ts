import { GraphQLClient } from 'graphql-request'
import { atom } from 'jotai'
import { ChainId, defaultChain } from 'utils/chains'
import { blockDuration } from 'utils/constants'
import { formatEther } from 'viem'
import { Address, PublicClient, WalletClient } from 'wagmi'
import rtokens from '@lc-labs/rtokens'

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

export const rTokenListAtom = atom((get) => {
  const chainId = get(chainIdAtom)

  return rtokens[chainId] ?? {}
})

export const allrTokenListAtom = atom((get) => {
  const ethereumTokens = rtokens[1]
  const baseTokens = rtokens[8453]

  return Object.fromEntries([
    ...Object.values(ethereumTokens).map(i => ([i.address, {...i, chainId: 1}])),
    ...Object.values(baseTokens).map(i => ([i.address, {...i, chainId: 8453}]))
  ]) as Record<string, typeof ethereumTokens[string] & {chainId: number}>
})

export const clientAtom = atom((get) =>
  get(walletClientAtom || get(publicClientAtom))
)

export const secondsPerBlockAtom = atom((get) => {
  const chainId = get(chainIdAtom)

  return blockDuration[chainId] || 12
})

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
  [ChainId.Base]:
    'https://graph-base.register.app/subgraphs/name/lcamargof/reserve',
  [ChainId.Hardhat]:
    'https://api.thegraph.com/subgraphs/name/lcamargof/reserve-test',
}

export const gqlClientAtom = atom(
  (get) =>
    new GraphQLClient(
      import.meta.env.VITE_SUBGRAPH_URL ||
        SUBGRAPH_URL[get(chainIdAtom)] ||
        SUBGRAPH_URL[ChainId.Mainnet]
    )
)
