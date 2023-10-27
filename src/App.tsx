import Analytics from 'components/analytics/Analytics'
import ToastContainer from 'components/toaster-container/ToastContainer'
import TransactionSidebar from 'components/transactions/manager/TransactionSidebar'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useAtom, useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { Suspense, lazy, useEffect } from 'react'
import { lazyWithPreload } from 'react-lazy-with-preload'
import {
  Route,
  HashRouter as Router,
  Routes,
  useSearchParams,
} from 'react-router-dom'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import ChainProvider from 'state/chain'
import Updater from 'state/updater'
import { Text, ThemeProvider } from 'theme-ui'
import { supportedChains } from 'utils/chains'
import { ROUTES } from 'utils/constants'
import Auctions from 'views/auctions'
import Deploy from 'views/deploy'
import GovernanceSetup from 'views/deploy/components/Governance'
import GovernanceProposal from 'views/governance/views/proposal'
import GovernanceProposalDetail from 'views/governance/views/proposal-detail'
import Home from 'views/home'
import Overview from 'views/overview'
import Management from 'views/settings'
import Staking from 'views/staking'
import Tokens from 'views/tokens/Tokens'
import { useSwitchNetwork } from 'wagmi'
import Layout from './components/layout'
import LanguageProvider from './i18n'
import { theme } from './theme'

mixpanel.init(import.meta.env.VITE_MIXPANEL_KEY || 'mixpanel_key', {
  track_pageview: true,
})

const Issuance = lazyWithPreload(() => import('./views/issuance'))
const Governance = lazyWithPreload(() => import('./views/governance'))
const Bridge = lazy(() => import('./views/bridge'))

const Fallback = () => <Text>Loading...</Text>

const RouteListener = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [chainId, setChainId] = useAtom(chainIdAtom)
  const currentUrlChain = Number(searchParams.get('chainId') || 0)
  const { switchNetwork } = useSwitchNetwork()
  const isWindowOpen = useIsWindowVisible()

  // Set chainId on url
  useEffect(() => {
    if (!currentUrlChain || !supportedChains.has(currentUrlChain)) {
      searchParams.set('chainId', chainId.toString())
      setSearchParams(searchParams, { replace: true })
    }

    if (
      currentUrlChain &&
      supportedChains.has(currentUrlChain) &&
      chainId !== currentUrlChain
    ) {
      setChainId(currentUrlChain)

      if (switchNetwork && isWindowOpen) {
        switchNetwork(currentUrlChain)
      }
    }
  }, [currentUrlChain])

  return null
}

/**
 * App Entry point - Handles views routing
 *
 * @returns {JSX.Element}
 */
const App = () => {
  const rTokenSelected = !!useAtomValue(selectedRTokenAtom)

  useEffect(() => {
    if (rTokenSelected) {
      Issuance.preload()
      Governance.preload()
    }
  }, [rTokenSelected])

  return (
    <Router>
      <Analytics />
      <ThemeProvider theme={theme}>
        <LanguageProvider>
          <ChainProvider>
            <RouteListener />
            <Updater />
            <TransactionSidebar />
            <Layout>
              <ToastContainer />
              <Routes>
                <Route path={ROUTES.HOME} element={<Home />} />
                <Route path={ROUTES.OVERVIEW} element={<Overview />} />
                <Route
                  path={ROUTES.ISSUANCE}
                  element={
                    <Suspense fallback={<Fallback />}>
                      <Issuance />
                    </Suspense>
                  }
                />
                <Route path={ROUTES.STAKING} element={<Staking />} />
                <Route path={ROUTES.AUCTIONS} element={<Auctions />} />
                <Route path={ROUTES.DEPLOY} element={<Deploy />} />
                <Route path={ROUTES.SETTINGS} element={<Management />} />
                <Route
                  path={ROUTES.GOVERNANCE_SETUP}
                  element={<GovernanceSetup />}
                />
                <Route path={ROUTES.TOKENS} element={<Tokens />} />
                <Route
                  path={ROUTES.GOVERNANCE}
                  element={
                    <Suspense fallback={<Fallback />}>
                      <Governance />
                    </Suspense>
                  }
                />
                <Route
                  path={ROUTES.GOVERNANCE_PROPOSAL}
                  element={<GovernanceProposal />}
                />
                <Route
                  path={`${ROUTES.GOVERNANCE_PROPOSAL}/:proposalId`}
                  element={<GovernanceProposalDetail />}
                />
                <Route
                  path={ROUTES.BRIDGE}
                  element={
                    <Suspense fallback={<Fallback />}>
                      <Bridge />
                    </Suspense>
                  }
                />
              </Routes>
            </Layout>
          </ChainProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
