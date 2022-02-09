import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Wallet {
  address: string
  alias: string
}

export interface WalletsState {
  list: Wallet[]
  current: number | null
  balances: {
    [x: string]: {
      total: number
      [x: string]: number
    }
  }
}

const initialState: WalletsState = {
  list: [],
  current: null,
  balances: {},
}

export const walletsSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Wallet>) => {
      state.list = [...state.list, action.payload]
    },
    select: (state, action: PayloadAction<number>) => {
      state.current = action.payload
    },
    remove: (state, action: PayloadAction<number>) => {
      state.list.splice(action.payload, 1)
    },
  },
})

export const {
  add: addWallet,
  select: selectWallet,
  remove: removeWallet,
} = walletsSlice.actions

export default walletsSlice.reducer
