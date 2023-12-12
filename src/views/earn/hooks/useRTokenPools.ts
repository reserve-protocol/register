import { useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'
import { StringMap } from 'types'
import rtokens from '@lc-labs/rtokens'
import { RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { RSR } from 'utils/constants'

export interface Pool {
  symbol: string
  apy: number
  apyBase: number
  stablecoin: boolean
  project: string
  chain: string
  tvlUsd: number
  underlyingTokens: string[]
}

const listedRTokens = Object.values(rtokens).reduce((acc, curr) => {
  return { ...acc, ...curr }
}, {} as StringMap)

listedRTokens[RSR_ADDRESS[ChainId.Mainnet]] = RSR
listedRTokens[RSR_ADDRESS[ChainId.Base]] = RSR

const OTHER_POOL_TOKENS = {
  '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC': 'crvFRAX',
}

// TODO: May use a central Updater component for defillama data, currently being traversed twice for APYs and this
const useRTokenPools = () => {
  const { data, isLoading } = useSWRImmutable('https://yields.llama.fi/pools')

  return useMemo(() => {
    const pools: Pool[] = []

    if (data) {
      for (const pool of data.data) {
        const rToken = pool.underlyingTokens?.find(
          (token: string) => !!listedRTokens[token]
        )

        if (rToken && pool.project !== 'reserve') {
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

          pools.push({
            ...pool,
            symbol: poolSymbol,
          })
        }
      }
    }

    return { data: pools, isLoading }
  }, [data, isLoading])
}

export default useRTokenPools
