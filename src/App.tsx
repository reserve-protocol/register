import AppRoutes from './AppRoutes'
import Analytics from 'components/analytics/Analytics'
import ToastContainer from 'components/toaster-container/ToastContainer'
import TransactionSidebar from 'components/transactions/manager/TransactionSidebar'
import mixpanel from 'mixpanel-browser'
import { BrowserRouter as Router, ScrollRestoration } from 'react-router-dom'
import ChainProvider from 'state/chain'
import Updater from 'state/updater'
import { ThemeProvider } from 'theme-ui'
import Layout from './components/layout'
import LanguageProvider from './i18n'
import { theme } from './theme'

mixpanel.init(import.meta.env.VITE_MIXPANEL_KEY || 'mixpanel_key', {
  track_pageview: true,
})
/**
 * App Entry point
 *
 * @returns {JSX.Element}
 */
const App = () => {
  return (
    <Router>
      <Analytics />
      <ThemeProvider theme={theme}>
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
      </ThemeProvider>
    </Router>
  )
}

export default App
