import { z } from 'zod'
import type { LiveSurface } from './live'

// Response contracts for every Reserve/zapper endpoint register consumes.
//
// In mocked runs the snapshots ARE the contract: a spec asserting a rendered
// price proves register reads the shape it was captured against. A live run has
// no such anchor — the upstream may return a different magnitude every call —
// so the oracle becomes the SHAPE plus shape-only invariants: the parts register
// actually depends on. A drifted field, a null where a number is required, or a
// quote whose tx cannot execute is reported as a contract violation and fails
// the live test.
//
// Sources of truth for each schema (keep in sync when they change):
//   zapper surface — zapper/crates/public-api/src/models/{swap,price,tokens}.rs
//                    and src/views/yield-dtf/issuance/components/zapV2/api
//   reserve surface — the consuming hooks in src/hooks + src/views (each entry
//                     names the consumer whose expectations it encodes)

const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'not an address')
const weiSchema = z.string().regex(/^\d+$/, 'not a base-10 wei string')
const hexDataSchema = z.string().regex(/^0x([0-9a-fA-F]{2})*$/, 'not hex calldata')

// ---------------------------------------------------------------------------
// Zapper surface (planner)
// ---------------------------------------------------------------------------

const zapResultSchema = z
  .object({
    tokenIn: addressSchema,
    tokenOut: addressSchema,
    amountIn: weiSchema,
    amountOut: weiSchema,
    minAmountOut: weiSchema.optional(),
    // Empty when the planner built no route to approve against; that is a
    // defect only when an approval is actually needed (invariant below).
    approvalAddress: z.union([addressSchema, z.literal('')]),
    approvalNeeded: z.boolean(),
    insufficientFunds: z.boolean(),
    dust: z.array(z.object({ token: z.string(), amount: z.string() })),
    dustValue: z.number().nullable().optional(),
    amountInValue: z.number().nullable().optional(),
    amountOutValue: z.number().nullable().optional(),
    gas: z.string().nullable().optional(),
    priceImpact: z.number(),
    truePriceImpact: z.number(),
    // Absent/null on a quote the planner could not encode. Whether that is
    // legal for THIS quote is an invariant, not a shape question.
    tx: z
      .object({ data: hexDataSchema, to: addressSchema, value: z.string() })
      .nullish(),
  })
  .loose()

const zapResponseSchema = z
  .object({
    status: z.enum(['success', 'error']),
    result: zapResultSchema.optional(),
    error: z.string().optional(),
  })
  .loose()

// Invariants register's zap UI relies on (useZapSwapQuery + the react-zapper
// widget): a successful quote must be executable and must move a non-zero
// amount, otherwise the panel shows an output it cannot submit.
function zapQuoteInvariants(data: unknown): string[] {
  const parsed = zapResponseSchema.safeParse(data)
  if (!parsed.success) return []
  const quote = parsed.data
  if (quote.status !== 'success' || !quote.result) return []
  const result = quote.result
  const issues: string[] = []

  if (BigInt(result.amountOut) === 0n) issues.push('successful quote has amountOut = 0')
  if (!result.insufficientFunds && !result.tx) {
    issues.push('successful quote with sufficient funds has no tx to submit')
  }
  if (result.approvalNeeded && !result.approvalAddress) {
    issues.push('quote needs an approval but carries no approvalAddress')
  }
  if (result.minAmountOut && BigInt(result.minAmountOut) > BigInt(result.amountOut)) {
    // The on-chain floor above the expected output means the built tx would
    // revert INSUFFICIENT_OUT (see ZapResponse.min_amount_out in the planner).
    issues.push(
      `minAmountOut (${result.minAmountOut}) exceeds amountOut (${result.amountOut}) — tx would revert INSUFFICIENT_OUT`
    )
  }
  if (result.priceImpact < 0) issues.push(`priceImpact is negative (${result.priceImpact})`)
  return issues
}

const plannerTokenSchema = z
  .object({
    address: addressSchema,
    symbol: z.string(),
    name: z.string(),
    decimals: z.number().int().min(0).max(36),
  })
  .loose()

// Zappable token list. Two element shapes are in the wild and both are
// accepted here, because the endpoint's own envelope is what this contract
// covers: api.reserve.org returns `{ token: {...}, liquidity }` entries, the
// zrs1 planner returns the flat token. NOTE: neither is what
// src/utils/zapper.ts fetchZapperTokens reads (`data.tokens[]`) — that drift is
// asserted, and its consequence documented, in tests/live/zapper-api-contract.
const plannerTokensSchema = z
  .object({
    status: z.enum(['success', 'error']),
    result: z
      .array(
        z.union([
          plannerTokenSchema,
          z.object({ token: plannerTokenSchema, liquidity: z.number().nullable() }).loose(),
        ])
      )
      .optional(),
  })
  .loose()

const plannerPricesSchema = z
  .object({
    status: z.enum(['success', 'error']),
    result: z
      .array(
        z.object({
          address: addressSchema,
          symbol: z.string(),
          price: z.number(),
          source: z.string().optional(),
        })
      )
      .optional(),
  })
  .loose()

// ---------------------------------------------------------------------------
// Reserve surface (reserve-api)
// ---------------------------------------------------------------------------

// hooks/usePrices.ts + views/index-dtf/deploy/updater.tsx: [{ address, price }].
const currentPricesSchema = z.array(
  z
    .object({
      address: addressSchema,
      price: z.number().nullable().optional(),
      timestamp: z.number().optional(),
    })
    .loose()
)

// hooks/useIndexPrice.ts reads `price`; the DTF endpoints echo identity.
const currentDtfSchema = z
  .object({ address: addressSchema.optional(), price: z.number().nullable().optional() })
  .loose()

const timeseriesSchema = z
  .object({
    address: addressSchema.optional(),
    timeseries: z.array(z.object({ timestamp: z.number() }).loose()),
  })
  .loose()

// /v2/historical/dtf/candles — the overview's DEFAULT chart type, and a
// different shape from the line-chart timeseries above.
const candlesSchema = z
  .object({
    address: addressSchema.optional(),
    candles: z.array(
      z
        .object({
          timestamp: z.number(),
          open: z.number(),
          high: z.number(),
          low: z.number(),
          close: z.number(),
        })
        .loose()
    ),
  })
  .loose()

// A candle whose high/low do not bracket its open/close cannot be drawn as a
// candle body inside its wick (candlestick-chart-body.tsx).
function candleInvariants(data: unknown): string[] {
  const parsed = candlesSchema.safeParse(data)
  if (!parsed.success) return []
  const issues: string[] = []
  for (const candle of parsed.data.candles) {
    if (candle.high < candle.low) {
      issues.push(`candle ${candle.timestamp}: high (${candle.high}) < low (${candle.low})`)
    }
    if (
      Math.max(candle.open, candle.close) > candle.high ||
      Math.min(candle.open, candle.close) < candle.low
    ) {
      issues.push(`candle ${candle.timestamp}: open/close outside the high/low range`)
    }
    if (issues.length >= 3) break // one failure is enough; don't dump the series
  }
  return issues
}

const geolocationSchema = z
  .object({
    country: z.string(),
    countryCode: z.string(),
    restricted: z.boolean(),
  })
  .loose()

// hooks/use-dtf-restricted.ts fail-CLOSES on a bad shape — a drift here silently
// gates every DTF surface in production, so it is contracted explicitly.
const dtfComplianceSchema = z
  .object({ restricted: z.boolean(), restriction: z.string().optional() })
  .loose()

const walletComplianceSchema = z.object({ isRestricted: z.boolean() }).loose()

const discoverSchema = z.array(
  z.object({ address: addressSchema, chainId: z.number() }).loose()
)

const portfolioSchema = z
  .object({
    totalHoldingsUSD: z.number(),
    indexDTFs: z.array(z.unknown()),
    yieldDTFs: z.array(z.unknown()),
  })
  .loose()

const healthSchema = z.looseObject({})

// ---------------------------------------------------------------------------
// Contract registry
// ---------------------------------------------------------------------------

export interface LiveContract {
  name: string
  surface: LiveSurface
  match: (method: string, url: URL) => boolean
  schema: z.ZodType
  invariants?: (data: unknown) => string[]
  // Endpoints whose documented behavior includes a non-2xx answer (an
  // unroutable zap is a 4xx/5xx with an error body, not a broken deployment).
  allowedErrorStatuses?: number[]
}

const get = (method: string) => method === 'GET'

export const LIVE_CONTRACTS: LiveContract[] = [
  {
    name: 'zap quote',
    surface: 'zapper',
    match: (m, u) => get(m) && /^\/api\/zapper\/\d+\/swap$/.test(u.pathname),
    schema: zapResponseSchema,
    invariants: zapQuoteInvariants,
    allowedErrorStatuses: [400, 422, 500],
  },
  {
    name: 'zap deploy',
    surface: 'zapper',
    match: (m, u) =>
      m === 'POST' && /^\/api\/zapper\/\d+\/deploy(-ungoverned)?$/.test(u.pathname),
    schema: zapResponseSchema,
    invariants: zapQuoteInvariants,
    allowedErrorStatuses: [400, 422, 500],
  },
  {
    name: 'planner token list',
    surface: 'zapper',
    match: (m, u) => get(m) && /^\/api\/zapper\/\d+\/tokens$/.test(u.pathname),
    schema: plannerTokensSchema,
  },
  {
    name: 'planner prices',
    surface: 'zapper',
    match: (m, u) => get(m) && /^\/api\/prices\/\d+/.test(u.pathname),
    schema: plannerPricesSchema,
  },
  {
    name: 'current prices',
    surface: 'reserve',
    match: (m, u) => get(m) && u.pathname.endsWith('/current/prices'),
    schema: currentPricesSchema,
  },
  {
    name: 'current dtf',
    surface: 'reserve',
    match: (m, u) => get(m) && u.pathname.endsWith('/current/dtf'),
    schema: currentDtfSchema,
  },
  {
    name: 'historical dtf candles',
    surface: 'reserve',
    match: (m, u) => get(m) && u.pathname.includes('/historical/dtf/candles'),
    schema: candlesSchema,
    invariants: candleInvariants,
  },
  {
    name: 'historical dtf',
    surface: 'reserve',
    match: (m, u) =>
      get(m) &&
      u.pathname.includes('/historical/dtf') &&
      !u.pathname.includes('/candles'),
    schema: timeseriesSchema,
  },
  {
    name: 'historical prices',
    surface: 'reserve',
    match: (m, u) => get(m) && u.pathname.includes('/historical/prices'),
    schema: timeseriesSchema,
  },
  {
    name: 'dtf exposure',
    surface: 'reserve',
    match: (m, u) => get(m) && u.pathname.includes('/dtf/exposure'),
    schema: z.union([z.array(z.unknown()), z.looseObject({})]),
  },
  {
    name: 'dtf compliance',
    surface: 'reserve',
    match: (m, u) => get(m) && u.pathname.includes('/v2/compliance/geolocation/dtf/'),
    schema: dtfComplianceSchema,
  },
  {
    name: 'geolocation compliance',
    surface: 'reserve',
    match: (m, u) =>
      get(m) &&
      u.pathname.includes('/v2/compliance/geolocation') &&
      !u.pathname.includes('/dtf/'),
    schema: geolocationSchema,
  },
  {
    name: 'wallet compliance',
    surface: 'reserve',
    match: (m, u) => get(m) && u.pathname.includes('/v2/compliance/wallet/'),
    schema: walletComplianceSchema,
  },
  {
    name: 'discover dtfs',
    surface: 'reserve',
    match: (m, u) => get(m) && /\/discover\/(dtfs?|featured)$/.test(u.pathname),
    schema: discoverSchema,
  },
  {
    name: 'portfolio',
    surface: 'reserve',
    match: (m, u) =>
      get(m) && /\/v1\/portfolio\/0x[a-fA-F0-9]{40}$/.test(u.pathname),
    schema: portfolioSchema,
  },
  {
    // hooks/use-token-list.ts — reserve-api's OWN list (a flat array with a
    // volatility classification), not the planner's envelope.
    name: 'reserve zappable tokens',
    surface: 'reserve',
    match: (m, u) => get(m) && u.pathname.endsWith('/zapper/tokens'),
    schema: z.array(
      z.object({ address: addressSchema, symbol: z.string(), decimals: z.number() }).loose()
    ),
  },
  {
    name: 'health',
    surface: 'zapper',
    match: (m, u) => get(m) && u.pathname === '/health',
    schema: healthSchema,
  },
]

export function contractFor(
  surface: LiveSurface,
  method: string,
  url: URL
): LiveContract | undefined {
  return LIVE_CONTRACTS.find(
    (contract) => contract.surface === surface && contract.match(method, url)
  )
}

export interface LiveValidationInput {
  surface: LiveSurface
  targetName: string
  method: string
  url: URL
  status: number
  body: string
  postData?: string
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .slice(0, 5)
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ')
}

// Validate one live response. Returns violation lines (empty = contract held).
// An endpoint with no contract is NOT a violation — it is simply uncontracted;
// the contract specs assert coverage of the endpoints register depends on.
export function validateLiveResponse(input: LiveValidationInput): string[] {
  const { surface, targetName, method, url, status, body } = input
  const contract = contractFor(surface, method, url)
  if (!contract) return []

  const where = `${contract.name} [${method} ${targetName}${url.pathname}]`
  const violations: string[] = []

  if (status >= 400 && !contract.allowedErrorStatuses?.includes(status)) {
    return [`${where} returned HTTP ${status}: ${body.slice(0, 200)}`]
  }

  let data: unknown
  try {
    data = JSON.parse(body)
  } catch {
    return [`${where} returned non-JSON body: ${body.slice(0, 200)}`]
  }

  const parsed = contract.schema.safeParse(data)
  if (!parsed.success) {
    violations.push(`${where} shape drifted — ${formatIssues(parsed.error)}`)
  }
  for (const issue of contract.invariants?.(data) ?? []) {
    violations.push(`${where} ${issue}`)
  }
  return violations
}
