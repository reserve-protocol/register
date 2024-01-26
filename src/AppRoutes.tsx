import { useAtomValue, useSetAtom } from 'jotai'
import { Suspense, lazy, useEffect, useMemo } from 'react'
import { lazyWithPreload } from 'react-lazy-with-preload'
import { Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { Box, Flex, Spinner } from 'theme-ui'
import { NETWORKS, ROUTES } from 'utils/constants'
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
import Issuance from './views/issuance'
import Governance from './views/governance'
import rtokens from '@lc-labs/rtokens'
import { isAddress } from 'utils'
import { Address } from 'viem'
import useRTokenContext from 'hooks/useRTokenContext'

// const Issuance = lazyWithPreload(() => import('./views/issuance'))
// const Governance = lazyWithPreload(() => import('./views/governance'))
const Bridge = lazy(() => import('./views/bridge'))

const Fallback = () => (
  <Flex sx={{ justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
    <Spinner size={24} />
  </Flex>
)

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

const TestComponent = () => {
  return <Box>asdnmasdnasodnasdnasdjuiknas</Box>
}

const AppRoutes = () => {
  // const rTokenSelected = !!useAtomValue(selectedRTokenAtom)

  // useEffect(() => {
  //   if (rTokenSelected) {
  //     Issuance.preload()
  //     Governance.preload()
  //   }
  // }, [rTokenSelected])

  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.TOKENS} element={<Tokens />} />
      <Route
        path={ROUTES.BRIDGE}
        element={
          <Suspense fallback={<Fallback />}>
            <Bridge />
          </Suspense>
        }
      />
      <Route path={ROUTES.PORTFOLIO} element={<PortfolioWrapper />} />
      <Route path={ROUTES.EARN} element={<EarnWrapper />} />
      <Route path={ROUTES.DEPLOY} element={<Deploy />} />
      <Route path={`/:chain/token/:tokenId`} element={<RTokenContainer />}>
        <Route index element={<Overview />} />
        <Route path="issuance" element={<Issuance />} />
        <Route path="staking" element={<Staking />} />
        <Route path="auctions" element={<Auctions />} />
        <Route path="governance" element={<Governance />} />
        <Route path="governance/proposal" element={<GovernanceProposal />} />
        <Route
          path="governance/proposal/:proposalId"
          element={<GovernanceProposalDetail />}
        />
        <Route path="governance/setup" element={<GovernanceSetup />} />
        <Route path="settings" element={<Management />} />
        {/* <Route
          path={ROUTES.ISSUANCE}
          element={
            <Suspense fallback={<Fallback />}>
              <Issuance />
            </Suspense>
          }
        />
        <Route path={ROUTES.STAKING} element={<Staking />} />
        <Route path={ROUTES.AUCTIONS} element={<Auctions />} />
        <Route path={ROUTES.SETTINGS} element={<Management />} />
        <Route path={ROUTES.GOVERNANCE_SETUP} element={<GovernanceSetup />} /> */}
      </Route>
      <Route path="*" element={<Box>Not found</Box>} />

      {/* <Route
        path={ROUTES.GOVERNANCE}
        element={
          <Suspense fallback={<Fallback />}>
            <Governance />
          </Suspense>
        }
      /> */}
      {/* <Route
        path={ROUTES.GOVERNANCE_PROPOSAL}
        element={<GovernanceProposal />}
      /> */}
      {/* <Route
        path={`${ROUTES.GOVERNANCE_PROPOSAL}/:proposalId`}
        element={<GovernanceProposalDetail />}
      /> */}
    </Routes>
  )
}

export default AppRoutes
