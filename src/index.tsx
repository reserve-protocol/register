import "./patch"

import { createRoot } from 'react-dom/client'
import App from './App'

import { Buffer } from 'buffer'
window.Buffer = window.Buffer || Buffer

const root = createRoot(document.getElementById('root')!)

root.render(<App />)
