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
  token: IToken
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
  // TODO: fetched prop if progress indicator if needed
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

// Get top 5 tokens including the selected token on top
export const selectTopTokens = createSelector(
  (state: any) => [state.reserveTokens.current, state.reserveTokens.list],
  (params) => {
    const [current, list] = <[string, ReserveTokenState['list']]>params
    const result: IReserveToken[] = []

    if (!list || !Object.keys(list).length || !current) {
      return result
    }

    return [
      <IReserveToken>list[current],
      ...Object.values(list)
        .reduce<IReserveToken[]>((prev, curr): IReserveToken[] => {
          if (curr.id === current) {
            return prev
          }

          return [...prev, curr]
        }, [])
        .slice(0, 5),
    ]
  }
)

export const { loadTokens, updateBalance, setCurrent } =
  reserveTokenSlice.actions

export default reserveTokenSlice.reducer
