import { encodeAbiParameters, encodeFunctionData, parseAbi } from 'viem'
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
  lcap,
  liveAuction,
  matched,
  metricsPayload,
  proposalIdFor,
  sides,
  windowed,
} from './fixtures'
import { horizontalFit, observations, pumpUntil, setTheme, settle, shot, tabTrail } from './review-helpers'

// Phone-width fit (390 and 320) for the list, the restricted detail, a live
// auction with bids, the completed card and the weight editor; keyboard reach
// of the detail controls at desktop width.
const log = observations('phone-keyboard')

const seedUsdt = (mock: { ethCall: (a: string, c: string, r: `0x${string}`) => unknown }) =>
  mock.ethCall(
    BSC_USDT,
    encodeFunctionData({ abi: parseAbi(['function balanceOf(address) view returns (uint256)']), functionName: 'balanceOf', args: [TEST_ADDRESS] }),
    encodeAbiParameters([{ type: 'uint256' }], [0n])
  )

test.describe('phone, disconnected', () => {
  test.use({ wallet: false })

  for (const width of [390, 320]) {
    test(`cmc20 list and restricted detail at ${width}`, async ({ harness, boundaryRequests }) => {
      const r = windowed(cmc20)
      detailFills(harness.mock)
      harness.mock.ethCall(cmc20.address, '0xaa3b5568', encodeTuple(cmc20, r))
      await harness.chain.freezeAt(rebalanceTime(r, 'restricted'))
      await harness.page.setViewportSize({ width, height: 844 })
      await harness.page.goto(dtfPath(cmc20, 'auctions'))
      await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
      await settle(harness.page, boundaryRequests)
      await expect(harness.page.getByTestId('auctions-active-item').first()).toBeVisible({ timeout: 20_000 })
      await harness.chain.advance(5_000)
      log.add(`list.${width}.fit`, await horizontalFit(harness.page))
      await harness.page.getByTestId('auctions-active-section').scrollIntoViewIfNeeded()
      await shot(harness.page, 'phone-keyboard', `list-${width}-restricted`)
      await harness.page.getByTestId('auctions-active-item').first().click()
      await expect(harness.page).toHaveURL(/\/auctions\/rebalance\//)
      await settle(harness.page, boundaryRequests)
      await pumpUntil(harness.page, async () => (await harness.page.getByTestId('auctions-round').count()) > 0)
      await harness.chain.advance(5_000)
      log.add(`detail.${width}.restricted.fit`, await horizontalFit(harness.page))
      await shot(harness.page, 'phone-keyboard', `detail-${width}-restricted-top`)
      await harness.page.mouse.wheel(0, 600)
      await harness.chain.advance(200)
      await shot(harness.page, 'phone-keyboard', `detail-${width}-restricted-scrolled`)
    })

    test(`cmc20 live auction with bids at ${width} (dark)`, async ({ harness, boundaryRequests }) => {
      const r = windowed(cmc20)
      const now = rebalanceTime(r, 'permissionless')
      const s = sides(cmc20, r)
      harness.mock.subgraph(
        { operationName: 'getGovernanceStats', variables: { rebalanceId: r.id } },
        { auctions: [liveAuction(r, now, { startOffset: -600, endOffset: 600, bids: [bid(s.surplus[0], s.deficit[0], now - 300, 1)] })] }
      )
      detailFills(harness.mock)
      harness.mock.ethCall(cmc20.address, '0xaa3b5568', encodeTuple(cmc20, r))
      await setTheme(harness.page, 'dark')
      await harness.chain.freezeAt(now)
      await harness.page.setViewportSize({ width, height: 844 })
      await harness.page.goto(dtfPath(cmc20, `auctions/rebalance/${proposalIdFor(cmc20, r)}`))
      await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
      await settle(harness.page, boundaryRequests)
      await pumpUntil(harness.page, async () => (await harness.page.getByTestId('dtf-auctions').getByText('Bidding is ongoing').count()) > 0)
      await harness.chain.advance(2_000)
      log.add(`detail.${width}.live.fit`, await horizontalFit(harness.page))
      await shot(harness.page, 'phone-keyboard', `detail-${width}-live-top-dark`)
      await harness.page.mouse.wheel(0, 500)
      await harness.chain.advance(200)
      await shot(harness.page, 'phone-keyboard', `detail-${width}-live-scrolled-dark`)
    })

    test(`lcap completed card at ${width}`, async ({ harness, boundaryRequests }) => {
      const latest = matched(lcap)[0]
      detailFills(harness.mock)
      harness.mock.ethCall(lcap.address, '0xaa3b5568', encodeTuple(lcap, latest))
      harness.mock.api({ pathname: '/dtf/rebalance' }, metricsPayload(latest, 96.4, 1.51, 84_210, 3))
      await harness.chain.freezeAt(rebalanceTime(latest, 'expired'))
      await harness.page.setViewportSize({ width, height: 844 })
      await harness.page.goto(dtfPath(lcap, `auctions/rebalance/${proposalIdFor(lcap, latest)}`))
      await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
      await settle(harness.page, boundaryRequests)
      await expect(harness.page.getByTestId('auctions-rebalance-completed')).toBeVisible({ timeout: 20_000 })
      await harness.chain.advance(10_000)
      log.add(`completed.${width}.fit`, await horizontalFit(harness.page))
      await shot(harness.page, 'phone-keyboard', `completed-${width}`)
    })
  }
})

test.describe('phone, lcap launcher (weight editor)', () => {
  test.use({ walletChain: 8453 })
  test('weight editor at 390', async ({ harness, boundaryRequests }) => {
    const latest = matched(lcap)[0]
    enrolLauncher(harness.mock, lcap, TEST_ADDRESS)
    detailFills(harness.mock)
    harness.mock.ethCall(lcap.address, '0xaa3b5568', encodeTuple(lcap, latest))
    await harness.chain.freezeAt(rebalanceTime(latest, 'restricted'))
    await harness.page.setViewportSize({ width: 390, height: 844 })
    await harness.page.goto(dtfPath(lcap, `auctions/rebalance/${proposalIdFor(lcap, latest)}`))
    await harness.wallet.connect()
    await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
    await settle(harness.page, boundaryRequests)
    await pumpUntil(harness.page, async () => (await harness.page.getByRole('button', { name: 'Manage Weights' }).count()) > 0)
    await harness.chain.advance(3_000)
    await shot(harness.page, 'phone-keyboard', 'manage-weights-card-390')
    await harness.page.getByRole('button', { name: 'Manage Weights' }).click()
    await pumpUntil(harness.page, async () => (await harness.page.getByText('Manage Basket Weights').count()) > 0 || (await harness.page.getByTestId('manage-weights-unavailable').count()) > 0)
    await harness.chain.advance(2_000)
    log.add('editor.390.fit', await horizontalFit(harness.page))
    await shot(harness.page, 'phone-keyboard', 'editor-390-top')
    await harness.page.mouse.wheel(0, 500)
    await harness.chain.advance(200)
    await shot(harness.page, 'phone-keyboard', 'editor-390-scrolled')
  })
})

test.describe('keyboard at desktop width', () => {
  test.use({ walletChain: 56 })
  test('cmc20 launcher detail with a live auction: reachable controls', async ({ harness, boundaryRequests }) => {
    const r = windowed(cmc20)
    const now = rebalanceTime(r, 'permissionless')
    const s = sides(cmc20, r)
    enrolLauncher(harness.mock, cmc20, TEST_ADDRESS)
    seedUsdt(harness.mock)
    harness.mock.subgraph(
      { operationName: 'getGovernanceStats', variables: { rebalanceId: r.id } },
      { auctions: [liveAuction(r, now, { startOffset: -600, endOffset: 600, bids: [bid(s.surplus[0], s.deficit[0], now - 300, 1)] })] }
    )
    detailFills(harness.mock)
    harness.mock.ethCall(cmc20.address, '0xaa3b5568', encodeTuple(cmc20, r))
    await harness.chain.freezeAt(now)
    await harness.page.setViewportSize({ width: 1400, height: 900 })
    await harness.page.goto(dtfPath(cmc20, `auctions/rebalance/${proposalIdFor(cmc20, r)}`))
    await harness.wallet.connect()
    await expect(harness.page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
    await settle(harness.page, boundaryRequests)
    await pumpUntil(harness.page, async () => (await harness.page.getByTestId('dtf-auctions').getByText('Bidding is ongoing').count()) > 0)
    await harness.chain.advance(3_000)
    const root = harness.page.getByTestId('dtf-auctions')
    log.add('keyboard.trail', await tabTrail(harness.page, 14, root.locator('a').first()))
    log.add('keyboard.inventory', await root.evaluate((el) => ({
      focusable: [...el.querySelectorAll('a,button,input,[tabindex]:not([tabindex="-1"])')].filter((n) => (n as HTMLElement).getClientRects().length).map((n) => `${n.tagName.toLowerCase()}:${(n.getAttribute('aria-label') ?? n.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40)}`),
      clickableDivs: [...el.querySelectorAll('div[role="button"], div.cursor-pointer')].map((n) => (n.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40)),
      chartDots: el.querySelectorAll('.recharts-reference-dot').length,
      chartDotsFocusable: [...el.querySelectorAll('.recharts-reference-dot')].filter((n) => n.matches('[tabindex]')).length,
    })))
    // Title link opens the proposal in a new tab; back link returns to the list.
    const title = harness.page.getByTestId('auctions-rebalance-title')
    log.add('keyboard.titleLink', { href: await title.getAttribute('href'), target: await title.getAttribute('target') })
    const back = root.locator('a').first()
    log.add('keyboard.backLink', { href: await back.getAttribute('href'), nestedButton: await back.locator('button').count() })
  })
})
