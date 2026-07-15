import { test, expect } from '../../../harness'

// Z2 (docs/plans/REGISTER_HARDENING.md): useUnlistedTokens buckets a multichain
// GetTokenListOverview fan-out and read `data[chain].rtokens.map` guarding only
// `data[chain]`. A partial/rtokens-less bucket for one chain threw in the effect
// and crashed the unlisted-tokens table. Structural GH0 twin of the A1 explorer
// crash — same chain-scoped-override regression shape.
test.use({ wallet: false })

const rtoken = (symbol: string) => ({
  id: '0x' + symbol.charCodeAt(0).toString(16).padStart(40, '0'),
  targetUnits: 'USD',
  rsrStaked: '0',
  token: {
    name: `${symbol} Token`,
    symbol,
    lastPriceUSD: '1',
    holderCount: 1,
    transferCount: 1,
    totalSupply: '1000000000000000000',
    cumulativeVolume: '0',
  },
})

test('tokens: one chain returning an rtokens-less bucket must not crash the table @smoke', async ({
  harness,
}) => {
  const page = harness.page

  // GetTokenListOverview is declared by BOTH the listed table (vars: tokenIds,
  // fromTime) and the unlisted table (vars: limit/search/by/direction). Scope
  // the unlisted overrides by the unlisted query's stable vars so they don't
  // answer the listed query; the broad op-only override below (lower findLast
  // precedence) gives the listed query an honest empty shape.
  const unlistedVars = {
    limit: 50,
    search: '',
    by: 'token__totalSupply',
    direction: 'desc',
  }

  // Listed table: empty-but-valid shape (op-only = lowest precedence).
  harness.mock.subgraph(
    { operationName: 'GetTokenListOverview' },
    { tokens: [], tokenDailySnapshots: [] }
  )
  // Unlisted: healthy feed everywhere...
  harness.mock.subgraph(
    { operationName: 'GetTokenListOverview', variables: unlistedVars },
    { rtokens: [rtoken('ZTWO')] }
  )
  // ...except base: truthy body MISSING `rtokens` (partial/drifted shape).
  harness.mock.subgraph(
    { operationName: 'GetTokenListOverview', variables: unlistedVars, chain: 8453 },
    {}
  )
  harness.mock.subgraph(
    { operationName: 'GetRTokenCount' },
    { protocol: { rTokenCount: 1 } }
  )

  await page.goto('/tokens')

  // The healthy chain's row renders (proves multichain data landed and the
  // malformed base bucket reached the read path) and the table survives.
  await expect(page.getByTestId('unlisted-tokens-table')).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText('ZTWO').first()).toBeVisible()
})
