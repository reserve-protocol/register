import { createRoot } from 'react-dom/client'
import App from './App'

// TODO: WalletConnect workaround for CRA webpack v5
import { Buffer } from 'buffer'
window.Buffer = window.Buffer || Buffer

const root = createRoot(document.getElementById('root')!)

root.render(<App />)
