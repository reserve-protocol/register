import { configureStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'
import coinsApi from './service/coins'
import reserveTokens from './reserve-tokens/reducer'
import wallets from './wallets/reducer'

const PERSISTED: string[] = []

const store = configureStore({
  reducer: {
    [coinsApi.reducerPath]: coinsApi.reducer,
    reserveTokens,
    wallets,
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({ thunk: true }).concat(
  //     save({ states: PERSISTED, debounce: 1000 })
  //   ),
  // // preloadedState: load({ states: PERSISTED }),
})

export default store
export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
