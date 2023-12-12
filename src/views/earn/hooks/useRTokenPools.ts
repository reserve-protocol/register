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
  apyReward: number
  stablecoin: boolean
  project: string
  chain: string
  tvlUsd: number
  underlyingTokens: string[]
  url: string
}

const listedRTokens = Object.values(rtokens).reduce((acc, curr) => {
  return { ...acc, ...curr }
}, {} as StringMap)

listedRTokens[RSR_ADDRESS[ChainId.Mainnet]] = RSR
listedRTokens[RSR_ADDRESS[ChainId.Base]] = RSR

const OTHER_POOL_TOKENS = {
  '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC': 'crvFRAX',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC',
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 'WETH',
  '0x853d955acef822db058eb8505911ed77f175b99e': 'FRAX',
}

const POOL_URL: StringMap = {
  // Curve
  '28c0ad15-ecaf-4b14-8ad6-06ded47566b1':
    'https://curve.fi/#/ethereum/pools/factory-tricrypto-21/deposit',
  '5a046093-29fc-4ecb-b90e-daccda151b5b':
    'https://curve.fi/#/ethereum/pools/factory-crypto-256/deposit',
  '817329d2-07cb-4cbd-82ac-eb9bc0add450':
    'https://curve.fi/#/ethereum/pools/factory-v2-277/deposit',
  '2faacc5b-7e32-46f3-84e2-061aed8f7f21':
    'https://curve.fi/#/ethereum/pools/factory-crypto-252/deposit',
  'd99d9bb0-8865-44ca-bdcc-1c2047e8b5a6':
    'https://curve.fi/#/ethereum/pools/factory-crypto-312/deposit',
  '3c76e848-3c17-4bc9-8d41-8c36b27368cd':
    'https://curve.fi/#/base/pools/factory-crypto-14/deposit',
  '4af07af7-4b66-4772-bfcc-395dfb5ef10e':
    'https://curve.fi/#/ethereum/pools/factory-crypto-136/deposit',
  // Convex
  'c04005c9-7e34-41a6-91c4-295834ed8ac0':
    'https://www.convexfinance.com/stake/ethereum/156',
  '74346f6f-c7ee-4506-a204-baf48e13decb':
    'https://www.convexfinance.com/stake/ethereum/185',
  'c8815168-ba35-4e7c-b7b1-a0b33b6c73bc':
    'https://www.convexfinance.com/stake/ethereum/183',
  '59efd00b-0613-42fc-9799-7e43a9350a5d':
    'https://www.convexfinance.com/stake/ethereum/238',
  '19131596-dddf-4a6c-af71-31f75cee6e6e':
    'https://www.convexfinance.com/stake/ethereum/125',

  // Yearn
  'f8eff410-1a99-49be-b3e1-23966a94b57b':
    'https://yearn.fi/vaults/1/0x6a7A0481e476827857704B87bdeE7922D058cbE4',
  '52dd9b80-774f-414b-bf57-83fa5335f707':
    'https://yearn.fi/vaults/1/0x849dC56ceCa7Cf55AbF5ec87910DA21c5C7dA581',
  '313de697-1863-4c81-bf57-6fe40976823b':
    'https://yearn.fi/vaults/1/0x5383C1Ab5beac04d6A6E6872Cc6a422f2Dc25576',
}

// TODO: May use a central Updater component for defillama data, currently being traversed twice for APYs and this
const useRTokenPools = () => {
  const { data, isLoading } = useSWRImmutable('https://yields.llama.fi/pools')

  return useMemo(() => {
    const pools: Pool[] = []

    const curve: string[] = []

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
            url: POOL_URL[pool.pool] || '',
          })
        }
      }

      console.log('curve', curve)
    }

    return { data: pools, isLoading }
  }, [data, isLoading])
}

export default useRTokenPools
