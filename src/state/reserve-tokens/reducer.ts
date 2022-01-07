import RSV from 'constants/rsv'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ReserveToken } from 'types'

export interface ReserveTokenState {
  list: { [x: string]: ReserveToken }
  current: string | null
  balances: { [x: string]: number }
}

const initialState: ReserveTokenState = {
  // TODO: fetched prop if progress indicator if needed
  list: {
    [RSV.id]: RSV,
  },
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
        acc[data.id.toLowerCase()] = {
          id: data.id.toLowerCase(),
          token: {
            ...data.token,
            supply: data.token.supply?.total || 0,
          },
          vault: data.vault,
          insurance: {
            staked: data.staked,
            token: data.stToken,
          },
        } as ReserveToken

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
  ([current, list]): ReserveToken | null =>
    current ? list[current.toLowerCase()] : null
)

// Get top 5 tokens including the selected token on top
export const selectTopTokens = createSelector(
  (state: any) => [state.reserveTokens.current, state.reserveTokens.list],
  (params) => {
    const [current, list] = <[string, ReserveTokenState['list']]>params
    const result: ReserveToken[] = []

    if (!list || !Object.keys(list).length) {
      return result
    }

    if (!list[current]) {
      return Object.values(list).slice(0, 5)
    }

    return [
      <ReserveToken>list[current],
      ...Object.values(list)
        .reduce<ReserveToken[]>((prev, curr): ReserveToken[] => {
          if (curr.id === current) {
            return prev
          }

          return [...prev, curr]
        }, [])
        .slice(0, 4),
    ]
  }
)

export const { loadTokens, updateBalance, setCurrent } =
  reserveTokenSlice.actions

export default reserveTokenSlice.reducer
