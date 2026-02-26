import { INDEX_GRAPH_CLIENTS } from '@/state/chain/atoms/chainAtoms'
import { RESERVE_API } from '@/utils/constants'
import { PERMISSIONLESS_VOTE_LOCK } from '@/views/index-dtf/deploy/permissionless-defaults'
import { Address, formatEther } from 'viem'
import { ACTIVE_CHAINS, TOP100_QUERY } from './constants'
import { Top100DTF } from './types'

const MAX_CONCURRENT = 5

const fetchWithConcurrency = async <T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  limit: number
) => {
  const queue = [...items]
  const workers = Array.from(
    { length: Math.min(limit, queue.length) },
    async () => {
      while (queue.length > 0) {
        const item = queue.shift()!
        await fn(item)
      }
    }
  )
  await Promise.all(workers)
}

type SubgraphDTF = {
  id: string
  timestamp: string
  token: {
    name: string
    symbol: string
    totalSupply: string
    currentHolderCount: number
  }
}

export const fetchSubgraphDTFs = async (): Promise<Top100DTF[]> => {
  const allDTFs: Top100DTF[] = []

  for (const chainId of ACTIVE_CHAINS) {
    try {
      const client = INDEX_GRAPH_CLIENTS[chainId]
      if (!client) continue

      const voteLockAddr = PERMISSIONLESS_VOTE_LOCK[chainId]
      if (!voteLockAddr) continue

      const response = await client.request<{ dtfs: SubgraphDTF[] }>(
        TOP100_QUERY,
        { first: 100, voteLockAddress: voteLockAddr.toLowerCase() }
      )

      for (const dtf of response.dtfs) {
        allDTFs.push({
          address: dtf.id as Address,
          name: dtf.token.name,
          symbol: dtf.token.symbol,
          chainId,
          totalSupply: dtf.token.totalSupply,
          currentHolderCount: dtf.token.currentHolderCount,
          timestamp: Number(dtf.timestamp),
          price: null,
          marketCap: null,
          basket: [],
        })
      }
    } catch (error) {
      console.error(`Failed to fetch DTFs from chain ${chainId}:`, error)
    }
  }

  allDTFs.sort((a, b) => b.timestamp - a.timestamp)
  return allDTFs
}

type PriceResponse = {
  price?: number
  basket?: { address: string; symbol: string; weight?: string }[]
}

export type PriceResult = Record<
  string,
  { price: number; basket: PriceResponse['basket'] }
>

export const fetchPricesAndBaskets = async (
  dtfs: Top100DTF[]
): Promise<PriceResult> => {
  const results: PriceResult = {}

  await fetchWithConcurrency(
    dtfs,
    async (dtf) => {
      try {
        const response = await fetch(
          `${RESERVE_API}current/dtf?address=${dtf.address}&chainId=${dtf.chainId}`
        )
        if (!response.ok) return

        const data: PriceResponse = await response.json()
        if (data.price) {
          const key = `${dtf.chainId}-${dtf.address.toLowerCase()}`
          results[key] = { price: data.price, basket: data.basket }
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${dtf.address}:`, error)
      }
    },
    MAX_CONCURRENT
  )

  return results
}

type BrandData = { icon?: string; cover?: string; tags?: string[] }
type BrandResponse = {
  status: string
  parsedData?: { dtf?: BrandData }
}

export type BrandResult = Record<string, BrandData>

export const fetchBrands = async (
  dtfs: Top100DTF[]
): Promise<BrandResult> => {
  const results: BrandResult = {}

  await fetchWithConcurrency(
    dtfs,
    async (dtf) => {
      try {
        const response = await fetch(
          `${RESERVE_API}folio-manager/read?folio=${dtf.address}&chainId=${dtf.chainId}`
        )
        if (!response.ok) return

        const data: BrandResponse = await response.json()
        if (data.status === 'ok' && data.parsedData?.dtf) {
          const key = `${dtf.chainId}-${dtf.address.toLowerCase()}`
          results[key] = data.parsedData.dtf
        }
      } catch (error) {
        console.error(`Failed to fetch brand for ${dtf.address}:`, error)
      }
    },
    MAX_CONCURRENT
  )

  return results
}

export const enrichDTFs = (
  dtfs: Top100DTF[],
  prices: PriceResult,
  brands: BrandResult
): Top100DTF[] => {
  return dtfs.map((dtf) => {
    const key = `${dtf.chainId}-${dtf.address.toLowerCase()}`
    const priceData = prices[key]
    const brandData = brands[key]

    const price = priceData?.price ?? null
    const supply = Number(formatEther(BigInt(dtf.totalSupply)))
    const marketCap = price !== null ? supply * price : null

    return {
      ...dtf,
      price,
      marketCap,
      basket: (priceData?.basket ?? []) as Top100DTF['basket'],
      brand: brandData,
    }
  })
}
