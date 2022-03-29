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

// DAppProvider configuration
const config = {
  readOnlyChainId: CHAIN_ID,
  readOnlyUrls: {
    // [ChainId.Mainnet]: 'http://localhost:8545',
    [ChainId.Hardhat]: 'http://192.168.3.51:8545',
  },
  multicallAddresses: MULTICALL_ADDRESS,
}

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <StoreProvider store={store}>
        <DAppProvider config={config}>
          <App />
        </DAppProvider>
      </StoreProvider>
    </ApolloProvider>
  </StrictMode>
)
