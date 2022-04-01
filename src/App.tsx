import { useEthers } from '@usedapp/core'
import { Web3ReactProvider } from '@web3-react/core'
import { Card } from 'components'
import Container from 'components/container'
import connectors from 'components/wallets/connectors'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useAppSelector } from 'state/hooks'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import Updater from 'state/reserve-tokens/updater'
import { ThemeProvider } from 'theme-ui'
import Home from 'views/home'
import Overview from 'views/overview'
import Insurance from 'views/staking'
import WalletManagement from 'views/wallet'
import Layout from './components/layout'
import { ROUTES } from './constants'
import { theme } from './theme'
import Issuance from './views/issuance'

// Requires rToken to be selected and a wallet connected
// TODO: Better placeholders
const Guard = ({ children }: { children: React.ReactNode }) => {
  const { account } = useEthers()
  const RToken = useAppSelector(selectCurrentRToken)

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
  <Web3ReactProvider connectors={connectors}>
    <ThemeProvider theme={theme}>
      {/* <Updater /> */}
      {/* <Toaster /> */}
      <Router>
        <Layout>
          <Routes>
            <Route path={ROUTES.HOME} element={<Home />} />
            {/* <Route path={ROUTES.OVERVIEW} element={<Overview />} /> */}
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
  </Web3ReactProvider>
)

export default App
