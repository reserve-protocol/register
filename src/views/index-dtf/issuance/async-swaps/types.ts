import { Token } from '@/types'
import { EnrichedOrder, OrderQuoteResponse } from '@cowprotocol/cow-sdk'

export type QuoteAggregated =
  | {
      token: Token
      success: false
    }
  | {
      token: Token
      success: true
      data: OrderQuoteResponse
    }

export type AsyncSwapOrderResponse = {
  cowswapOrders: (EnrichedOrder & { orderId: string })[]
}
