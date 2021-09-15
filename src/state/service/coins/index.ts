import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'

export interface ICoinMarketQuery {
  vs_currency: string
  order: string
  per_page: number
  page: number
  sparkline?: boolean
  ids?: string
  category?: string
  price_change_percentage?: string
}

const coinsApi = createApi({
  reducerPath: 'coinsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.coingecko.com/api/v3' }),
  endpoints: (builder) => ({
    getTokenMarketList: builder.query({
      query: (params: ICoinMarketQuery) => ({
        url: '/coins/markets',
        params,
      }),
    }),
  }),
})

export default coinsApi
