import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import React, { useEffect } from 'react'
import { AlertCircle } from 'react-feather'
import ReactGA from 'react-ga'
import { Toaster } from 'react-hot-toast'
import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { rTokenAtom } from 'state/atoms'
import Updater from 'state/updater'
import Web3Provider from 'state/web3'
import { Box, Text, ThemeProvider } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import Auctions from 'views/auctions'
import Deploy from 'views/deploy'
import Governance from 'views/governance'
import GovernanceConfigured from 'views/governance/views/GovernanceConfigured'
import Home from 'views/home'
import Management from 'views/management'
import Overview from 'views/overview'
import Insurance from 'views/staking'
import Tokens from 'views/tokens/Tokens'
import Layout from './components/layout'
import LanguageProvider, { DEFAULT_LOCALE } from './i18n'
import { theme } from './theme'
import Issuance from './views/issuance'

const Analytics = () => {
  const location = useLocation()

  useEffect(() => {
    ReactGA.initialize('G-DMSRQ8XLEE')
    ReactGA.pageview(location.pathname + location.search)
  }, [location])

  return null
}

/**
 * App Entry point - Handles views routing
 *
 * @returns {JSX.Element}
 */
const App = () => {
  return (
    <Router>
      <LanguageProvider locale={DEFAULT_LOCALE}>
        <Web3Provider>
          <Updater />
          <Analytics />
          <ThemeProvider theme={theme}>
            <Toaster
              gutter={20}
              toastOptions={{
                position: 'bottom-right',
                style: {
                  width: 300,
                  background: 'var(--theme-ui-colors-contentBackground)',
                },
              }}
              containerStyle={{
                top: 40,
                left: 40,
                bottom: 40,
                right: 40,
              }}
            />
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
          </ThemeProvider>
        </Web3Provider>
      </LanguageProvider>
    </Router>
  )
}

export default App
