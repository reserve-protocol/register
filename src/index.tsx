import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { ChainId, DAppProvider, MULTICALL_ADDRESSES } from '@usedapp/core'
import { Provider as StoreProvider } from 'react-redux'
import { ApolloProvider } from '@apollo/client'
import apolloClient from './apollo/client'
import store from './state'
import './i18n'
import App from './App'

const config = {
  readOnlyChainId: ChainId.Hardhat,
  readOnlyUrls: {
    [ChainId.Localhost]: 'http://localhost:8545',
    [ChainId.Hardhat]: 'http://localhost:8545',
    [ChainId.Ropsten]:
      'https://ropsten.infura.io/v3/19deb2b36da947f493d2db11ce04be63',
  },
  multicallAddresses: {
    [ChainId.Localhost]: '0xc96304e3c037f81da488ed9dea1d8f2a48278a75',
    [ChainId.Hardhat]: '0xc96304e3c037f81da488ed9dea1d8f2a48278a75',
    ...MULTICALL_ADDRESSES,
  },
}

ReactDOM.render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <StoreProvider store={store}>
        <DAppProvider config={config}>
          <App />
        </DAppProvider>
      </StoreProvider>
    </ApolloProvider>
  </StrictMode>,
  document.getElementById('root')
)
