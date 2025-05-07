import 'polyfills'
import { createRoot } from 'react-dom/client'
import App from './app'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://107782f294b8cc0089b1b8ed58f2b917@o4509282817015808.ingest.us.sentry.io/4509282817736704',
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
})

const root = createRoot(document.getElementById('root')!)

root.render(<App />)
