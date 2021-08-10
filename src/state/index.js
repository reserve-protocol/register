import { configureStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

const PERSISTED = []

const store = configureStore({
  reducer: {

  },
  middleware: (getDefaultMiddleware) => (
    getDefaultMiddleware({ thunk: true })
      .concat(save({ states: PERSISTED, debounce: 1000 }))
  ),
  preloadedState: load({ states: PERSISTED }),
})

export default store
