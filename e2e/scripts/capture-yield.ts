/**
 * Capture Yield-DTF (RToken) e2e fixtures by DRIVING THE REAL APP against a
 * block-pinned recording proxy — the empirical opposite of hand-encoding calls.
 *
 * Yield views read almost everything from RPC via vendored ABIs (FacadeRead,
 * Main, StRSR, BasketHandler, RToken, collateral plugins), NOT off-chain via the
 * SDK. So we record a **record/replay eth_call map** (`address:calldata → return`)
 * plus the yield subgraph responses the page actually fires, at a PINNED block
 * per chain. The replay mock (helpers/rpc.ts resolveYieldQuery + the yield
 * eth_call table) serves these back verbatim; the overview smoke freezes to the
 * pinned block timestamp so any block.timestamp-derived calldata regenerates
 * identically.
 *
 * Usage: pnpm e2e:capture:yield   (dev server must be up on 127.0.0.1:3005)
 *
 * Why Playwright and not viem hand-calls: the app builds calldata (multicall
 * batching, timestamp args, collateral-specific price selectors) we must not
 * guess. We let the app produce them and record the real answers.
 */
import { chromium, type Route } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import {
  createPublicClient,
  decodeFunctionData,
  decodeFunctionResult,
  http,
  multicall3Abi,
  type Hex,
} from 'viem'
import { CHAINS, YIELD_REGISTRY, rtokenPath, type YieldDTF } from '../helpers/registry'
import { RPC_HOST_PATTERNS, YIELD_REVERT_SENTINEL } from '../helpers/rpc'

const snapshotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'snapshots')
const BASE_URL = 'http://127.0.0.1:3005'
const MULTICALL3 = '0xca11bde05977b3631167028862be2a173976ca11'
const SETTLE_MS = 16_000
const MAX_SERIES = 400

const hexBlock = (n: bigint) => '0x' + n.toString(16)

function saveSnapshot(relativePath: string, data: unknown, extra: Record<string, unknown>) {
  const full = join(snapshotsDir, relativePath)
  mkdirSync(dirname(full), { recursive: true })
  const snapshot = {
    _meta: { source: 'e2e/scripts/capture-yield.ts', capturedAt: new Date().toISOString(), ...extra },
    data,
  }
  writeFileSync(full, JSON.stringify(snapshot, null, 2))
  console.log(`  ok ${relativePath}`)
}

// Even-sample any oversized time series so recorded chart snapshots stay lean.
function capSeries(value: unknown): unknown {
  if (Array.isArray(value)) {
    let arr = value
    if (arr.length > MAX_SERIES) {
      const step = arr.length / MAX_SERIES
      const out: unknown[] = []
      for (let i = 0; i < MAX_SERIES; i++) out.push(arr[Math.floor(i * step)])
      out[out.length - 1] = arr[arr.length - 1]
      arr = out
    }
    return arr.map(capSeries)
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = capSeries(v)
    return out
  }
  return value
}

interface RpcReq {
  id: number
  method: string
  params?: unknown[]
}

interface GraphEntry {
  op: string
  query: string
  variables: Record<string, unknown>
  data: unknown
}

async function captureDtf(dtf: YieldDTF) {
  const chain = CHAINS[dtf.chain]
  const rpcUrl = chain.captureRpcUrl
  if (!rpcUrl) throw new Error(`No captureRpcUrl for ${dtf.chain}`)
  console.log(`\n${dtf.symbol} (${dtf.chain}, ${dtf.address.toLowerCase()}):`)

  // Pin a block a few behind the tip so the public RPC reliably serves eth_call
  // at it. Its timestamp anchors every block.timestamp-derived read.
  const client = createPublicClient({ transport: http(rpcUrl) })
  const tip = await client.getBlockNumber()
  const pinnedBlock = tip - 3n
  const block = await client.getBlock({ blockNumber: pinnedBlock })
  const blockTimestamp = Number(block.timestamp)
  const pinnedHex = hexBlock(pinnedBlock)
  console.log(`  pinned block ${pinnedBlock} (ts ${blockTimestamp})`)

  const ethCallMap: Record<string, Hex> = {}
  const graphEntries: GraphEntry[] = []
  // Dedup graph ops across the multi-view walk (overview/issuance/staking all
  // fire the shared token/overview queries) so re-navigations don't triple the
  // file. Keyed by op + normalized query + identity vars (fromTime excluded —
  // it's the now-relative window the replay resolver already ignores).
  const seenGraphKeys = new Set<string>()

  const recordCall = (to: string, data: string, result: Hex) => {
    if (!data || data === '0x') return
    // A successful answer always wins over a prior revert marker.
    ethCallMap[`${to.toLowerCase()}:${data.toLowerCase()}`] = result
  }

  // Record an allow-failure probe that REVERTED on-chain so the replay serves a
  // real success:false (see YIELD_REVERT_SENTINEL). Only mark when no successful
  // value exists for the key — a success recorded elsewhere must not be clobbered.
  const recordRevert = (to: string, data: string) => {
    const key = `${to.toLowerCase()}:${data.toLowerCase()}`
    if (!(key in ethCallMap)) ethCallMap[key] = YIELD_REVERT_SENTINEL as Hex
  }

  const recordEthCall = (to: string, data: string, result: Hex) => {
    if (to.toLowerCase() === MULTICALL3) {
      try {
        const decoded = decodeFunctionData({ abi: multicall3Abi, data: data as Hex })
        if (decoded.functionName === 'aggregate3') {
          const calls = decoded.args[0] as ReadonlyArray<{ target: string; callData: string }>
          const results = decodeFunctionResult({
            abi: multicall3Abi,
            functionName: 'aggregate3',
            data: result,
          }) as ReadonlyArray<{ success: boolean; returnData: Hex }>
          calls.forEach((c, i) => {
            if (results[i]?.success) recordCall(c.target, c.callData, results[i].returnData)
            else recordRevert(c.target, c.callData)
          })
          return
        }
      } catch {
        /* fall through to raw record */
      }
    }
    recordCall(to, data, result)
  }

  // Rewrite moving block tags to the pinned block so every read is consistent
  // and block.timestamp is deterministic.
  const pinParams = (req: RpcReq): RpcReq => {
    if (req.method === 'eth_call' || req.method === 'eth_getBalance' || req.method === 'eth_getCode') {
      const params = [...(req.params ?? [])]
      if (params.length >= 2 && typeof params[1] === 'string') params[1] = pinnedHex
      else if (req.method === 'eth_call') params[1] = pinnedHex
      return { ...req, params }
    }
    if (req.method === 'eth_getBlockByNumber') {
      const params = [...(req.params ?? [])]
      const tag = params[0]
      if (typeof tag === 'string' && !tag.startsWith('0x')) params[0] = pinnedHex
      return { ...req, params }
    }
    return req
  }

  const forward = async (body: unknown): Promise<unknown> => {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  const handleRpc = async (route: Route) => {
    const request = route.request()
    if (request.method() !== 'POST') return route.fallback()
    let body: RpcReq | RpcReq[]
    try {
      body = request.postDataJSON()
    } catch {
      return route.fallback()
    }
    const isBatch = Array.isArray(body)
    const reqs = (isBatch ? body : [body]) as RpcReq[]
    const pinned = reqs.map(pinParams)
    const forwarded = (await forward(isBatch ? pinned : pinned[0])) as
      | { id: number; result?: Hex }
      | Array<{ id: number; result?: Hex }>
    const responses = Array.isArray(forwarded) ? forwarded : [forwarded]

    // Record eth_call answers; pin eth_blockNumber to the pinned block.
    const byId = new Map(responses.map((r) => [r.id, r]))
    for (const req of pinned) {
      const resp = byId.get(req.id)
      if (!resp) continue
      if (req.method === 'eth_blockNumber') resp.result = pinnedHex as Hex
      if (req.method === 'eth_call' && resp.result && resp.result !== '0x') {
        const call = req.params?.[0] as { to?: string; data?: string } | undefined
        if (call?.to && call.data) recordEthCall(call.to, call.data, resp.result)
      }
      // A standalone eth_call that reverted (error, no result) is a captured
      // allow-failure probe — record the revert so the replay is deterministic.
      if (req.method === 'eth_call' && (resp as { error?: unknown }).error) {
        const call = req.params?.[0] as { to?: string; data?: string } | undefined
        if (call?.to && call.data !== undefined) recordRevert(call.to, call.data)
      }
      // Record raw storage reads (address:slot → word) into the SAME map. The
      // staking withdraw updater reads the stToken's draft-era slot via
      // eth_getStorageAt (not calldata), so it needs an exact captured answer —
      // the replay fails loud otherwise (no blanket storage word). A 32-byte
      // slot key (0x + 64 hex) can't collide with an eth_call calldata key
      // (which starts with a 4-byte selector).
      if (req.method === 'eth_getStorageAt' && resp.result && resp.result !== '0x') {
        const addr = req.params?.[0] as string | undefined
        const slot = req.params?.[1] as string | undefined
        if (addr && slot) ethCallMap[`${addr.toLowerCase()}:${slot.toLowerCase()}`] = resp.result as Hex
      }
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(isBatch ? responses : responses[0]),
    })
  }

  const handleGraph = async (route: Route) => {
    const request = route.request()
    if (request.method() !== 'POST') return route.fallback()
    const raw = request.postData() ?? '{}'
    let parsed: { operationName?: string; query?: string; variables?: Record<string, unknown> }
    try {
      parsed = JSON.parse(raw)
    } catch {
      return route.fallback()
    }
    const res = await fetch(request.url(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: raw,
    })
    const json = (await res.json()) as { data?: unknown }
    // Only record ops against THIS DTF's yield subgraph (skip cross-chain lists
    // that belong to the other fixture's chain — they get captured on its run).
    if (request.url().includes(`dtf-yield-${dtf.chain}`) && json?.data) {
      const normQuery = (parsed.query ?? '').replace(/\s+/g, ' ').trim()
      const { fromTime: _fromTime, ...idVars } = parsed.variables ?? {}
      const key = `${parsed.operationName ?? ''}::${normQuery}::${JSON.stringify(idVars)}`
      if (!seenGraphKeys.has(key)) {
        seenGraphKeys.add(key)
        graphEntries.push({
          op: parsed.operationName ?? '',
          query: normQuery,
          variables: parsed.variables ?? {},
          data: capSeries(json.data),
        })
      }
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(json),
    })
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.addInitScript(() => {
    localStorage.setItem('splashVisible', 'false')
    localStorage.setItem('register.locale', 'en')
  })
  for (const pattern of RPC_HOST_PATTERNS) await page.route(pattern, handleRpc)
  await page.route('**/api.goldsky.com/**', handleGraph)

  // Walk every read-only view we smoke-test, at the SAME pinned block, so the
  // eth_call map + subgraph ops feed overview, issuance, and staking from one
  // consistent snapshot. Reads accumulate into the shared maps (keys are
  // deduped); account-parameterized reads (balanceOf/allowance) don't fire
  // because no wallet is connected — those are served by handlers at test time.
  const views = ['overview', 'issuance', 'staking'] as const
  for (const view of views) {
    await page.goto(`${BASE_URL}${rtokenPath(dtf, view)}`)
    await page.waitForTimeout(SETTLE_MS)
    // Issuance defaults to the Zap panel (off-chain quote APIs). Switch to the
    // manual mint/redeem surface so its RPC-only reads — the read-only smoke's
    // target — are recorded too.
    if (view === 'issuance') {
      const toggle = page.getByTestId('issuance-manual-toggle')
      if (await toggle.count()) {
        await toggle.first().click().catch(() => {})
        await page.waitForTimeout(SETTLE_MS)
      }
    }
  }
  await browser.close()

  const callCount = Object.keys(ethCallMap).length
  console.log(`  recorded ${callCount} eth_call(s), ${graphEntries.length} subgraph op(s)`)
  if (callCount === 0) throw new Error(`No eth_calls recorded for ${dtf.symbol} — page did not load`)

  const extra = { dtf: dtf.address.toLowerCase(), chainId: dtf.chainId }
  saveSnapshot(`${dtf.snapshotDir}/rtoken-chain-state.json`, ethCallMap, {
    ...extra,
    block: Number(pinnedBlock),
    blockTimestamp,
    rpc: rpcUrl,
  })
  saveSnapshot(`${dtf.snapshotDir}/yield-graph.json`, graphEntries, {
    ...extra,
    subgraph: chain.yieldSubgraphUrl,
  })
}

async function main() {
  // Verify the dev server is up first — this capture drives the real app.
  const ping = await fetch(BASE_URL).catch(() => undefined)
  if (!ping?.ok) throw new Error(`Dev server not reachable at ${BASE_URL}. Start it first.`)

  console.log('Capturing Yield-DTF (RToken) fixtures from the live app...')
  for (const dtf of YIELD_REGISTRY) await captureDtf(dtf)
  console.log('\nDone. Yield snapshots in e2e/snapshots/')
}

main().catch((e) => {
  console.error('Yield capture failed:', e)
  process.exit(1)
})
