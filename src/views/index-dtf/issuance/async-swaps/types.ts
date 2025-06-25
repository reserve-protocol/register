import { Token } from '@/types'
import { EnrichedOrder, OrderQuoteResponse } from '@cowprotocol/cow-sdk'
import { Quote } from 'universal-sdk'
import { CustomUniversalQuote } from './providers/universal'

export enum QuoteProvider {
  CowSwap = 'CowSwap',
  Universal = 'Universal',
}

export type CowswapQuote = {
  token: Token
  success: true
  type: QuoteProvider.CowSwap
  data: OrderQuoteResponse
}

export type UniversalQuote = {
  token: Token
  success: true
  type: QuoteProvider.Universal
  data: CustomUniversalQuote
}

export type QuoteAggregated =
  | {
      token: Token
      success: false
    }
  | CowswapQuote
  | UniversalQuote

export type UniversalOrder = Quote & {
  orderId: string
  transactionHash: string
}

export type AsyncSwapOrderResponse = {
  cowswapOrders: (EnrichedOrder & { orderId: string })[]
}
