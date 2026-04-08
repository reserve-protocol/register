import type { Page } from '@playwright/test'
import { loadSnapshot, snapshotExists } from './snapshot-loader'
import { DTF, type TestDTF } from './test-data'

// --- Snapshot loading ---

interface DTFSnapshot {
  dtf: Record<string, unknown>
}

interface GovernanceSnapshot {
  governances: Array<{
    id: string
    proposals: Array<Record<string, unknown>>
    proposalCount?: number
  }>
  stakingToken: Record<string, unknown> | null
}

interface ProposalSnapshot {
  proposal: Record<string, unknown>
}

// Lazy snapshot loading — only loads when a DTF is actually accessed
const dtfSnapshots = new Map<string, DTFSnapshot>()
const governanceSnapshots = new Map<string, GovernanceSnapshot>()
const governanceIdToDtf = new Map<string, string>()

function ensureDtfLoaded(dtf: TestDTF) {
  const addr = dtf.address.toLowerCase()
  if (dtfSnapshots.has(addr)) return

  if (!snapshotExists(`${dtf.snapshotDir}/dtf.json`)) return
  dtfSnapshots.set(
    addr,
    loadSnapshot<DTFSnapshot>(`${dtf.snapshotDir}/dtf.json`)
  )

  if (!snapshotExists(`${dtf.snapshotDir}/governance.json`)) return
  const gov = loadSnapshot<GovernanceSnapshot>(
    `${dtf.snapshotDir}/governance.json`
  )
  governanceSnapshots.set(addr, gov)

  // Build governance ID → DTF reverse lookup
  for (const g of gov.governances) {
    governanceIdToDtf.set(g.id.toLowerCase(), addr)
  }
}

function ensureAllLoaded() {
  for (const dtf of Object.values(DTF)) {
    ensureDtfLoaded(dtf)
  }
}

// --- Public accessors for tests ---

export function getSnapshotDTF(address: string) {
  const dtf = findDtfByAddress(address) // triggers lazy load
  if (!dtf) return null
  return dtfSnapshots.get(dtf.address.toLowerCase())?.dtf ?? null
}

export function getSnapshotGovernance(address: string) {
  const dtf = findDtfByAddress(address) // triggers lazy load
  if (!dtf) return null
  return governanceSnapshots.get(dtf.address.toLowerCase()) ?? null
}

export function getSnapshotProposals(address: string) {
  const gov = getSnapshotGovernance(address) // triggers lazy load
  if (!gov) return []
  return gov.governances.flatMap((g) => g.proposals)
}

// --- Helpers ---

function findDtfByAddress(id: string): TestDTF | undefined {
  const lower = id.toLowerCase()
  const dtf = Object.values(DTF).find(
    (d) => d.address.toLowerCase() === lower
  )
  if (dtf) ensureDtfLoaded(dtf)
  return dtf
}

function findDtfByGovernanceId(govId: string): TestDTF | undefined {
  // Need all DTFs loaded to search by governance ID
  ensureAllLoaded()
  const dtfAddr = governanceIdToDtf.get(govId.toLowerCase())
  if (!dtfAddr) return undefined
  return findDtfByAddress(dtfAddr)
}

function loadProposalDetail(
  dtf: TestDTF,
  proposalId: string
): ProposalSnapshot | null {
  const path = `${dtf.snapshotDir}/proposals/${proposalId}.json`
  if (!snapshotExists(path)) return null
  return loadSnapshot<ProposalSnapshot>(path)
}

// Fallback transfer events — used when no snapshot exists
const FALLBACK_TRANSFER_EVENTS = [
  {
    id: '0xabc-1',
    hash: '0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234',
    amount: '1500000000000000000000',
    timestamp: '1712500000',
    to: { id: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
    from: { id: '0x0000000000000000000000000000000000000000' },
    type: 'MINT',
  },
  {
    id: '0xabc-2',
    hash: '0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1235',
    amount: '2500000000000000000000',
    timestamp: '1712496400',
    to: { id: '0x0000000000000000000000000000000000000000' },
    from: { id: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
    type: 'REDEEM',
  },
  {
    id: '0xabc-3',
    hash: '0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1236',
    amount: '3000000000000000000000',
    timestamp: '1712489200',
    to: { id: '0xcccccccccccccccccccccccccccccccccccccccc' },
    from: { id: '0x0000000000000000000000000000000000000000' },
    type: 'MINT',
  },
]

// --- Query dispatch ---

interface ParsedBody {
  operationName?: string
  query?: string
  variables?: Record<string, unknown>
}

function tryParseBody(body: string): ParsedBody {
  try {
    return JSON.parse(body)
  } catch {
    return {}
  }
}

/**
 * Detect which query is being run from the POST body and return
 * query-specific mock data. Falls back to empty response for unknown queries.
 */
function getResponseForQuery(body: string, url: string) {
  const isIndexDtfSubgraph = url.includes('dtf-index')
  const parsed = tryParseBody(body)
  const op = parsed.operationName ?? ''
  const vars = parsed.variables ?? {}

  if (isIndexDtfSubgraph) {
    // getDTF query
    if (op === 'getDTF' || body.includes('dtf(id:')) {
      const id = (vars.id as string) ?? ''
      const dtf = findDtfByAddress(id)
      if (dtf) {
        const snapshot = dtfSnapshots.get(dtf.address.toLowerCase())
        if (snapshot) return { data: snapshot }
      }
      // No matching snapshot — loud error
      return {
        data: { dtf: null },
        errors: [
          {
            message: `[E2E] No DTF snapshot for address: ${id}`,
          },
        ],
      }
    }

    // Proposal detail query
    if (op === 'getProposalDetail' || body.includes('proposal(id:')) {
      const proposalId = (vars.id as string) ?? ''
      // Search all DTFs for a matching proposal file
      for (const dtf of Object.values(DTF)) {
        const detail = loadProposalDetail(dtf, proposalId)
        if (detail) return { data: detail }
      }
      return {
        data: { proposal: null },
        errors: [
          {
            message: `[E2E] No proposal snapshot for id: ${proposalId}`,
          },
        ],
      }
    }

    // Transfer events — serve from snapshot when available
    if (op === 'getTransferEvents' || body.includes('transferEvents')) {
      const dtfAddr = (vars.dtf as string) ?? ''
      const dtf = findDtfByAddress(dtfAddr)

      if (dtf && snapshotExists(`${dtf.snapshotDir}/transfer-events.json`)) {
        const snapshot = loadSnapshot<{ transferEvents: unknown[] }>(
          `${dtf.snapshotDir}/transfer-events.json`
        )
        return { data: snapshot }
      }

      return { data: { transferEvents: FALLBACK_TRANSFER_EVENTS } }
    }

    // Governance stats query
    if (op === 'getGovernanceStats' || body.includes('governances(')) {
      // Extract governance IDs from variables to find the right DTF
      const whereIds =
        (vars.governanceIds as string[]) ??
        (vars.ids as string[]) ??
        []

      // Try to match by governance IDs in variables
      let matchedDtf: TestDTF | undefined
      for (const gid of whereIds) {
        matchedDtf = findDtfByGovernanceId(gid)
        if (matchedDtf) break
      }

      // Fallback: try extracting IDs from the raw query string
      if (!matchedDtf) {
        const idMatches = body.match(/"id_in"\s*:\s*\[([^\]]*)\]/)?.[1]
        if (idMatches) {
          const ids = idMatches
            .replace(/"/g, '')
            .split(',')
            .map((s) => s.trim())
          for (const gid of ids) {
            matchedDtf = findDtfByGovernanceId(gid)
            if (matchedDtf) break
          }
        }
      }

      if (matchedDtf) {
        const snapshot = governanceSnapshots.get(
          matchedDtf.address.toLowerCase()
        )
        if (snapshot) return { data: snapshot }
      }

      // No match — return empty governance with loud error
      return {
        data: { governances: [], stakingToken: null },
        errors: [
          {
            message: `[E2E] No governance snapshot matched for ids: ${JSON.stringify(whereIds)}`,
          },
        ],
      }
    }

    // Rebalance queries — serve from snapshot when available
    if (body.includes('rebalances') || body.includes('rebalance(')) {
      const dtfAddr = (vars.dtf as string) ?? ''
      const dtf = findDtfByAddress(dtfAddr)

      if (dtf && snapshotExists(`${dtf.snapshotDir}/rebalances.json`)) {
        const snapshot = loadSnapshot<{ rebalances: unknown[] }>(
          `${dtf.snapshotDir}/rebalances.json`
        )
        return { data: snapshot }
      }

      return { data: { rebalances: [] } }
    }

    // Unmatched Index DTF query — loud error
    return {
      data: {},
      errors: [
        {
          message: `[E2E] Unmocked Index DTF subgraph query: op="${op}"`,
        },
      ],
    }
  }

  // Yield DTF subgraph or unknown — return safe empty data
  return {
    data: {
      tokens: [],
      tokenDailySnapshots: [],
      proposals: [],
      votes: [],
      governances: [],
      ownerGovernance: null,
      tradingGovernance: null,
      vaultGovernance: null,
      stakingToken: null,
      delegates: [],
      trades: [],
      rebalances: [],
      auctions: [],
      entries: [],
      accounts: [],
      stakeEvents: [],
      unstakeEvents: [],
      dtf: null,
      rtoken: null,
      governance: null,
      token: null,
      folio: null,
      transferEvents: [],
    },
  }
}

/**
 * Mock all Goldsky subgraph GraphQL endpoints.
 * Index DTF queries return snapshot data; yield/other queries return safe empty data.
 */
export async function mockSubgraphRoutes(page: Page) {
  await page.route('**/api.goldsky.com/**', (route) => {
    const request = route.request()

    if (request.method() === 'POST') {
      const url = request.url()
      const body = request.postData() || ''
      const response = getResponseForQuery(body, url)

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    }
  })
}
