import { test, expect } from '../fixtures/base'
import {
  readReviewSource,
  assertUnchangedSource,
  watchReviewSource,
} from './review-source'

for (const width of [390, 1400])
  test(`Earn loading geometry and disclosure recovery ${width}`, async ({
    page,
    txLog,
  }, info) => {
    const source = readReviewSource(process.cwd())
    const guard = watchReviewSource(process.cwd())
    try {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(
        '/internal/design-system/components/table#earn-family-review'
      )
      const review = page.getByTestId('earn-review')
      const composition = page.getByTestId('earn-composition')
      const choose = async (option: string) => {
        await review
          .getByRole('combobox', { name: 'Earn preview state' })
          .click()
        await page.getByRole('option', { name: option, exact: true }).click()
      }
      await review
        .getByRole('switch', { name: 'Wallet position', exact: true })
        .click()
      await page.evaluate(() => document.fonts.ready)
      const row = composition.locator('tbody tr').first()
      const before = (await row.boundingBox())!
      await choose('Loading opportunities')
      const loading = (await row.boundingBox())!
      expect(Math.abs(loading.height - before.height)).toBeLessThanOrEqual(1)
      if (width < 1024) {
        const position = row.locator('[data-slot="earn-wallet-position"]')
        await expect(position).toHaveCSS('height', '20px')
        const label = (await position
          .locator('[data-slot="earn-wallet-label"]')
          .boundingBox())!
        const placeholder = (await position
          .getByTestId('v1-skeleton')
          .first()
          .boundingBox())!
        expect(placeholder.x - label.x - label.width).toBeCloseTo(8, 0)
      } else {
        const pair = row.locator('[data-slot="earn-pair"]:visible').nth(1)
        const alignment = await pair.evaluate((element) => {
          const block = element.firstElementChild!.getBoundingClientRect()
          return Math.abs(element.getBoundingClientRect().right - block.right)
        })
        expect(alignment).toBeLessThanOrEqual(1)
      }
      await composition.scrollIntoViewIfNeeded()
      await info.attach('loading-aligned', {
        body: await page.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      })
      await choose('Default')
      const trigger = composition
        .getByTestId('earn-governs-shared-rsr')
        .filter({ visible: true })
      await trigger.focus()
      await page.keyboard.press('Enter')
      await expect(page.getByTestId('earn-governed-assets')).toBeVisible()
      await page.setViewportSize({ width: width - 1, height: 900 })
      await expect(page.getByTestId('earn-governed-assets')).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(trigger).toBeFocused()
      expect(txLog).toHaveLength(0)
      await info.attach('recovered', {
        body: await page.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      })
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
