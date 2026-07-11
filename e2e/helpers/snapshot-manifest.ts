import { REGISTRY } from './registry'

const SHARED_FILES = [
  'shared/discover-dtfs.json',
  'shared/featured-dtfs.json',
  'shared/protocol-metrics.json',
] as const

const DTF_FILES = [
  'chain-state.json',
  'current-price.json',
  'dtf.json',
  'exposure.json',
  'folio-manager.json',
  'governance.json',
  'historical-price.json',
  'rebalances.json',
  'token-prices.json',
  'transfer-events.json',
] as const

export const PINNED_PROPOSALS = [
  {
    snapshotDir: 'base/lcap',
    proposalId:
      '111337429388977163548785296806473337490511918976677753366781905746718791330309',
  },
] as const

// The zap API cannot construct a sell quote for the deterministic unfunded E2E
// wallet. These characterization fixtures are refreshed deliberately and must
// be preserved (with their own freshness timestamps) during a full capture.
export const PRESERVED_FLOW_FILES = [
  'base/lcap/zap-buy.json',
  'base/lcap/zap-sell.json',
  'base/lcap/zap-buy-highimpact.json',
  'base/lcap/zap-buy-insufficient.json',
  'base/lcap/zap-error.json',
] as const

export function requiredSnapshotPaths(): string[] {
  return [
    ...SHARED_FILES,
    ...REGISTRY.flatMap((dtf) =>
      DTF_FILES.map((filename) => `${dtf.snapshotDir}/${filename}`)
    ),
    ...PINNED_PROPOSALS.map(
      ({ snapshotDir, proposalId }) => `${snapshotDir}/proposals/${proposalId}.json`
    ),
    ...PRESERVED_FLOW_FILES,
  ]
}
