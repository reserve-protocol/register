import { useQuery } from '@tanstack/react-query'
import rtokens from '@reserve-protocol/rtokens'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { Pool, poolsAtom } from 'state/pools/atoms'
import { StringMap } from 'types'
import { EUSD_ADDRESS, RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import {
  BRIDGED_INDEX_DTFS,
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
import { EarnPool, getEarnPools } from '@/lib/meta'
import useIndexDTFList from '@/hooks/useIndexDTFList'

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

const listedDTFs = Object.values(rtokens).reduce((acc, curr) => {
  // Defillama has some addresses on lowercase... better to transform to lowercase than to an Address format
  const lowercaseAddresses = Object.keys(curr).reduce((tokens, key) => {
    tokens[key.toLowerCase()] = curr[key]
    return tokens
  }, {} as StringMap)

  return { ...acc, ...lowercaseAddresses }
}, {} as StringMap)

// Include bridged Yield DTFs
Object.values(BRIDGED_RTOKENS).forEach((bridge) => {
  Object.entries(bridge).forEach(([key, tokens]) => {
    const _token = listedDTFs[key.toLowerCase()]
    if (_token) {
      tokens.forEach((token) => {
        listedDTFs[token.address.toLowerCase()] = {
          ..._token,
          address: token.address,
        }
      })
    }
  })
})

listedDTFs[RSR_ADDRESS[ChainId.Mainnet].toLowerCase()] = RSR
listedDTFs[RSR_ADDRESS[ChainId.Base].toLowerCase()] = RSR

// Bridged Yield DTFs
listedDTFs['0xcfa3ef56d303ae4faaba0592388f19d7c3399fb4'] =
  listedDTFs[EUSD_ADDRESS[ChainId.Mainnet].toLowerCase()]
const filterPools = (
  data: DefillamaPool[],
  ids?: string[],
  additionalDTFs: StringMap = {}
): DefillamaPool[] => {
  const allDTFs = { ...listedDTFs, ...additionalDTFs }
  return data.filter((pool) => {
    const isUnderlyingTokenValid = (pool.underlyingTokens || []).some(
      (underlyingToken) =>
        !!allDTFs[underlyingToken?.toLowerCase()] ||
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
  earnPools: EarnPool[],
  additionalDTFs: StringMap = {}
): Omit<Pool, 'url'>[] => {
  const allDTFs = { ...listedDTFs, ...additionalDTFs }
  return pools.map((pool) => {
    const cmsPool = earnPools.find((item) => item.llamaId === pool.pool)
    const chainId = NETWORKS[pool.chain.toLowerCase()]

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

        if (allDTFs[address] && allDTFs[address].symbol !== 'RSR') {
          // For Yield DTFs: logo is just filename (e.g., "eusd.svg")
          // For Index DTFs: logo is full URL (e.g., "https://...")
          const logo = allDTFs[address].logo.startsWith('http')
            ? allDTFs[address].logo // Keep Index DTF URL as-is
            : `/svgs/${allDTFs[address].logo.toLowerCase()}` // Prepend for Yield DTFs

          return {
            ...allDTFs[address],
            logo,
            chain: chainId,
          }
        }

        return (
          allDTFs[address] ||
          OTHER_POOL_TOKENS[address] || {
            address: token,
            symbol: 'Unknown',
            logo: '',
            chain: chainId,
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
  earnPools: EarnPool[],
  additionalDTFs: StringMap = {}
): Pool[] => {
  return pools.map((pool) => {
    const cmsPool = earnPools.find((item) => item.llamaId === pool.id)
    let url =
      cmsPool?.url ||
      LP_PROJECTS[pool.project]?.site ||
      `https://defillama.com/yields/pool/${pool.id}`

    const symbol = cmsPool?.symbol || pool.symbol

    // Adds query param to the first protocol related token for aerodrome pools
    if (url == 'https://aerodrome.finance/') {
      const alldtfs = { ...listedDTFs, ...additionalDTFs }
      // find the dtf or rtoken related to the pool
      const dtf = pool.underlyingTokens.find((token) => {
        return !!alldtfs[token.address.toLowerCase()]
      })
      url += `liquidity?query=${dtf?.symbol}`
    }

    return {
      ...pool,
      url,
      symbol,
    }
  })
}

const mapPools = (
  data: DefillamaPool[],
  earnPools: EarnPool[],
  additionalDTFs: StringMap = {}
) => {
  const ids = earnPools.map((pool) => pool.llamaId)
  const filteredPools = filterPools(data, ids, additionalDTFs)

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
    earnPools,
    additionalDTFs
  )
  const parsedPools = parsePoolSymbol(enrichedPools)
  const pools = addPoolCMSMetadata(parsedPools, earnPools, additionalDTFs)

  return pools
}

const useRTokenPools = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['llama-pools'],
    queryFn: () => fetch('https://yields.llama.fi/pools').then((res) => res.json()),
    staleTime: 1000 * 60 * 60, // 1 hour - mimics useSWRImmutable behavior
  })
  const earnPools = getEarnPools()
  const { data: indexDTFs } = useIndexDTFList()

  const [poolsCache, setPools] = useAtom(poolsAtom)

  useEffect(() => {
    if (data && indexDTFs) {
      const indexDTFsMap = indexDTFs.reduce((acc, dtf) => {
        acc[dtf.address.toLowerCase()] = {
          address: dtf.address,
          symbol: dtf.symbol,
          name: dtf.name,
          logo: dtf.brand?.icon || '',
        }
        return acc
      }, {} as StringMap)

      // Include bridged Index DTFs
      Object.entries(BRIDGED_INDEX_DTFS).forEach(([address, bridges]) => {
        const _token = indexDTFsMap[address]
        if (_token) {
          bridges.forEach((bridge) => {
            const bridgeAddr = bridge.address.toLowerCase()
            if (!indexDTFsMap[bridgeAddr]) {
              indexDTFsMap[bridgeAddr] = {
                ..._token,
                address: bridge.address,
              }
            }
          })
        }
      })

      const pools = mapPools(
        data.data as DefillamaPool[],
        earnPools,
        indexDTFsMap
      )
      setPools(pools)
    }
  }, [data, earnPools, indexDTFs, setPools])

  return {
    data: poolsCache,
    isLoading: isLoading || !indexDTFs,
  }
}

export default useRTokenPools
