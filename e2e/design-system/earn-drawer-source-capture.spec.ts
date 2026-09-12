import { test, expect } from '../fixtures/base'
import { sourceLcap } from './earn-source-data'
import { readReviewSource, assertUnchangedSource } from './review-source'

test.use({ actionTimeout: 10_000, navigationTimeout: 20_000 })

for (const width of [390, 1400]) {
  test(`Earn Index drawer ${width}`, async ({
    page,
    overrides,
    txLog,
  }, info) => {
    const source = readReviewSource(process.cwd())
    overrides.api({ pathname: '/dtf/daos' }, [sourceLcap])
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/earn/index-dtf')
    const row = page.getByTestId('earn-index-dtf').locator('tbody tr')
    await expect(row).toHaveCount(1)
    await expect(row).toContainText(sourceLcap.token.symbol)
    await row.locator('td').first().click()
    await expect(page.getByTestId('vote-lock-tab-lock')).toBeVisible()
    await info.attach('index-drawer', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('vote-lock-tab-lock')).toBeHidden()
    expect(txLog).toHaveLength(0)
    assertUnchangedSource(source, readReviewSource(process.cwd()))
    await info.attach('public-source-digest', {
      body: Buffer.from(source.digest),
      contentType: 'text/plain',
    })
  })
}
