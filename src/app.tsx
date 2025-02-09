import ToastContainer from '@/components/old/toaster-container/ToastContainer'
import RouteAnalytics from '@/components/utils/route-analytics'
import TransactionSidebar from 'components/transactions/manager/TransactionSidebar'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import {
  BrowserRouter as Router,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import ChainProvider from 'state/chain'
import Updater from 'state/updater'
import { ThemeUIProvider } from 'theme-ui'
import { getTokenRoute } from 'utils'
import AppRoutes from './app-routes'
import Layout from './components/layout'
import LanguageProvider from './i18n'
import { theme } from './theme'
import { Toaster } from './components/ui/sonner'

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

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    document.getElementById('app-container')?.scrollTo(0, 0)
  }, [pathname])

  return null
}

const handleError = (error: Error) => {
  if (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed')
  ) {
    window.location.reload()
  } else {
    console.error(error)
  }
}

function FallbackUI({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="bg-secondary flex flex-col gap-4 justify-center items-center">
      <div className="bg-card container rounded-3xl p-4">
        <h1 className="text-3xl text-center mb-2">
          An unexpected error ocurred
        </h1>
        <p className="text-destructive">Error: {error.message}</p>
        <code className="text-sm bg-muted p-4 block whitespace-pre-wrap rounded-lg font-mono overflow-x-auto">
          {error.stack}
        </code>
        <div className="flex justify-center mt-4 items-center gap-2">
          <button
            onClick={() => {
              window.location.reload()
            }}
            className="bg-primary text-primary-foreground rounded-full px-4 py-2"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * App Entry point
 *
 * @returns {JSX.Element}
 */
const App = () => (
  <ErrorBoundary FallbackComponent={FallbackUI} onError={handleError}>
    <Router>
      <RouteAnalytics />
      <Redirects />
      <ScrollToTop />
      <ThemeUIProvider theme={theme}>
        <LanguageProvider>
          <ChainProvider>
            <Updater />
            <TransactionSidebar />
            <Layout>
              <Toaster />
              <ToastContainer />
              <AppRoutes />
            </Layout>
          </ChainProvider>
        </LanguageProvider>
      </ThemeUIProvider>
    </Router>
  </ErrorBoundary>
)

export default App
