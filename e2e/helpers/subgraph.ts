import type { Page } from '@playwright/test'
import type { UnmockedLogger } from './logger'
import type { MockOverrides } from './overrides'
import { findDtfByAddress, REGISTRY, type RegistryDTF } from './registry'
import { loadSnapshot, snapshotExists } from './snapshots'

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

function resolveIndexQuery(
  body: string,
  log: UnmockedLogger,
  overrides?: MockOverrides
) {
  const parsed = parseBody(body)
  const op = parsed.operationName ?? ''
  const vars = parsed.variables ?? {}

  // Per-test overlay wins over snapshots — keyed by the exact operationName so a
  // spec can, e.g., serve a fresher voting snapshot after a vote tx.
  const overlaid = overrides?.lookupSubgraph(op)
  if (overlaid !== undefined) return { data: overlaid }

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

  if (op === 'getGovernanceStats' || body.includes('governances(')) {
    const ids = ((vars.governanceIds as string[]) ?? (vars.ids as string[]) ?? []) as string[]
    let matched: RegistryDTF | undefined
    for (const id of ids) {
      matched = dtfForGovernanceId(id)
      if (matched) break
    }
    const snap = matched && govCache.get(matched.address.toLowerCase())
    if (snap) return { data: snap }
    // No governance snapshot (e.g. DTF has no governance) — empty, not an error.
    return { data: { governances: [], stakingToken: null } }
  }

  if (op === 'getTransferEvents' || body.includes('transferEvents')) {
    const dtf = dtfForAddress((vars.dtf as string) ?? '')
    if (dtf && snapshotExists(`${dtf.snapshotDir}/transfer-events.json`)) {
      return { data: loadSnapshot(`${dtf.snapshotDir}/transfer-events.json`) }
    }
    return { data: { transferEvents: [] } }
  }

  if (op === 'getRebalances' || body.includes('rebalances') || body.includes('rebalance(')) {
    const dtf = dtfForAddress((vars.dtf as string) ?? '')
    if (dtf && snapshotExists(`${dtf.snapshotDir}/rebalances.json`)) {
      return { data: loadSnapshot(`${dtf.snapshotDir}/rebalances.json`) }
    }
    return { data: { rebalances: [] } }
  }

  log('unmocked operation', { op })
  return graphError(`[E2E] unmocked operation: ${op || '(anonymous)'}`)
}

export async function mockSubgraphRoutes(
  page: Page,
  log: UnmockedLogger,
  overrides?: MockOverrides
) {
  await page.route('**/api.goldsky.com/**', (route) => {
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
    const isIndex = url.includes('dtf-index')
    const response = isIndex ? resolveIndexQuery(body, log, overrides) : { data: EMPTY_SHAPE }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}
