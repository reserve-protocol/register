import 'polyfills'
import { createRoot } from 'react-dom/client'
import App from './app'
import * as Sentry from '@sentry/react'
import { storeReferralFromUrl } from './utils/referral'

// Before render: React effects (legacy redirects, wallet link) must not run
// before the ?referral= code is captured.
storeReferralFromUrl()

Sentry.init({
  dsn: 'https://b68198129f2305a28405a306efc7d779@o4509282817015808.ingest.us.sentry.io/4509282885566464',
  sendDefaultPii: true,
})

const root = createRoot(document.getElementById('root')!)

root.render(<App />)
