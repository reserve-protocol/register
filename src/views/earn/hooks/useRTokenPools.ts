import rtokens from '@lc-labs/rtokens'
import { gql } from 'graphql-request'
import { useCMSQuery } from 'hooks/useQuery'
import { useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { Pool, poolsAtom } from 'state/pools/atoms'
import useSWRImmutable from 'swr/immutable'
import { StringMap } from 'types'
import { EUSD_ADDRESS, RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { RSR } from 'utils/constants'

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

const OTHER_POOL_TOKENS: Record<
  string,
  { address: string; symbol: string; logo: string }
> = {
  '0x3175df0976dfa876431c2e9ee6bc45b65d3473cc': {
    address: '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC',
    symbol: 'FRAXBP',
    logo: '',
  },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    symbol: 'USDC',
    address: '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC',
    logo: '',
  },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
    symbol: 'WETH',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    logo: '',
  },
  '0x853d955acef822db058eb8505911ed77f175b99e': {
    symbol: 'FRAX',
    address: '0x853d955acef822db058eb8505911ed77f175b99e',
    logo: '',
  },
  '0x417ac0e078398c154edfadd9ef675d30be60af93': {
    symbol: 'crvUSD',
    address: '0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93',
    logo: '',
  },
}

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

// TODO: May use a central Updater component for defillama data, currently being traversed twice for APYs and this
const useRTokenPools = () => {
  const { data, isLoading } = useSWRImmutable('https://yields.llama.fi/pools')
  const { data: protocolsData } = useSWRImmutable(
    'https://api.llama.fi/protocols',
    (...args) => fetch(...args).then((res) => res.json())
  )
  const { data: earnPools } = useCMSQuery(earnPoolQuery)

  const [poolsCache, setPools] = useAtom(poolsAtom)

  const mapPools = useCallback(
    async (
      data: DefillamaPool[],
      earnPools: EarnPool[],
      protocolsData: any
    ) => {
      const pools: Pool[] = []

      for (const pool of data) {
        const rToken = pool.underlyingTokens?.find(
          (token: string) => !!listedRTokens[token.toLowerCase()]
        )

        if (rToken && pool.project !== 'reserve') {
          const underlyingTokens = pool.underlyingTokens.map(
            (token: string) => {
              const lowercasedAddress = token.toLowerCase()

              if (
                listedRTokens[lowercasedAddress] &&
                listedRTokens[lowercasedAddress].symbol !== 'RSR'
              ) {
                return {
                  ...listedRTokens[lowercasedAddress],
                  logo: `/svgs/${listedRTokens[lowercasedAddress].logo}`,
                }
              }

              return (
                listedRTokens[lowercasedAddress] ||
                OTHER_POOL_TOKENS[lowercasedAddress] || {
                  address: token,
                  symbol: 'Unknown',
                  logo: '',
                }
              )
            }
          )

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

          const url =
            earnPools.find((item: any) => item.llamaId === pool.pool)?.url ||
            protocolsData.find((item: any) => item.slug === pool.project)
              ?.url ||
            `https://defillama.com/yields/pool/${pool.pool}`

          pools.push({
            ...pool,
            id: pool.pool,
            symbol: poolSymbol,
            underlyingTokens,
            url,
          })
        }
      }
      setPools(pools)
    },
    [setPools]
  )

  useEffect(() => {
    if (data && earnPools?.earnPoolsCollection?.items && protocolsData) {
      mapPools(
        data.data as DefillamaPool[],
        earnPools.earnPoolsCollection.items,
        protocolsData
      )
    }
  }, [data, earnPools, protocolsData])

  return {
    data: poolsCache,
    isLoading,
  }
}

export default useRTokenPools
