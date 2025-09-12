import rtokens from '@reserve-protocol/rtokens'
import { gql } from 'graphql-request'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { Pool, poolsAtom } from 'state/pools/atoms'
import useSWRImmutable from 'swr/immutable'
import { StringMap } from 'types'
import { EUSD_ADDRESS, RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import {
  BRIDGED_RTOKENS,
  LP_PROJECTS,
  NETWORKS,
  RSR,
  capitalize,
} from 'utils/constants'
import {
  EXTRA_POOLS_BY_UNDERLYING_TOKEN,
  OTHER_POOL_TOKENS,
} from '../utils/constants'
import { EarnPool, getEarnPools } from '@/lib/contentful'

// Only map what I care about the response...
interface DefillamaPool {
  symbol: string
  pool: string
  apy: number
  apyBase: number
  apyReward: number
  stablecoin: boolean
  poolMeta: string | null
  project: string
  chain: string
  tvlUsd: number
  underlyingTokens: string[]
  rewardTokens: string[]
}

const listedRTokens = Object.values(rtokens).reduce((acc, curr) => {
  // Defillama has some addresses on lowercase... better to transform to lowercase than to an Address format
  const lowercaseAddresses = Object.keys(curr).reduce((tokens, key) => {
    tokens[key.toLowerCase()] = curr[key]
    return tokens
  }, {} as StringMap)

  return { ...acc, ...lowercaseAddresses }
}, {} as StringMap)

// Include bridged RTokens
Object.values(BRIDGED_RTOKENS).forEach((bridge) => {
  Object.entries(bridge).forEach(([key, tokens]) => {
    const _token = listedRTokens[key.toLowerCase()]
    if (_token) {
      tokens.forEach((token) => {
        listedRTokens[token.address.toLowerCase()] = {
          ..._token,
          address: token.address,
        }
      })
    }
  })
})

listedRTokens[RSR_ADDRESS[ChainId.Mainnet].toLowerCase()] = RSR
listedRTokens[RSR_ADDRESS[ChainId.Base].toLowerCase()] = RSR

// Bridged RTokens
listedRTokens['0xcfa3ef56d303ae4faaba0592388f19d7c3399fb4'] =
  listedRTokens[EUSD_ADDRESS[ChainId.Mainnet].toLowerCase()]

const earnPoolQuery = gql`
  query {
    earnPoolsCollection(limit: 1000) {
      items {
        llamaId
        url
        underlyingTokens
        symbol
      }
    }
  }
`

const filterPools = (
  data: DefillamaPool[],
  ids?: string[]
): DefillamaPool[] => {
  return data.filter((pool) => {
    const isUnderlyingTokenValid = (pool.underlyingTokens || []).some(
      (underlyingToken) =>
        !!listedRTokens[underlyingToken?.toLowerCase()] ||
        EXTRA_POOLS_BY_UNDERLYING_TOKEN.includes(underlyingToken?.toLowerCase())
    )
    const includedId = ids ? ids.includes(pool.pool) : true
    return isUnderlyingTokenValid || includedId
  })
}

const filterByChains = (
  pools: DefillamaPool[],
  chains: string[]
): DefillamaPool[] => {
  return pools.filter((pool) => chains.includes(pool.chain))
}

const removeByProject = (
  pools: DefillamaPool[],
  ignoredProjects: string[]
): DefillamaPool[] => {
  return pools.filter((pool) => !ignoredProjects.includes(pool.project))
}

const enrichPoolUnderlyingAndId = (
  pools: DefillamaPool[],
  earnPools: EarnPool[]
): Omit<Pool, 'url'>[] => {
  return pools.map((pool) => {
    const cmsPool = earnPools.find((item) => item.llamaId === pool.pool)

    return {
      ...pool,
      id: pool.pool,
      symbol: `${pool.symbol}${
        pool.poolMeta?.toLowerCase()?.includes('lending')
          ? ' (Lending Pool)'
          : ''
      }`,
      underlyingTokens: (
        cmsPool?.underlyingTokens ||
        pool.underlyingTokens ||
        []
      ).map((token: string) => {
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
    }
  })
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

const addPoolCMSMetadata = (
  pools: Omit<Pool, 'url'>[],
  earnPools: EarnPool[]
): Pool[] => {
  return pools.map((pool) => {
    const cmsPool = earnPools.find((item) => item.llamaId === pool.id)
    const url =
      cmsPool?.url ||
      LP_PROJECTS[pool.project]?.site ||
      `https://defillama.com/yields/pool/${pool.id}`

    const symbol = cmsPool?.symbol || pool.symbol

    return {
      ...pool,
      url,
      symbol,
    }
  })
}

const mapPools = (data: DefillamaPool[], earnPools: EarnPool[]) => {
  const ids = earnPools.map((pool) => pool.llamaId)
  const filteredPools = filterPools(data, ids)

  const filteredPoolsByChains = filterByChains(
    filteredPools,
    Object.keys(NETWORKS).map((chain) => capitalize(chain))
  )
  const filteredPoolsByProject = removeByProject(filteredPoolsByChains, [
    'reserve',
    'reserve-protocol',
  ])

  const enrichedPools = enrichPoolUnderlyingAndId(
    filteredPoolsByProject,
    earnPools
  )
  const parsedPools = parsePoolSymbol(enrichedPools)
  const pools = addPoolCMSMetadata(parsedPools, earnPools)

  return pools
}

// TODO: May use a central Updater component for defillama data, currently being traversed twice for APYs and this
const useRTokenPools = () => {
  const { data, isLoading } = useSWRImmutable('https://yields.llama.fi/pools')
  const earnPools = getEarnPools()

  const [poolsCache, setPools] = useAtom(poolsAtom)

  useEffect(() => {
    if (data) {
      const pools = mapPools(data.data as DefillamaPool[], earnPools)
      setPools(pools)
    }
  }, [data, earnPools, setPools])

  return {
    data: poolsCache,
    isLoading,
  }
}

export default useRTokenPools
