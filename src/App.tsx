import Analytics from 'components/analytics/Analytics'
import ToastContainer from 'components/toaster-container/ToastContainer'
import TransactionSidebar from 'components/transactions/manager/TransactionSidebar'
import mixpanel from 'mixpanel-browser'
import { useEffect } from 'react'
import {
  BrowserRouter as Router,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import ChainProvider from 'state/chain'
import Updater from 'state/updater'
import { ThemeUIProvider } from 'theme-ui'
import { getTokenRoute } from 'utils'
import AppRoutes from './AppRoutes'
import Layout from './components/layout'
import LanguageProvider from './i18n'
import { theme } from './theme'

mixpanel.init(import.meta.env.VITE_MIXPANEL_KEY || 'mixpanel_key', {
  track_pageview: true,
})

const queryClient = new QueryClient()

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

/**
 * App Entry point
 *
 * @returns {JSX.Element}
 */
const App = () => (
  <Router>
    <Analytics />
    <Redirects />
    <ScrollToTop />
    <ThemeUIProvider theme={theme}>
      <LanguageProvider>
        <ChainProvider>
          <Updater />
          <TransactionSidebar />
          <Layout>
            <ToastContainer />
            <AppRoutes />
          </Layout>
        </ChainProvider>
      </LanguageProvider>
    </ThemeUIProvider>
  </Router>
)

export default App
