import { ApolloProvider } from '@apollo/client'
import { ChainId, DAppProvider, MULTICALL_ADDRESSES } from '@usedapp/core'
import { getAddress } from 'constants/addresses'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider as StoreProvider } from 'react-redux'
import apolloClient from './apollo/client'
import App from './App'
import './i18n'
import store from './state'

const config = {
  readOnlyChainId: ChainId.Hardhat,
  readOnlyUrls: {
    [ChainId.Hardhat]: 'http://localhost:8545',
    [ChainId.Ropsten]:
      'https://ropsten.infura.io/v3/19deb2b36da947f493d2db11ce04be63',
  },
  multicallAddresses: {
    [ChainId.Hardhat]: getAddress(ChainId.Hardhat, 'MULTICALL'),
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
