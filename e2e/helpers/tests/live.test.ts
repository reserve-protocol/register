import { describe, expect, it } from 'vitest'
import { validateLiveResponse } from '../live-contracts'
import {
  basketDrift,
  describeBasketDrift,
  describeLiveConfig,
  isLiveMode,
  isTeardownRace,
  LIVE_ENV_VARS,
  LIVE_TARGETS,
  liveConfig,
  liveUrl,
  resolveLiveTarget,
  surfaceForPath,
  type LiveSurface,
  type LiveTarget,
} from '../live'

// Contract tests for the live-API seam. The expensive property is the DEFAULT:
// with no env vars set the suite must stay fully mocked, and a typo must never
// degrade into "silently offline but reported as live".

const zapperTarget: LiveTarget = {
  surface: 'zapper',
  name: 'zrs1',
  base: LIVE_TARGETS.zrs1,
}

function url(path: string): URL {
  return new URL(`https://api.reserve.org${path}`)
}

describe('live target resolution', () => {
  it('is off by default — an empty env yields no live surface', () => {
    const config = liveConfig({})
    expect(config).toEqual({})
    expect(isLiveMode(config)).toBe(false)
  })

  it('treats empty and whitespace-only values as off', () => {
    expect(isLiveMode(liveConfig({ [LIVE_ENV_VARS.zapper]: '' }))).toBe(false)
    expect(isLiveMode(liveConfig({ [LIVE_ENV_VARS.reserve]: '   ' }))).toBe(false)
  })

  it('resolves named targets per surface', () => {
    const config = liveConfig({
      [LIVE_ENV_VARS.zapper]: 'zrs1',
      [LIVE_ENV_VARS.reserve]: 'production',
    })
    expect(config.zapper).toEqual({ surface: 'zapper', name: 'zrs1', base: LIVE_TARGETS.zrs1 })
    expect(config.reserve?.base).toBe(LIVE_TARGETS.production)
    expect(isLiveMode(config)).toBe(true)
  })

  it('accepts an absolute URL and keeps only its origin', () => {
    const target = resolveLiveTarget('reserve', 'https://my-branch.example.com/base/path')
    expect(target).toEqual({
      surface: 'reserve',
      name: 'custom',
      base: 'https://my-branch.example.com',
    })
  })

  it('throws on an unknown target instead of falling back to mocks', () => {
    expect(() => resolveLiveTarget('zapper', 'zrs-1')).toThrow(/not a known target/)
    expect(() => liveConfig({ [LIVE_ENV_VARS.zapper]: 'staging1' })).toThrow(
      /E2E_LIVE_ZAPPER_API/
    )
  })

  it('describes which surfaces are live and which stay mocked', () => {
    const description = describeLiveConfig(liveConfig({ [LIVE_ENV_VARS.zapper]: 'zrs1' }))
    expect(description).toContain('reserve=mocked')
    expect(description).toContain('zapper=zrs1')
  })
})

describe('surface classification', () => {
  it('routes the planner paths to the zapper surface', () => {
    expect(surfaceForPath('/api/zapper/8453/swap')).toBe('zapper')
    expect(surfaceForPath('/api/zapper/8453/deploy-ungoverned')).toBe('zapper')
    expect(surfaceForPath('/api/zapper/1/tokens')).toBe('zapper')
    expect(surfaceForPath('/api/prices/56')).toBe('zapper')
  })

  it('routes everything else to the reserve surface', () => {
    for (const path of [
      '/current/prices',
      '/current/dtf',
      '/historical/dtf',
      '/v1/portfolio/0x0',
      '/v2/compliance/geolocation',
      '/zapper/tokens',
      '/velora/swap',
    ]) {
      expect(surfaceForPath(path), path).toBe('reserve')
    }
  })

  it('rewrites only the origin, preserving path and query', () => {
    expect(liveUrl(url('/api/zapper/8453/swap?chainId=8453&trade=true'), zapperTarget)).toBe(
      `${LIVE_TARGETS.zrs1}/api/zapper/8453/swap?chainId=8453&trade=true`
    )
  })
})

describe('response contract validation', () => {
  const validate = (
    path: string,
    body: unknown,
    {
      method = 'GET',
      status = 200,
      surface = 'zapper',
    }: { method?: string; status?: number; surface?: LiveSurface } = {}
  ) =>
    validateLiveResponse({
      surface,
      targetName: 'zrs1',
      method,
      url: url(path),
      status,
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })

  const quote = {
    status: 'success',
    result: {
      tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      tokenOut: '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8',
      amountIn: '50000000000000000',
      amountOut: '17905950155437571976',
      minAmountOut: '17726890653883196256',
      approvalAddress: '0x47A32430f7440395b17C7De7C32266A6d4E39d0A',
      approvalNeeded: false,
      insufficientFunds: false,
      dust: [],
      dustValue: 0,
      priceImpact: 0.4,
      truePriceImpact: -0.2,
      tx: { data: '0xabcd', to: '0x47A32430f7440395b17C7De7C32266A6d4E39d0A', value: '0' },
    },
  }

  it('accepts a real zap quote', () => {
    expect(validate('/api/zapper/8453/swap', quote)).toEqual([])
  })

  it('accepts a negative truePriceImpact (signed by design)', () => {
    expect(
      validate('/api/zapper/8453/swap', {
        ...quote,
        result: { ...quote.result, truePriceImpact: -12.5 },
      })
    ).toEqual([])
  })

  it('flags a quote whose floor exceeds its expected output', () => {
    const violations = validate('/api/zapper/8453/swap', {
      ...quote,
      result: { ...quote.result, minAmountOut: '20000000000000000000' },
    })
    expect(violations).toHaveLength(1)
    expect(violations[0]).toContain('INSUFFICIENT_OUT')
  })

  it('flags a zero-output success and a success with no tx', () => {
    expect(
      validate('/api/zapper/8453/swap', {
        ...quote,
        result: { ...quote.result, amountOut: '0', minAmountOut: '0' },
      })[0]
    ).toContain('amountOut = 0')
    expect(
      validate('/api/zapper/8453/swap', { ...quote, result: { ...quote.result, tx: null } })[0]
    ).toContain('no tx to submit')
    // Observed on zrs1: `tx` omitted entirely rather than nulled.
    const { tx: _tx, ...noTx } = quote.result
    expect(validate('/api/zapper/8453/swap', { ...quote, result: noTx })[0]).toContain(
      'no tx to submit'
    )
  })

  it('flags an approval-needing quote with no approvalAddress, but not an unused empty one', () => {
    expect(
      validate('/api/zapper/8453/swap', {
        ...quote,
        result: { ...quote.result, approvalNeeded: true, approvalAddress: '' },
      })[0]
    ).toContain('no approvalAddress')
    expect(
      validate('/api/zapper/8453/swap', {
        ...quote,
        result: { ...quote.result, approvalAddress: '' },
      })
    ).toEqual([])
  })

  it('flags drifted shapes', () => {
    // amountOut as a number instead of a wei string — precision-losing, and the
    // widget's BigInt() would throw on a decimal.
    expect(
      validate('/api/zapper/8453/swap', {
        ...quote,
        result: { ...quote.result, amountOut: 17.9 },
      })[0]
    ).toContain('shape drifted')
    expect(validate('/api/zapper/8453/swap', 'not json at all')[0]).toContain('non-JSON')
  })

  it('accepts documented error statuses but not unexpected ones', () => {
    expect(
      validate(
        '/api/zapper/8453/swap',
        { status: 'error', error: 'no route' },
        { status: 500 }
      )
    ).toEqual([])
    expect(validate('/api/zapper/8453/swap', {}, { status: 404 })[0]).toContain('HTTP 404')
  })

  it('validates the planner price envelope, deploy zaps and token lists', () => {
    expect(
      validate('/api/prices/8453', {
        status: 'success',
        result: [{ address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', price: 1861.9 }],
      })
    ).toEqual([])
    expect(
      validate('/api/prices/8453', {
        status: 'success',
        result: [{ address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', price: '1861.9' }],
      })[0]
    ).toContain('shape drifted')
    expect(
      validate('/api/zapper/8453/deploy-ungoverned', quote, { method: 'POST' })
    ).toEqual([])
    // Both element shapes in the wild: flat (zrs1) and { token, liquidity }
    // (api.reserve.org).
    const token = {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    }
    expect(validate('/api/zapper/1/tokens', { status: 'success', result: [token] })).toEqual([])
    expect(
      validate('/api/zapper/8453/tokens', {
        status: 'success',
        result: [{ token, liquidity: 99645.0 }],
      })
    ).toEqual([])
  })

  it('validates the reserve pricing and compliance surfaces', () => {
    const reserve = { surface: 'reserve' as const }
    expect(
      validate(
        '/current/prices',
        [{ address: '0x4200000000000000000000000000000000000006', price: 1863.1, timestamp: 1 }],
        reserve
      )
    ).toEqual([])
    // A price the app would render as NaN.
    expect(
      validate(
        '/current/prices',
        [{ address: '0x4200000000000000000000000000000000000006', price: '1863.1' }],
        reserve
      )[0]
    ).toContain('shape drifted')
    expect(validate('/current/dtf', { price: 5.21 }, reserve)).toEqual([])
    expect(
      validate('/historical/dtf', { timeseries: [{ timestamp: 1, price: 5.2 }] }, reserve)
    ).toEqual([])
    // use-dtf-restricted fail-closes on a non-boolean `restricted`.
    expect(
      validate(
        '/v2/compliance/geolocation/dtf/0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8',
        { restricted: 'false' },
        reserve
      )[0]
    ).toContain('shape drifted')
  })

  it('ignores endpoints that have no contract', () => {
    expect(validate('/some/unknown/endpoint', { anything: true })).toEqual([])
  })
})

// The pinned-chain-state vs live-API join. A basket token the mocked chain has
// never seen makes the DTF header unrenderable, so the drift must be detected
// (case-insensitively) rather than surfacing as a UI timeout.
describe('basket drift between the snapshot and the live API', () => {
  const weth = '0x4200000000000000000000000000000000000006'
  const shib = '0x2859e4544C4bB03966803b044A93563Bd2D0DD4D'

  it('reports no drift for the same basket in different casings', () => {
    const drift = basketDrift(
      { basket: [{ address: weth.toUpperCase() }] },
      { basket: [{ address: weth }] }
    )
    expect(describeBasketDrift(drift)).toEqual([])
  })

  it('reports tokens the live API added and the snapshot lost', () => {
    const drift = basketDrift(
      { basket: [{ address: weth }] },
      { basket: [{ address: shib }] }
    )
    expect(drift.added).toEqual([shib.toLowerCase()])
    expect(drift.removed).toEqual([weth])
    expect(describeBasketDrift(drift)).toEqual([
      `+${shib.toLowerCase()}`,
      `-${weth}`,
    ])
  })

  it('separates a teardown race from a real live-request failure', () => {
    expect(
      isTeardownRace('route.fetch: Target page, context or browser has been closed')
    ).toBe(true)
    expect(isTeardownRace('apiResponse.text: Response has been disposed')).toBe(true)
    expect(isTeardownRace('apiRequestContext.get: socket hang up')).toBe(false)
    expect(isTeardownRace('route.fetch: Timeout 60000ms exceeded')).toBe(false)
  })

  it('treats a missing or malformed basket as empty rather than throwing', () => {
    expect(describeBasketDrift(basketDrift(undefined, null))).toEqual([])
    expect(
      describeBasketDrift(basketDrift({ basket: 'nope' }, { basket: [null, {}] }))
    ).toEqual([])
  })
})
