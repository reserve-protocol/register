import { Token } from '@/types'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'
import { Address, Hex } from 'viem'

export enum QuoteProvider {
  CowSwap = 'CowSwap',
  Universal = 'Universal',
}

export type QuoteAggregated =
  | {
      token: Token
      success: false
    }
  | {
      token: Token
      success: true
      type: QuoteProvider.CowSwap
      data: OrderQuoteResponse
    }
  | {
      token: Token
      success: true
      type: QuoteProvider.Universal
      data: unknown // TODO: Type Universal Quote Response
    }

export type AsyncSwapQuote = {
  token: string
  symbol: string
  quote: {
    quote: {
      sellToken: Address
      buyToken: Address
      receiver: Address
      sellAmount: string
      buyAmount: string
      validTo: number
      appData: Hex
      feeAmount: string
      kind: string
      partiallyFillable: boolean
      sellTokenBalance: string
      buyTokenBalance: string
      signingScheme: string
    }
    from: string
    expiration: string
    id: number
    verified: boolean
  }
}

export type AsyncSwapResponse = {
  universalQuotes: AsyncSwapQuote[] // TODO: review it
  cowswapQuotes: AsyncSwapQuote[]
}

export type AsyncSwapOrder = {
  orderId: string
  quote: AsyncSwapQuote['quote']['quote']
  status: {
    type:
      | 'open'
      | 'scheduled'
      | 'active'
      | 'solved'
      | 'executing'
      | 'traded'
      | 'cancelled'
  }
}

export type AsyncSwapOrderResponse = {
  swapOrderId: string
  chainId: number
  signer: Address
  dtf: Address
  amountOut: string
  universalOrders: AsyncSwapOrder[] // TODO: review it
  cowswapOrders: AsyncSwapOrder[]
  createdAt: string
}
