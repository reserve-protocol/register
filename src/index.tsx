import 'polyfills'
import { createRoot } from 'react-dom/client'
import App from './app'
import * as Sentry from '@sentry/react'
import { storeReferralFromUrl } from './utils/referral'

// Before render: React effects (legacy redirects, wallet link) must not run
// before the ?referral= code is captured.
storeReferralFromUrl()

Sentry.init({
  dsn: 'https://a1035072f1595cfb8c8650f0594adf56@o4512169834643456.ingest.us.sentry.io/4512169868001280',
  sendDefaultPii: true,
})

const root = createRoot(document.getElementById('root')!)

root.render(<App />)
