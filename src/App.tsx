import { useWeb3React } from '@web3-react/core'
import { Card } from 'components'
import Container from 'components/container'
import { useAtomValue } from 'jotai'
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { rTokenAtom } from 'state/atoms'
import Web3Provider from 'state/providers/web3'
import Updater from 'state/updater'
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
  const { account } = useWeb3React()
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
const App = () => {
  return (
    <Web3Provider>
      <Updater />
      <ThemeProvider theme={theme}>
        {/* <Toaster /> */}
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
}

export default App
