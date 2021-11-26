import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BigNumber, BigNumberish } from 'ethers'

export interface IToken {
  address: string
  symbol: string
  name: string
  decimals: number
  supply?: { total: number }
}

export interface ICollateral {
  id: string
  ratio: BigNumber
  token: IToken
}

export interface IVault {
  id: string
  collaterals: ICollateral[]
}

// TODO: Token as base interface
export interface IReserveToken {
  id: string
  mood: string
  staked: BigNumber
  rToken: IToken
  rsr: IToken
  stToken: IToken
  vault: IVault
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
    // TODO: Typings
    loadTokens: (state, action: PayloadAction<any[]>) => {
      state.list = action.payload.reduce((acc, data) => {
        acc[data.id.toLowerCase()] = data as IReserveToken

        return acc
      }, {})
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
  ([current, list]): IReserveToken | null =>
    current ? list[current.toLowerCase()] : null
)

export const selectBasket = createSelector(
  (state: any) => [state.reserveTokens.current, state.reserveTokens.baskets],
  ([current, baskets]): IBasketToken[] => (current ? baskets[current] : [])
)

export const { loadTokens, updateBalance, setCurrent } =
  reserveTokenSlice.actions

export default reserveTokenSlice.reducer
