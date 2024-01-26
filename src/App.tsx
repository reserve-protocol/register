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
import Layout from './components/layout'
import LanguageProvider from './i18n'
import { theme } from './theme'
import AppRoutes from 'AppRoutes'

mixpanel.init(import.meta.env.VITE_MIXPANEL_KEY || 'mixpanel_key', {
  track_pageview: true,
})

const Issuance = lazyWithPreload(() => import('./views/issuance'))
const Governance = lazyWithPreload(() => import('./views/governance'))
const Bridge = lazy(() => import('./views/bridge'))

const Fallback = () => (
  <Flex sx={{ justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
    <Spinner size={24} />
  </Flex>
)

// /token/base/tokenAddress -> overview
// /token/base/tokenAddress/mint

// Home
// Deploy => delploy/ethereum // deploy/base
//

// const RouteListener = () => {
//   const [searchParams, setSearchParams] = useSearchParams()
//   const [chainId, setChainId] = useAtom(chainIdAtom)
//   const currentUrlChain = Number(searchParams.get('chainId') || 0)
//   const { switchNetwork } = useSwitchNetwork()
//   const isWindowOpen = useIsWindowVisible()

//   // Set chainId on url
//   useEffect(() => {
//     if (!currentUrlChain || !supportedChains.has(currentUrlChain)) {
//       searchParams.set('chainId', chainId.toString())
//       setSearchParams(searchParams, { replace: true })
//     }

//     if (
//       currentUrlChain &&
//       supportedChains.has(currentUrlChain) &&
//       chainId !== currentUrlChain
//     ) {
//       setChainId(currentUrlChain)

//       if (switchNetwork && isWindowOpen) {
//         switchNetwork(currentUrlChain)
//       }
//     }
//   }, [currentUrlChain])

//   return null
// }

/**
 * App Entry point - Handles views routing
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
