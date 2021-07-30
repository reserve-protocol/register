import React from 'react'
import ReactDOM from 'react-dom'
import { ChainId, DAppProvider } from '@usedapp/core'
import App from './App'
import './index.css'
import reportWebVitals from './reportWebVitals'

const config = {
  readOnlyChainId: ChainId.Localhost,
  // readOnlyUrls: {
  //   [ChainId.Localhost]: 'https://mainnet.infura.io/v3/62687d1a985d4508b2b7a24827551934',
  // },
}

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
