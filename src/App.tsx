import { i18n } from '@lingui/core'
import { Trans } from '@lingui/macro'
import { I18nProvider } from '@lingui/react'
import { useAtomValue } from 'jotai'
import { en, es } from 'make-plural/plurals'
import React, { useEffect } from 'react'
import { AlertCircle } from 'react-feather'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
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
import Layout from './components/layout'
import { messages as enMessages } from './locales/en/messages'
import { messages as esMessages } from './locales/es/messages'
import { theme } from './theme'
import Issuance from './views/issuance'

// Requires rToken to exist for route to render
const Guard = ({ children }: { children: React.ReactNode }) => {
  const rToken = useAtomValue(rTokenAtom)
  return !rToken ? (
    <Box sx={{ textAlign: 'center', color: 'lightText' }} mt={8}>
      <AlertCircle />
      <br />
      <Text sx={{ fontSize: 3, fontWeight: 300 }}>
        <Trans>No RToken data</Trans>
      </Text>
    </Box>
  ) : (
    <>{children}</>
  )
}

i18n.load('en', enMessages)
i18n.load('es', esMessages)

i18n.loadLocaleData({
  en: { plurals: en },
  es: { plurals: es },
})
i18n.activate('en')

/**
 * App Entry point - Handles views routing
 *
 * @returns {JSX.Element}
 */
const App = () => {
  if (process.env.REACT_APP_MAINTENANCE) {
    return <Text>Maintenance</Text>
  }

  return (
    <Router>
      <I18nProvider i18n={i18n}>
        <Web3Provider>
          <Updater />
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
                <Route
                  path={ROUTES.ISSUANCE}
                  element={
                    <Guard>
                      <Issuance />
                    </Guard>
                  }
                />
                <Route
                  path={ROUTES.INSURANCE}
                  element={
                    <Guard>
                      <Insurance />
                    </Guard>
                  }
                />
                <Route path={ROUTES.AUCTIONS} element={<Auctions />} />
                <Route path={ROUTES.DEPLOY} element={<Deploy />} />
                <Route path={ROUTES.MANAGEMENT} element={<Management />} />
                <Route path={ROUTES.GOVERNANCE} element={<Governance />} />
                <Route
                  path={`${ROUTES.GOVERNANCE_INFO}/:txId`}
                  element={<GovernanceConfigured />}
                />
              </Routes>
            </Layout>
          </ThemeProvider>
        </Web3Provider>
      </I18nProvider>
    </Router>
  )
}

export default App
