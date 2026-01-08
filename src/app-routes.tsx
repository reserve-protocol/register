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
import { GOVERNANCE_PROPOSAL_TYPES, ROUTES, RSR } from 'utils/constants'
import Bridge from 'views/bridge'
import Earn from 'views/earn'
import Explorer from 'views/explorer'
import Collaterals from 'views/explorer/components/collaterals'
import ExploreGovernance from 'views/explorer/components/governance'
import AvailableRevenue from 'views/explorer/components/revenue'
import ExploreTokens from 'views/explorer/components/tokens'
import ExploreTransactions from 'views/explorer/components/transactions'
import Discover from './views/discover'
import IndexDTFAuctions from './views/index-dtf/auctions'
import IndexDTFAuctionsLegacy from './views/index-dtf/auctions/legacy'
import Rebalance from './views/index-dtf/auctions/views/rebalance'
import RebalanceList from './views/index-dtf/auctions/views/rebalance-list'
import DeployComingSoon from './views/index-dtf/deploy/components/deploy-coming-soon'
import IndexDTFGovernance from './views/index-dtf/governance'
import IndexProposal from './views/index-dtf/governance/views/proposal'
import IndexDTFPropose from './views/index-dtf/governance/views/propose'
import IndexDTFBasketProposal from './views/index-dtf/governance/views/propose/basket'
import IndexDTFBasketSettingsProposal from './views/index-dtf/governance/views/propose/views/propose-basket-settings'
import IndexDTFDaoSettingsProposal from './views/index-dtf/governance/views/propose/views/propose-dao-settings'
import ProposeDTFSettings from './views/index-dtf/governance/views/propose/views/propose-dtf-settings'
import IndexDTFContainer from './views/index-dtf/index-dtf-container'
import IndexDTFIssuance from './views/index-dtf/issuance'
import IndexDTFManualIssuance from './views/index-dtf/issuance/manual'
import IndexDTFManage from './views/index-dtf/manage'
import IndexDTFOverview from './views/index-dtf/overview'
import IndexDTFSettings from './views/index-dtf/settings'
import AllYieldDTFList from './views/tokens/Tokens'
import InternalDTFList from './views/internal/dtf-list'
import InternalDTFListed from './views/internal/dtf-listed'
import IndexDTFFactsheet from './views/index-dtf/factsheet'
import EarnIndexDTF from './views/earn/views/index-dtf'
import EarnYieldDTF from './views/earn/views/yield-dtf'
import EarnDefi from './views/earn/views/defi'
import RSRView from './views/rsr'

// TODO: Fix recoll call on yield dtf auction page
const AppRoutes = () => (
  <Routes>
    <Route path={ROUTES.HOME} element={<Discover />} />
    <Route path={'/rsr'} element={<RSRView />} />
    {/* Internal routes */}
    <Route path="/internal/dtf-list" element={<InternalDTFList />} />
    <Route path="/internal/dtf-listed" element={<InternalDTFListed />} />
    <Route path={ROUTES.BRIDGE} element={<Bridge />} />
    <Route path={ROUTES.DEPLOY_YIELD} element={<DeployYieldDTF />} />
    <Route path={ROUTES.DEPLOY_INDEX} element={<DeployComingSoon />} />
    <Route path={'/hidden/deploy'} element={<DeployIndexDTF />} />
    <Route path={ROUTES.TOKENS} element={<AllYieldDTFList />} />
    {/* EARN DTF */}
    <Route path={ROUTES.EARN} element={<Earn />}>
      <Route index element={<Navigate replace to={ROUTES.EARN_INDEX} />} />
      <Route path={ROUTES.EARN_INDEX} element={<EarnIndexDTF />} />
      <Route path={ROUTES.EARN_YIELD} element={<EarnYieldDTF />} />
      <Route path={ROUTES.EARN_DEFI} element={<EarnDefi />} />
    </Route>
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
      <Route path={ROUTES.MANAGE} element={<IndexDTFManage />} />
      <Route path={ROUTES.FACTSHEET} element={<IndexDTFFactsheet />} />
      <Route path={ROUTES.ISSUANCE} element={<IndexDTFIssuance />} />
      <Route
        path={`${ROUTES.ISSUANCE}/manual`}
        element={<IndexDTFManualIssuance />}
      />
      <Route
        path={`${ROUTES.AUCTIONS}/legacy`}
        element={<IndexDTFAuctionsLegacy />}
      />
      <Route path={ROUTES.AUCTIONS} element={<IndexDTFAuctions />}>
        <Route index element={<RebalanceList />} />
        <Route path={'rebalance/:proposalId'} element={<Rebalance />} />
      </Route>
      <Route path={ROUTES.SETTINGS} element={<IndexDTFSettings />} />
      <Route path={ROUTES.GOVERNANCE} element={<IndexDTFGovernance />} />
      <Route
        path={`${ROUTES.GOVERNANCE}/${ROUTES.GOVERNANCE_PROPOSE}`}
        element={<IndexDTFPropose />}
      />
      <Route
        path={`${ROUTES.GOVERNANCE}/${ROUTES.GOVERNANCE_PROPOSE}/${GOVERNANCE_PROPOSAL_TYPES.BASKET}`}
        element={<IndexDTFBasketProposal />}
      />
      <Route
        path={`${ROUTES.GOVERNANCE}/${ROUTES.GOVERNANCE_PROPOSE}/${GOVERNANCE_PROPOSAL_TYPES.DTF}`}
        element={<ProposeDTFSettings />}
      />
      <Route
        path={`${ROUTES.GOVERNANCE}/${ROUTES.GOVERNANCE_PROPOSE}/${GOVERNANCE_PROPOSAL_TYPES.OTHER}`}
        element={<IndexDTFDaoSettingsProposal />}
      />
      <Route
        path={`${ROUTES.GOVERNANCE}/${ROUTES.GOVERNANCE_PROPOSE}/${GOVERNANCE_PROPOSAL_TYPES.BASKET_SETTINGS}`}
        element={<IndexDTFBasketSettingsProposal />}
      />
      <Route
        path={`${ROUTES.GOVERNANCE_PROPOSAL}/:proposalId`}
        element={<IndexProposal />}
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
    <Route path="*" element={<div>Not found</div>} />
  </Routes>
)

export default AppRoutes
