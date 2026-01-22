import 'polyfills'
import { createRoot } from 'react-dom/client'
import App from './app'

const root = createRoot(document.getElementById('root')!)

// Render app first, then initialize Sentry asynchronously
root.render(<App />)

// Defer Sentry init to avoid blocking first render
import('@sentry/react').then((Sentry) => {
  Sentry.init({
    dsn: 'https://b68198129f2305a28405a306efc7d779@o4509282817015808.ingest.us.sentry.io/4509282885566464',
    sendDefaultPii: true,
  })
})
