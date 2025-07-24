import { RateLimiter } from 'limiter'
import {
  OrderRequest,
  OrdersParams,
  Quote,
  QuoteRequest,
  TokenName,
} from 'universal-sdk'
import { BlockchainConfigs, TokenAddresses } from 'universal-sdk/dist/config'
import { Address } from 'viem'
import { universal } from './universal-api'

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
    return BlockchainConfigs.BASE.usdcAddress
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

  return {
    getQuote: async (quote: QuoteRequest) => {
      await limiter.removeTokens(1)
      return await universal.getQuote(quote)
    },
    getOrders: async (orders: OrdersParams) => {
      await limiter.removeTokens(1)
      return await universal.getOrders(orders)
    },
    submitOrder: async (order: OrderRequest) => {
      await limiter.removeTokens(1)
      return await universal.submitOrder(order)
    },
  }
}
