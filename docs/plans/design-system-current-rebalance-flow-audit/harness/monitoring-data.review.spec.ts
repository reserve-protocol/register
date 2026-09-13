import { expect, test } from '../../../../e2e/harness'
import { rebalanceTime } from '../../../../e2e/helpers/clock'
import { dtfPath } from '../../../../e2e/helpers/registry'
import {
  bid,
  cmc20,
  detailFills,
  encodeTuple,
  liquidityPayload,
  liveAuction,
  proposalIdFor,
  sides,
  windowed,
} from './fixtures'
import { clean, detailState, fixtureFile, observations, pumpUntil, settle, shot, tabTrail } from './review-helpers'

// Monitoring and data boundaries on cmc20, disconnected: live auction with
// bids, liquidity/Ondo panel, Ondo cap default, auctions-query failure, price
// loading, dev-mode diagnostics, unknown proposal route, cowbot for an unlisted DTF.
const log = observations('monitoring-data')
test.use({ wallet: false })

async function open(
  harness: import('../../../../e2e/harness').DtfHarness,
  requests: import('../../../../e2e/helpers/requests').BoundaryRequest[],
  at: number,
  options: { query?: string; skipDetailFills?: boolean; width?: number } = {}
) {
  const r = windowed(cmc20)
  if (!options.skipDetailFills) detailFills(harness.mock)
  harness.mock.ethCall(cmc20.address, '0xaa3b5568', encodeTuple(cmc20, r))
  await harness.chain.freezeAt(at)
  await harness.page.setViewportSize({ width: options.width ?? 1400, height: 900 })
  await harness.page.goto(dtfPath(cmc20, `auctions/rebalance/${proposalIdFor(cmc20, r)}${options.query ?? ''}`))
  await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
  await settle(harness.page, requests)
  return r
}

test('live auction with bids: chart, bid inspection, value traded', async ({ harness, boundaryRequests }) => {
  const r = windowed(cmc20)
  const now = rebalanceTime(r, 'permissionless')
  const s = sides(cmc20, r)
  const bids = [bid(s.surplus[0], s.deficit[0], now - 400, 1, 500, 800), bid(s.surplus[1], s.deficit[1], now - 200, 2, 250, 300)]
  const auction = liveAuction(r, now, { startOffset: -600, endOffset: 600, bids })
  fixtureFile('cmc20-live-auction-with-bids', { source: 'synthetic; per-rebalance auctions subgraph operation', frozenAt: now, auction })
  harness.mock.subgraph({ operationName: 'getGovernanceStats', variables: { rebalanceId: r.id } }, { auctions: [auction] })
  await open(harness, boundaryRequests, now)
  await pumpUntil(harness.page, async () => (await harness.page.getByTestId('dtf-auctions').getByText('Bidding is ongoing').count()) > 0)
  const state = await detailState(harness.page)
  log.add('bids.state', { auctions: state.auctions, overview: state.overview, launch: state.launch, community: state.community, headerPill: state.headerPill })
  const dots = harness.page.locator('.recharts-reference-dot')
  log.add('bids.dots', await dots.count())
  await harness.page.getByTestId('auctions-rebalance-header').scrollIntoViewIfNeeded()
  await shot(harness.page, 'monitoring-data', 'live-auction-bids-1400')
  if (await dots.count()) {
    await dots.first().click({ force: true })
    await harness.chain.advance(500)
    const panel = harness.page.getByTestId('dtf-auctions').locator('h3:has-text("Bid #")').locator('xpath=ancestor::div[contains(@class,"rounded-2xl")]')
    log.add('bids.selected', {
      text: clean(await panel.first().textContent().catch(() => '')).slice(0, 400),
      links: await panel.first().locator('a').evaluateAll((as) => as.map((a) => ({ text: (a.textContent ?? '').trim(), href: a.getAttribute('href'), target: a.getAttribute('target') }))).catch(() => []),
      dotFocusable: await dots.first().evaluate((el) => el.matches('a,button,[tabindex]')),
    })
    await shot(harness.page, 'monitoring-data', 'live-auction-bid-selected-1400')
  }
  // Auction countdown pill ticks with the clock.
  const pillBefore = state.auctions?.pill
  await harness.chain.advance(60_000)
  const after = await detailState(harness.page)
  log.add('bids.pillTick', { before: pillBefore, after60s: after.auctions?.pill })
})

test('liquidity panel: levels, error retry, high impact, Ondo closed/limited, refresh', async ({ harness, boundaryRequests }) => {
  const r = windowed(cmc20)
  const s = sides(cmc20, r)
  const [a, b, c, d] = [s.deficit[0], s.surplus[0], s.deficit[1], s.surplus[1]]
  const payload = liquidityPayload(s.all, {
    [a.address.toLowerCase()]: { level: 'error', priceImpact: 0, error: 'Zapper timeout' },
    [b.address.toLowerCase()]: { level: 'low', priceImpact: 8.4 },
    [c.address.toLowerCase()]: { level: 'ondo', priceImpact: 0, ondo: { symbol: 'TSLAon', ticker: 'TSLA', tradingOpen: false, withinCapacity: true, capacityUsd: 250_000, reason: { code: 'market_closed', message: 'Market closed' }, upcoming: [] } },
    [d.address.toLowerCase()]: { level: 'ondo', priceImpact: 0, ondo: { symbol: 'NVDAon', ticker: 'NVDA', tradingOpen: true, withinCapacity: false, capacityUsd: 50, reason: null, upcoming: [{ code: 'earnings', message: 'Earnings', start: '2026-09-20T13:30:00Z', end: null }] } },
  }, { isOpen: false, session: 'closed', nextOpen: '2026-09-14T13:30:00Z', nextClose: null, timestamp: '2026-09-13T10:00:00Z' })
  fixtureFile('cmc20-liquidity-payload', { source: 'synthetic; POST /rebalance/liquidity', payload })
  harness.mock.api({ pathname: '/zapper/tokens' }, [])
  harness.mock.api({ method: 'POST', pathname: '/rebalance/liquidity' }, payload)
  await open(harness, boundaryRequests, rebalanceTime(r, 'permissionless'), { skipDetailFills: true })
  await pumpUntil(harness.page, async () => (await harness.page.getByTestId('dtf-auctions').getByText('Estimated total impact').count()) > 0)
  const state = await detailState(harness.page)
  log.add('liquidity.state', { liquidity: state.liquidity, actionOverview: state.actionOverview, round: state.round })
  const panel = harness.page.getByTestId('dtf-auctions').locator('span:has-text("Liquidity")').first().locator('xpath=ancestor::div[contains(@class,"rounded-3xl")][1]')
  await panel.scrollIntoViewIfNeeded()
  await shot(harness.page, 'monitoring-data', 'liquidity-panel-1400')
  const posts = () => boundaryRequests.filter((q) => q.boundary === 'api' && q.pathname.includes('/rebalance/liquidity')).length
  const before = posts()
  // Retry lives inside the errored token's badge tooltip (hover-only).
  const erroredRow = panel.locator('div.flex.items-center.py-1').filter({ hasText: a.symbol }).first()
  const badge = erroredRow.locator('[data-state], span.rounded-full, button').last()
  await badge.hover()
  await harness.chain.advance(500)
  const tooltip = harness.page.getByRole('tooltip')
  log.add('liquidity.errorBadgeTooltip', (await tooltip.count()) ? clean(await tooltip.first().textContent()) : '(no tooltip)')
  const retry = harness.page.locator('[role="tooltip"] button, [data-radix-popper-content-wrapper] button').filter({ hasText: /retry/i }).first()
  log.add('liquidity.retryControl', { inTooltip: await retry.count(), badgeFocusable: await badge.evaluate((el) => el.matches('a,button,[tabindex]')) })
  if (await retry.count()) {
    await retry.click()
    await harness.chain.advance(2_000)
  }
  await harness.page.mouse.move(5, 5)
  const afterRetry = posts()
  const refresh = panel.locator('button').filter({ has: harness.page.locator('svg.lucide-refresh-cw') }).first()
  await refresh.click()
  await harness.chain.advance(2_000)
  log.add('liquidity.requests', { before, afterRetry, afterRefresh: posts() })
  // Ondo badge tooltips.
  const ondoPills = panel.locator('span:has-text("Market closed"), span:has-text("Limited")')
  log.add('liquidity.ondoPills', await ondoPills.allTextContents())
  log.add('liquidity.tabTrail', await tabTrail(harness.page, 8, panel.locator('button').first()))
})

test('Ondo cap defaults the launch percent; visible only through the debug panel', async ({ harness, boundaryRequests }) => {
  const r = windowed(cmc20)
  const s = sides(cmc20, r)
  const capped = liquidityPayload(s.all, {
    [s.deficit[0].address.toLowerCase()]: { level: 'ondo', priceImpact: 0, ondo: { symbol: 'NVDAon', tradingOpen: true, withinCapacity: false, capacityUsd: 50, reason: null, upcoming: [] } },
  }, null)
  harness.mock.api({ pathname: '/zapper/tokens' }, [])
  harness.mock.api({ method: 'POST', pathname: '/rebalance/liquidity' }, capped)
  await open(harness, boundaryRequests, rebalanceTime(r, 'permissionless'), { skipDetailFills: true, query: '?debug=true' })
  await pumpUntil(harness.page, async () => (await harness.page.getByText('Rebalance Percent:').count()) > 0)
  await harness.chain.advance(10_000)
  const state = await detailState(harness.page)
  const percent = clean(await harness.page.getByText('Rebalance Percent:').textContent())
  log.add('ondoCap.debug', { percent, estTradeValue: state.actionOverview.estTradeValue, exceeded: clean(await harness.page.getByText('Above Ondo single-trade limit').textContent().catch(() => '')), debugPanel: state.debugPanel, completedShown: !!state.completed })
  await harness.page.getByText('Rebalance Percent:').scrollIntoViewIfNeeded()
  await shot(harness.page, 'monitoring-data', 'debug-panel-ondo-cap-1400')
  // The same page without ?debug shows no control and no explanation.
  await harness.page.goto(dtfPath(cmc20, `auctions/rebalance/${proposalIdFor(cmc20, r)}`))
  await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
  await settle(harness.page, boundaryRequests)
  await pumpUntil(harness.page, async () => (await harness.page.getByTestId('auctions-round').count()) > 0)
  await harness.chain.advance(10_000)
  const plain = await detailState(harness.page)
  log.add('ondoCap.plain', { estTradeValue: plain.actionOverview.estTradeValue, debugPanel: plain.debugPanel, community: plain.community })
})

test('auctions query failure hides live-auction state and re-exposes the launch control', async ({ harness, boundaryRequests }) => {
  const r = windowed(cmc20)
  harness.mock.subgraph({ operationName: 'getGovernanceStats', variables: { rebalanceId: r.id } }, { errors: [{ message: 'indexer unavailable' }] })
  await open(harness, boundaryRequests, rebalanceTime(r, 'permissionless'))
  await pumpUntil(harness.page, async () => (await harness.page.getByTestId('auctions-community-launch-btn').count()) > 0)
  const state = await detailState(harness.page)
  log.add('auctionsQueryFailure', { auctions: state.auctions, community: state.community, error: state.error, toasts: state.toasts })
})

test('price feed still loading: what the detail shows before metrics exist', async ({ harness, boundaryRequests }) => {
  const r = windowed(cmc20)
  const hold = harness.mock.hold({ boundary: 'api', pathname: '/current/prices' })
  await open(harness, boundaryRequests, rebalanceTime(r, 'permissionless'))
  await expect.poll(() => hold.hits, { timeout: 20_000 }).toBeGreaterThan(0)
  await harness.chain.advance(5_000)
  const loading = await detailState(harness.page)
  log.add('pricesPending', { progress: loading.progress, round: loading.round, actionOverview: loading.actionOverview, overview: loading.overview, community: loading.community, error: loading.error, headerPill: loading.headerPill })
  await shot(harness.page, 'monitoring-data', 'prices-pending-1400')
  hold.release()
  await pumpUntil(harness.page, async () => (await harness.page.getByTestId('auctions-round').getAttribute('data-round')) !== '')
  const loaded = await detailState(harness.page)
  log.add('pricesResolved', { progress: loaded.progress, round: loaded.round, actionOverview: loaded.actionOverview, community: loaded.community })
  await shot(harness.page, 'monitoring-data', 'prices-resolved-1400')
})

test('debug mode on an expired rebalance suppresses the completed card', async ({ harness, boundaryRequests }) => {
  const r = windowed(cmc20)
  await open(harness, boundaryRequests, rebalanceTime(r, 'expired'), { query: '?debug=true' })
  await pumpUntil(harness.page, async () => (await harness.page.getByText('Rebalance Percent:').count()) > 0 || (await harness.page.getByTestId('auctions-rebalance-completed').count()) > 0)
  const state = await detailState(harness.page)
  log.add('debugExpired', { completed: !!state.completed, headerPill: state.headerPill, community: state.community, debugPanel: state.debugPanel, round: state.round })
  const debug = harness.page.getByText('Rebalance Percent:').locator('xpath=ancestor::div[contains(@class,"rounded-3xl")][1]')
  log.add('debugExpired.panelSections', (await debug.locator('h4, label').allTextContents()).map(clean))
  await shot(harness.page, 'monitoring-data', 'debug-expired-1400')
})

test('detail route for a proposal id with no matching rebalance', async ({ harness, boundaryRequests }) => {
  detailFills(harness.mock)
  await harness.chain.freezeAt(rebalanceTime(windowed(cmc20), 'permissionless'))
  await harness.page.setViewportSize({ width: 1400, height: 900 })
  await harness.page.goto(dtfPath(cmc20, 'auctions/rebalance/999999999999'))
  await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
  await settle(harness.page, boundaryRequests)
  await harness.chain.advance(10_000)
  const state = await detailState(harness.page)
  log.add('unknownProposal', { title: state.title, headerPill: state.headerPill, round: state.round, progress: state.progress, community: state.community, communityUnavailable: state.communityUnavailable, launch: state.launch, actionOverview: state.actionOverview, completed: !!state.completed, skeletons: await harness.page.getByTestId('dtf-auctions').locator('[class*="animate-pulse"]').count() })
  await shot(harness.page, 'monitoring-data', 'unknown-proposal-1400')
})

test.describe('cowbot for a DTF outside the listed set', () => {
  test.use({ allowUnmocked: true })
  test('initializing card and navigation guard, then the SDK error path', async ({ harness, boundaryRequests, unmockedCalls }) => {
    const r = windowed(cmc20)
    const now = rebalanceTime(r, 'permissionless')
    harness.mock.subgraph({ operationName: 'getGovernanceStats', variables: { rebalanceId: r.id } }, { auctions: [liveAuction(r, now, { startOffset: -300, endOffset: 1_500 })] })
    // Remove cmc20 from the discover list so useIsListedDTF() reports false
    // (the hook fetches /v1/discover/dtfs; the shared mock serves the snapshot).
    harness.mock.api({ pathname: '/v1/discover/dtfs' }, [])
    harness.page.on('dialog', (dialog) => {
      log.add('cowbot.dialog', { type: dialog.type(), message: dialog.message() })
      void dialog.dismiss()
    })
    await open(harness, boundaryRequests, now)
    await pumpUntil(harness.page, async () => (await harness.page.getByTestId('dtf-auctions').getByText('Bidding is ongoing').count()) > 0)
    const states: unknown[] = []
    for (const step of [1_000, 5_000, 15_000, 30_000]) {
      await harness.chain.advance(step)
      const s = await detailState(harness.page)
      states.push({ afterMs: step, cowbot: s.cowbot, banner: s.cowbotBanner, toasts: s.toasts })
      if (s.cowbot) await shot(harness.page, 'monitoring-data', `cowbot-${step}`)
    }
    log.add('cowbot.states', states)
    // Navigation guard while the filler is active (history.pushState is wrapped).
    const before = harness.page.url()
    await harness.page.getByTestId('auctions-rebalance-header').locator('a').first().click()
    await harness.chain.advance(1_000)
    log.add('cowbot.backAttempt', { before, after: harness.page.url() })
    log.add('cowbot.unmockedCalls', unmockedCalls.slice(0, 12).map((l) => l.slice(0, 180)))
  })
})
