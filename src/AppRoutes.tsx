import PreloadComponent, { LazyComponent } from 'components/lazy-component'
import { lazy } from 'react'
import { lazyWithPreload } from 'react-lazy-with-preload'
import { Navigate, Route, Routes } from 'react-router-dom'
import RTokenContainer from 'state/rtoken/RTokenContainer'
import { Box } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import Collaterals from 'views/collaterals'
import EarnWrapper from 'views/earn'

import Home from 'views/home'
import Issuance from 'views/issuance'
import Overview from 'views/overview'
import PortfolioWrapper from 'views/portfolio'
import Staking from 'views/staking'

// Preloadable components
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
      <Route index element={<Navigate replace to={ROUTES.OVERVIEW} />} />
      <Route path={ROUTES.OVERVIEW} element={<Overview />} />
      <Route path={ROUTES.ISSUANCE} element={<Issuance />} />
      <Route path={ROUTES.STAKING} element={<Staking />} />
      <Route
        path={ROUTES.AUCTIONS}
        element={<PreloadComponent element={Auctions} />}
      />
      <Route
        path={ROUTES.GOVERNANCE}
        element={<PreloadComponent element={Governance} />}
      />
      <Route
        path={ROUTES.GOVERNANCE_PROPOSAL}
        element={<PreloadComponent element={GovernanceProposal} />}
      />
      <Route
        path={`${ROUTES.GOVERNANCE_PROPOSAL}/:proposalId`}
        element={<PreloadComponent element={GovernanceProposalDetail} />}
      />
      <Route
        path={ROUTES.GOVERNANCE_SETUP}
        element={<PreloadComponent element={GovernanceSetup} />}
      />
      <Route
        path={ROUTES.SETTINGS}
        element={<PreloadComponent element={Settings} />}
      />
    </Route>
    <Route path={ROUTES.COLLATERALS} element={<Collaterals />} />
    <Route path="*" element={<Box>Not found</Box>} />
  </Routes>
)

export default AppRoutes
