import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Wallet {
  address: string
  alias: string
}

export interface WalletsState {
  list: Wallet[]
  current: null | string
  connected: null | string
}

const initialState: WalletsState = {
  list: [],
  current: null,
  connected: null,
}

export const walletsSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Wallet>) => {
      state.list = [...state.list, action.payload]
    },
    addConnected: (state, action: PayloadAction<Wallet>) => {
      state.list = [...state.list, action.payload]
      state.connected = action.payload.address
      state.current = action.payload.address
    },
    connect: (state, action: PayloadAction<string>) => {
      state.connected = action.payload
    },
    select: (state, action: PayloadAction<string>) => {
      state.current = action.payload
    },
    remove: (state, action: PayloadAction<string>) => {
      const index = state.list.findIndex(
        (wallets: Wallet) => wallets.address === action.payload
      )
      state.list.splice(index, 1)
      if (state.current === action.payload) {
        state.current = null
      }
      if (state.connected === action.payload) {
        state.connected = null
      }
    },
  },
})

export const selectCurrentWallet = createSelector(
  (state: any) => [
    state.wallets.list,
    state.wallets.current,
    state.wallets.connected,
  ],
  ([list, current, connected]): [Wallet | null, Wallet | null] => {
    const currentWallet = list.find(
      (wallet: Wallet) => wallet.address === current
    )

    const connectedWallet =
      current === connected
        ? currentWallet
        : list.find((wallet: Wallet) => wallet.address === connected)

    return [currentWallet, connectedWallet]
  }
)

export const {
  add: addWallet,
  select: selectWallet,
  remove: removeWallet,
} = walletsSlice.actions

export default walletsSlice.reducer
