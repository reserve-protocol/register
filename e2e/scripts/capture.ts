/**
 * Capture e2e snapshots from live production APIs + subgraphs into
 * e2e/snapshots/<chain>/<slug>/*.json, wrapped in a {_meta, data} envelope.
 *
 * Usage:
 *   pnpm e2e:capture              full capture (all boundaries, all DTFs)
 *   pnpm e2e:capture --only=dtf   re-capture ONLY dtf.json + chain-state.json
 *   pnpm e2e:capture --only=chain re-capture ONLY chain-state.json
 *
 * The targeted modes exist so we can refresh the SDK-shaped GetIndexDTF payload
 * and on-chain basket reads WITHOUT churning the proposal/governance/historical
 * snapshots that committed flow specs depend on.
 *
 * Time-series responses (historical price, exposure) are downsampled to
 * MAX_SERIES_POINTS before writing to keep the repo lean; the moving-window
 * params and downsampling are recorded in _meta.window.
 */
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createPublicClient, http, type Address, type Abi } from 'viem'
import { CHAINS, REGISTRY, type RegistryDTF } from '../helpers/registry'
import {
  PINNED_PROPOSALS,
  PRESERVED_FLOW_FILES,
  requiredSnapshotPaths,
} from '../helpers/snapshot-manifest'

const snapshotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'snapshots')
const e2eDir = join(snapshotsDir, '..')
let outputDir = snapshotsDir
const captureFailures: string[] = []
const RESERVE_API = 'https://api.reserve.org'
const MAX_SERIES_POINTS = 200
const MAX_SNAPSHOT_AGE_MS = 45 * 86_400_000

// Targeted capture mode from `--only=<dtf|chain>`; undefined = full capture.
type OnlyMode = 'dtf' | 'chain'
function parseOnly(): OnlyMode | undefined {
  const arg = process.argv.find((a) => a.startsWith('--only='))
  const value = arg?.split('=')[1]
  if (value === 'dtf' || value === 'chain') return value
  if (value) throw new Error(`Unknown --only value: ${value} (expected dtf|chain)`)
  return undefined
}

// Public RPC per chain for on-chain reads (totalAssets/totalSupply/decimals).
const PUBLIC_RPC: Record<number, string> = {
  1: 'https://ethereum-rpc.publicnode.com',
  8453: 'https://base-rpc.publicnode.com',
  56: 'https://bsc-rpc.publicnode.com',
}

// Minimal folio ABI for the basket-shaping reads the SDK does off-chain.
const FOLIO_ABI = [
  {
    type: 'function',
    name: 'totalAssets',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address[]' }, { type: 'uint256[]' }],
  },
  { type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'version', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
] as const satisfies Abi

// ERC-20 metadata for every basket token — the SDK's getBasket follows
// totalAssets() with a name/symbol/decimals multicall over the basket tokens,
// so the RPC mock must answer those per-address too.
const ERC20_META_ABI = [
  { type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
] as const satisfies Abi

const subgraphUrlFor = (chainId: number) =>
  Object.values(CHAINS).find((c) => c.chainId === chainId)?.indexSubgraphUrl

// --- Time-series downsampling ---

interface DownsampleReport {
  path: string
  from: number
  to: number
}

interface CapturedDtfGovernanceRefs {
  ownerGovernance?: { id?: string }
  legacyAdmins?: string[]
  tradingGovernance?: { id?: string }
  legacyAuctionApprovers?: string[]
  stToken?: {
    id?: string
    governance?: { id?: string }
    legacyGovernance?: string[]
  }
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
  const full = join(outputDir, relativePath)
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
  if (json.errors?.length) {
    throw new Error(`Subgraph errors chain ${chainId}: ${JSON.stringify(json.errors)}`)
  }
  return json.data ?? null
}

// --- GraphQL queries (mirror the app's operations, defined once) ---

const QUERIES = {
  // Verbatim copy of the SDK's GetIndexDtfDocument — `sdk.index.get` (via
  // react-sdk's useCurrentIndexDtf) feeds this exact shape through `mapIndexDtf`
  // → `mapIndexDtfData`, and it reads nested fields (admins, token.address,
  // token.snapshot, weightControl/priceControl, governance name/version/
  // optimistic params, delegation counts) that the old hand-written query
  // omitted — so a legacy-shaped snapshot made mapIndexDtf throw.
  //
  // NOT importable: @reserve-protocol/sdk@0.2.0 does not export the document.
  // Source: @reserve-protocol/sdk@0.2.0 dist/index.mjs, const GetIndexDtfDocument
  // (query GetIndexDTF). Keep in sync on SDK bumps — the dtf-data.spec canary
  // catches drift. `$block` is omitted at call time (always latest).
  getDTF: `query GetIndexDTF($id: ID!, $block: Block_height) {
    dtf(id: $id, block: $block) {
      id
      proxyAdmin
      timestamp
      deployer
      ownerAddress
      admins
      mintingFee
      tvlFee
      annualizedTvlFee
      mandate
      auctionDelay
      auctionLength
      auctionApprovers
      auctionLaunchers
      brandManagers
      totalRevenue
      protocolRevenue
      governanceRevenue
      externalRevenue
      feeRecipients
      bidsEnabled
      trustedFillerRegistry
      trustedFillerEnabled
      weightControl
      priceControl
      ownerGovernance {
        id
        name
        version
        votingDelay
        votingPeriod
        proposalThreshold
        quorumVotes
        quorumNumerator
        quorumDenominator
        isOptimistic
        optimisticVetoDelay
        optimisticVetoPeriod
        optimisticVetoThreshold
        optimisticProposalThrottleCapacity
        optimisticSelectorRegistry
        optimisticProposers
        timelock {
          id
          guardians
          optimisticProposers
          executionDelay
          type
        }
      }
      legacyAdmins
      tradingGovernance {
        id
        name
        version
        votingDelay
        votingPeriod
        proposalThreshold
        quorumVotes
        quorumNumerator
        quorumDenominator
        isOptimistic
        optimisticVetoDelay
        optimisticVetoPeriod
        optimisticVetoThreshold
        optimisticProposalThrottleCapacity
        optimisticSelectorRegistry
        optimisticProposers
        timelock {
          id
          guardians
          optimisticProposers
          executionDelay
          type
        }
      }
      legacyAuctionApprovers
      token {
        id
        address
        name
        symbol
        decimals
        totalSupply
        currentHolderCount
        cumulativeHolderCount
        transferCount
        mintCount
        burnCount
        totalBurned
        totalMinted
      }
      stToken {
        id
        token {
          id
          address
          name
          symbol
          decimals
          totalSupply
          currentHolderCount
          cumulativeHolderCount
          transferCount
          mintCount
          burnCount
          totalBurned
          totalMinted
        }
        currentDelegates
        totalDelegates
        delegatedVotesRaw
        currentOptimisticDelegates
        totalOptimisticDelegates
        optimisticDelegatedVotesRaw
        underlying {
          name
          symbol
          address
          decimals
        }
        governance {
          id
          name
          version
          votingDelay
          votingPeriod
          proposalThreshold
          quorumVotes
          quorumNumerator
          quorumDenominator
          isOptimistic
          optimisticVetoDelay
          optimisticVetoPeriod
          optimisticVetoThreshold
          optimisticProposalThrottleCapacity
          optimisticSelectorRegistry
          optimisticProposers
          timelock {
            id
            guardians
            optimisticProposers
            executionDelay
            type
          }
        }
        legacyGovernance
        rewards(where: {active: true}) {
          rewardToken {
            address
            name
            symbol
            decimals
          }
        }
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
    const message = `${label}: ${(e as Error).message}`
    captureFailures.push(message)
    console.warn(`  ! ${message}`)
    return undefined
  }
}

async function captureShared() {
  console.log('\nShared:')
  await tryCapture('discover-dtfs', async () => {
    const url = `${RESERVE_API}/discover/dtfs?performance=true&brand=true`
    saveSnapshot('shared/discover-dtfs.json', url, await fetchApi(url))
  })
  await tryCapture('featured-dtfs', async () => {
    const url = 'https://api-staging.reserve.org/v1/discover/featured'
    saveSnapshot('shared/featured-dtfs.json', url, await fetchApi(url))
  })
  await tryCapture('protocol-metrics', async () => {
    const url = `${RESERVE_API}/protocol/metrics`
    saveSnapshot('shared/protocol-metrics.json', url, await fetchApi(url))
  })
}

async function capturePinnedFlowFixtures() {
  for (const { snapshotDir, proposalId } of PINNED_PROPOSALS) {
    const dtf = REGISTRY.find((entry) => entry.snapshotDir === snapshotDir)
    if (!dtf) throw new Error(`Pinned proposal has no registry DTF: ${snapshotDir}`)
    await tryCapture(`pinned proposal ${proposalId}`, async () => {
      const detail = await fetchSubgraph(dtf.chainId, QUERIES.getProposalDetail, {
        id: proposalId,
      })
      saveSnapshot(
        `${snapshotDir}/proposals/${proposalId}.json`,
        subgraphUrlFor(dtf.chainId)!,
        detail,
        {
          dtf: dtf.address.toLowerCase(),
          chainId: dtf.chainId,
          query: 'getProposalDetail',
          proposalId,
        }
      )
    })
  }

  for (const relativePath of PRESERVED_FLOW_FILES) {
    const source = join(snapshotsDir, relativePath)
    if (!existsSync(source)) {
      captureFailures.push(`preserved fixture missing: ${relativePath}`)
      continue
    }
    const raw = JSON.parse(readFileSync(source, 'utf-8')) as {
      _meta?: { capturedAt?: string }
    }
    const capturedAt = Date.parse(raw._meta?.capturedAt ?? '')
    if (!Number.isFinite(capturedAt) || Date.now() - capturedAt > MAX_SNAPSHOT_AGE_MS) {
      captureFailures.push(`preserved fixture stale or invalid: ${relativePath}`)
      continue
    }
    const destination = join(outputDir, relativePath)
    mkdirSync(dirname(destination), { recursive: true })
    copyFileSync(source, destination)
    console.log(`  preserved ${relativePath}`)
  }
}

// Read the folio's on-chain basket shape (totalAssets), supply and decimals via
// a live RPC. These feed the RPC mock's address-specific eth_call overrides so
// the SDK's off-chain basket derivation (which reads totalAssets) resolves to a
// real, non-empty basket. bigints are hex-encoded as strings.
async function captureChainState(dtf: RegistryDTF) {
  const addr = dtf.address.toLowerCase()
  const dir = dtf.snapshotDir
  const rpcUrl = PUBLIC_RPC[dtf.chainId]
  if (!rpcUrl) throw new Error(`No public RPC for chain ${dtf.chainId}`)

  await tryCapture('chain-state', async () => {
    const client = createPublicClient({ transport: http(rpcUrl) })
    const contract = { address: dtf.address as Address, abi: FOLIO_ABI } as const
    const [assets, totalSupply, decimals, version] = await Promise.all([
      client.readContract({ ...contract, functionName: 'totalAssets' }),
      client.readContract({ ...contract, functionName: 'totalSupply' }),
      client.readContract({ ...contract, functionName: 'decimals' }),
      client.readContract({ ...contract, functionName: 'version' }),
    ])
    const [tokens, amounts] = assets as readonly [readonly Address[], readonly bigint[]]

    // Basket-token metadata, mirroring the SDK's getTokensData multicall.
    const meta = await client.multicall({
      // Canonical Multicall3, same address on eth/base/bsc (chain not configured
      // on this ad-hoc client, so viem can't infer it).
      multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
      allowFailure: false,
      contracts: tokens.flatMap((address) => [
        { address, abi: ERC20_META_ABI, functionName: 'name' } as const,
        { address, abi: ERC20_META_ABI, functionName: 'symbol' } as const,
        { address, abi: ERC20_META_ABI, functionName: 'decimals' } as const,
      ]),
    })
    const basketTokens = tokens.map((address, i) => ({
      address: address.toLowerCase(),
      name: meta[i * 3] as string,
      symbol: meta[i * 3 + 1] as string,
      decimals: Number(meta[i * 3 + 2]),
    }))

    const data = {
      totalAssets: {
        tokens: tokens.map((t) => t.toLowerCase()),
        amounts: amounts.map((a) => '0x' + a.toString(16)),
      },
      totalSupply: '0x' + (totalSupply as bigint).toString(16),
      decimals: Number(decimals),
      version: version as string,
      basketTokens,
    }
    saveSnapshot(`${dir}/chain-state.json`, rpcUrl, data, { dtf: addr, chainId: dtf.chainId })
  })
}

// Re-capture only the SDK-shaped GetIndexDTF subgraph payload for one DTF.
async function captureDtfSubgraph(
  dtf: RegistryDTF
): Promise<{ dtf?: Record<string, unknown> } | undefined> {
  const addr = dtf.address.toLowerCase()
  const dir = dtf.snapshotDir
  return tryCapture('dtf', async () => {
    const data = (await fetchSubgraph(dtf.chainId, QUERIES.getDTF, { id: addr })) as {
      dtf?: Record<string, unknown>
    } | null
    saveSnapshot(`${dir}/dtf.json`, subgraphUrlFor(dtf.chainId)!, data, {
      dtf: addr,
      chainId: dtf.chainId,
      query: 'GetIndexDTF',
    })
    return data ?? undefined
  })
}

async function captureDtf(dtf: RegistryDTF, only?: OnlyMode) {
  const dir = dtf.snapshotDir
  const addr = dtf.address.toLowerCase()
  const chainId = dtf.chainId
  console.log(`\n${dtf.slug.toUpperCase()} (${dtf.chain}, ${addr}):`)

  // Targeted modes touch ONLY dtf.json / chain-state.json — never the
  // proposal/governance/historical snapshots flow specs depend on.
  if (only === 'chain') {
    await captureChainState(dtf)
    return
  }
  if (only === 'dtf') {
    await captureDtfSubgraph(dtf)
    await captureChainState(dtf)
    return
  }

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
    if (!tokens.length) throw new Error(`current-price returned no basket tokens for ${dtf.slug}`)
    const url = `${RESERVE_API}/current/prices?chainId=${chainId}&tokens=${tokens.join(',')}`
    saveSnapshot(`${dir}/token-prices.json`, url, await fetchApi(url), { dtf: addr, chainId })
  })

  const dtfData = await captureDtfSubgraph(dtf)
  await captureChainState(dtf)

  await tryCapture('transfer-events', async () => {
    const data = await fetchSubgraph(chainId, QUERIES.getTransferEvents, { dtf: addr })
    saveSnapshot(`${dir}/transfer-events.json`, subgraphUrlFor(chainId)!, data, { dtf: addr, chainId, query: 'getTransferEvents' })
  })

  await tryCapture('rebalances', async () => {
    const data = await fetchSubgraph(chainId, QUERIES.getRebalances, { dtf: addr })
    saveSnapshot(`${dir}/rebalances.json`, subgraphUrlFor(chainId)!, data, { dtf: addr, chainId, query: 'getRebalances' })
  })

  const d = dtfData?.dtf as CapturedDtfGovernanceRefs | undefined
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
  const only = parseOnly()
  if (only) {
    // Targeted refresh: dtf.json (+ chain-state) or chain-state only. Leaves the
    // shared/proposal/governance/historical snapshots untouched (and _meta's
    // capturedAt, so e2e:check freshness still reflects the last FULL capture).
    console.log(`Targeted capture (--only=${only})...`)
    const temporaryDir = mkdtempSync(join(e2eDir, '.snapshots-targeted-'))
    cpSync(snapshotsDir, temporaryDir, { recursive: true })
    outputDir = temporaryDir
    for (const dtf of REGISTRY) await captureDtf(dtf, only)
    if (captureFailures.length) {
      throw new Error(`Targeted snapshot capture incomplete:\n${captureFailures.join('\n')}`)
    }
    publishSnapshotTree(temporaryDir)
    console.log('\nDone. Snapshots in e2e/snapshots/')
    return
  }

  console.log('Capturing e2e snapshots from production...')
  const temporaryDir = mkdtempSync(join(e2eDir, '.snapshots-capture-'))
  outputDir = temporaryDir
  await captureShared()
  for (const dtf of REGISTRY) await captureDtf(dtf)
  await capturePinnedFlowFixtures()
  if (captureFailures.length) {
    throw new Error(`Snapshot capture incomplete:\n${captureFailures.join('\n')}`)
  }
  const missing = requiredSnapshotPaths().filter(
    (relativePath) => !existsSync(join(temporaryDir, relativePath))
  )
  if (missing.length) {
    throw new Error(`Snapshot capture missing required files:\n${missing.join('\n')}`)
  }
  saveSnapshot('_meta.json', 'e2e/scripts/capture.ts', {
    capturedAt: new Date().toISOString(),
    dtfs: REGISTRY.map((d) => ({ slug: d.slug, address: d.address, chainId: d.chainId })),
  })
  publishSnapshotTree(temporaryDir)
  console.log('\nDone. Snapshots in e2e/snapshots/')
}

function publishSnapshotTree(temporaryDir: string) {
  const backupDir = `${snapshotsDir}.previous`
  rmSync(backupDir, { recursive: true, force: true })
  renameSync(snapshotsDir, backupDir)
  try {
    renameSync(temporaryDir, snapshotsDir)
    outputDir = snapshotsDir
    rmSync(backupDir, { recursive: true, force: true })
  } catch (error) {
    if (!existsSync(snapshotsDir) && existsSync(backupDir)) {
      renameSync(backupDir, snapshotsDir)
    }
    throw error
  }
}

main().catch((e) => {
  if (outputDir !== snapshotsDir) rmSync(outputDir, { recursive: true, force: true })
  console.error('Capture failed:', e)
  process.exit(1)
})
