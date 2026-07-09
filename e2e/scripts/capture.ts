/**
 * Capture e2e snapshots from live production APIs + subgraphs into
 * e2e/snapshots/<chain>/<slug>/*.json, wrapped in a {_meta, data} envelope.
 *
 * Usage: pnpm e2e:capture
 *
 * Time-series responses (historical price, exposure) are downsampled to
 * MAX_SERIES_POINTS before writing to keep the repo lean; the moving-window
 * params and downsampling are recorded in _meta.window.
 */
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { CHAINS, REGISTRY, type RegistryDTF } from '../helpers/registry'

const snapshotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'snapshots')
const RESERVE_API = 'https://api.reserve.org'
const MAX_SERIES_POINTS = 200

const subgraphUrlFor = (chainId: number) =>
  Object.values(CHAINS).find((c) => c.chainId === chainId)?.indexSubgraphUrl

// --- Time-series downsampling ---

interface DownsampleReport {
  path: string
  from: number
  to: number
}

function evenSample<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr
  const step = arr.length / max
  const out: T[] = []
  for (let i = 0; i < max; i++) out.push(arr[Math.floor(i * step)])
  out[out.length - 1] = arr[arr.length - 1] // always keep the latest point
  return out
}

// Recursively downsample any array longer than MAX_SERIES_POINTS. Used only on
// historical/exposure payloads, where long arrays are the time series.
function capSeries(value: unknown, path: string, report: DownsampleReport[]): unknown {
  if (Array.isArray(value)) {
    let arr = value
    if (arr.length > MAX_SERIES_POINTS) {
      report.push({ path: path || '(root)', from: arr.length, to: MAX_SERIES_POINTS })
      arr = evenSample(arr, MAX_SERIES_POINTS)
    }
    return arr.map((v, i) => capSeries(v, `${path}[${i}]`, report))
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = capSeries(v, path ? `${path}.${k}` : k, report)
    }
    return out
  }
  return value
}

// --- IO ---

function saveSnapshot(
  relativePath: string,
  source: string,
  data: unknown,
  extra: Record<string, unknown> = {}
) {
  const full = join(snapshotsDir, relativePath)
  mkdirSync(dirname(full), { recursive: true })
  const snapshot = { _meta: { source, capturedAt: new Date().toISOString(), ...extra }, data }
  writeFileSync(full, JSON.stringify(snapshot, null, 2))
  console.log(`  ok ${relativePath}`)
}

async function fetchApi(url: string): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`)
  return res.json()
}

async function fetchSubgraph(
  chainId: number,
  query: string,
  variables: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  const url = subgraphUrlFor(chainId)
  if (!url) throw new Error(`No subgraph URL for chain ${chainId}`)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`Subgraph ${res.status}: ${url}`)
  const json = (await res.json()) as { data?: Record<string, unknown>; errors?: unknown[] }
  if (json.errors?.length) console.warn(`  ! subgraph errors chain ${chainId}:`, json.errors)
  return json.data ?? null
}

// --- GraphQL queries (mirror the app's operations, defined once) ---

const QUERIES = {
  getDTF: `query getDTF($id: String!) {
    dtf(id: $id) {
      id proxyAdmin timestamp deployer ownerAddress mintingFee tvlFee
      annualizedTvlFee mandate auctionDelay auctionLength auctionApprovers
      auctionLaunchers brandManagers totalRevenue protocolRevenue
      governanceRevenue externalRevenue feeRecipients legacyAdmins
      legacyAuctionApprovers
      ownerGovernance { id votingDelay votingPeriod proposalThreshold quorumNumerator quorumDenominator timelock { id guardians executionDelay } }
      tradingGovernance { id votingDelay votingPeriod proposalThreshold quorumNumerator quorumDenominator timelock { id guardians executionDelay } }
      token { id name symbol decimals totalSupply currentHolderCount }
      stToken {
        id token { name symbol decimals totalSupply }
        underlying { name symbol address decimals }
        governance { id votingDelay votingPeriod proposalThreshold quorumNumerator quorumDenominator timelock { id guardians executionDelay } }
        legacyGovernance
        rewards(where: { active: true }) { rewardToken { address name symbol decimals } }
      }
    }
  }`,
  getGovernanceStats: `query getGovernanceStats($governanceIds: [String!]!, $stToken: String!) {
    governances(where: { id_in: $governanceIds }) {
      id proposalCount
      proposals {
        id description creationTime state forWeightedVotes abstainWeightedVotes
        againstWeightedVotes executionETA executionTime quorumVotes voteStart
        voteEnd executionBlock creationBlock proposer { address }
      }
    }
    stakingToken(id: $stToken) {
      id totalDelegates token { totalSupply }
      delegates(first: 10, orderBy: delegatedVotes, orderDirection: desc, where: { address_not: "0x0000000000000000000000000000000000000000" }) {
        address delegatedVotes numberVotes
      }
    }
  }`,
  getProposalDetail: `query getProposalDetail($id: String!) {
    proposal(id: $id) {
      id timelockId description creationTime voteStart voteEnd queueBlock
      queueTime state executionETA executionTime creationBlock cancellationTime
      calldatas targets proposer { address }
      votes { choice voter { address } weight }
      forWeightedVotes againstWeightedVotes abstainWeightedVotes quorumVotes
      forDelegateVotes abstainDelegateVotes againstDelegateVotes
      executionTxnHash governance { id token { id } timelock { id type } }
    }
  }`,
  getTransferEvents: `query getTransferEvents($dtf: String!) {
    transferEvents(where: { token: $dtf, type_not: "TRANSFER" }, orderBy: timestamp, orderDirection: desc) {
      id hash amount timestamp to { id } from { id } type
    }
  }`,
  getRebalances: `query getRebalances($dtf: String!) {
    rebalances(where: { dtf: $dtf }, orderBy: timestamp, orderDirection: desc) {
      id nonce tokens { address name symbol decimals } priceControl
      weightLowLimit weightSpotLimit weightHighLimit rebalanceLowLimit
      rebalanceSpotLimit rebalanceHighLimit priceLowLimit priceHighLimit
      restrictedUntil availableUntil transactionHash blockNumber timestamp
    }
  }`,
}

// --- Capture ---

async function tryCapture<T>(label: string, fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn()
  } catch (e) {
    console.warn(`  ! skip ${label}: ${(e as Error).message}`)
    return undefined
  }
}

async function captureShared() {
  console.log('\nShared:')
  await tryCapture('discover-dtfs', async () => {
    const url = `${RESERVE_API}/discover/dtfs?performance=true&brand=true`
    saveSnapshot('shared/discover-dtfs.json', url, await fetchApi(url))
  })
  await tryCapture('protocol-metrics', async () => {
    const url = `${RESERVE_API}/protocol/metrics`
    saveSnapshot('shared/protocol-metrics.json', url, await fetchApi(url))
  })
}

async function captureDtf(dtf: RegistryDTF) {
  const dir = dtf.snapshotDir
  const addr = dtf.address.toLowerCase()
  const chainId = dtf.chainId
  console.log(`\n${dtf.slug.toUpperCase()} (${dtf.chain}, ${addr}):`)

  const currentPrice = await tryCapture('current-price', async () => {
    const url = `${RESERVE_API}/current/dtf?address=${addr}&chainId=${chainId}`
    const data = (await fetchApi(url)) as { basket?: Array<{ address?: string }> }
    saveSnapshot(`${dir}/current-price.json`, url, data, { dtf: addr, chainId })
    return data
  })

  await tryCapture('folio-manager', async () => {
    const url = `${RESERVE_API}/folio-manager/read?folio=${addr}&chainId=${chainId}`
    saveSnapshot(`${dir}/folio-manager.json`, url, await fetchApi(url), { dtf: addr, chainId })
  })

  await tryCapture('historical-price', async () => {
    const now = Math.floor(Date.now() / 1000)
    const from = now - 7 * 24 * 3600
    const url = `${RESERVE_API}/historical/dtf?chainId=${chainId}&address=${addr}&from=${from}&to=${now}&interval=1h`
    const report: DownsampleReport[] = []
    const data = capSeries(await fetchApi(url), '', report)
    saveSnapshot(`${dir}/historical-price.json`, url, data, {
      dtf: addr,
      chainId,
      window: { from, to: now, interval: '1h', downsampledSeries: report },
    })
  })

  await tryCapture('exposure', async () => {
    const url = `${RESERVE_API}/dtf/exposure?chainId=${chainId}&address=${addr}&period=7d`
    const report: DownsampleReport[] = []
    const data = capSeries(await fetchApi(url), '', report)
    saveSnapshot(`${dir}/exposure.json`, url, data, {
      dtf: addr,
      chainId,
      window: { period: '7d', downsampledSeries: report },
    })
  })

  await tryCapture('token-prices', async () => {
    const tokens = (currentPrice?.basket ?? []).map((t) => t.address).filter(Boolean)
    if (!tokens.length) return
    const url = `${RESERVE_API}/current/prices?chainId=${chainId}&tokens=${tokens.join(',')}`
    saveSnapshot(`${dir}/token-prices.json`, url, await fetchApi(url), { dtf: addr, chainId })
  })

  const dtfData = await tryCapture('dtf', async () => {
    const data = (await fetchSubgraph(chainId, QUERIES.getDTF, { id: addr })) as {
      dtf?: Record<string, unknown>
    } | null
    saveSnapshot(`${dir}/dtf.json`, subgraphUrlFor(chainId)!, data, { dtf: addr, chainId, query: 'getDTF' })
    return data
  })

  await tryCapture('transfer-events', async () => {
    const data = await fetchSubgraph(chainId, QUERIES.getTransferEvents, { dtf: addr })
    saveSnapshot(`${dir}/transfer-events.json`, subgraphUrlFor(chainId)!, data, { dtf: addr, chainId, query: 'getTransferEvents' })
  })

  await tryCapture('rebalances', async () => {
    const data = await fetchSubgraph(chainId, QUERIES.getRebalances, { dtf: addr })
    saveSnapshot(`${dir}/rebalances.json`, subgraphUrlFor(chainId)!, data, { dtf: addr, chainId, query: 'getRebalances' })
  })

  const d = dtfData?.dtf as Record<string, any> | undefined
  if (d) {
    const governanceIds = [
      d.ownerGovernance?.id,
      ...(d.legacyAdmins ?? []),
      d.tradingGovernance?.id,
      ...(d.legacyAuctionApprovers ?? []),
      d.stToken?.governance?.id,
      ...(d.stToken?.legacyGovernance ?? []),
    ].filter(Boolean)
    const stToken = d.stToken?.id ?? ''

    await tryCapture('governance', async () => {
      const gov = await fetchSubgraph(chainId, QUERIES.getGovernanceStats, { governanceIds, stToken })
      saveSnapshot(`${dir}/governance.json`, subgraphUrlFor(chainId)!, gov, { dtf: addr, chainId, query: 'getGovernanceStats' })

      const proposals = ((gov?.governances as Array<{ proposals?: Array<{ id: string }> }>) ?? []).flatMap(
        (g) => g.proposals ?? []
      )
      console.log(`  ${proposals.length} proposal(s)`)
      for (const p of proposals.slice(0, 10)) {
        await tryCapture(`proposal ${p.id}`, async () => {
          const detail = await fetchSubgraph(chainId, QUERIES.getProposalDetail, { id: p.id })
          saveSnapshot(`${dir}/proposals/${p.id}.json`, subgraphUrlFor(chainId)!, detail, {
            dtf: addr,
            chainId,
            query: 'getProposalDetail',
            proposalId: p.id,
          })
        })
      }
    })
  }
}

async function main() {
  console.log('Capturing e2e snapshots from production...')
  await captureShared()
  for (const dtf of REGISTRY) await captureDtf(dtf)
  saveSnapshot('_meta.json', 'e2e/scripts/capture.ts', {
    capturedAt: new Date().toISOString(),
    dtfs: REGISTRY.map((d) => ({ slug: d.slug, address: d.address, chainId: d.chainId })),
  })
  console.log('\nDone. Snapshots in e2e/snapshots/')
}

main().catch((e) => {
  console.error('Capture failed:', e)
  process.exit(1)
})
