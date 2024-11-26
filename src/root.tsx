import Analytics from 'components/analytics/Analytics'
import ToastContainer from 'components/toaster-container/ToastContainer'
import TransactionSidebar from 'components/transactions/manager/TransactionSidebar'
import mixpanel from 'mixpanel-browser'
import { useEffect } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { useNavigate } from 'react-router-dom'
import ChainProvider from 'state/chain'
import Updater from 'state/updater'
import { ThemeUIProvider } from 'theme-ui'
import { getTokenRoute } from 'utils'
import BaseLayout from './components/layout'
import LanguageProvider from './i18n'
import { theme } from './theme'

mixpanel.init(import.meta.env.VITE_MIXPANEL_KEY || 'mixpanel_key', {
  track_pageview: true,
})

// Support for old routes redirects
const Redirects = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const search = new URL(window.location.href.replace('/#/', '/'))
      .searchParams
    const token = search.get('token')
    const chain = search.get('chainId')

    if (token && chain) {
      navigate(getTokenRoute(token, +chain))
    }
  }, [])

  return null
}

const ExternalScripts = () => (
  <>
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-DMSRQ8XLEE"
    ></script>
    <script
      defer
      src="https://broadcast.coinbase.com/subscribe-button.js"
    ></script>
  </>
)

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.cdnfonts.com/css/satoshi" rel="stylesheet" />

        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Reserve Register is an open source
    interface for the Reserve protocol to explore, research, and interact with
    asset-backed currencies called RTokens, create and launch new RTokens, stake
    and unstake Reserve Rights tokens ($RSR), and more."
        />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <title>Reserve Register - Reserve Protocol Interface</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">{children}</div>
        <ScrollRestoration />
        <Scripts />
      </body>
      {/* <ExternalScripts /> */}
    </html>
  )
}

export default function Root() {
  return (
    <ThemeUIProvider theme={theme}>
      <Redirects />
      <Analytics />
      <LanguageProvider>
        <ChainProvider>
          <Updater />
          <TransactionSidebar />
          <BaseLayout>
            <ToastContainer />
            <Outlet />
          </BaseLayout>
        </ChainProvider>
      </LanguageProvider>
    </ThemeUIProvider>
  )
}
