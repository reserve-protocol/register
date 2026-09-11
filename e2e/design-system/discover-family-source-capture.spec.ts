import { test, expect } from '../fixtures/base'
import {
  readReviewSource,
  assertUnchangedSource,
  watchReviewSource,
} from './review-source'

for (const width of [390, 1400]) {
  test(`discover source ${width}`, async ({ page, txLog }, info) => {
    const before = readReviewSource(process.cwd())
    const guard = watchReviewSource(process.cwd())
    try {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/discover')
      await page.getByTestId('discover-search').fill('LCAP')
      const source = page.getByTestId('discover-dtf-table')
      const link = source
        .getByRole('link')
        .filter({ hasText: 'CF Large Cap Index' })
        .filter({ visible: true })
        .first()
      await expect(link).toBeVisible()
      await link.scrollIntoViewIfNeeded()
      await page.evaluate(() => document.fonts.ready)
      await info.attach('source-default', {
        body: await page.screenshot(),
        contentType: 'image/png',
      })
      if (width === 1400) {
        const row = source
          .locator('tbody tr')
          .filter({ hasText: 'CF Large Cap Index' })
        await expect(row).toHaveCount(1)
        await row.locator('td').nth(1).hover()
        await expect(
          page.getByText('Collateral:', { exact: true }).first()
        ).toBeVisible()
        await info.attach('source-basket-hover', {
          body: await page.screenshot(),
          contentType: 'image/png',
        })
      }
      await link.click()
      await expect(page).toHaveURL(
        /\/base\/index-dtf\/(?:lcap|0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8)\/overview/i
      )
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
