import type { APIRequestContext, Route } from '@playwright/test'
import type { UnmockedLogger } from './logger'
import { validateLiveResponse } from './live-contracts'
import type { BoundaryRequest } from './requests'

// Live-API mode — the ONLY seam where an e2e run talks to a real Reserve/zapper
// deployment. Default (no env vars) is unchanged: every boundary is mocked and
// external egress is denied.
//
// Two INDEPENDENT surfaces, mirroring src/utils/constants.ts (RESERVE_API vs
// ZAPPER_API) and the actual deployments behind them:
//
//   zapper  — /api/zapper/** and /api/prices/**. Served by the Rust
//             public-api (the "planner"): swap quotes, deploy zaps, the
//             zappable token list, upstream token pricing.
//   reserve — everything else on api.reserve.org: /current/*, /historical/*,
//             /dtf/*, /v1/*, /v2/*, the velora|enso aggregator proxies.
//             Served by reserve-api (Fastify), which proxies the zapper
//             surface upstream.
//
// Split matters for zrs1: https://zrs-1.reserve-api.com IS a planner
// deployment, so it serves the zapper surface (and /api/prices) but returns 404
// for reserve-api's own endpoints. Point the zapper surface at zrs1 and the
// reserve surface at production/staging to validate both in one run.
//
//   E2E_LIVE_ZAPPER_API=zrs1 pnpm e2e:live
//   E2E_LIVE_ZAPPER_API=zrs1 E2E_LIVE_RESERVE_API=production pnpm e2e:live
//   E2E_LIVE_RESERVE_API=https://my-branch.example.com pnpm e2e:live
//
// Requests are rewritten at the Playwright route boundary (origin swap, path +
// query preserved), fetched from Node, validated against the per-endpoint
// contracts in live-contracts.ts, and fulfilled back into the page. RPC,
// subgraph and wallet stay mocked, so chain state remains deterministic while
// the API boundary is real.

export type LiveSurface = 'reserve' | 'zapper'

export const LIVE_TARGETS: Record<string, string> = {
  zrs1: 'https://zrs-1.reserve-api.com',
  production: 'https://api.reserve.org',
  staging: 'https://api-staging.reserve.org',
}

export const LIVE_ENV_VARS: Record<LiveSurface, string> = {
  reserve: 'E2E_LIVE_RESERVE_API',
  zapper: 'E2E_LIVE_ZAPPER_API',
}

// Live upstreams are slower and less predictable than a mock: a cold zappable
// token list or a deep-liquidity quote can take tens of seconds.
export const LIVE_REQUEST_TIMEOUT = 60_000

export interface LiveTarget {
  surface: LiveSurface
  // Named target (`zrs1`) or `custom` for an explicit URL.
  name: string
  // Origin without a trailing slash.
  base: string
}

export type LiveConfig = Partial<Record<LiveSurface, LiveTarget>>

// Resolve one surface's env value: a named target or an absolute http(s) URL.
// A typo must fail loudly — silently falling back to mocks would report a green
// "live" run that never left the machine.
export function resolveLiveTarget(
  surface: LiveSurface,
  value: string | undefined
): LiveTarget | undefined {
  const raw = value?.trim()
  if (!raw) return undefined

  const named = LIVE_TARGETS[raw]
  if (named) return { surface, name: raw, base: named }

  if (/^https?:\/\//.test(raw)) {
    const url = new URL(raw)
    return { surface, name: 'custom', base: url.origin }
  }

  throw new Error(
    `${LIVE_ENV_VARS[surface]}="${raw}" is not a known target. Use one of ` +
      `${Object.keys(LIVE_TARGETS).join(', ')} or an absolute http(s) URL.`
  )
}

export function liveConfig(env: Record<string, string | undefined> = process.env): LiveConfig {
  const config: LiveConfig = {}
  for (const surface of ['reserve', 'zapper'] as const) {
    const target = resolveLiveTarget(surface, env[LIVE_ENV_VARS[surface]])
    if (target) config[surface] = target
  }
  return config
}

export function isLiveMode(config: LiveConfig = liveConfig()): boolean {
  return Boolean(config.reserve || config.zapper)
}

export function describeLiveConfig(config: LiveConfig): string {
  const parts = (['reserve', 'zapper'] as const)
    .map((surface) => {
      const target = config[surface]
      return target ? `${surface}=${target.name} (${target.base})` : `${surface}=mocked`
    })
  return parts.join(', ')
}

// Which deployment owns a path. The planner surface is prefix-identified; the
// rest of api.reserve.org belongs to reserve-api.
export function surfaceForPath(pathname: string): LiveSurface {
  return pathname.startsWith('/api/zapper/') || pathname.startsWith('/api/prices/')
    ? 'zapper'
    : 'reserve'
}

// Origin swap only — path and query are register's, and that is exactly what is
// under validation.
export function liveUrl(url: URL, target: LiveTarget): string {
  return `${target.base}${url.pathname}${url.search}`
}

export interface LivePassthroughOptions {
  // Contract failures, appended as human-readable lines. The base fixture fails
  // the test at teardown when non-empty (same contract as `unmockedCalls`).
  violations: string[]
  log?: UnmockedLogger
  requests?: BoundaryRequest[]
}

function violation(violations: string[], line: string) {
  const message = `[E2E] live contract ${line}`
  violations.push(message)
  console.error(message)
}

// Browser-facing headers for a fulfilled live response. The upstream's CORS
// headers are for app.reserve.org, not 127.0.0.1:3005, and content-encoding /
// content-length would describe the already-decoded body.
function fulfillHeaders(): Record<string, string> {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'cache-control': 'no-store',
  }
}

// A page closing with live requests still in flight is not a target failure:
// the fetch is abandoned (or its response disposed with the context), nobody
// consumes it, and the spec's assertions already ran. Only real
// transport/timeout failures are violations.
export function isTeardownRace(message: string): boolean {
  return /has been closed|has been disposed|Target closed|Test ended/.test(message)
}

// Fetch one request from the live target, validate it, and fulfill the page.
export async function fulfillFromLive(
  route: Route,
  target: LiveTarget,
  options: LivePassthroughOptions
): Promise<void> {
  const request = route.request()
  const method = request.method()
  const url = new URL(request.url())

  // Cross-origin JSON POSTs (deploy zaps) preflight. The mock boundary never
  // saw one; answer it locally so the real POST can go out.
  if (method === 'OPTIONS') {
    return route.fulfill({ status: 204, headers: fulfillHeaders(), body: '' })
  }

  const liveTarget = liveUrl(url, target)
  let status: number
  let body: string
  let contentType: string
  try {
    const response = await route.fetch({
      url: liveTarget,
      timeout: LIVE_REQUEST_TIMEOUT,
      maxRedirects: 5,
    })
    status = response.status()
    body = await response.text()
    contentType = response.headers()['content-type'] ?? 'application/json'
  } catch (error) {
    const message = (error as Error).message
    if (isTeardownRace(message)) return
    violation(
      options.violations,
      `${method} ${target.name}${url.pathname} request failed: ${message}`
    )
    return route.fulfill({
      status: 599,
      headers: { ...fulfillHeaders(), 'content-type': 'application/json' },
      body: JSON.stringify({ error: '[E2E] live request failed' }),
    })
  }

  for (const line of validateLiveResponse({
    surface: target.surface,
    targetName: target.name,
    method,
    url,
    status,
    body,
    postData: request.postData() ?? undefined,
  })) {
    violation(options.violations, line)
  }

  // Live requests are recorded on the same boundary log as mocked ones, so a
  // live spec can assert request identity/parameters exactly like an offline
  // one (helpers/requests.ts).
  options.requests?.push({
    boundary: 'api',
    method,
    pathname: url.pathname,
    search: Object.fromEntries(url.searchParams),
  })

  return route.fulfill({
    status,
    headers: { ...fulfillHeaders(), 'content-type': contentType },
    body,
  })
}

// Hybrid mode's one structural limitation. The API surface is live (today's
// basket) while chain state stays pinned at the last `pnpm e2e:capture`, and the
// SDK joins the two by token address: a token the deployment reports but the
// mocked chain has never heard of leaves the DTF header/chart on its skeleton
// forever (reproduced offline by injecting an extra basket token). A UI live spec
// checks the two baskets first so drift reports itself instead of timing out.
export interface BasketDrift {
  // Addresses (lowercase) the live API reports and the snapshot does not.
  added: string[]
  // Addresses the snapshot has and the live API no longer reports.
  removed: string[]
}

function basketAddresses(payload: unknown): string[] {
  if (typeof payload !== 'object' || payload === null) return []
  const basket = (payload as { basket?: unknown }).basket
  if (!Array.isArray(basket)) return []
  return basket
    .map((token) =>
      typeof token === 'object' && token !== null
        ? (token as { address?: unknown }).address
        : undefined
    )
    .filter((address): address is string => typeof address === 'string')
    .map((address) => address.toLowerCase())
}

export function basketDrift(snapshot: unknown, live: unknown): BasketDrift {
  const pinned = new Set(basketAddresses(snapshot))
  const current = new Set(basketAddresses(live))
  return {
    added: [...current].filter((address) => !pinned.has(address)),
    removed: [...pinned].filter((address) => !current.has(address)),
  }
}

export function describeBasketDrift(drift: BasketDrift): string[] {
  return [
    ...drift.added.map((address) => `+${address}`),
    ...drift.removed.map((address) => `-${address}`),
  ]
}

// Request-level live validation for the contract specs (no browser involved).
// Returns the parsed body so a spec can assert request-correlated invariants
// (e.g. "every token I asked for came back priced").
export async function liveGet(
  request: APIRequestContext,
  target: LiveTarget,
  path: string,
  violations: string[]
): Promise<{ status: number; body: string; data: unknown }> {
  return liveRequest(request, target, 'GET', path, violations)
}

export async function livePost(
  request: APIRequestContext,
  target: LiveTarget,
  path: string,
  payload: unknown,
  violations: string[]
): Promise<{ status: number; body: string; data: unknown }> {
  return liveRequest(request, target, 'POST', path, violations, payload)
}

// Size-bounded probe for endpoints whose full body is impractical to buffer.
// The zappable token list is the case that forced this: zrs1's Base list is
// ~500 MB of JSON, so validating it means reading the head of the stream and
// aborting, not parsing the document.
export async function liveProbe(
  target: LiveTarget,
  path: string,
  maxBytes = 64 * 1024
): Promise<{ status: number; head: string; truncated: boolean; bytes: number }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), LIVE_REQUEST_TIMEOUT)
  try {
    const response = await fetch(`${target.base}${path}`, { signal: controller.signal })
    const reader = response.body?.getReader()
    if (!reader) return { status: response.status, head: '', truncated: false, bytes: 0 }

    const chunks: Uint8Array[] = []
    let bytes = 0
    let truncated = false
    while (bytes < maxBytes) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      bytes += value.byteLength
      if (bytes >= maxBytes) truncated = true
    }
    await reader.cancel().catch(() => {})
    return {
      status: response.status,
      head: Buffer.concat(chunks).toString('utf8'),
      truncated,
      bytes,
    }
  } finally {
    clearTimeout(timer)
  }
}

async function liveRequest(
  request: APIRequestContext,
  target: LiveTarget,
  method: 'GET' | 'POST',
  path: string,
  violations: string[],
  payload?: unknown
): Promise<{ status: number; body: string; data: unknown }> {
  const url = new URL(`${target.base}${path}`)
  const response =
    method === 'GET'
      ? await request.get(url.toString(), { timeout: LIVE_REQUEST_TIMEOUT })
      : await request.post(url.toString(), {
          timeout: LIVE_REQUEST_TIMEOUT,
          data: payload ?? {},
        })

  const status = response.status()
  const body = await response.text()
  for (const line of validateLiveResponse({
    surface: target.surface,
    targetName: target.name,
    method,
    url,
    status,
    body,
    postData: payload === undefined ? undefined : JSON.stringify(payload),
  })) {
    violation(violations, line)
  }

  let data: unknown
  try {
    data = JSON.parse(body)
  } catch {
    data = undefined
  }
  return { status, body, data }
}
