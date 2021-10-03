import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BigNumber, BigNumberish } from 'ethers'

// TODO: Token as base interface
export interface IReserveToken {
  address: string
  symbol: string
  name: string
  decimals: number
  basketSize: number
  insurancePool: string
}

export interface IBasketToken {
  basketIndex: number
  address: string
  symbol: string
  name: string
  decimals: number
  genesisQuantity: BigNumberish
  maxTrade: BigNumberish
  priceInRToken: BigNumberish
  rateLimit: BigNumberish
  slippageTolerance: BigNumberish
}

export interface ReserveTokenState {
  list: { [x: string]: IReserveToken }
  current: string | null
  baskets: { [x: string]: IBasketToken[] }
  balances: { [x: string]: BigNumber }
}

const initialState: ReserveTokenState = {
  list: {},
  current: null,
  baskets: {},
  balances: {},
}

export const reserveTokenSlice = createSlice({
  name: 'reserveTokens',
  initialState,
  reducers: {
    loadTokens: (
      state,
      action: PayloadAction<{ [x: string]: IReserveToken }>
    ) => {
      state.list = { ...state.list, ...action.payload }
    },
    loadBasket: (
      state,
      action: PayloadAction<{ [x: string]: IBasketToken[] }>
    ) => {
      state.baskets = { ...state.baskets, ...action.payload }
    },
    updateBalance: (
      state,
      action: PayloadAction<{ [x: string]: BigNumber }>
    ) => {
      state.balances = { ...state.balances, ...action.payload }
    },
    setCurrent: (state, action: PayloadAction<string>) => {
      state.current = action.payload
    },
  },
})

export const selectCurrentRToken = createSelector(
  (state: any) => [state.reserveTokens.current, state.reserveTokens.list],
  ([current, list]): IReserveToken | null => (current ? list[current] : null)
)

export const { loadTokens, loadBasket, updateBalance, setCurrent } =
  reserveTokenSlice.actions

export default reserveTokenSlice.reducer
