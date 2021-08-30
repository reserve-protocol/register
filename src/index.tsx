import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { ChainId, DAppProvider, MULTICALL_ADDRESSES } from '@usedapp/core'
import enTranslations from '@shopify/polaris/locales/en.json'
import { AppProvider as PolarisProvider } from '@shopify/polaris'
import { Provider as StoreProvider } from 'react-redux'
import { ApolloProvider } from '@apollo/client'
import apolloClient from './apollo/client'
import store from './state'
import App from './App'

// Polaris styles
// TODO: Remove when polaris is removed from the app
import '@shopify/polaris/dist/styles.css'

const config = {
  readOnlyChainId: ChainId.Hardhat,
  readOnlyUrls: {
    [ChainId.Localhost]: 'http://localhost:8545',
    [ChainId.Hardhat]: 'http://localhost:8545',
  },
  multicallAddresses: {
    [ChainId.Localhost]: '0xa51c1fc2f0d1a1b8494ed1fe312d7c3a78ed91c0',
    [ChainId.Hardhat]: '0xa51c1fc2f0d1a1b8494ed1fe312d7c3a78ed91c0',
    ...MULTICALL_ADDRESSES,
  },
}

// TODO: remove Polaris in favor for a lightweigh solution
ReactDOM.render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <StoreProvider store={store}>
        <DAppProvider config={config}>
          <PolarisProvider i18n={enTranslations}>
            <App />
          </PolarisProvider>
        </DAppProvider>
      </StoreProvider>
    </ApolloProvider>
  </StrictMode>,
  document.getElementById('root')
)
