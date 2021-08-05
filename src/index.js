import React from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'
import { ChainId, DAppProvider, MULTICALL_ADDRESSES } from '@usedapp/core'
import App from './App'
import reportWebVitals from './reportWebVitals'
import enTranslations from '@shopify/polaris/locales/en.json';
import { AppProvider as PolarisProvider } from '@shopify/polaris';

import '@shopify/polaris/dist/styles.css';
import './index.css'

const config = {
  readOnlyChainId: ChainId.Localhost,
  readOnlyUrls: {
    [ChainId.Localhost]: 'http://localhost:8545',
  },
  multicallAddresses: {
    [ChainId.Localhost]: '0x959922be3caee4b8cd9a407cc3ac1c251c2007b1',
    ...MULTICALL_ADDRESSES
  }
}

// TODO: remove Polaris in favor for a lightweigh solution
ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <PolarisProvider 
        i18n={enTranslations}
        linkComponent={Link}
      >
        <App />
      </PolarisProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
