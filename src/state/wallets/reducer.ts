import { shortenAddress } from '@usedapp/core'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Wallet {
  address: string
  alias: string
}

export interface WalletsState {
  list: { [x: string]: Wallet }
  current: null | string
  balances: { [x: string]: { [x: string]: number } }
  // TODO: Track stake/rewards
}

const initialState: WalletsState = {
  list: {},
  // Current wallet is the one take into account to show information on the dashboard
  // For Issuance/Redemption and Stake/Unstake the connected wallet is the one to use otherwise those pages are blocked
  current: null,
  // Represent the balances for the tracked accounts
  // This balances are fetched from theGraph
  balances: {},
}

export const walletsSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Wallet>) => {
      state.list[action.payload.address] = action.payload
      state.current = action.payload.address
    },
    addConnected: (state, action: PayloadAction<string>) => {
      if (!state.list[action.payload]) {
        state.list[action.payload] = {
          address: action.payload,
          alias: shortenAddress(action.payload),
        }
      }
      state.current = action.payload
    },
    select: (state, action: PayloadAction<string>) => {
      state.current = action.payload
    },
    remove: (state, action: PayloadAction<string>) => {
      delete state.list[action.payload]

      if (state.current === action.payload) {
        state.current = null
      }
    },
  },
})

export const {
  add: addWallet,
  addConnected: addConnectedWallet,
  select: selectWallet,
  remove: removeWallet,
} = walletsSlice.actions

export default walletsSlice.reducer
