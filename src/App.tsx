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

/**
 * App Entry point - Handles views routing
 *
 * @returns {JSX.Element}
 */
const App = () => (
  <Web3Provider>
    <Updater />
    <ThemeProvider theme={theme}>
      <Toaster />
      <Router>
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
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  </Web3Provider>
)

export default App
