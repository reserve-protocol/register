import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  parseAbi,
} from 'viem'
import { expect, test } from '../../../harness'
import { REGISTRY, TEST_ADDRESS } from '../../../helpers/registry'
import { rebalanceTime } from '../../../helpers/clock'
import { loadSnapshot } from '../../../helpers/snapshots'
import {
  encodeActiveRebalance,
  loadRebalances,
  proposalIdFor,
} from '../../../helpers/rebalance-tuple'

// Auction-launcher WRITE path (base/lcap, v5). The launch button gates on
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

test('auctions: an auction launcher submits openAuction() to the folio @smoke', async ({
  harness,
  overrides,
}) => {
  const page = harness.page
  const latest = loadRebalances(dtf)[0]
  const { dtf: dtfObj } = loadSnapshot<{
    dtf: { auctionLaunchers: string[] }
  }>(`${dtf.snapshotDir}/dtf.json`)

  await harness.chain.freezeAt(rebalanceTime(latest, 'restricted'))

  // Enrol the connected test wallet as an auction launcher.
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
  // ACTIVE getRebalance() tuple — makes currentRebalanceAtom + useRebalanceParams resolve.
  overrides.ethCall(dtf.address, '0xaa3b5568', encodeActiveRebalance(dtf, latest))

  await harness.goto(dtf, `auctions/rebalance/${proposalIdFor(dtf, latest)}`)
  await harness.wallet.connect()
  await expect(page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })

  // Pump the frozen clock so the rebalance/params queries flush into React and
  // the launcher branch (LaunchAuctionsButton) mounts, enabled.
  const launch = page.getByTestId('auctions-launch-btn')
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
    abi: OPEN_AUCTION_ABI,
    data: sent.data as `0x${string}`,
  })
  expect(decoded.functionName).toBe('openAuction')
  // Nonce matches the active rebalance the tuple encoded — proves the write was
  // wired to the live rebalance, not a stale/zero nonce.
  expect(decoded.args[0]).toBe(BigInt(latest.nonce))
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

  // The community button reads the window from currentRebalanceAtom (subgraph
  // getRebalances), NOT the RPC tuple — widen it there too, or isNotCommunityLaunch
  // (availableUntil === restrictedUntil) stays true and no button renders.
  const rebSnap = loadSnapshot<{ rebalances: Array<Record<string, unknown>> }>(
    `${dtf.snapshotDir}/rebalances.json`
  )
  overrides.subgraph(
    { operationName: 'getRebalances' },
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
