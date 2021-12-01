import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface IToken {
  address: string
  symbol: string
  name: string
  decimals: number
  transfersCount?: number
  holdersCount?: number
  supply?: { total: number }
}

export interface ICollateral {
  id: string
  index: number
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
  staked: number
  rToken: IToken
  rsr: IToken
  stToken: IToken
  vault: IVault
}

export interface ReserveTokenState {
  list: { [x: string]: IReserveToken }
  current: string | null
  balances: { [x: string]: number }
}

const initialState: ReserveTokenState = {
  list: {},
  current: null,
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
    updateBalance: (state, action: PayloadAction<{ [x: string]: number }>) => {
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

export const { loadTokens, updateBalance, setCurrent } =
  reserveTokenSlice.actions

export default reserveTokenSlice.reducer
