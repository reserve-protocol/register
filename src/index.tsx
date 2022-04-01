import { ApolloProvider } from '@apollo/client'
import { ChainId, DAppProvider } from '@usedapp/core'
import { MULTICALL_ADDRESS } from 'constants/addresses'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as StoreProvider } from 'react-redux'
import apolloClient from './apollo/client'
import App from './App'
import { CHAIN_ID } from './constants'
import './i18n'
import store from './state'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
