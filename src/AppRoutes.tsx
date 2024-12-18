import { Navigate, Route, Routes } from 'react-router-dom'
import RTokenContainer from 'state/rtoken/RTokenContainer'
import { Box } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import Auctions from '@/views/rtoken/auctions'
import Bridge from 'views/bridge'
import Compare from 'views/compare'
import Deploy from '@/views/rtoken/deploy'
import FTokenDeploy from '@/views/ftoken/deploy'
import EarnWrapper from 'views/earn'
import Explorer from 'views/explorer'
import Collaterals from 'views/explorer/components/collaterals'
import ExploreGovernance from 'views/explorer/components/governance'
import AvailableRevenue from 'views/explorer/components/revenue'
import ExploreTokens from 'views/explorer/components/tokens'
import ExploreTransactions from 'views/explorer/components/transactions'
import Governance from '@/views/rtoken/governance'
import GovernanceProposal from '@/views/rtoken/governance/views/proposal'
import GovernanceProposalDetail from '@/views/rtoken/governance/views/proposal-detail'
import Home from 'views/home'
import Issuance from '@/views/rtoken/issuance'
import Overview from '@/views/rtoken/overview'
import PortfolioWrapper from 'views/portfolio'
import Settings from '@/views/rtoken/settings'
import Staking from '@/views/rtoken/staking'
import Terms from 'views/terms'
import GovernanceSetup from '@/views/rtoken/deploy/components/Governance'
import AllTokenList from './views/tokens/Tokens'
import DTFContainer from './views/dtf/dtf-container'
import DTFOverview from './views/dtf/overview'
import Discover from './views/discover'

// TODO: Remove COMPARE
const AppRoutes = () => (
  <Routes>
    <Route path={ROUTES.HOME} element={<Home />} />
    <Route path={ROUTES.DISCOVER} element={<Discover />} />
    <Route path={ROUTES.COMPARE} element={<Compare />} />
    <Route path={ROUTES.BRIDGE} element={<Bridge />} />
    <Route path={ROUTES.PORTFOLIO} element={<PortfolioWrapper />} />
    <Route path={ROUTES.EARN} element={<EarnWrapper />} />
    <Route path={ROUTES.DEPLOY} element={<Deploy />} />
    <Route path={ROUTES.FTOKEN_DEPLOY} element={<FTokenDeploy />} />
    <Route path={ROUTES.TOKENS} element={<AllTokenList />} />
    <Route path={`/:chain/token/:tokenId`} element={<RTokenContainer />}>
      <Route index element={<Navigate replace to={ROUTES.OVERVIEW} />} />
      <Route path={ROUTES.OVERVIEW} element={<Overview />} />
      <Route path={ROUTES.ISSUANCE} element={<Issuance />} />
      <Route path={ROUTES.STAKING} element={<Staking />} />
      <Route path={ROUTES.AUCTIONS} element={<Auctions />} />
      <Route path={ROUTES.GOVERNANCE} element={<Governance />} />
      <Route
        path={ROUTES.GOVERNANCE_PROPOSAL}
        element={<GovernanceProposal />}
      />
      <Route
        path={`${ROUTES.GOVERNANCE_PROPOSAL}/:proposalId`}
        element={<GovernanceProposalDetail />}
      />
      <Route path={ROUTES.GOVERNANCE_SETUP} element={<GovernanceSetup />} />
      <Route path={ROUTES.SETTINGS} element={<Settings />} />
    </Route>
    <Route path={`/:chain/dtf/:tokenId`} element={<DTFContainer />}>
      <Route index element={<Navigate replace to={ROUTES.OVERVIEW} />} />
      <Route path={ROUTES.OVERVIEW} element={<DTFOverview />} />
    </Route>
    <Route path={ROUTES.EXPLORER} element={<Explorer />}>
      <Route
        index
        element={<Navigate replace to={ROUTES.EXPLORER_TRANSACTIONS} />}
      />
      <Route path={ROUTES.EXPLORER_COLLATERALS} element={<Collaterals />} />
      <Route path={ROUTES.EXPLORER_TOKENS} element={<ExploreTokens />} />
      <Route
        path={ROUTES.EXPLORER_TRANSACTIONS}
        element={<ExploreTransactions />}
      />
      <Route
        path={ROUTES.EXPLORER_GOVERNANCE}
        element={<ExploreGovernance />}
      />
      <Route path={ROUTES.EXPLORER_REVENUE} element={<AvailableRevenue />} />
    </Route>
    <Route path={ROUTES.TERMS} element={<Terms />} />
    <Route path="*" element={<Box>Not found</Box>} />
  </Routes>
)

export default AppRoutes
