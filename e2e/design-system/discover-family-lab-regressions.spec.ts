import { test, expect } from '../fixtures/base'
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

test('discover family initial behavior', async ({ page, context }) => {
  await page.goto(
    '/internal/design-system/components/table#discover-family-review'
  )
  const composition = page.getByTestId('discover-composition')
  await expect(
    composition.getByRole('table', { name: 'Discover DTF sample' })
  ).toBeVisible()
  const basket = composition
    .locator('tbody tr')
    .filter({ hasText: 'CF Large Cap Index' })
    .getByRole('button', {
      name: 'Basket',
      exact: true,
    })
    .filter({ visible: true })
  await basket.focus()
  await page.keyboard.press('Enter')
  const popup = page.getByRole('dialog', { name: 'Collateral:' })
  await expect(popup).toBeVisible()
  await expect(popup.getByRole('listitem')).toHaveCount(8)
  await expect(popup).toContainText('41.14%')
  await page.keyboard.press('Escape')
  await expect(basket).toBeFocused()
  await expect(page).toHaveURL(/#discover-family-review$/)
  const lcap = composition
    .locator('tbody tr')
    .filter({ hasText: 'CF Large Cap Index' })
  await lcap.locator('td:visible').last().click()
  await expect(page).toHaveURL(
    /\/base\/index-dtf\/(?:lcap|0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8)\/overview/i
  )
  await page.goto(
    '/internal/design-system/components/table#discover-family-review'
  )
  await context.route('**/base/index-dtf/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<title>Navigation destination</title>',
    })
  )
  const opened = context.waitForEvent('page', { timeout: 10_000 })
  await lcap
    .locator('td:visible')
    .last()
    .click({ modifiers: [process.platform === 'darwin' ? 'Meta' : 'Control'] })
  const destination = await opened
  await destination.waitForLoadState('domcontentloaded')
  await expect(destination).toHaveURL(
    /\/base\/index-dtf\/(?:lcap|0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8)\/overview/i
  )
  await destination.close()
  await expect(page).toHaveURL(/#discover-family-review$/)
})

for (const [theme, width] of [
  ['light', 1400],
  ['dark', 1400],
] as const) {
  test(`discover family ${theme} ${width}`, async ({ page, txLog }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto(
      '/internal/design-system/components/table#discover-family-review'
    )
    const review = page.getByTestId('discover-review')
    const composition = review.getByTestId('discover-composition')
    const rows = composition.locator('tbody tr')
    const select = async (value: string) => {
      await review
        .getByRole('combobox', { name: 'Discover preview state' })
        .click()
      await page.getByRole('option', { name: value, exact: true }).click()
    }
    const capture = async (name: string) => {
      await composition.evaluate((el) => {
        el.style.scrollMarginTop = '120px'
        el.scrollIntoView({ block: 'start' })
      })
      await page.evaluate(() => document.fonts.ready)
      await info.attach(name, {
        body: await page.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      })
    }
    const noOverflow = async () => {
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(width)
      const clipped = await composition.evaluate((root) =>
        [
          ...root.querySelectorAll(
            'td,th,[data-slot="entity-identity-name"],.overflow-x-auto'
          ),
        ]
          .filter(
            (el) =>
              el.getClientRects().length && el.scrollWidth > el.clientWidth + 1
          )
          .map((el) => ({
            text: el.textContent,
            width: el.clientWidth,
            scroll: el.scrollWidth,
          }))
      )
      expect(clipped).toEqual([])
    }
    await expect(rows).toHaveCount(5)
    await expect(rows.first()).toContainText('CoinMarketCap 20 Index DTF')
    await noOverflow()
    await capture('default')
    if (width < 1152) {
      await composition.getByTestId('table-sort-menu').click()
      await page.getByTestId('table-sort-field-change').click()
      await expect(page.getByTestId('table-sort-options')).toHaveCount(0)
      const trigger = await composition
        .getByTestId('table-sort-menu')
        .boundingBox()
      expect(trigger!.width).toBeLessThanOrEqual(
        (await composition.boundingBox())!.width - 48
      )
      await noOverflow()
    }
    const basket = rows
      .filter({ hasText: 'Reserve AI Infrastructure DTF' })
      .getByRole('button', {
        name: 'Basket',
        exact: true,
      })
      .filter({ visible: true })
    await basket.click()
    const popup = page.getByRole('dialog', { name: 'Collateral:' })
    await expect(popup).toBeVisible()
    const list = popup.getByRole('list', { name: 'Collateral:' })
    await expect(list.getByRole('listitem')).toHaveCount(25)
    await expect(list).toBeFocused()
    await page.keyboard.press('End')
    await expect
      .poll(() => list.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0)
    const popupBox = await popup.boundingBox()
    expect(popupBox!.x).toBeGreaterThanOrEqual(0)
    expect(popupBox!.x + popupBox!.width).toBeLessThanOrEqual(width)
    await info.attach('basket-open', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    await page.keyboard.press('Escape')
    await expect(basket).toBeFocused()
    await expect(page).toHaveURL(/#discover-family-review$/)
    if (width === 1400) {
      await composition
        .getByRole('button', { name: 'Name', exact: true })
        .click()
    } else {
      await composition.getByTestId('table-sort-menu').click()
      await page.getByTestId('table-sort-field-name').click()
      await expect(page.getByTestId('table-sort-options')).toHaveCount(0)
      await composition.getByTestId('table-sort-menu').click()
      await expect(page.getByTestId('table-sort-options')).toBeVisible()
      await page.getByTestId('table-sort-direction-asc').click()
    }
    await expect(rows.first()).toContainText('CF Large Cap Index')
    await select('Zero / unavailable')
    const lcap = rows.filter({ hasText: 'CF Large Cap Index' })
    const cmc = rows.filter({ hasText: 'CoinMarketCap 20 Index DTF' })
    await expect(lcap.locator('[data-slot="discover-trend"] svg')).toHaveCount(
      0
    )
    await expect(lcap).toContainText('—')
    await expect(cmc).toContainText('$0.00')
    await expect(cmc).toContainText('0.00%')
    await noOverflow()
    await capture('zero-unavailable')
    await select('Loading')
    await expect(composition.getByRole('link')).toHaveCount(0)
    await expect(
      composition.getByRole('button', { name: 'Basket', exact: true })
    ).toHaveCount(0)
    await capture('loading')
    await select('Including inactive')
    await expect(rows).toHaveCount(6)
    await expect(rows.filter({ hasText: 'BTC ETH DCA Index' })).toContainText(
      'Inactive'
    )
    await select('Long content')
    await expect(rows).toHaveCount(5)
    await noOverflow()
    await capture('long-content')
    if (width === 1400) {
      for (const available of [1151, 1152]) {
        await composition.evaluate((el, available) => {
          el.style.width = `${available}px`
        }, available)
        await noOverflow()
        if (available === 1152)
          await expect(composition.locator('thead')).toBeVisible()
        else await expect(composition.getByRole('table')).toHaveCount(0)
        await capture(`boundary-${available}`)
        if (available === 1151) {
          await composition
            .getByTestId('discover-card')
            .filter({ hasText: 'CF Large Cap Index' })
            .focus()
        } else {
          await expect(
            rows.filter({ hasText: 'CF Large Cap Index' }).getByRole('link')
          ).toBeFocused()
        }
      }
      await composition.evaluate((el) => {
        el.style.width = '1151px'
      })
      await expect(composition.getByTestId('discover-card')).toHaveCount(5)
      await composition.evaluate((el) => {
        el.style.width = ''
      })
      await review
        .getByRole('switch', { name: 'Constrained Discover column' })
        .setChecked(true)
      await noOverflow()
      await capture('constrained')
      await review
        .getByRole('switch', { name: 'Constrained Discover column' })
        .setChecked(false)
    }
    await select('Default')
    const link = rows
      .filter({ hasText: 'CF Large Cap Index' })
      .getByRole('link')
      .filter({ visible: true })
    await link.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(
      /\/base\/index-dtf\/(?:lcap|0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8)\/overview/i
    )
    expect(txLog).toHaveLength(0)
  })
}
