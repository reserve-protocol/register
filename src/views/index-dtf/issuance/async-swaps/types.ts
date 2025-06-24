import { Token } from '@/types'
import { EnrichedOrder, OrderQuoteResponse } from '@cowprotocol/cow-sdk'
import { Quote } from 'universal-sdk'
import { Address } from 'viem'
import { CustomUniversalQuote } from './providers/universal'

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
      data: CustomUniversalQuote
    }

export type UniversalOrder = Quote & {
  orderId: string
  transactionHash: string
}

export type AsyncSwapOrderResponse = {
  cowswapOrders: (EnrichedOrder & { orderId: string })[]
}
