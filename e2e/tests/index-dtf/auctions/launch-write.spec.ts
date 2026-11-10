import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  parseAbi,
} from 'viem'
import { type DtfHarness, expect, test } from '../../../harness'
import type { MockOverrides } from '../../../helpers/overrides'
import { REGISTRY, TEST_ADDRESS } from '../../../helpers/registry'
import { rebalanceTime } from '../../../helpers/clock'
import { loadSnapshot } from '../../../helpers/snapshots'
import {
  encodeActiveRebalance,
  loadRebalances,
  proposalIdFor,
} from '../../../helpers/rebalance-tuple'

// Auction-launcher WRITE path (bsc/cmc20, v5; one case re-reports the proxy as 6.0.0). The launch button gates on
// isAuctionLauncherAtom (dtf.auctionLaunchers ∋ wallet — a subgraph field, so we
// overlay GetIndexDTF to enrol the test wallet) AND on a fully-resolved
// useRebalanceParams (active getRebalance() tuple + detail API fills, same seed
// the active-detail flow proves coherent). With the auctions subgraph empty,
// isAuctionOngoing is false and rebalancePercent defaults to 98 (>0), so the
// button is enabled and firing it calls openAuction() on the folio.
//
// ENGINEER REVIEW REQUIRED: this asserts the call FIRES with the right target +
// selector + rebalance nonce. It does NOT validate the openAuction weight/price
// MATH (getRebalanceOpenAuction) — that's a stop-condition surface (on-chain
// rebalance math) and needs engineer sign-off, tracked in the auctions guide.
//
// Uses bsc/cmc20, NOT base/lcap: isHybridDTFAtom is hardcoded to LCAP+Venionaire,
// and a hybrid DTF forces a Manage-Weights step BEFORE the launch button. cmc20
// is non-hybrid → the launcher branch renders the launch button directly.
const dtf = REGISTRY.find((d) => d.slug === 'cmc20')! // bsc, non-hybrid, v5

// The wallet must sit on the DTF's chain or the CTA becomes "Switch network".
test.use({ walletChain: 56 })

const OPEN_AUCTION_ABI = parseAbi([
  'function openAuction(uint256 rebalanceNonce, address[] tokens, (uint256 low, uint256 spot, uint256 high)[] newWeights, (uint256 low, uint256 high)[] newPrices, (uint256 low, uint256 spot, uint256 high) newLimits)',
])
// Folio 6.0 appends the per-auction length; the launcher passes maxAuctionLength().
const OPEN_AUCTION_V6_ABI = parseAbi([
  'function openAuction(uint256 rebalanceNonce, address[] tokens, (uint256 low, uint256 spot, uint256 high)[] newWeights, (uint256 low, uint256 high)[] newPrices, (uint256 low, uint256 spot, uint256 high) newLimits, uint256 auctionLength)',
])
const OPEN_AUCTION_UNRESTRICTED_ABI = parseAbi([
  'function openAuctionUnrestricted(uint256 rebalanceNonce)',
])
const BSC_USDT = '0x55d398326f99059fF775485246999027B3197955'

// Detail-page fills shared by both launch paths: empty token list → 'medium'
// volatility; empty liquidity → no warnings; connected wallet's BSC-USDT (a
// cmc20 basket token) balanceOf → 0. COVERAGE DEBT: bsc-connected specs need
// central basket balanceOf seeding once they grow beyond this.
function seedAuctionDetail(overrides: {
  api: (m: { method?: string; pathname: string }, data: unknown) => unknown
  ethCall: (a: string, c: string, r: `0x${string}`) => unknown
}) {
  overrides.api({ pathname: '/zapper/tokens' }, [])
  overrides.api({ method: 'POST', pathname: '/rebalance/liquidity' }, {
    market: null,
    totals: { sellUsd: 0, buyUsd: 0 },
    assets: [],
  })
  overrides.ethCall(
    BSC_USDT,
    encodeFunctionData({
      abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
      functionName: 'balanceOf',
      args: [TEST_ADDRESS],
    }),
    encodeAbiParameters([{ type: 'uint256' }], [0n])
  )
}

// cmc20 in its restricted window, test wallet enrolled as launcher, ACTIVE tuple on RPC, button enabled.
async function bootEnabledLauncher(
  harness: DtfHarness,
  overrides: MockOverrides,
  beforeGoto?: () => void
) {
  const page = harness.page
  const latest = loadRebalances(dtf)[0]
  const { dtf: dtfObj } = loadSnapshot<{
    dtf: { auctionLaunchers: string[] }
  }>(`${dtf.snapshotDir}/dtf.json`)

  await harness.chain.freezeAt(rebalanceTime(latest, 'restricted'))
  overrides.subgraph(
    { operationName: 'GetIndexDTF' },
    {
      dtf: {
        ...dtfObj,
        auctionLaunchers: [...dtfObj.auctionLaunchers, TEST_ADDRESS.toLowerCase()],
      },
    }
  )
  seedAuctionDetail(overrides)
  overrides.ethCall(dtf.address, '0xaa3b5568', encodeActiveRebalance(dtf, latest))
  beforeGoto?.()

  await harness.goto(dtf, `auctions/rebalance/${proposalIdFor(dtf, latest)}`)
  await harness.wallet.connect()
  await expect(page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })

  // Pump the frozen clock so the rebalance/params queries flush into React and the launch button mounts, enabled.
  const launch = page.getByTestId('auctions-launch-btn')
  await expect(async () => {
    await harness.chain.advance(5_000)
    await expect(launch).toBeVisible()
    await expect(launch).toBeEnabled()
  }).toPass({ timeout: 30_000 })
  return { launch, latest }
}

test('auctions: an auction launcher submits openAuction() to the folio @smoke', async ({
  harness,
  overrides,
}) => {
  const { launch, latest } = await bootEnabledLauncher(harness, overrides)

  harness.tx.confirm()
  await launch.click()
  await harness.chain.advance(10_000)

  await expect.poll(() => harness.tx.log.length, { timeout: 15_000 }).toBeGreaterThan(0)
  const sent = harness.tx.last()!
  expect(sent.to.toLowerCase()).toBe(dtf.address.toLowerCase())
  const decoded = decodeFunctionData({
    abi: OPEN_AUCTION_ABI,
    data: sent.data as `0x${string}`,
  })
  expect(decoded.functionName).toBe('openAuction')
  // Nonce matches the active rebalance the tuple encoded — proves the write was
  // wired to the live rebalance, not a stale/zero nonce.
  expect(decoded.args[0]).toBe(BigInt(latest.nonce))

  // Post-receipt the gate re-reads RPC (nextAuctionId/auctions), not the
  // indexer: once the chain reports an open auction for this nonce the button
  // stays disabled well past the old 15 s launching timer.
  const now = rebalanceTime(latest, 'restricted')
  overrides.ethCall(
    dtf.address,
    '0xfc528482',
    encodeAbiParameters([{ type: 'uint256' }], [1n])
  )
  overrides.ethCall(
    dtf.address,
    encodeFunctionData({
      abi: parseAbi(['function auctions(uint256) view returns (uint256,uint256,uint256)']),
      functionName: 'auctions',
      args: [0n],
    }),
    encodeAbiParameters(
      [{ type: 'uint256' }, { type: 'uint256' }, { type: 'uint256' }],
      [BigInt(latest.nonce), BigInt(now - 10), BigInt(now + 1800)]
    )
  )
  await harness.chain.advance(30_000)
  await expect(launch).toHaveAttribute('data-ongoing', 'true')
  await harness.chain.advance(30_000)
  await expect(launch).toBeDisabled()
  await expect(launch).toHaveAttribute('data-ongoing', 'true')
})

test('auctions: a non-launcher in the permissionless window submits openAuctionUnrestricted() @smoke', async ({
  harness,
  overrides,
}) => {
  const page = harness.page
  const raw = loadRebalances(dtf)[0]
  // Captured windows are zero-width (restrictedUntil == availableUntil), which
  // reads as "community launch not available". Widen the window so the
  // permissionless phase exists, then freeze inside it (past restrictedUntil,
  // before availableUntil) — no launcher overlay, so the community branch renders.
  const widenedAvailableUntil = String(Number(raw.restrictedUntil) + 3_600)
  const permissionless = { ...raw, availableUntil: widenedAvailableUntil }
  await harness.chain.freezeAt(Number(raw.restrictedUntil) + 60)

  // The community button reads its window from the RPC tuple, but the detail
  // page decides active vs completed from the indexed availableUntil — widen it
  // there too, or the page renders the completed card and no button mounts.
  const rebSnap = loadSnapshot<{ rebalances: Array<Record<string, unknown>> }>(
    `${dtf.snapshotDir}/rebalances.json`
  )
  overrides.subgraph(
    { operationName: 'GetIndexDtfRebalances' },
    {
      rebalances: rebSnap.rebalances.map((r) =>
        r.blockNumber === raw.blockNumber
          ? { ...r, availableUntil: widenedAvailableUntil }
          : r
      ),
    }
  )

  seedAuctionDetail(overrides)
  overrides.ethCall(
    dtf.address,
    '0xaa3b5568',
    encodeActiveRebalance(dtf, permissionless)
  )

  await harness.goto(dtf, `auctions/rebalance/${proposalIdFor(dtf, raw)}`)
  await harness.wallet.connect()
  await expect(page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })

  const launch = page.getByTestId('auctions-community-launch-btn')
  await expect(async () => {
    await harness.chain.advance(5_000)
    await expect(launch).toBeVisible()
    await expect(launch).toBeEnabled()
  }).toPass({ timeout: 30_000 })

  harness.tx.confirm()
  await launch.click()
  await harness.chain.advance(10_000)

  await expect.poll(() => harness.tx.log.length, { timeout: 15_000 }).toBeGreaterThan(0)
  const sent = harness.tx.last()!
  expect(sent.to.toLowerCase()).toBe(dtf.address.toLowerCase())
  const decoded = decodeFunctionData({
    abi: OPEN_AUCTION_UNRESTRICTED_ABI,
    data: sent.data as `0x${string}`,
  })
  expect(decoded.functionName).toBe('openAuctionUnrestricted')
  expect(decoded.args[0]).toBe(BigInt(raw.nonce))
})

test('auctions: on a Folio 6.0 proxy the launcher submits the six-argument openAuction() with maxAuctionLength @smoke', async ({
  harness,
  overrides,
}) => {
  // Same proxy, reported as 6.0.0, with the v6 length ceiling the SDK must carry.
  const { launch, latest } = await bootEnabledLauncher(harness, overrides, () => {
    overrides.ethCall(
      dtf.address,
      '0x54fd4d50',
      encodeAbiParameters([{ type: 'string' }], ['6.0.0'])
    )
    overrides.ethCall(
      dtf.address,
      '0x0e519ef9',
      encodeAbiParameters([{ type: 'uint256' }], [1_800n])
    )
  })

  harness.tx.confirm()
  await launch.click()
  await harness.chain.advance(10_000)

  await expect.poll(() => harness.tx.log.length, { timeout: 15_000 }).toBeGreaterThan(0)
  const sent = harness.tx.last()!
  expect(sent.to.toLowerCase()).toBe(dtf.address.toLowerCase())
  expect(sent.data.slice(0, 10)).toBe('0x9bd97b3e')
  const decoded = decodeFunctionData({
    abi: OPEN_AUCTION_V6_ABI,
    data: sent.data as `0x${string}`,
  })
  expect(decoded.functionName).toBe('openAuction')
  expect(decoded.args[0]).toBe(BigInt(latest.nonce))
  expect(decoded.args[5]).toBe(1_800n)
})

test('auctions: a cached launch readiness does not survive a failing live auction read', async ({
  harness,
  overrides,
}) => {
  const { launch } = await bootEnabledLauncher(harness, overrides)

  // React Query keeps the last good latest-auction value cached while the poll errors.
  overrides.ethCallRevert(dtf.address, '0xfc528482', 'rpc unavailable')
  // One 10 s poll plus React Query's three backoff retries (1 + 2 + 4 s).
  for (let i = 0; i < 8; i++) await harness.chain.advance(5_000)
  await expect(harness.page.getByTestId('auctions-live-state-unavailable')).toBeVisible()
  await expect(launch).toBeDisabled()
  expect(harness.tx.log).toHaveLength(0)
})

test('auctions: the launcher re-reads the live rebalance before sending and refuses a stale nonce', async ({
  harness,
  overrides,
}) => {
  const { launch, latest } = await bootEnabledLauncher(harness, overrides)

  // A newer rebalance replaced this one on chain; the cached read has not polled it yet.
  overrides.ethCall(
    dtf.address,
    '0xaa3b5568',
    encodeActiveRebalance(dtf, { ...latest, nonce: String(Number(latest.nonce) + 1) })
  )
  harness.tx.confirm()
  await launch.click()
  for (let i = 0; i < 4; i++) await harness.chain.advance(5_000)

  expect(harness.tx.log).toHaveLength(0)
  await expect(launch).toHaveAttribute('data-blocker', 'nonce-changed')
  await expect(launch).not.toHaveText(/Launching/)
})

test('auctions: a reverted launch receipt releases the launch button', async ({
  harness,
  overrides,
}) => {
  const { launch } = await bootEnabledLauncher(harness, overrides)

  harness.tx.revert()
  await launch.click()
  await expect.poll(() => harness.tx.log.length, { timeout: 15_000 }).toBe(1)
  // wagmi replays a reverted tx through eth_call to read the reason.
  const sent = harness.tx.last()!
  overrides.ethCallRevert(sent.to, sent.data, 'Folio__NotRebalancing')
  for (let i = 0; i < 8; i++) await harness.chain.advance(5_000)
  await expect(launch).toBeEnabled()
  expect(harness.tx.log[0].receiptStatus).toBe('revert')
})

test('auctions: community launch follows the live restrictedUntil, not the indexed one', async ({
  harness,
  overrides,
}) => {
  const page = harness.page
  const raw = loadRebalances(dtf)[0]
  const widenedAvailableUntil = String(Number(raw.restrictedUntil) + 3_600)
  const now = Number(raw.restrictedUntil) + 60
  // The launcher's openAuction pushed restrictedUntil past the indexed value; only the RPC tuple knows.
  const extended = {
    ...raw,
    availableUntil: widenedAvailableUntil,
    restrictedUntil: String(now + 600),
  }
  await harness.chain.freezeAt(now)

  const rebSnap = loadSnapshot<{ rebalances: Array<Record<string, unknown>> }>(
    `${dtf.snapshotDir}/rebalances.json`
  )
  overrides.subgraph(
    { operationName: 'GetIndexDtfRebalances' },
    {
      rebalances: rebSnap.rebalances.map((r) =>
        r.blockNumber === raw.blockNumber
          ? { ...r, availableUntil: widenedAvailableUntil }
          : r
      ),
    }
  )
  seedAuctionDetail(overrides)
  overrides.ethCall(dtf.address, '0xaa3b5568', encodeActiveRebalance(dtf, extended))

  await harness.goto(dtf, `auctions/rebalance/${proposalIdFor(dtf, raw)}`)
  await harness.wallet.connect()
  await expect(page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })

  const countdown = page.getByTestId('auctions-community-launch-countdown')
  const launch = page.getByTestId('auctions-community-launch-btn')
  for (let i = 0; i < 6; i++) await harness.chain.advance(5_000)
  await expect(launch).toHaveCount(0)
  await expect(countdown).toBeVisible()
  await expect(countdown).toBeDisabled()
  expect(harness.tx.log).toHaveLength(0)
})
