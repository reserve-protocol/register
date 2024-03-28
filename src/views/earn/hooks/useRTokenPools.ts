import rtokens from '@lc-labs/rtokens'
import { gql } from 'graphql-request'
import { useCMSQuery } from 'hooks/useQuery'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { Pool, poolsAtom } from 'state/pools/atoms'
import useSWRImmutable from 'swr/immutable'
import { StringMap } from 'types'
import { EUSD_ADDRESS, RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { LP_PROJECTS, RSR } from 'utils/constants'
import {
  EXTRA_POOLS_BY_UNDERLYING_TOKEN,
  OTHER_POOL_TOKENS,
} from '../utils/constants'
import { mainnet } from 'wagmi'
import { base } from 'viem/chains'

// Only map what I care about the response...
interface DefillamaPool {
  symbol: string
  pool: string
  apy: number
  apyBase: number
  apyReward: number
  stablecoin: boolean
  project: string
  chain: string
  tvlUsd: number
  underlyingTokens: string[]
  rewardTokens: string[]
}

interface EarnPool {
  llamaId: string
  url: string
}

const listedRTokens = Object.values(rtokens).reduce((acc, curr) => {
  // Defillama has some addresses on lowercase... better to transform to lowercase than to an Address format
  const lowercaseAddresses = Object.keys(curr).reduce((tokens, key) => {
    tokens[key.toLowerCase()] = curr[key]
    return tokens
  }, {} as StringMap)

  return { ...acc, ...lowercaseAddresses }
}, {} as StringMap)

listedRTokens[RSR_ADDRESS[ChainId.Mainnet].toLowerCase()] = RSR
listedRTokens[RSR_ADDRESS[ChainId.Base].toLowerCase()] = RSR

// Bridged RTokens
listedRTokens['0xcfa3ef56d303ae4faaba0592388f19d7c3399fb4'] =
  listedRTokens[EUSD_ADDRESS[ChainId.Mainnet].toLowerCase()]

const earnPoolQuery = gql`
  query {
    earnPoolsCollection {
      items {
        llamaId
        url
      }
    }
  }
`

const getPoolsByUnderlying = (data: DefillamaPool[]): DefillamaPool[] => {
  return data.filter((pool) =>
    (pool.underlyingTokens || []).some(
      (underlyingToken) =>
        !!listedRTokens[underlyingToken?.toLowerCase()] ||
        EXTRA_POOLS_BY_UNDERLYING_TOKEN.includes(underlyingToken?.toLowerCase())
    )
  )
}

const getPoolsById = (
  data: DefillamaPool[],
  ids: string[]
): DefillamaPool[] => {
  return data.filter((pool) => ids.includes(pool.pool))
}

const removeDuplicates = (pools: DefillamaPool[]): DefillamaPool[] => {
  const poolMap = pools.reduce((acc, pool) => {
    acc[pool.pool] = pool
    return acc
  }, {} as Record<string, DefillamaPool>)
  return Object.values(poolMap)
}

const filterByChains = (
  pools: DefillamaPool[],
  chains: string[]
): DefillamaPool[] => {
  return pools.filter((pool) => chains.includes(pool.chain))
}

const removeByProject = (
  pools: DefillamaPool[],
  project: string
): DefillamaPool[] => {
  return pools.filter((pool) => pool.project !== project)
}

const enrichPoolUnderlyingAndId = (
  pools: DefillamaPool[]
): Omit<Pool, 'url'>[] => {
  return pools.map((pool) => ({
    ...pool,
    id: pool.pool,
    underlyingTokens: (pool.underlyingTokens || []).map((token: string) => {
      const address = token?.toLowerCase() ?? ''

      if (listedRTokens[address] && listedRTokens[address].symbol !== 'RSR') {
        return {
          ...listedRTokens[address],
          logo: `/svgs/${listedRTokens[address].logo.toLowerCase()}`,
        }
      }

      return (
        listedRTokens[address] ||
        OTHER_POOL_TOKENS[address] || {
          address: token,
          symbol: 'Unknown',
          logo: '',
        }
      )
    }),
  }))
}

const parsePoolSymbol = (pools: Omit<Pool, 'url'>[]): Omit<Pool, 'url'>[] => {
  return pools.map((pool) => {
    let poolSymbol: string = pool.symbol

    if (poolSymbol[poolSymbol.length - 1] === '-') {
      poolSymbol = poolSymbol.substring(0, poolSymbol.length - 1) + '+'
    }

    const separatorIndex = poolSymbol.indexOf('--')

    if (separatorIndex !== -1) {
      poolSymbol =
        poolSymbol.substring(0, separatorIndex) +
        '+' +
        poolSymbol.substring(separatorIndex + 1)
    }

    return {
      ...pool,
      symbol: poolSymbol,
    }
  })
}

const addPoolURL = (
  pools: Omit<Pool, 'url'>[],
  earnPools: EarnPool[]
): Pool[] => {
  return pools.map((pool) => {
    const url =
      earnPools.find((item) => item.llamaId === pool.id)?.url ||
      LP_PROJECTS[pool.project]?.site ||
      `https://defillama.com/yields/pool/${pool.id}`

    return {
      ...pool,
      url,
    }
  })
}

const mapPools = (data: DefillamaPool[], earnPools: EarnPool[]) => {
  const poolsByUnderlying = getPoolsByUnderlying(data)
  const ids = earnPools.map((pool) => pool.llamaId)
  const poolsById = getPoolsById(data, ids)

  const allPools = removeDuplicates([
    ...poolsByUnderlying,
    ...poolsById,
  ])

  const filteredPoolsByChains = filterByChains(allPools, [mainnet.name, base.name])
  const filteredPools = removeByProject(filteredPoolsByChains, 'reserve')
  const enrichedPools = enrichPoolUnderlyingAndId(filteredPools)
  const parsedPools = parsePoolSymbol(enrichedPools)
  const pools = addPoolURL(parsedPools, earnPools)

  return pools
}

// TODO: May use a central Updater component for defillama data, currently being traversed twice for APYs and this
const useRTokenPools = () => {
  const { data, isLoading } = useSWRImmutable('https://yields.llama.fi/pools')
  const { data: earnPools } = useCMSQuery(earnPoolQuery)

  const [poolsCache, setPools] = useAtom(poolsAtom)

  useEffect(() => {
    if (data && earnPools?.earnPoolsCollection?.items) {
      const pools = mapPools(
        data.data as DefillamaPool[],
        earnPools.earnPoolsCollection.items
      )
      setPools(pools)
    }
  }, [data, earnPools, setPools])

  return {
    data: poolsCache,
    isLoading,
  }
}

export default useRTokenPools
