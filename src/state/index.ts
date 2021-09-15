import { configureStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'
import coinsApi from './service/coins'

const PERSISTED: string[] = []

const store = configureStore({
  reducer: {
    [coinsApi.reducerPath]: coinsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true }).concat(
      save({ states: PERSISTED, debounce: 1000 })
    ),
  preloadedState: load({ states: PERSISTED }),
})

export default store
