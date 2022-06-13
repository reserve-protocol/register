import { Card, Container } from 'components'
import { useAtomValue } from 'jotai'
import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { rTokenAtom, selectedAccountAtom } from 'state/atoms'
import Updater from 'state/updater'
import Web3Provider from 'state/web3'
import { ThemeProvider } from 'theme-ui'
import Home from 'views/home'
import Overview from 'views/overview'
import Insurance from 'views/staking'
import WalletManagement from 'views/wallet'
import Layout from './components/layout'
import { theme } from './theme'
import { Toaster } from 'react-hot-toast'
import Issuance from './views/issuance'
import { ROUTES } from 'utils/constants'
import { i18n } from '@lingui/core'
import { en, es } from 'make-plural/plurals'
import { I18nProvider } from '@lingui/react'
import { messages as esMessages } from './locales/es/messages'
import { messages as enMessages } from './locales/en/messages'
import Deploy from 'views/deploy'
import DeployIntro from 'views/deploy/components/DeployIntro'

// Requires rToken to be selected and a wallet connected
// TODO: Better placeholders
const Guard = ({ children }: { children: React.ReactNode }) => {
  const account = useAtomValue(selectedAccountAtom)
  const RToken = useAtomValue(rTokenAtom)

  // TODO: Connect your wallet placeholder
  if (!account) {
    return (
      <Container pt={4} pb={4}>
        <Card>Please connect your wallet...</Card>
      </Container>
    )
  }

  // TODO: Loading placeholder
  if (!RToken) {
    return (
      <Container pt={4} pb={4}>
        <Card>Loading ReserveToken...</Card>
      </Container>
    )
  }

  return <>{children}</>
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
const App = () => (
  <Router>
    <I18nProvider i18n={i18n}>
      <Web3Provider>
        <Updater />
        <ThemeProvider theme={theme}>
          <Toaster
            gutter={20}
            toastOptions={{ position: 'bottom-right', style: { width: 300 } }}
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
              <Route path={ROUTES.WALLET} element={<WalletManagement />} />
              <Route path={ROUTES.DEPLOY} element={<DeployIntro />} />
              <Route path={ROUTES.DEPLOY_SETUP} element={<Deploy />} />
            </Routes>
          </Layout>
        </ThemeProvider>
      </Web3Provider>
    </I18nProvider>
  </Router>
)

export default App
