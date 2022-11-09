import Analytics from 'components/analytics/Analytics'
import ToastContainer from 'components/toaster-container/ToastContainer'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import Updater from 'state/updater'
import Web3Provider from 'state/web3'
import { ThemeProvider } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import Auctions from 'views/auctions'
import Deploy from 'views/deploy'
import Governance from 'views/management/governance-setup'
import GovernanceConfigured from 'views/management/governance-setup/views/GovernanceConfigured'
import Home from 'views/home'
import Management from 'views/management'
import Overview from 'views/overview'
import Insurance from 'views/staking'
import Tokens from 'views/tokens/Tokens'
import Layout from './components/layout'
import LanguageProvider from './i18n'
import { theme } from './theme'
import Issuance from './views/issuance'

/**
 * App Entry point - Handles views routing
 *
 * @returns {JSX.Element}
 */
const App = () => (
  <Router>
    <Analytics />
    <ThemeProvider theme={theme}>
      <LanguageProvider>
        <ToastContainer />
        <Web3Provider>
          <Updater />
          <Layout>
            <Routes>
              <Route path={ROUTES.HOME} element={<Home />} />
              <Route path={ROUTES.OVERVIEW} element={<Overview />} />
              <Route path={ROUTES.ISSUANCE} element={<Issuance />} />
              <Route path={ROUTES.INSURANCE} element={<Insurance />} />
              <Route path={ROUTES.AUCTIONS} element={<Auctions />} />
              <Route path={ROUTES.DEPLOY} element={<Deploy />} />
              <Route path={ROUTES.MANAGEMENT} element={<Management />} />
              <Route path={ROUTES.GOVERNANCE} element={<Governance />} />
              <Route
                path={`${ROUTES.GOVERNANCE_INFO}/:txId`}
                element={<GovernanceConfigured />}
              />
              <Route path={ROUTES.TOKENS} element={<Tokens />} />
            </Routes>
          </Layout>
        </Web3Provider>
      </LanguageProvider>
    </ThemeProvider>
  </Router>
)

export default App
