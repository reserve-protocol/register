import { decodeFunctionData, encodeAbiParameters, encodeFunctionData, parseAbi } from 'viem'
import { expect, test } from '../../../../e2e/harness'
import { rebalanceTime } from '../../../../e2e/helpers/clock'
import { dtfPath, TEST_ADDRESS } from '../../../../e2e/helpers/registry'
import {
  BSC_USDT,
  bid,
  cmc20,
  detailFills,
  encodeTuple,
  enrolLauncher,
  liveAuction,
  proposalIdFor,
  sides,
  windowed,
} from './fixtures'
import { clean, detailState, fixtureFile, observations, pumpUntil, settle, shot } from './review-helpers'

// Launcher write lifecycle on cmc20 (bsc, non-hybrid, v5): intercepted
// openAuction(), confirmation, the 10 s / 15 s refresh timers, indexer lag,
// rejection, revert, an auction ending while the view is open, rebalance
// expiry while open, and completion. No transaction leaves the mock wallet.
const log = observations('launch-lifecycle')
const OPEN_AUCTION_ABI = parseAbi([
  'function openAuction(uint256 rebalanceNonce, address[] tokens, (uint256 low, uint256 spot, uint256 high)[] newWeights, (uint256 low, uint256 high)[] newPrices, (uint256 low, uint256 spot, uint256 high) newLimits)',
])

test.use({ walletChain: 56 })

const seedUsdt = (mock: { ethCall: (a: string, c: string, r: `0x${string}`) => unknown }) =>
  mock.ethCall(
    BSC_USDT,
    encodeFunctionData({ abi: parseAbi(['function balanceOf(address) view returns (uint256)']), functionName: 'balanceOf', args: [TEST_ADDRESS] }),
    encodeAbiParameters([{ type: 'uint256' }], [0n])
  )

async function openAsLauncher(
  harness: import('../../../../e2e/harness').DtfHarness,
  requests: import('../../../../e2e/helpers/requests').BoundaryRequest[],
  at: number,
  tuple?: `0x${string}`
) {
  const r = windowed(cmc20)
  enrolLauncher(harness.mock, cmc20, TEST_ADDRESS)
  seedUsdt(harness.mock)
  detailFills(harness.mock)
  harness.mock.ethCall(cmc20.address, '0xaa3b5568', tuple ?? encodeTuple(cmc20, r))
  await harness.chain.freezeAt(at)
  await harness.page.setViewportSize({ width: 1400, height: 900 })
  await harness.page.goto(dtfPath(cmc20, `auctions/rebalance/${proposalIdFor(cmc20, r)}`))
  await harness.wallet.connect()
  await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
  await settle(harness.page, requests)
  return r
}

const launchReady = async (harness: import('../../../../e2e/harness').DtfHarness) => {
  const launch = harness.page.getByTestId('auctions-launch-btn')
  await expect(async () => {
    await harness.chain.advance(5_000)
    await expect(launch).toBeVisible()
    await expect(launch).toBeEnabled()
  }).toPass({ timeout: 40_000 })
  return launch
}

// Counts eth_call requests carrying the selector, including inside multicall3
// aggregate3 payloads (the selector appears without its 0x prefix there).
const rpcCalls = (requests: import('../../../../e2e/helpers/requests').BoundaryRequest[], selector: string) =>
  requests.filter((r) => r.boundary === 'rpc' && r.method === 'eth_call' && JSON.stringify(r.params).toLowerCase().includes(selector.replace(/^0x/, '').toLowerCase())).length

test('confirmed launch: toast, launching state, refresh picks up the new auction', async ({ harness, boundaryRequests }) => {
  const r = await openAsLauncher(harness, boundaryRequests, rebalanceTime(windowed(cmc20), 'restricted'))
  const launch = await launchReady(harness)
  const before = await detailState(harness.page)
  log.add('confirm.before', { launch: before.launch, round: before.round, progress: before.progress })
  harness.tx.confirm()
  await launch.click()
  await harness.chain.advance(1_000)
  const pending = await detailState(harness.page)
  log.add('confirm.pendingWallet', { launch: pending.launch, toasts: pending.toasts })
  // Receipt polling needs the clock to move; then the success toast fires.
  await pumpUntil(harness.page, async () => (await harness.page.locator('[data-sonner-toast]').count()) > 0, { stepMs: 4_000, maxSteps: 6 })
  const confirmed = await detailState(harness.page)
  log.add('confirm.receipt', { launch: confirmed.launch, toasts: confirmed.toasts, txLog: harness.tx.log.length })
  const sent = harness.tx.last()!
  const decoded = decodeFunctionData({ abi: OPEN_AUCTION_ABI, data: sent.data as `0x${string}` })
  log.add('confirm.calldata', {
    to: sent.to,
    functionName: decoded.functionName,
    nonce: String(decoded.args[0]),
    tokenCount: decoded.args[1].length,
    weightsCount: decoded.args[2].length,
  })
  fixtureFile('launch-openAuction-calldata', { to: sent.to, data: sent.data, decodedNonce: String(decoded.args[0]) })
  expect(decoded.functionName).toBe('openAuction')
  // The app refetches the auctions subgraph 10 s after the receipt; serve the
  // new auction from then on (findLast: this overlay supersedes the default []).
  const now = Number(r.restrictedUntil) - 60 + 30
  const s = sides(cmc20, r)
  const auction = liveAuction(r, now, { startOffset: -5, endOffset: 1_800, bids: [bid(s.surplus[0], s.deficit[0], now + 60, 1)] })
  harness.mock.subgraph({ operationName: 'getGovernanceStats', variables: { rebalanceId: r.id } }, { auctions: [auction] })
  const rpcBefore = rpcCalls(boundaryRequests, '0xaa3b5568')
  await harness.chain.advance(11_000)
  await pumpUntil(harness.page, async () => (await harness.page.getByTestId('dtf-auctions').getByText('Bidding is ongoing').count()) > 0, { stepMs: 5_000, maxSteps: 6 })
  const live = await detailState(harness.page)
  log.add('confirm.afterRefresh', { auctions: live.auctions, launch: live.launch, community: live.community, cowbot: live.cowbot, cowbotBanner: live.cowbotBanner, headerPill: live.headerPill })
  await harness.page.getByTestId('auctions-rebalance-header').scrollIntoViewIfNeeded()
  await shot(harness.page, 'launch-lifecycle', 'after-confirm-live-auction-1400')
  // Live-state refresh cadence: getRebalance is re-read every 10 s while an auction is ongoing.
  await harness.chain.advance(31_000)
  log.add('confirm.liveRefetch', { getRebalanceCallsBeforeLive: rpcBefore, after31s: rpcCalls(boundaryRequests, '0xaa3b5568') })
  expect(harness.tx.log).toHaveLength(1)
})

test('confirmed launch with indexer lag: the button re-arms after 15 s', async ({ harness, boundaryRequests }) => {
  await openAsLauncher(harness, boundaryRequests, rebalanceTime(windowed(cmc20), 'restricted'))
  const launch = await launchReady(harness)
  harness.tx.confirm()
  await launch.click()
  await pumpUntil(harness.page, async () => (await harness.page.locator('[data-sonner-toast]').count()) > 0, { stepMs: 4_000, maxSteps: 6 })
  const at5 = await detailState(harness.page)
  await harness.chain.advance(16_000)
  const at21 = await detailState(harness.page)
  log.add('lag.buttonStates', { afterReceipt: at5.launch, after16sMore: at21.launch, auctions: at21.auctions })
  // SYNTHETIC double-launch exposure: with the subgraph still empty the control
  // is live again; a second click sends a second openAuction to the mock wallet.
  if (at21.launch && !at21.launch.disabled) {
    harness.tx.confirm()
    await launch.click()
    await harness.chain.advance(5_000)
  }
  log.add('lag.txLog', harness.tx.log.map((t) => ({ to: t.to, selector: t.data.slice(0, 10) })))
  await shot(harness.page, 'launch-lifecycle', 'indexer-lag-rearmed-1400')
})

test('launch rejected in the wallet', async ({ harness, boundaryRequests }) => {
  await openAsLauncher(harness, boundaryRequests, rebalanceTime(windowed(cmc20), 'restricted'))
  const launch = await launchReady(harness)
  harness.tx.decline()
  await launch.click()
  await harness.chain.advance(2_000)
  const state = await detailState(harness.page)
  log.add('reject', { launch: state.launch, toasts: state.toasts, txLog: harness.tx.log.length })
  await shot(harness.page, 'launch-lifecycle', 'rejected-1400')
  expect(harness.tx.log).toHaveLength(0)
})

test('launch reverted on chain', async ({ harness, boundaryRequests }) => {
  await openAsLauncher(harness, boundaryRequests, rebalanceTime(windowed(cmc20), 'restricted'))
  const launch = await launchReady(harness)
  harness.tx.revert()
  await launch.click()
  await expect.poll(() => harness.tx.log.length, { timeout: 10_000 }).toBe(1)
  const sent = harness.tx.last()!
  // A reverted receipt is replayed as eth_call to surface the reason; the
  // MockControl wrapper does not expose ethCallRevert, so reach the underlying
  // overrides registry (a TS-private field, present at runtime).
  const overrides = (harness.mock as unknown as { overrides: { ethCallRevert: (a: string, c: string, r: string) => void } }).overrides
  overrides.ethCallRevert(sent.to, sent.data, 'Folio__AuctionCannotBeOpened')
  const states: unknown[] = []
  for (const step of [4_000, 8_000, 8_000, 10_000]) {
    await harness.chain.advance(step)
    const s = await detailState(harness.page)
    states.push({ afterMs: step, launch: s.launch, toasts: s.toasts })
  }
  log.add('revert', { states, receiptPolls: boundaryRequests.filter((r) => r.boundary === 'rpc' && r.method === 'eth_getTransactionReceipt').length })
  await shot(harness.page, 'launch-lifecycle', 'reverted-1400')
})

test('auction ends while the view is open; the next launch is auction 2', async ({ harness, boundaryRequests }) => {
  const r = windowed(cmc20)
  const now = rebalanceTime(r, 'permissionless')
  const s = sides(cmc20, r)
  harness.mock.subgraph(
    { operationName: 'getGovernanceStats', variables: { rebalanceId: r.id } },
    { auctions: [liveAuction(r, now, { startOffset: -1_700, endOffset: 100, bids: [bid(s.surplus[0], s.deficit[0], now - 900, 1), bid(s.surplus[1], s.deficit[1], now - 300, 2)] })] }
  )
  await openAsLauncher(harness, boundaryRequests, now)
  await pumpUntil(harness.page, async () => (await harness.page.getByTestId('dtf-auctions').getByText('Bidding is ongoing').count()) > 0)
  const live = await detailState(harness.page)
  log.add('ending.live', { auctions: live.auctions, launch: live.launch, community: live.community, overview: live.overview, headerPill: live.headerPill })
  await shot(harness.page, 'launch-lifecycle', 'auction-live-100s-left-1400')
  await harness.chain.advance(101_000)
  await harness.chain.advance(2_000)
  await pumpUntil(harness.page, async () => (await harness.page.getByTestId('auctions-launch-btn').count()) > 0, { stepMs: 3_000, maxSteps: 8 })
  const ended = await detailState(harness.page)
  log.add('ending.afterEnd', { auctions: ended.auctions, launch: ended.launch, round: ended.round, overview: ended.overview, toasts: ended.toasts, auctionQueries: boundaryRequests.filter((q) => q.boundary === 'subgraph' && q.operationName === 'getGovernanceStats').length })
  await shot(harness.page, 'launch-lifecycle', 'auction-ended-next-launch-1400')
  expect(ended.launch?.text).toMatch(/Start auction 2/)
  expect(harness.tx.log).toHaveLength(0)
})

test('rebalance expires while the view is open', async ({ harness, boundaryRequests }) => {
  const r = windowed(cmc20)
  await openAsLauncher(harness, boundaryRequests, Number(r.availableUntil) - 90)
  await launchReady(harness)
  const before = await detailState(harness.page)
  log.add('expiry.before', { headerPill: before.headerPill, launch: before.launch })
  await harness.chain.advance(120_000)
  await harness.chain.advance(2_000)
  const after = await detailState(harness.page)
  log.add('expiry.after', { headerPill: after.headerPill, launch: after.launch, completed: after.completed, round: after.round })
  await shot(harness.page, 'launch-lifecycle', 'expired-while-open-1400')
  // A reload at the same (now expired) time shows what a fresh visitor sees.
  await harness.page.reload()
  await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
  await settle(harness.page, boundaryRequests)
  await pumpUntil(harness.page, async () => (await harness.page.getByTestId('auctions-rebalance-completed').count()) > 0 || (await harness.page.getByTestId('auctions-launch-btn').count()) > 0)
  const reloaded = await detailState(harness.page)
  log.add('expiry.afterReload', { completed: reloaded.completed, launch: reloaded.launch })
  expect(harness.tx.log).toHaveLength(0)
})

test('completion during the session: unskewed basket reads as finished', async ({ harness, boundaryRequests }) => {
  const r = windowed(cmc20)
  await openAsLauncher(harness, boundaryRequests, rebalanceTime(r, 'permissionless'), encodeTuple(cmc20, r, { skewPercent: 0 }))
  await pumpUntil(harness.page, async () => (await harness.page.getByTestId('auctions-rebalance-completed').count()) > 0)
  const state = await detailState(harness.page)
  const card = harness.page.getByTestId('auctions-rebalance-completed')
  log.add('finished.withoutApiMetrics', {
    completed: state.completed,
    helpTooltips: await card.locator('button').count(),
    skeletons: await card.locator('[class*="animate-pulse"]').count(),
  })
  // Help buttons live in the metric cells (the back control is a link).
  const helps = card.locator('.p-4 button')
  const tips: string[] = []
  for (let i = 0; i < (await helps.count()); i += 1) {
    await helps.nth(i).hover()
    await harness.chain.advance(300)
    const tip = harness.page.getByRole('tooltip')
    tips.push((await tip.count()) ? clean(await tip.first().textContent()) : '(no tooltip)')
    await harness.page.mouse.move(5, 5)
    await harness.chain.advance(300)
  }
  log.add('finished.tooltips', tips)
  await shot(harness.page, 'launch-lifecycle', 'finished-in-session-1400')
})
