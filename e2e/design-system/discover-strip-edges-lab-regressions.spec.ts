import { test, expect } from '../fixtures/base'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

for (const [theme, width] of [
  ['light', 1400],
  ['dark', 1400],
] as const) {
  test(`discover strip edges ${theme} ${width}`, async ({
    page,
    txLog,
  }, info) => {
    const before = readReviewSource(process.cwd())
    const guard = watchReviewSource(process.cwd())
    try {
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(
        '/internal/design-system/components/table#discover-family-review'
      )
      await page.evaluate(() => document.fonts.ready)
      const trigger = page
        .getByTestId('discover-composition')
        .locator('tbody tr')
        .first()
        .getByRole('button', { name: 'Basket', exact: true })
        .filter({ visible: true })
      await trigger.click()
      const popup = page.getByRole('dialog', { name: 'Collateral:' })
      const strip = popup.getByRole('list', { name: 'Collateral:' })
      const left = popup.locator('[data-slot="asset-strip-fade-left"]')
      const right = popup.locator('[data-slot="asset-strip-fade-right"]')
      await expect(strip).toBeFocused()
      await expect(left).toHaveCSS('opacity', '0')
      await expect(right).toHaveCSS('opacity', '1')
      await expect(right).toHaveCSS('width', '12px')
      await expect(right).toHaveCSS('pointer-events', 'none')
      await info.attach('manual-start', {
        body: await page.screenshot(),
        contentType: 'image/png',
      })
      await page.keyboard.press('End')
      await expect(left).toHaveCSS('opacity', '1')
      await expect(right).toHaveCSS('opacity', '0')
      await info.attach('manual-end', {
        body: await page.screenshot(),
        contentType: 'image/png',
      })
      await page.keyboard.press('Home')
      await expect(left).toHaveCSS('opacity', '0')
      await expect(right).toHaveCSS('opacity', '1')
      await page.keyboard.press('Escape')
      await page
        .getByRole('combobox', { name: 'Discover preview state' })
        .click()
      await page
        .getByRole('option', { name: 'Short basket', exact: true })
        .click()
      await trigger.hover()
      await expect(popup).toBeVisible()
      await expect(strip.locator('ul')).toHaveCount(1)
      await expect(left).toHaveCSS('opacity', '0')
      await expect(right).toHaveCSS('opacity', '0')
      const positions = await strip.evaluate(async (element) => {
        const start = performance.now()
        const samples: number[] = []
        await new Promise<void>((resolve) => {
          const tick = () => {
            samples.push(element.scrollLeft)
            if (performance.now() - start >= 1400) resolve()
            else requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        })
        return samples
      })
      expect(Math.max(...positions)).toBe(0)
      await info.attach('short-basket', {
        body: await page.screenshot(),
        contentType: 'image/png',
      })
      await popup.evaluate((el) => {
        el.style.width = '140px'
      })
      await expect
        .poll(() => strip.evaluate((el) => el.scrollLeft))
        .toBeGreaterThan(2)
      await expect(right).toHaveCSS('opacity', '1')
      await popup.evaluate((el) => {
        el.style.width = ''
      })
      await expect(strip.locator('ul')).toHaveCount(1)
      await expect.poll(() => strip.evaluate((el) => el.scrollLeft)).toBe(0)
      await expect(left).toHaveCSS('opacity', '0')
      await expect(right).toHaveCSS('opacity', '0')
      await page.keyboard.press('Escape')
      expect(txLog).toHaveLength(0)
    } finally {
      guard.close()
      assertUnchangedSource(before, readReviewSource(process.cwd()), [
        ...guard.changes,
      ])
      await info.attach('public-source-digest', {
        body: Buffer.from(before.digest),
        contentType: 'text/plain',
      })
    }
  })
}
