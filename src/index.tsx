import 'polyfills'
import { createRoot } from 'react-dom/client'
import App from './app'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://b68198129f2305a28405a306efc7d779@o4509282817015808.ingest.us.sentry.io/4509282885566464',
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
})

const root = createRoot(document.getElementById('root')!)

root.render(<App />)
