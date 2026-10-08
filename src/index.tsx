import 'polyfills'
import { createRoot } from 'react-dom/client'
import App from './app'
import * as Sentry from '@sentry/react'
import { storeReferralFromUrl } from './utils/referral'

// Before render: React effects (legacy redirects, wallet link) must not run
// before the ?referral= code is captured.
storeReferralFromUrl()

const { hostname } = window.location

Sentry.init({
  dsn: 'https://a1035072f1595cfb8c8650f0594adf56@o4512169834643456.ingest.us.sentry.io/4512169868001280',
  sendDefaultPii: true,
  // Local dev and e2e preview servers were reporting into production issues.
  enabled:
    import.meta.env.PROD && !['localhost', '127.0.0.1'].includes(hostname),
  environment: hostname === 'app.reserve.org' ? 'production' : 'preview',
})

const root = createRoot(document.getElementById('root')!)

root.render(<App />)
