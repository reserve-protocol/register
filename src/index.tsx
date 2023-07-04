import { createRoot } from 'react-dom/client'
import App from './App'
import 'polyfills'

const root = createRoot(document.getElementById('root')!)

root.render(<App />)
