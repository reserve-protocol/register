import PreloadComponent, { LazyComponent } from 'components/lazy-component'
import useRTokenContext from 'hooks/useRTokenContext'
import { lazy } from 'react'
import { lazyWithPreload } from 'react-lazy-with-preload'
import { Outlet, Route, Routes } from 'react-router-dom'
import { Box } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import EarnWrapper from 'views/earn'

import Home from 'views/home'
import Overview from 'views/overview'
import PortfolioWrapper from 'views/portfolio'

// Preloadable components
const Issuance = lazyWithPreload(() => import('./views/issuance'))
const Staking = lazyWithPreload(() => import('./views/staking'))
const Auctions = lazyWithPreload(() => import('./views/auctions'))
const Governance = lazyWithPreload(() => import('./views/governance'))
const GovernanceProposal = lazyWithPreload(
  () => import('./views/governance/views/proposal')
)
const GovernanceProposalDetail = lazyWithPreload(
  () => import('./views/governance/views/proposal-detail')
)
const GovernanceSetup = lazyWithPreload(
  () => import('./views/deploy/components/Governance')
)
const Settings = lazyWithPreload(() => import('./views/settings'))

// Lazy components
const Bridge = lazy(() => import('./views/bridge'))
const AllTokenList = lazy(() => import('./views/tokens/Tokens'))
const Deploy = lazy(() => import('./views/deploy'))

const RTokenStateManager = () => {
  // Set RToken atoms or redirect if routed RToken is invalid
  useRTokenContext()

  // Updaters goes here
  return null
}

const RTokenContainer = () => {
  return (
    <Box>
      <RTokenStateManager />
      <Outlet />
    </Box>
  )
}

// TODO: Not sure if its worth to lazy load main routes
const AppRoutes = () => (
  <Routes>
    <Route path={ROUTES.HOME} element={<Home />} />
    <Route path={ROUTES.BRIDGE} element={<LazyComponent element={Bridge} />} />
    <Route path={ROUTES.PORTFOLIO} element={<PortfolioWrapper />} />
    <Route path={ROUTES.EARN} element={<EarnWrapper />} />
    <Route path={ROUTES.DEPLOY} element={<LazyComponent element={Deploy} />} />
    <Route
      path={ROUTES.TOKENS}
      element={<LazyComponent element={AllTokenList} />}
    />
    <Route path={`/:chain/token/:tokenId`} element={<RTokenContainer />}>
      <Route index element={<Overview />} />
      <Route
        path="issuance"
        element={<PreloadComponent element={Issuance} />}
      />
      <Route path="staking" element={<PreloadComponent element={Staking} />} />
      <Route
        path="auctions"
        element={<PreloadComponent element={Auctions} />}
      />
      <Route
        path="governance"
        element={<PreloadComponent element={Governance} />}
      />
      <Route
        path="governance/proposal"
        element={<PreloadComponent element={GovernanceProposal} />}
      />
      <Route
        path="governance/proposal/:proposalId"
        element={<PreloadComponent element={GovernanceProposalDetail} />}
      />
      <Route
        path="governance/setup"
        element={<PreloadComponent element={GovernanceSetup} />}
      />
      <Route
        path="settings"
        element={<PreloadComponent element={Settings} />}
      />
    </Route>
    <Route path="*" element={<Box>Not found</Box>} />
  </Routes>
)

export default AppRoutes
