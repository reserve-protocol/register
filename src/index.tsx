import 'polyfills'
import * as Sentry from '@sentry/react'
import { createRoot } from 'react-dom/client'
import App from './app'

const root = createRoot(document.getElementById('root')!)

root.render(<App />)

// Defer Sentry init to after first render to avoid blocking FCP
requestIdleCallback(
  () => {
    Sentry.init({
      dsn: 'https://b68198129f2305a28405a306efc7d779@o4509282817015808.ingest.us.sentry.io/4509282885566464',
      sendDefaultPii: true,
    })
  },
  { timeout: 2000 }
)
