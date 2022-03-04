import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Wallet {
  address: string
  alias: string
}

export interface WalletsState {
  list: Wallet[]
  current: null | string
}

const initialState: WalletsState = {
  list: [],
  current: null,
}

export const walletsSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Wallet>) => {
      state.list = [...state.list, action.payload]
    },
    select: (state, action: PayloadAction<string>) => {
      state.current = action.payload
    },
    remove: (state, action: PayloadAction<number>) => {
      state.list.splice(action.payload, 1)
    },
  },
})

export const selectCurrentWallet = createSelector(
  (state: any) => [
    state.wallets.list,
    state.wallets.current,
    state.wallets.connected,
  ],
  ([list, current, connected]) => {
    const currentWallet = list.find(
      (wallet: Wallet) => wallet.address === current
    )

    const connectedWallet =
      current === connected
        ? currentWallet
        : list.find((wallet: Wallet) => wallet.address === connected)

    return {
      current: currentWallet,
      connected: connectedWallet,
    }
  }
)

export const {
  add: addWallet,
  select: selectWallet,
  remove: removeWallet,
} = walletsSlice.actions

export default walletsSlice.reducer
