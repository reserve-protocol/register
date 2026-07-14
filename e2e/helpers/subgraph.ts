import type { Page } from '@playwright/test'
import type { UnmockedLogger } from './logger'
import type { MockOverrides } from './overrides'
import type { BoundaryRequest } from './requests'
import { findDtfByAddress, REGISTRY, YIELD_REGISTRY, type RegistryDTF } from './registry'
import { loadSnapshot, snapshotExists } from './snapshots'
import { isYieldReplayActive } from './rpc'

// Goldsky GraphQL interception. Index-DTF queries are served from per-DTF
// snapshots, dispatched primarily by operationName (body-substring fallback for
// the few anonymous queries the app sends). Yield/reserve subgraphs get a safe
// empty shape. Unmatched index ops fail loud.

interface DTFSnapshot {
  dtf: Record<string, unknown> | null
}
interface GovernanceSnapshot {
  governances: Array<{ id: string; proposals: Array<Record<string, unknown>> }>
  stakingToken: Record<string, unknown> | null
}

// Lazy snapshot caches + governance-id → DTF reverse lookup.
const dtfCache = new Map<string, DTFSnapshot>()
const govCache = new Map<string, GovernanceSnapshot>()
const govIdToAddress = new Map<string, string>()

function ensureLoaded(dtf: RegistryDTF) {
  const addr = dtf.address.toLowerCase()
  if (dtfCache.has(addr)) return
  if (snapshotExists(`${dtf.snapshotDir}/dtf.json`)) {
    dtfCache.set(addr, loadSnapshot<DTFSnapshot>(`${dtf.snapshotDir}/dtf.json`))
  }
  if (snapshotExists(`${dtf.snapshotDir}/governance.json`)) {
    const gov = loadSnapshot<GovernanceSnapshot>(`${dtf.snapshotDir}/governance.json`)
    govCache.set(addr, gov)
    for (const g of gov.governances) govIdToAddress.set(g.id.toLowerCase(), addr)
  }
}

function ensureAllLoaded() {
  for (const dtf of REGISTRY) ensureLoaded(dtf)
}

function dtfForAddress(address: string): RegistryDTF | undefined {
  const dtf = findDtfByAddress(address)
  if (dtf) ensureLoaded(dtf)
  return dtf
}

function dtfForGovernanceId(govId: string): RegistryDTF | undefined {
  ensureAllLoaded()
  const addr = govIdToAddress.get(govId.toLowerCase())
  return addr ? findDtfByAddress(addr) : undefined
}

function loadProposalDetail(dtf: RegistryDTF, proposalId: string): unknown | null {
  const path = `${dtf.snapshotDir}/proposals/${proposalId}.json`
  return snapshotExists(path) ? loadSnapshot(path) : null
}

// The DTF's `dtf` object from its snapshot (carries governance context).
function dtfObjectFor(address: string): Record<string, unknown> | undefined {
  const dtf = dtfForAddress(address)
  const snap = dtf
    ? (dtfCache.get(dtf.address.toLowerCase()) as { dtf?: Record<string, unknown> } | undefined)
    : undefined
  return snap?.dtf
}

interface GovEntry {
  id: string
  timelock?: { id: string }
}

// The capture query under-selects proposal.governance to `{ id }`, but the SDK
// mappers read governance.token.id and governance.timelock.id. Backfill both
// from the DTF snapshot, which carries full governance context. Every DTF
// governor votes with the vote-lock stToken, so that's the vote token. Idempotent
// — a snapshot already carrying token+timelock (re-captured) is returned as-is.
function enrichProposalGovernance(
  proposal: Record<string, unknown>,
  dtfObj: Record<string, unknown> | undefined
): Record<string, unknown> {
  const gov = (proposal.governance ?? {}) as Record<string, unknown>
  if (gov.token && gov.timelock) return proposal

  const govId = String(gov.id ?? '').toLowerCase()
  const stToken = dtfObj?.stToken as { id?: string; governance?: GovEntry } | undefined
  const candidates = [
    dtfObj?.ownerGovernance,
    dtfObj?.tradingGovernance,
    stToken?.governance,
  ].filter(Boolean) as GovEntry[]
  const match = candidates.find((g) => String(g.id).toLowerCase() === govId)
  const timelock = match?.timelock ?? stToken?.governance?.timelock

  return {
    ...proposal,
    governance: {
      ...gov,
      token: gov.token ?? { id: stToken?.id },
      timelock: gov.timelock ?? (timelock ? { id: timelock.id } : undefined),
    },
  }
}

// Load a proposal snapshot from whichever registry DTF owns it, with governance
// context backfilled so the SDK mappers succeed. Exported so specs build post-tx
// overlay payloads from the same enriched shape (see governance-vote.spec.ts).
export function loadEnrichedProposal(
  proposalId: string
): { proposal: Record<string, unknown> } | undefined {
  for (const dtf of REGISTRY) {
    const detail = loadProposalDetail(dtf, proposalId) as
      | { proposal?: Record<string, unknown> }
      | null
    if (detail?.proposal) {
      return { proposal: enrichProposalGovernance(detail.proposal, dtfObjectFor(dtf.address)) }
    }
  }
  return undefined
}

// Empty shape covering every field the yield/index apps read, so anonymous or
// yield queries resolve without errors.
const EMPTY_SHAPE = {
  tokens: [],
  proposals: [],
  votes: [],
  governances: [],
  stakingToken: null,
  delegates: [],
  rebalances: [],
  auctions: [],
  transferEvents: [],
  dtf: null,
  proposal: null,
  token: null,
  folio: null,
}

interface ParsedBody {
  operationName?: string
  query?: string
  variables?: Record<string, unknown>
}

function parseBody(raw: string): ParsedBody {
  try {
    return JSON.parse(raw) as ParsedBody
  } catch {
    return {}
  }
}

function graphError(message: string) {
  return { data: null, errors: [{ message }] }
}

// The index subgraph resolves DTFs by their globally-unique address, NOT by the
// subgraph URL's chain — as a WORKAROUND for a known app bug, not because it's
// correct (unlike the reserve-api, which is genuinely address-keyed). The real
// index subgraph host IS chain-specific, so a base/bsc DTF SHOULD reach its own
// chain's URL. But `index-dtf-container.tsx` sets `chainIdAtom` in a layout
// effect that runs AFTER the SDK-consumer children mount, so their first query
// fires against the stale mainnet client — a transient wrong-chain request.
// A strict URL-chain guard here flakily fails every base/bsc index test on that
// transient. Tracked as a triaged app bug + a `test.fixme` regression in
// `flows/spa-chain-identity.spec.ts` (asserts each request's registry-chain
// host); when the container inits chain identity before mounting consumers, the
// fixme flips green and this can enforce chain again. See CODEX_AUDIT § P0.
export function resolveIndexQuery(
  body: string,
  log: UnmockedLogger,
  overrides?: MockOverrides
) {
  const parsed = parseBody(body)
  const op = parsed.operationName ?? ''
  const vars = parsed.variables ?? {}

  // Per-test overlay wins over snapshots — keyed by the exact operationName so a
  // spec can, e.g., serve a fresher voting snapshot after a vote tx.
  const overlaid = overrides?.lookupSubgraph(op, vars)
  if (overlaid !== undefined) return { data: overlaid }

  // Past-week PnL balance snapshot (overview balance card, wallet-gated). Empty
  // is the product default — "wasn't holding a week ago" hides the PnL row. A
  // spec that wants a non-zero week-ago position overrides via overrides.subgraph.
  if (op === 'AccountBalanceWeekAgo') return { data: { accountBalanceDailySnapshots: [] } }

  // The SDK sends the proposal id as `proposalId`; older callers used `id`.
  const proposalId = (vars.proposalId as string) ?? (vars.id as string) ?? ''

  // Proposal detail (GetIndexDtfProposal) — carries BOTH dtf context and the
  // proposal, so it must be matched before the dtf-only / proposal-only branches
  // (its body contains `dtf(id:` too, or it'd be misrouted to getDTF).
  if (op === 'GetIndexDtfProposal' || (body.includes('proposal(id:') && body.includes('dtf(id:'))) {
    const enriched = loadEnrichedProposal(proposalId)
    const dtfObj = dtfObjectFor((vars.dtfId as string) ?? '')
    if (enriched && dtfObj) return { data: { dtf: dtfObj, proposal: enriched.proposal } }
    log('unmocked operation', { op: 'GetIndexDtfProposal', proposalId })
    return graphError(`[E2E] unmocked operation: GetIndexDtfProposal (no snapshot for ${proposalId})`)
  }

  // Voting snapshot (GetIndexDtfProposalVotingSnapshot) — proposal only; the
  // fresher live tally overlaid onto ACTIVE proposals.
  if (op === 'GetIndexDtfProposalVotingSnapshot' || body.includes('proposal(id:')) {
    const enriched = loadEnrichedProposal(proposalId)
    if (enriched) return { data: enriched }
    log('unmocked operation', { op: 'GetIndexDtfProposalVotingSnapshot', proposalId })
    return graphError(
      `[E2E] unmocked operation: GetIndexDtfProposalVotingSnapshot (no snapshot for ${proposalId})`
    )
  }

  if (op === 'GetIndexDTF' || op === 'getDTF' || body.includes('dtf(id:')) {
    const id = (vars.id as string) ?? ''
    const dtf = dtfForAddress(id)
    const snap = dtf && dtfCache.get(dtf.address.toLowerCase())
    if (snap) return { data: snap }
    log('unmocked operation', { op: 'GetIndexDTF', id })
    return graphError(`[E2E] unmocked operation: GetIndexDTF (no snapshot for ${id})`)
  }

  // Auctions history — the app's query is misnamed `getGovernanceStats`
  // upstream (use-rebalance-auctions.ts) but selects `auctions(...)`; match on
  // the selection BEFORE the real governances branch or it gets the governance
  // payload and the hook silently degrades to []. Empty is deterministic;
  // bid-list specs overlay this op.
  if (body.includes('auctions(')) {
    return { data: { auctions: [] } }
  }

  if (op === 'getGovernanceStats' || body.includes('governances(')) {
    const ids = ((vars.governanceIds as string[]) ?? (vars.ids as string[]) ?? []) as string[]
    let matched: RegistryDTF | undefined
    for (const id of ids) {
      matched = dtfForGovernanceId(id)
      if (matched) break
    }
    const snap = matched && govCache.get(matched.address.toLowerCase())
    if (matched && snap) {
      // Captured list proposals carry no `governance` sub-object, but the SDK's
      // mapIndexDtfProposalSummary dereferences governance.{id,token,timelock} —
      // backfill each proposal from its parent governance + the DTF object
      // (same enrichment the detail path gets).
      const dtfObj = dtfObjectFor(matched.address)
      const raw = snap as { governances?: Record<string, unknown>[] }
      const governances = (raw.governances ?? []).map((g) => ({
        ...g,
        proposals: ((g.proposals as Record<string, unknown>[]) ?? []).map((p) =>
          enrichProposalGovernance({ ...p, governance: { id: g.id } }, dtfObj)
        ),
      }))
      return { data: { ...raw, governances } }
    }
    if (ids.length) {
      log('unmocked operation identity', { op, governanceIds: ids })
      return graphError(`[E2E] unmocked operation identity: ${op}`)
    }
    // No governance ids means the DTF genuinely has no governance.
    return { data: { governances: [], stakingToken: null } }
  }

  // Vote-lock sidebar: which DTFs a vote-lock token governs — none of our
  // registry vote-locks govern extra DTFs, so empty is the truthful default.
  if (op === 'GetGovernedDtfs') {
    return { data: { dtfs: [] } }
  }

  // Delegates panel — deterministic empty (no staking token context). Specs
  // needing delegates overlay this op with delegatedVotesRaw etc.
  if (op === 'GetIndexDtfDelegates') {
    return { data: { stakingToken: null } }
  }

  if (op === 'getTransferEvents' || body.includes('transferEvents')) {
    const address = (vars.dtf as string) ?? ''
    const dtf = dtfForAddress(address)
    if (dtf && snapshotExists(`${dtf.snapshotDir}/transfer-events.json`)) {
      return { data: loadSnapshot(`${dtf.snapshotDir}/transfer-events.json`) }
    }
    log('unmocked operation identity', { op: 'getTransferEvents', dtf: address })
    return graphError('[E2E] unmocked operation identity: getTransferEvents')
  }

  if (op === 'getRebalances' || body.includes('rebalances') || body.includes('rebalance(')) {
    const address = (vars.dtf as string) ?? ''
    const dtf = dtfForAddress(address)
    if (dtf && snapshotExists(`${dtf.snapshotDir}/rebalances.json`)) {
      return { data: loadSnapshot(`${dtf.snapshotDir}/rebalances.json`) }
    }
    log('unmocked operation identity', { op: 'getRebalances', dtf: address })
    return graphError('[E2E] unmocked operation identity: getRebalances')
  }

  // Explorer (general, cross-DTF) governance aggregation. getAllIndexProposals
  // pulls every index proposal for the vote filter; getDTFGovernance maps
  // whitelisted DTF ids → governor ids. Empty-but-correctly-shaped is the honest
  // default (the explorer's populated state is a per-test overlay). The SHAPE
  // matters: use-proposals-data iterates `proposals`/`dtfs` UNGUARDED, so a
  // missing field crashes the whole explorer (GH0) — these branches return the
  // arrays the hook expects.
  if (op === 'getAllIndexProposals') {
    return { data: { proposals: [] } }
  }
  if (op === 'getDTFGovernance') {
    return { data: { dtfs: [] } }
  }

  log('unmocked operation', { op, hint: 'model in e2e/helpers/subgraph.ts (or overrides.subgraph)' })
  return graphError(`[E2E] unmocked operation: ${op || '(anonymous)'}`)
}

// --- Yield-DTF (RToken) subgraph replay ---
// Yield views hit the dtf-yield-* subgraphs with a different op set than index
// (GetTokenListOverview, GetRecentTransactions, getRTokenOwner, getHistorical-
// Baskets, getRTokenDistribution, and FOUR queries that collide on the name
// getTokenDailyPrice — disambiguated by selection). scripts/capture-yield.ts
// records each real response into <chain>/<slug>/yield-graph.json as a request
// log; we match on op + normalized query body (the selection signature) + the
// identity variable, deliberately IGNORING fromTime (a now-relative window that
// shifts between capture and replay while the returned series is the same).

interface YieldGraphEntry {
  op: string
  query: string
  variables: Record<string, unknown>
  data: unknown
}

// Each loaded entry is tagged with the chainId of the fixture that owns its
// file so replay is chain-scoped: an op with no identity variable (e.g. a
// global GetRecentTransactions feed) would otherwise match the FIRST fixture's
// entry regardless of chain, letting a base page render mainnet data.
type ChainedYieldEntry = YieldGraphEntry & { chainId: number }
let yieldEntries: ChainedYieldEntry[] | undefined

function normalizeQuery(query: string): string {
  return query.replace(/\s+/g, ' ').trim()
}

// Stable identity for an operation, excluding the fromTime window.
function queryIdentity(variables: Record<string, unknown>): string {
  if (variables.id !== undefined) return `id:${String(variables.id).toLowerCase()}`
  if (variables.tokenId !== undefined) return `tokenId:${String(variables.tokenId).toLowerCase()}`
  if (Array.isArray(variables.tokenIds)) {
    return `tokenIds:${(variables.tokenIds as string[]).map((t) => t.toLowerCase()).join(',')}`
  }
  return ''
}

function yieldEntryKey(chainId: number, op: string, query: string, identity: string): string {
  return `${chainId}::${op}::${normalizeQuery(query)}::${identity}`
}

// mainnet/base from the dtf-yield-<chain> Goldsky URL.
function yieldChainForUrl(url: string): number {
  return url.includes('dtf-yield-base') ? 8453 : 1
}

// Chain of ANY Goldsky subgraph URL (index or yield), for boundary recording.
function subgraphChainForUrl(url: string): number {
  if (url.includes('-base')) return 8453
  if (url.includes('-bsc')) return 56
  return 1
}

function loadYieldEntries(): ChainedYieldEntry[] {
  if (yieldEntries) return yieldEntries
  yieldEntries = []
  for (const dtf of YIELD_REGISTRY) {
    const path = `${dtf.snapshotDir}/yield-graph.json`
    if (snapshotExists(path)) {
      const entries = loadSnapshot<YieldGraphEntry[]>(path)
      yieldEntries.push(...entries.map((e) => ({ ...e, chainId: dtf.chainId })))
    }
  }
  return yieldEntries
}

export function resolveYieldQuery(
  chainId: number,
  body: string,
  log: UnmockedLogger,
  overrides?: MockOverrides
) {
  const parsed = parseBody(body)
  const op = parsed.operationName ?? ''
  const vars = parsed.variables ?? {}

  const overlaid = overrides?.lookupSubgraph(op, vars)
  if (overlaid !== undefined) return { data: overlaid }

  // Explorer transactions tab (default route) — a cross-chain feed on the
  // RToken/yield subgraph. Per-chain `{ entries: [] }` is the honest empty
  // default; the SHAPE matters — useTransactionData reads `data[chain].entries.map`
  // guarding only `data[chain]`, so a response without `entries` crashes the whole
  // explorer (GH0). Populated-feed specs overlay this op.
  if (op === 'Transactions' || body.includes('entries(')) {
    return { data: { entries: [] } }
  }
  // Connected-wallet account panels (portfolio positions, stake history). The
  // test wallet holds nothing on the yield side by default → empty/null account.
  // A spec seeding a position overlays these ops.
  if (op === 'getAccountTokens') {
    return { data: { account: null } }
  }
  if (op === 'getAccountStakeHistory') {
    return { data: { account: null } }
  }

  const identity = queryIdentity(vars)
  const key = yieldEntryKey(chainId, op, parsed.query ?? '', identity)
  const match = loadYieldEntries().find(
    (entry) =>
      yieldEntryKey(entry.chainId, entry.op, entry.query, queryIdentity(entry.variables)) === key
  )
  if (match) return { data: match.data }

  log('unmocked yield operation', {
    chainId,
    op,
    identity,
    hint: 'capture via pnpm e2e:capture:yield, or a per-test overrides.subgraph',
  })
  return graphError(`[E2E] unmocked yield operation: ${op || '(anonymous)'} (${identity})`)
}

export async function mockSubgraphRoutes(
  page: Page,
  log: UnmockedLogger,
  overrides?: MockOverrides,
  requests?: BoundaryRequest[]
) {
  await page.route('**/api.goldsky.com/**', async (route) => {
    const request = route.request()
    if (request.method() !== 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: EMPTY_SHAPE }),
      })
    }

    const url = request.url()
    const body = request.postData() ?? ''
    const parsed = parseBody(body)
    requests?.push({
      boundary: 'subgraph',
      operationName: parsed.operationName ?? '',
      variables: parsed.variables ?? {},
      urlChain: subgraphChainForUrl(url),
    })
    await overrides?.holds.gate({ boundary: 'subgraph', operationName: parsed.operationName ?? '' })
    // URL-based fork: yield RTokens read the dtf-yield-* subgraphs, index reads
    // dtf-index-*. The yield resolver only engages while a yield test is active
    // (isYieldReplayActive) — so index tests, which incidentally poll a
    // dtf-yield subgraph via app updaters, keep the pre-yield EMPTY_SHAPE
    // behavior verbatim instead of hitting the yield replay's fail-loud.
    const response =
      url.includes('dtf-yield') && isYieldReplayActive()
        ? resolveYieldQuery(yieldChainForUrl(url), body, log, overrides)
        : url.includes('dtf-index')
          ? resolveIndexQuery(body, log, overrides)
          : { data: EMPTY_SHAPE }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}
