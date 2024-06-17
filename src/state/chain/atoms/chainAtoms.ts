import rtokens from '@reserve-protocol/rtokens'
import { GraphQLClient } from 'graphql-request'
import { atom } from 'jotai'
import { getCurrentTime } from 'utils'
import { atomWithLoadable } from 'utils/atoms/utils'
import { ChainId, defaultChain } from 'utils/chains'
import { blockDuration } from 'utils/constants'
import { formatEther } from 'viem'
import { Address } from 'wagmi'
/**
 * #########################
 * Chain state related atoms
 * #########################
 */
export const chainIdAtom = atom<number>(defaultChain)
export const blockAtom = atom<number | undefined>(undefined)
export const blockTimestampAtom = atom<number>(getCurrentTime())
// Acts as an application timer, basically it gets updated every minute which is a good debounce metric
export const timestampAtom = atom<number>(getCurrentTime())
export const debouncedBlockAtom = atom<number | undefined>(undefined)

export const walletAtom = atom<Address | null>(null)
export const walletChainAtom = atom<number | undefined>(undefined)
export const isWalletInvalidAtom = atom((get) => {
  const chainId = get(chainIdAtom)
  const walletChain = get(walletChainAtom)

  if (!walletChain) {
    return false
  }

  return chainId !== walletChain
})

export const rTokenListAtom = atom((get) => {
  const chainId = get(chainIdAtom)

  return rtokens[chainId] ?? {}
})

export const allrTokenListAtom = atom((get) => {
  const ethereumTokens = rtokens[ChainId.Mainnet]
  const baseTokens = rtokens[ChainId.Base]
  const arbitrumTokens = rtokens[ChainId.Arbitrum]

  return Object.fromEntries([
    ...Object.values(ethereumTokens).map((i) => [
      i.address,
      { ...i, chainId: 1 },
    ]),
    ...Object.values(baseTokens).map((i) => [
      i.address,
      { ...i, chainId: 8453 },
    ]),
    ...Object.values(arbitrumTokens).map((i) => [
      i.address,
      { ...i, chainId: 42161 },
    ]),
  ]) as Record<string, (typeof ethereumTokens)[string] & { chainId: number }>
})

export const secondsPerBlockAtom = atom((get) => {
  const chainId = get(chainIdAtom)

  return blockDuration[chainId] || 12
})

/**
 * ##################
 * Price related atom
 * ##################
 */

// TODO: ETH initial null state
export const ethPriceAtom = atom(1)
export const btcPriceAtom = atom<number | null>(null)
export const gasFeeAtom = atom<bigint | null>(null)
export const gasPriceAtom = atom(
  (get) => Number(formatEther(get(gasFeeAtom) || 0n)) * get(ethPriceAtom)
)

const cloudflareFallbackURLs = [
  'https://one.one.one.one/cdn-cgi/trace',
  'https://1.0.0.1/cdn-cgi/trace',
  'https://cloudflare-dns.com/cdn-cgi/trace',
  'https://cloudflare-eth.com/cdn-cgi/trace',
  'https://cloudflare-ipfs.com/cdn-cgi/trace',
  'https://workers.dev/cdn-cgi/trace',
  'https://pages.dev/cdn-cgi/trace',
  'https://cloudflare.tv/cdn-cgi/trace',
]

async function fetchWithFallback(links: string[]) {
  let response
  for (let link of links) {
    try {
      response = await fetch(link)
      if (response.ok) return response
    } catch (e) {}
  }
  return response
}

export const geolocationAtom = atomWithLoadable(async () => {
  try {
    let response = await fetchWithFallback(cloudflareFallbackURLs)

    if (!response) {
      throw new Error('No response')
    }

    const data = await response.text()
    let arr = data
      .trim()
      .split('\n')
      .map((e) => e.split('='))
    return Object.fromEntries(arr).loc as string
  } catch (e) {
    console.warn('Failed to get client location')
    return null
  }
})

export const SUBGRAPH_URL = {
  [ChainId.Mainnet]:
    'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/reserve-mainnet/api',
  [ChainId.Base]:
    'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/reserve-base/api',
  [ChainId.Arbitrum]:
    'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/reserve-arbitrum/api',
  [ChainId.Hardhat]:
    'https://api.thegraph.com/subgraphs/name/lcamargof/reserve-test',
}

// TODO: Multi fork network graph
export const GRAPH_CLIENTS = {
  [ChainId.Mainnet]: new GraphQLClient(
    import.meta.env.VITE_SUBGRAPH_URL || SUBGRAPH_URL[ChainId.Mainnet]
  ),
  [ChainId.Base]: new GraphQLClient(SUBGRAPH_URL[ChainId.Base]),
  [ChainId.Arbitrum]: new GraphQLClient(SUBGRAPH_URL[ChainId.Arbitrum]),
  CONTENTFUL: new GraphQLClient(
    `https://graphql.contentful.com/content/v1/spaces/9pqtywannd90/environments/master`,
    {
      headers: {
        authorization: `Bearer ${import.meta.env.VITE_CONTENTFUL_BEARER_TOKEN}`,
      },
    }
  ),
}

export const gqlClientAtom = atom(
  (get) => GRAPH_CLIENTS[get(chainIdAtom)] || GRAPH_CLIENTS[ChainId.Mainnet]
)

export const contentfulClientAtom = atom(() => GRAPH_CLIENTS['CONTENTFUL'])
