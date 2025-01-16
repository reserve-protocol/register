import DeployIndexDTF from '@/views/index-dtf/deploy'
import Auctions from '@/views/yield-dtf/auctions'
import DeployYieldDTF from '@/views/yield-dtf/deploy'
import GovernanceSetup from '@/views/yield-dtf/deploy/components/Governance'
import Governance from '@/views/yield-dtf/governance'
import GovernanceProposal from '@/views/yield-dtf/governance/views/proposal'
import GovernanceProposalDetail from '@/views/yield-dtf/governance/views/proposal-detail'
import Issuance from '@/views/yield-dtf/issuance'
import Overview from '@/views/yield-dtf/overview'
import Settings from '@/views/yield-dtf/settings'
import Staking from '@/views/yield-dtf/staking'
import { Navigate, Route, Routes } from 'react-router-dom'
import RTokenContainer from 'state/rtoken/RTokenContainer'
import { Box } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import Bridge from 'views/bridge'
import EarnWrapper from 'views/earn'
import Explorer from 'views/explorer'
import Collaterals from 'views/explorer/components/collaterals'
import ExploreGovernance from 'views/explorer/components/governance'
import AvailableRevenue from 'views/explorer/components/revenue'
import ExploreTokens from 'views/explorer/components/tokens'
import ExploreTransactions from 'views/explorer/components/transactions'
import Home from 'views/home'
import PortfolioWrapper from 'views/portfolio'
import Terms from 'views/terms'
import Deploy from './views/deploy'
import Discover from './views/discover'
import IndexDTFAuctions from './views/index-dtf/auctions'
import IndexDTFGovernance from './views/index-dtf/governance'
import IndexDTFContainer from './views/index-dtf/index-dtf-container'
import IndexDTFIssuance from './views/index-dtf/issuance'
import IndexDTFOverview from './views/index-dtf/overview'
import IndexDTFSettings from './views/index-dtf/settings'
import AllTokenList from './views/tokens/Tokens'
import IndexDTFPropose from './views/index-dtf/governance/views/propose'
import IndexDTFBasketProposal from './views/index-dtf/governance/views/propose/types/basket'

const AppRoutes = () => (
  <Routes>
    <Route path={ROUTES.HOME} element={<Home />} />
    <Route path={ROUTES.DISCOVER} element={<Discover />} />
    <Route path={ROUTES.BRIDGE} element={<Bridge />} />
    <Route path={ROUTES.PORTFOLIO} element={<PortfolioWrapper />} />
    <Route path={ROUTES.EARN} element={<EarnWrapper />} />
    <Route path={ROUTES.DEPLOY} element={<Deploy />} />
    <Route path={ROUTES.DEPLOY_YIELD} element={<DeployYieldDTF />} />
    <Route path={ROUTES.DEPLOY_INDEX} element={<DeployIndexDTF />} />
    <Route path={ROUTES.TOKENS} element={<AllTokenList />} />
    <Route path={ROUTES.TERMS} element={<Terms />} />
    {/* Yield DTF */}
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
    {/* Index DTF */}
    <Route path={`/:chain/index-dtf/:tokenId`} element={<IndexDTFContainer />}>
      <Route index element={<Navigate replace to={ROUTES.OVERVIEW} />} />
      <Route path={ROUTES.OVERVIEW} element={<IndexDTFOverview />} />
      <Route path={ROUTES.ISSUANCE} element={<IndexDTFIssuance />} />
      <Route path={ROUTES.AUCTIONS} element={<IndexDTFAuctions />} />
      <Route path={ROUTES.SETTINGS} element={<IndexDTFSettings />} />
      <Route path={ROUTES.GOVERNANCE} element={<IndexDTFGovernance />} />
      <Route
        path={`${ROUTES.GOVERNANCE}/${ROUTES.GOVERNANCE_PROPOSE}`}
        element={<IndexDTFPropose />}
      />
      <Route
        path={`${ROUTES.GOVERNANCE_PROPOSE}/basket`}
        element={<IndexDTFBasketProposal />}
      />
    </Route>
    {/* Explorer */}
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
    <Route path="*" element={<Box>Not found</Box>} />
  </Routes>
)

export default AppRoutes
