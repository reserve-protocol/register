import { BigNumberish, BigNumber } from 'ethers'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// TODO: Token as base interface
export interface IReserveToken {
  address: string
  symbol: string
  name: string
}

export interface IBasketToken {
  basketIndex: number
  address: string
  symbol: string
  name: string
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

export const counterSlice = createSlice({
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

export const { loadTokens, loadBasket, updateBalance, setCurrent } =
  counterSlice.actions

export default counterSlice.reducer
