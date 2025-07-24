import { RESERVE_API } from '@/utils/constants'
import type {
  OrderRequest,
  OrderResponse,
  OrdersParams,
  OrdersResponse,
  Quote,
  QuoteRequest,
} from 'universal-sdk'

// const API_BASE_URL = RESERVE_API
const API_BASE_URL = 'http://localhost:3000/'

const getQuote = async (quote: QuoteRequest): Promise<Quote> => {
  const queryParams = new URLSearchParams({
    type: quote.type,
    token: quote.token,
    pair_token: quote.pair_token,
    blockchain: quote.blockchain,
    user_address: quote.user_address,
    ...(quote.token_amount && { token_amount: quote.token_amount }),
    ...(quote.pair_token_amount && {
      pair_token_amount: quote.pair_token_amount,
    }),
    ...(quote.slippage_bips !== undefined && {
      slippage_bips: quote.slippage_bips.toString(),
    }),
  })

  const response = await fetch(
    `${API_BASE_URL}universal/quote?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get quote')
  }

  return response.json()
}

const submitOrder = async (order: OrderRequest): Promise<OrderResponse> => {
  const response = await fetch(`${API_BASE_URL}universal/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to submit order')
  }

  return response.json()
}

const getOrders = async (params?: OrdersParams): Promise<OrdersResponse> => {
  const queryParams = new URLSearchParams()

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString())
      }
    })
  }

  const url = queryParams.toString()
    ? `${API_BASE_URL}universal/orders?${queryParams}`
    : `${API_BASE_URL}universal/orders`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get orders')
  }

  return response.json()
}

export const universal = {
  getQuote,
  submitOrder,
  getOrders,
}
