import { test, expect } from '../fixtures/base'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

for (const theme of ['light', 'dark']) {
  test(`table hardening ${theme}`, async ({ page, txLog }, info) => {
    const source = readReviewSource(process.cwd())
    const guard = watchReviewSource(process.cwd())
    try {
      await page.setViewportSize({ width: 1400, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(
        '/internal/design-system/components/table#table-family-review'
      )
      const positions = page.getByTestId('table-family-positions')
      const compositions = page.getByTestId('table-family-compositions')
      const menu = positions.getByTestId('table-sort-menu')
      const resize = async (width: number) =>
        compositions.evaluate((el, width) => {
          el.style.width = `${width}px`
        }, width)
      const cost = positions.getByTestId('sort-cost')
      await cost.focus()
      await cost.evaluate((el) => el.blur())
      await resize(576)
      await expect(menu).toBeVisible()
      await expect(page.locator('body')).toBeFocused()
      await resize(1100)
      await cost.focus()
      await page.keyboard.press('Enter')
      await expect(cost).toHaveAccessibleDescription('ascending')
      await resize(576)
      await expect(menu).toBeFocused()
      await expect(menu).toHaveText('Sort by: Avg Cost')
      await expect(
        positions.locator('[data-slot="supporting-fact-cost"]:visible')
      ).toHaveCount(5)
      await expect(
        positions.locator('[data-slot="supporting-fact-cap"]:visible')
      ).toHaveCount(0)
      await page.keyboard.press('Enter')
      await expect(page.getByTestId('table-sort-options')).toBeVisible()
      await resize(1100)
      await expect(page.getByTestId('table-sort-options')).toBeHidden()
      await expect(cost).toBeFocused()

      const identityKey = await positions
        .locator('tbody a:visible')
        .first()
        .getAttribute('data-table-focus')
      const identity = positions.locator(
        `[data-table-focus="${identityKey}"]:visible`
      )
      await identity.focus()
      await resize(576)
      await expect(identity).toBeFocused()
      await resize(1100)
      await expect(identity).toBeFocused()

      for (const key of ['withdraw-staked-ready', 'source-lock-ready']) {
        const action = page.locator(`[data-table-focus="${key}"]:visible`)
        await action.focus()
        await resize(576)
        await expect(action).toBeFocused()
        await resize(1100)
        await expect(action).toBeFocused()
      }
      await page.getByTestId('withdraw-staked-ready').focus()
      await page.keyboard.press('Enter')
      await expect(page.getByTestId('withdrawal-staked-ready')).toBeFocused()
      await resize(576)
      await expect(
        page.getByTestId('withdrawal-staked-ready-mobile')
      ).toBeFocused()

      const preview = page.getByTestId('table-preview-state')
      await preview.focus()
      await resize(1100)
      await expect(preview).toBeFocused()
      await preview.click()
      await page.getByTestId('table-state-loading').click()
      await resize(576)
      await menu.click()
      await page.getByTestId('table-sort-field-cap').click()
      await expect(page.getByTestId('table-sort-options')).toBeHidden()
      await expect(menu).toBeFocused()
      await page.keyboard.press('Enter')
      await page.getByTestId('table-sort-direction-desc').click()
      await expect(positions).toHaveAttribute('aria-busy', 'true')
      await expect(
        positions.locator('[data-slot="supporting-fact-cap"]:visible')
      ).toHaveCount(5)
      await preview.click()
      await page.getByTestId('table-state-default').click()
      await expect(menu).toHaveText('Sort by: Market Cap')
      await expect(menu).toHaveAccessibleDescription('descending')
      await expect(positions.locator('tbody tr').first()).toContainText(
        'Open Stablecoin Index'
      )
      await compositions.evaluate((el) => {
        el.style.width = ''
      })
      await page.setViewportSize({ width: 375, height: 900 })
      await positions.evaluate((el) => {
        el.style.scrollMarginTop = '160px'
        el.scrollIntoView({ block: 'start' })
      })
      await info.attach('narrow-sorted-metric', {
        body: await page.screenshot({
          path: `/private/tmp/table-hardening-${theme}-sorted-metric.png`,
          animations: 'disabled',
        }),
        contentType: 'image/png',
      })
      await expect(
        positions.locator('[data-slot="supporting-fact-cap"]:visible')
      ).toHaveCount(5)
      await menu.click()
      await page.getByTestId('table-sort-field-value').click()
      await expect(
        positions.locator('[data-slot^="supporting-fact-"]:visible')
      ).toHaveCount(0)
      await resize(1100)
      await page.setViewportSize({ width: 1400, height: 900 })
      await expect(
        positions.getByTestId('sort-value')
      ).toHaveAccessibleDescription('descending')
      expect(txLog).toHaveLength(0)
    } finally {
      guard.close()
      assertUnchangedSource(source, readReviewSource(process.cwd()), [
        ...guard.changes,
      ])
      await info.attach('public-source-digest', {
        body: Buffer.from(source.digest),
        contentType: 'text/plain',
      })
    }
  })
}
