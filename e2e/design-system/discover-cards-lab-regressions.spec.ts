import { test, expect } from '../fixtures/base'
import { expectDiscoverCardSurfaces } from './discover-card-geometry'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

let before: ReturnType<typeof readReviewSource>
let guard: ReturnType<typeof watchReviewSource>
test.beforeEach(({ page }) => {
  page.setDefaultTimeout(10_000)
  page.setDefaultNavigationTimeout(60_000)
  before = readReviewSource(process.cwd())
  guard = watchReviewSource(process.cwd())
})
test.afterEach(async ({ page }, info) => {
  expect(page.isClosed()).toBe(false)
  guard.close()
  assertUnchangedSource(before, readReviewSource(process.cwd()), [
    ...guard.changes,
  ])
  await info.attach('public-source-digest', {
    body: Buffer.from(before.digest),
    contentType: 'text/plain',
  })
})

test('Discover cards retain sorting across the available-width boundary', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto(
    '/internal/design-system/components/table#discover-family-review'
  )
  const review = page.getByTestId('discover-review')
  const composition = review.getByTestId('discover-composition')
  await composition.getByRole('button', { name: 'Name', exact: true }).click()
  await expect(composition.locator('tbody tr').first()).toContainText(
    'CF Large Cap Index'
  )
  const lcap = composition.locator('tbody tr').first()
  await lcap.getByRole('button', { name: 'Basket', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Collateral:' })).toBeVisible()
  await composition.evaluate((el) => {
    el.style.width = '1151px'
  })
  await expect(page.getByRole('dialog', { name: 'Collateral:' })).toHaveCount(0)
  await expect(composition.getByTestId('discover-card').first()).toBeFocused()
  await composition.getByTestId('table-sort-menu').click()
  await expect(page.getByTestId('table-sort-options')).toBeVisible()
  await composition.evaluate((el) => {
    el.style.width = '1152px'
  })
  await expect(page.getByTestId('table-sort-options')).toHaveCount(0)
  await expect(
    composition.getByRole('button', { name: 'Name', exact: true })
  ).toBeFocused()
  await composition.evaluate((el) => {
    el.style.width = ''
  })
  await review
    .getByRole('switch', { name: 'Constrained Discover column' })
    .setChecked(true)
  await expect(composition.getByTestId('discover-card')).toHaveCount(5)
  await expect(composition.getByRole('table')).toHaveCount(0)
  await expect(composition.getByTestId('discover-card').first()).toContainText(
    'CF Large Cap Index'
  )
  await review
    .getByRole('switch', { name: 'Constrained Discover column' })
    .setChecked(false)
  await expect(composition.getByTestId('discover-card')).toHaveCount(0)
  await expect(composition.locator('tbody tr').first()).toContainText(
    'CF Large Cap Index'
  )
})

test('Discover resize does not reclaim focus after an outside interaction', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto(
    '/internal/design-system/components/table#discover-family-review'
  )
  const review = page.getByTestId('discover-review')
  const composition = review.getByTestId('discover-composition')
  await composition.evaluate((el) => {
    el.style.width = '1151px'
  })
  const card = composition.getByTestId('discover-card').first()
  await card.focus()
  await review
    .getByRole('heading', { name: 'Discover browsing rows', exact: true })
    .click()
  await composition.evaluate((el) => {
    el.style.width = '1152px'
  })
  await expect(composition.getByRole('table')).toHaveCount(1)
  expect(
    await composition.evaluate((el) => el.contains(document.activeElement))
  ).toBe(false)
  await composition.evaluate((el) => {
    el.style.width = '1151px'
  })
  await card.focus()
  await page
    .getByRole('button', { name: 'Select language', exact: true })
    .click()
  await expect(page.getByRole('menu')).toBeVisible()
  await composition.evaluate((el) => {
    el.style.width = '1152px'
  })
  await expect(composition.locator('table')).toHaveCount(1)
  expect(
    await composition.evaluate((el) => el.contains(document.activeElement))
  ).toBe(false)
  await page.keyboard.press('Escape')
})

for (const [theme, width] of [
  ['light', 320],
  ['light', 390],
  ['dark', 390],
  ['light', 768],
] as const) {
  test(`Discover card states ${theme} ${width}`, async ({
    page,
    txLog,
  }, info) => {
    await page.setViewportSize({ width, height: 844 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript(
      (theme) => localStorage.setItem('theme-ui-color-mode', theme),
      theme
    )
    await page.goto(
      '/internal/design-system/components/table#discover-family-review'
    )
    await page.evaluate(() => document.fonts.ready)
    const review = page.getByTestId('discover-review')
    const composition = review.getByTestId('discover-composition')
    const cards = composition.getByTestId('discover-card')
    const select = async (label: string, value: string) => {
      await review.getByRole('combobox', { name: label }).click()
      await page.getByRole('option', { name: value, exact: true }).click()
    }
    const capture = async (name: string) => {
      await composition.evaluate((el) => {
        el.style.scrollMarginTop = '120px'
        el.scrollIntoView({ block: 'start' })
      })
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(width)
      const clipped = await cards.evaluateAll((nodes) =>
        nodes.flatMap((node) =>
          [...node.querySelectorAll('h3,p,[data-slot="discover-card-market"]')]
            .filter((el) => el.scrollWidth > el.clientWidth + 1)
            .map((el) => el.textContent)
        )
      )
      expect(clipped).toEqual([])
      await expectDiscoverCardSurfaces(composition)
      await info.attach(name, {
        body: await page.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      })
    }
    await expect(cards).toHaveCount(5)
    await expect(composition.getByRole('table')).toHaveCount(0)
    await expect(cards.first()).toContainText('$162.45')
    await expect(cards.first()).toContainText('+23.81%')
    await expect(cards.first()).toContainText(
      'Majors, Bitcoin, L1, DeFi, Perps, Ecosystem'
    )
    const nameGap = await cards
      .first()
      .evaluate(
        (el) =>
          el
            .querySelector('[data-slot="discover-card-market"]')!
            .getBoundingClientRect().top -
          el.querySelector('h3')!.getBoundingClientRect().bottom
      )
    expect(nameGap).toBe(8)
    await capture('compact-default')
    await select('Discover card layout', 'Full chart')
    await expect(
      cards.first().locator('[data-slot="discover-card-chart"]')
    ).toHaveCSS('height', '208px')
    await capture('full-default')
    await select('Discover preview state', 'Long content')
    await capture('full-long')
    await select('Discover card layout', 'Compact chart')
    await capture('compact-long')
    await select('Discover preview state', 'Zero / unavailable')
    const lcap = cards.filter({ hasText: 'CF Large Cap Index' })
    const cmc = cards.filter({ hasText: 'CoinMarketCap 20 Index DTF' })
    await expect(
      lcap.locator('[data-slot="performance-value"]')
    ).toHaveAccessibleName('1M performance: no data')
    await expect(
      cmc.locator('[data-slot="performance-value"]')
    ).toHaveAccessibleName('1M performance: neutral 0.00 percent')
    await expect(
      cmc.locator('[data-slot="performance-value"]')
    ).toHaveAttribute('title', '1M performance')
    await expect(lcap).toContainText('—')
    await expect(
      lcap.locator('[data-slot="discover-card-chart"] svg')
    ).toHaveCount(0)
    await expect(cmc).toContainText('$0.00')
    await expect(cmc).toContainText('0.00%')
    await expect(
      cards
        .filter({ hasText: 'Reserve AI Photonics DTF' })
        .locator('[data-slot="card-asset-ticker"]')
    ).toContainText('—%')
    await capture('zero-unavailable')
    await select('Discover preview state', 'Including inactive')
    await expect(cards).toHaveCount(6)
    await expect(cards.filter({ hasText: 'BTC ETH DCA Index' })).toContainText(
      'Inactive'
    )
    await select('Discover preview state', 'Default')
    const heights = await cards.evaluateAll((nodes) =>
      nodes.map((el) => el.getBoundingClientRect().height)
    )
    await select('Discover preview state', 'Loading')
    const skeletons = composition.getByTestId('discover-card-skeleton')
    await expect(skeletons).toHaveCount(5)
    await expect(cards).toHaveCount(0)
    await expect(composition.getByRole('link')).toHaveCount(0)
    await expect(
      skeletons
        .first()
        .locator('[data-slot="card-asset-ticker"] [data-testid="v1-skeleton"]')
    ).not.toHaveCount(0)
    const fills = await skeletons
      .first()
      .getByTestId('v1-skeleton')
      .evaluateAll((nodes) => [
        ...new Set(nodes.map((el) => getComputedStyle(el).backgroundColor)),
      ])
    expect(fills).toHaveLength(1)
    await capture('loading')
    const loadingHeights = await skeletons.evaluateAll((nodes) =>
      nodes.map((el) => el.getBoundingClientRect().height)
    )
    expect(loadingHeights).toEqual(heights)
    await select('Discover preview state', 'Default')
    await expect(cards).toHaveCount(5)
    await composition.getByTestId('table-sort-menu').click()
    await page.getByTestId('table-sort-field-name').click()
    await expect(page.getByTestId('table-sort-options')).toHaveCount(0)
    await composition.getByTestId('table-sort-menu').click()
    await page.getByTestId('table-sort-direction-asc').click()
    await expect(page.getByTestId('table-sort-options')).toHaveCount(0)
    await expect(cards.first()).toContainText('CF Large Cap Index')
    await cards.first().focus()
    expect(
      await cards.first().evaluate((el) => getComputedStyle(el).boxShadow)
    ).toContain('2px')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(
      /\/base\/index-dtf\/(?:lcap|0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8)\/overview/i
    )
    expect(txLog).toHaveLength(0)
  })
}

for (const reduced of [false, true]) {
  test(`Discover card ticker recovery ${reduced ? 'reduced' : 'motion'}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({
      reducedMotion: reduced ? 'reduce' : 'no-preference',
    })
    await page.goto(
      '/internal/design-system/components/table#discover-family-review'
    )
    const review = page.getByTestId('discover-review')
    const composition = review.getByTestId('discover-composition')
    const choose = async (value: string) => {
      await review
        .getByRole('combobox', { name: 'Discover preview state' })
        .click()
      await page.getByRole('option', { name: value, exact: true }).click()
    }
    await choose('Loading')
    await expect(composition.getByTestId('discover-card-skeleton')).toHaveCount(
      5
    )
    await choose('Default')
    const card = composition.getByTestId('discover-card').first()
    await card.evaluate((el) => {
      el.style.scrollMarginTop = '120px'
      el.scrollIntoView({ block: 'start' })
    })
    const ticker = card.locator('[data-slot="card-asset-ticker"]')
    const animations = () =>
      ticker.evaluate((el) =>
        el
          .getAnimations({ subtree: true })
          .filter(
            (a) =>
              a instanceof CSSAnimation &&
              a.animationName === 'collateral-assets-scroll'
          )
          .map((a) => ({
            duration: a.effect?.getTiming().duration,
            state: a.playState,
          }))
      )
    if (reduced) expect(await animations()).toEqual([])
    else {
      await expect
        .poll(animations)
        .toEqual([{ duration: 18000, state: 'running' }])
      await card.focus()
      await expect
        .poll(animations)
        .toEqual([{ duration: 18000, state: 'paused' }])
    }
    await choose('Short basket')
    await expect(card.locator('[data-slot="card-asset-ticker"]')).toContainText(
      '100%'
    )
    expect(await animations()).toEqual([])
  })
}
