import AppRoutes from 'AppRoutes'
import Analytics from 'components/analytics/Analytics'
import ToastContainer from 'components/toaster-container/ToastContainer'
import TransactionSidebar from 'components/transactions/manager/TransactionSidebar'
import mixpanel from 'mixpanel-browser'
import { BrowserRouter as Router } from 'react-router-dom'
import ChainProvider from 'state/chain'
import Updater from 'state/updater'
<<<<<<< HEAD
import { ThemeProvider } from 'theme-ui'
=======
import { Flex, Spinner, ThemeProvider } from 'theme-ui'
import { supportedChains } from 'utils/chains'
import { ROUTES } from 'utils/constants'
import Auctions from 'views/auctions'
import Deploy from 'views/deploy'
import GovernanceSetup from 'views/deploy/components/Governance'
import EarnWrapper from 'views/earn'
import GovernanceProposal from 'views/governance/views/proposal'
import GovernanceProposalDetail from 'views/governance/views/proposal-detail'
import Home from 'views/home'
import Overview from 'views/overview'
import PortfolioWrapper from 'views/portfolio'
import Management from 'views/settings'
import Staking from 'views/staking'
import Tokens from 'views/tokens/Tokens'
import { useSwitchNetwork } from 'wagmi'
>>>>>>> origin/master
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
