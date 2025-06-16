import { Token } from '@/types'
import { RateLimiter } from 'limiter'
import { Quote, TokenName, UniversalRelayerSDK } from 'universal-sdk'
import { TokenAddresses } from 'universal-sdk/dist/config'
import { Address } from 'viem'

export type CustomUniversalQuote = {
  userAddress: Address
  buyToken: Address
  sellToken: Address
  type: 'BUY' | 'SELL'
  sellAmount: bigint
  buyAmount: bigint
  validTo: number
  _originalQuote: Quote
}

const universalTokenMap: Record<Address, TokenName> = Object.entries(
  TokenAddresses
).reduce(
  (acc, [tokenName, address]) => ({
    ...acc,
    [address.toLowerCase()]: tokenName as TokenName,
  }),
  {} as Record<Address, TokenName>
)

export const getUniversalTokenName = (token: Address) => {
  return universalTokenMap[token.toLowerCase() as Address] as TokenName
}

export const getUniversalTokenAddress = (token: TokenName) => {
  // @ts-expect-error - USDC is not in the universalTokenMap but we need it for the universal SDK
  if (token === 'USDC') {
    return '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  }

  return Object.keys(universalTokenMap).find(
    (key) => universalTokenMap[key as Address] === token
  ) as Address
}

export const createUniversalSdkWrapper = () => {
  const limiter = new RateLimiter({
    tokensPerInterval: 1,
    interval: 750,
  })
  const sdk = new UniversalRelayerSDK()

  return {
    getQuote: async (quote: Parameters<typeof sdk.getQuote>[0]) => {
      await limiter.removeTokens(1)

      return sdk.getQuote(quote)
    },
    getOrders: async (orders: Parameters<typeof sdk.getOrders>[0]) => {
      await limiter.removeTokens(1)
      return sdk.getOrders(orders)
    },
    submitOrder: async (order: Parameters<typeof sdk.submitOrder>[0]) => {
      await limiter.removeTokens(1)

      return sdk.submitOrder(order)
    },
  }
}
