import 'polyfills'
import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root')!)

root.render(<App />)

// @luis you probably can find a better place to stick this.
if (window.location.href.includes("localhost")||window.location.href.includes("staging")) {
    void import("./dev")
}