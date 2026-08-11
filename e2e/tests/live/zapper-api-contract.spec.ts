import { expect, test } from '@playwright/test'
import { PriceControl } from '@reserve-protocol/dtf-rebalance-lib'
import { parseEther, parseUnits, type Address } from 'viem'
import {
  LIVE_ENV_VARS,
  liveConfig,
  liveGet,
  livePost,
  liveProbe,
  type LiveTarget,
} from '../../helpers/live'
import { CHAINS, REGISTRY, TEST_ADDRESS, type ChainKey } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'
import { loadZapSnapshot } from '../../helpers/zapper'

// Live zapper-API contract validation (@live) — request-level, no browser.
//
// Target is E2E_LIVE_ZAPPER_API; `zrs1` (https://zrs-1.reserve-api.com) is a
// planner deployment, so it owns the whole surface register's zap and deploy
// flows use:
//
//   GET  /api/zapper/{chainId}/swap              — buy/sell quotes (useZapSwapQuery)
//   POST /api/zapper/{chainId}/deploy[-ungoverned] — deploy zaps (useZapDeployQuery)
//   GET  /api/zapper/{chainId}/tokens            — zappable list (utils/zapper.ts)
//   GET  /api/prices/{chainId}                   — the planner's own token
//                                                  pricing (one source behind
//                                                  reserve-api /current/prices)
//
//   E2E_LIVE_ZAPPER_API=zrs1 pnpm e2e:live
//
// Requests mirror what register builds (zapV2/api/index.ts for the URLs,
// deploy/steps/confirm-deploy/simple/atoms.ts for the deploy body). Responses
// are validated against helpers/live-contracts.ts — shape plus the executability
// invariants (amountOut > 0, a tx to submit, a floor the tx can actually meet).

const NATIVE = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

// Probe input per chain — a live quote needs a plausible amount, and these are
// INPUTS, not expected values (nothing is asserted against them). Base uses the
// captured buy fixture's pinned amount so the mocked and live suites quote the
// same trade; the others are the same order of magnitude in native token.
const PROBE_AMOUNT: Record<ChainKey, string> = {
  base: loadZapSnapshot(
    REGISTRY.find((entry) => entry.chain === 'base' && entry.slug === 'lcap')!.address,
    'buy'
  ).params.amountIn,
  mainnet: parseEther('0.05').toString(),
  bsc: parseEther('0.2').toString(),
}

const config = liveConfig()
const target = config.zapper

test.describe('@live zapper API contract', () => {
  test.skip(
    !target,
    `set ${LIVE_ENV_VARS.zapper}=zrs1 to validate the live zapper API`
  )

  const zapper = target as LiveTarget
  const violations: string[] = []

  test.afterEach(() => {
    expect(violations, violations.join('\n')).toEqual([])
    violations.length = 0
  })

  test('planner is healthy', async ({ request }) => {
    const { status } = await liveGet(request, zapper, '/health', violations)
    expect(status).toBe(200)
  })

  for (const chain of Object.values(CHAINS)) {
    // Zappable token list (utils/zapper.ts fetchZapperTokens; the rebalance
    // "manage weights" and proposal liquidity-check gates read it).
    //
    // PROBED, NOT PARSED: this response is not a small document. On zrs1 the
    // Base list streams ~500 MB (production's is ~700 KB), so buffering it
    // would dominate the run and tell us nothing extra — the head of the stream
    // is enough to see the envelope the client has to consume.
    test(`zappable token list on ${chain.key}`, async () => {
      const { status, head, bytes } = await liveProbe(
        zapper,
        `/api/zapper/${chain.chainId}/tokens`
      )
      expect(status).toBe(200)
      expect(bytes, 'token list is empty').toBeGreaterThan(0)

      // The envelope must be the planner's `{ status: "success", result: [...] }`
      // with address-bearing entries. Asserted on the head so a switch to a bare
      // array (or an error envelope) fails here.
      expect(head.startsWith('{"status":"success"'), `envelope: ${head.slice(0, 80)}`).toBe(
        true
      )
      expect(head).toContain('"result":[')
      expect(head).toMatch(/"address":"0x[a-fA-F0-9]{40}"/)
    })
  }

  // KNOWN DRIFT, pinned deliberately: fetchZapperTokens reads `data.tokens[]`,
  // but every deployment answers `{ status, result: [...] }`. The catch-all in
  // that helper turns the mismatch into an empty Set, i.e. "no token is
  // zappable" — silently, with no error surfaced. Marked `fail` so the suite
  // stays honest about it: when the client (or the API) is fixed, this test goes
  // green-on-a-fail-expectation and forces the pin to be removed.
  test('fetchZapperTokens can read the live token list', async () => {
    test.fail()
    const { head } = await liveProbe(zapper, `/api/zapper/${CHAINS.base.chainId}/tokens`)
    expect(head, 'response has no `tokens` key for fetchZapperTokens to read').toContain(
      '"tokens":['
    )
  })

  for (const dtf of REGISTRY.filter((entry) => !entry.deprecated)) {
    // Upstream pricing for a real basket. The planner's price service is one of
    // the sources behind reserve-api's /current/prices (`priceSources`), not the
    // whole of it — register reads /current/prices, so a planner gap only
    // reaches the UI as $0 when no other source covers the token either. Both
    // halves are asserted: the planner's own contract, and the guarantee that
    // whatever it cannot price the reserve API still can.
    test(`planner prices the ${dtf.slug} basket (${dtf.chain})`, async ({ request }) => {
      const state = loadSnapshot<{ basketTokens: Array<{ address: string }> }>(
        `${dtf.snapshotDir}/chain-state.json`
      )
      const tokens = state.basketTokens.map((token) => token.address)
      expect(tokens.length).toBeGreaterThan(0)

      const { status, data } = await liveGet(
        request,
        zapper,
        `/api/prices/${dtf.chainId}?tokens=${tokens.join(',')}`,
        violations
      )
      expect(status).toBe(200)

      const priced = new Map(
        ((data as { result?: Array<{ address: string; price: number }> }).result ?? []).map(
          (entry) => [entry.address.toLowerCase(), entry.price]
        )
      )
      for (const [address, price] of priced) {
        expect(price, `planner price for ${address}`).toBeGreaterThan(0)
      }

      // Tokens the planner has no source for (PHOTON's Ondo RWA tokens on BSC,
      // for one) must still be priced by the endpoint register actually reads,
      // or the basket renders at $0.
      const missing = tokens.filter((token) => !priced.has(token.toLowerCase()))
      test.skip(
        missing.length > 0 && !config.reserve,
        `planner priced none of ${missing.join(', ')} — set ${LIVE_ENV_VARS.reserve} ` +
          'to check the reserve API covers them'
      )
      if (missing.length === 0) return

      const { data: reservePrices } = await liveGet(
        request,
        config.reserve!,
        `/current/prices?chainId=${dtf.chainId}&tokens=${missing.join(',')}`,
        violations
      )
      const covered = new Set(
        (reservePrices as Array<{ address: string; price?: number }>)
          .filter((entry) => (entry.price ?? 0) > 0)
          .map((entry) => entry.address.toLowerCase())
      )
      expect(
        missing.filter((token) => !covered.has(token.toLowerCase())),
        `tokens no live price source covers on ${dtf.chain} (planner gap AND reserve gap)`
      ).toEqual([])
    })

    // useZapSwapQuery's exact request (zapper.zap in zapV2/api/index.ts): buy
    // the DTF with the chain's native token. The signer is the unfunded test
    // wallet, so `insufficientFunds` may be true — the planner still constructs
    // the route, which is what the contract covers. Executability invariants
    // (amountOut > 0, tx present, minAmountOut <= amountOut) come from
    // live-contracts.ts and surface as violations.
    test(`buy quote for ${dtf.slug} (${dtf.chain})`, async ({ request }) => {
      const amountIn = PROBE_AMOUNT[dtf.chain]
      const query = new URLSearchParams({
        chainId: String(dtf.chainId),
        signer: TEST_ADDRESS,
        tokenIn: NATIVE,
        amountIn,
        tokenOut: dtf.address,
        slippage: '100',
        trade: 'true',
        bypassCache: 'true',
      })
      const { status, data } = await liveGet(
        request,
        zapper,
        `/api/zapper/${dtf.chainId}/swap?${query.toString()}`,
        violations
      )
      expect(status, `quote HTTP status (${dtf.slug})`).toBe(200)
      const quote = data as { status: string; result?: { amountOut: string } }
      expect(quote.status, `quote status (${dtf.slug})`).toBe('success')
      expect(BigInt(quote.result!.amountOut)).toBeGreaterThan(0n)
    })
  }

  // useZapDeployQuery's request (deploy wizard → confirm-deploy → simple):
  // the DEPLOY half of the coverage. Body shape comes from
  // ZapDeployUngovernedBody; the basket is a real, priced two-token basket on
  // Base so the planner has to actually route and encode a deploy.
  test('ungoverned deploy zap quote (base)', async ({ request }) => {
    const chainId = CHAINS.base.chainId
    const weth = '0x4200000000000000000000000000000000000006' as Address
    const usdc = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address

    const payload = {
      tokenIn: NATIVE as Address,
      amountIn: parseEther('0.05').toString(),
      signer: TEST_ADDRESS as Address,
      slippage: 0.01,
      owner: TEST_ADDRESS as Address,
      basicDetails: {
        assets: [weth, usdc],
        // Per 1 share of output, mirroring basketRequiredAmountsAtom.
        amounts: [parseUnits('0.0002', 18).toString(), parseUnits('0.5', 6).toString()],
        name: 'E2E Live Validation DTF',
        symbol: 'E2ELV',
      },
      additionalDetails: {
        auctionLength: '1800',
        feeRecipients: [{ recipient: TEST_ADDRESS as Address, portion: parseEther('1').toString() }],
        tvlFee: parseEther('0.01').toString(),
        mintFee: parseEther('0.0005').toString(),
        mandate: 'e2e live validation',
      },
      folioFlags: {
        trustedFillerEnabled: true,
        rebalanceControl: { weightControl: false, priceControl: PriceControl.PARTIAL },
        bidsEnabled: false,
      },
      basketManagers: [] as Address[],
      auctionLaunchers: [] as Address[],
      brandManagers: [] as Address[],
    }

    const { status, data } = await livePost(
      request,
      zapper,
      `/api/zapper/${chainId}/deploy-ungoverned?chainId=${chainId}`,
      payload,
      violations
    )
    expect(status, 'deploy-zap HTTP status').toBe(200)
    const quote = data as { status: string; result?: { amountOut: string; tx: unknown } }
    expect(quote.status, 'deploy-zap status').toBe('success')
    expect(BigInt(quote.result!.amountOut)).toBeGreaterThan(0n)
  })
})
