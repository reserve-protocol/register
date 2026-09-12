import { test, expect } from '../fixtures/base'
import { seedYieldEarn } from './earn-yield-source-data'
import { readReviewSource, assertUnchangedSource } from './review-source'
import { setYieldReplay } from '../helpers/rpc'

test.use({ actionTimeout: 10_000, navigationTimeout: 20_000 })

for (const theme of ['light', 'dark']) {
  for (const width of [390, 1400]) {
    test(`Earn Yield list ${theme} ${width}`, async ({
      page,
      overrides,
      txLog,
    }, info) => {
      const source = readReviewSource(process.cwd())
      const symbols = seedYieldEarn(overrides)
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto('/earn/yield-dtf')
      const surface = page.getByTestId('earn-yield-dtf')
      const rows = surface.locator('tbody tr')
      await expect(rows).toHaveCount(2)
      for (const symbol of symbols)
        await expect(rows.filter({ hasText: symbol })).toHaveCount(1)
      await expect(rows.filter({ hasText: 'hyusdRSR' })).toHaveCount(0)
      await expect(surface).not.toContainText('NaN')
      await surface.locator('table').scrollIntoViewIfNeeded()
      await page.evaluate(() => document.fonts.ready)
      await info.attach('yield-default', {
        body: await page.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      })
      expect(txLog).toHaveLength(0)
      assertUnchangedSource(source, readReviewSource(process.cwd()))
      await info.attach('public-source-digest', {
        body: Buffer.from(source.digest),
        contentType: 'text/plain',
      })
    })
  }
}

for (const width of [390, 1400]) {
  test(`Earn Yield drawer ${width}`, async ({
    page,
    overrides,
    txLog,
  }, info) => {
    const source = readReviewSource(process.cwd())
    seedYieldEarn(overrides, 1)
    setYieldReplay(1)
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/earn/yield-dtf')
    const row = page.getByTestId('earn-yield-dtf').locator('tbody tr')
    await expect(row).toHaveCount(1)
    await expect(row).toContainText('eusdRSR')
    await row.locator('td').first().click()
    const drawer = page.getByRole('dialog')
    await expect(drawer).toBeVisible()
    await expect(drawer.getByRole('tab')).toHaveCount(2)
    await info.attach('yield-drawer', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
    expect(txLog).toHaveLength(0)
    assertUnchangedSource(source, readReviewSource(process.cwd()))
    await info.attach('public-source-digest', {
      body: Buffer.from(source.digest),
      contentType: 'text/plain',
    })
  })
}
