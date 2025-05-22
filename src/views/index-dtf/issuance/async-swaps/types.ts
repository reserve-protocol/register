import { Token } from '@/types'
import { EnrichedOrder, OrderQuoteResponse } from '@cowprotocol/cow-sdk'
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

export type AsyncSwapOrderResponse = {
  swapOrderId: string
  chainId: number
  signer: Address
  dtf: Address
  amountOut: string
  universalOrders: any[] // TODO: review it
  cowswapOrders: (EnrichedOrder & { orderId: string })[]
  createdAt: string
}
