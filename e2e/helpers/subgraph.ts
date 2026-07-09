import type { Page } from '@playwright/test'
import type { UnmockedLogger } from './logger'
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

function resolveIndexQuery(body: string, log: UnmockedLogger) {
  const parsed = parseBody(body)
  const op = parsed.operationName ?? ''
  const vars = parsed.variables ?? {}

  if (op === 'getDTF' || body.includes('dtf(id:')) {
    const id = (vars.id as string) ?? ''
    const dtf = dtfForAddress(id)
    const snap = dtf && dtfCache.get(dtf.address.toLowerCase())
    if (snap) return { data: snap }
    log('unmocked operation', { op: 'getDTF', id })
    return graphError(`[E2E] unmocked operation: getDTF (no snapshot for ${id})`)
  }

  if (op === 'getProposalDetail' || body.includes('proposal(id:')) {
    const id = (vars.id as string) ?? ''
    for (const dtf of REGISTRY) {
      const detail = loadProposalDetail(dtf, id)
      if (detail) return { data: detail }
    }
    log('unmocked operation', { op: 'getProposalDetail', id })
    return graphError(`[E2E] unmocked operation: getProposalDetail (no snapshot for ${id})`)
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

export async function mockSubgraphRoutes(page: Page, log: UnmockedLogger) {
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
    const response = isIndex ? resolveIndexQuery(body, log) : { data: EMPTY_SHAPE }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}
