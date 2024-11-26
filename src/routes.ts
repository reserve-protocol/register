import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes'
import { ROUTES } from 'utils/constants'

export default [
  // * matches all URLs, the ? makes it optional so it will match / as well
  index('./views/home/index.tsx'),
  route('compare', './views/compare/index.tsx'),
  route('bridge', './views/bridge/index.tsx'),
  route('portfolio', './views/portfolio/index.tsx'),
  route('earn', './views/earn/index.tsx'),
  route('deploy', './views/deploy/index.tsx'),
  route('tokens', './views/tokens/Tokens.tsx'),
  route('explorer', './views/explorer/index.tsx', [
    index('./views/explorer/components/transactions/index.tsx'),
    route('collaterals', './views/explorer/components/collaterals/index.tsx'),
    route('governance', './views/explorer/components/governance/index.tsx'),
    route('revenue', './views/explorer/components/revenue/index.tsx'),
    route('tokens', './views/explorer/components/tokens/index.tsx'),
  ]),
  route('terms', './views/terms/index.tsx'),
  route(':chain/token/:tokenId', './state/rtoken/RTokenContainer.tsx', [
    index('./pages/rtoken/index.tsx'),
    route('overview', './views/overview/index.tsx'),
    route('issuance', './pages/rtoken/issuance/index.tsx'),
    route('staking', './views/staking/index.tsx'),
    route('auctions', './views/auctions/index.tsx'),
    route('governance', './views/governance/index.tsx', [
      index('./views/governance/views/proposal/index.tsx'),
      route(
        ':proposalId',
        './views/governance/views/proposal-detail/index.tsx'
      ),
    ]),
    route('setup', './views/deploy/components/Governance.tsx'),
    route('settings', './views/settings/index.tsx'),
  ]),
  route('*?', 'catchall.tsx'),
] satisfies RouteConfig
