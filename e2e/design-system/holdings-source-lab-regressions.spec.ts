import { test, expect } from '../fixtures/base'
import { REGISTRY, dtfPath } from '../helpers/registry'
import { readReviewSource, assertUnchangedSource } from './review-source'

for (const [slug, width] of [
  ['cmc20', 1400],
  ['cmc20', 375],
  ['photon', 1400],
] as const) {
  test(`holdings source ${slug} ${width}`, async ({ page, txLog }, info) => {
    const source = readReviewSource(process.cwd())
    const dtf = REGISTRY.find((dtf) => dtf.slug === slug)!
    await page.setViewportSize({ width, height: 900 })
    await page.route(
      'https://storage-logos.reserve.org/logos/nasdaq--big.svg',
      (route) => route.fulfill({ status: 404, body: '' })
    )
    await page.goto(dtfPath(dtf, 'overview'))
    const basket = page.getByTestId('overview-basket')
    const tabs = basket.locator('[role=tab]:visible')
    const rows = basket.getByTestId('overview-basket-row')
    await expect(tabs).toHaveCount(2)
    const count = slug === 'photon' ? 9 : 18
    await expect(rows).toHaveCount(width < 640 ? 10 : count)
    if (width >= 640) {
      const initial = (await rows.first().textContent())!
      await basket.locator('thead button').filter({ hasText: 'Weight' }).click()
      await expect(rows.first()).not.toHaveText(initial)
      await basket
        .locator('thead button')
        .filter({ hasText: 'Price Change' })
        .click()
      await tabs.nth(1).click()
      await tabs.first().click()
      await expect(rows.first()).toHaveText(initial)
      if (slug === 'photon')
        await expect(rows.first()).toContainText(/NASDAQ:|NYSE:/)
    } else {
      const mobileRows = basket.locator('.sm\\:hidden > .border-b')
      await expect(mobileRows).toHaveCount(10)
      const names = () => mobileRows.locator('.break-words').allTextContents()
      const firstTen = await names()
      expect(firstTen).toHaveLength(10)
      await basket
        .getByRole('button', { name: 'View all 18 assets', exact: true })
        .click()
      await expect(mobileRows).toHaveCount(18)
      expect((await names()).slice(0, 10)).toEqual(firstTen)
      await tabs.nth(1).click()
      await tabs.first().click()
      await expect(mobileRows).toHaveCount(10)
    }
    await basket.scrollIntoViewIfNeeded()
    await info.attach('exposure', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    await tabs.nth(1).click()
    const bridge = basket
      .getByRole('button', { name: 'Bridged', exact: true })
      .filter({ visible: true })
      .first()
    await bridge.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Native asset (reference)')
    await info.attach('bridge', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await info.attach('bridge-focus-return', {
      body: Buffer.from(
        JSON.stringify({
          returned: await bridge.evaluate(
            (el) => el === document.activeElement
          ),
        })
      ),
      contentType: 'application/json',
    })
    expect(txLog).toHaveLength(0)
    assertUnchangedSource(source, readReviewSource(process.cwd()))
    await info.attach('public-source-digest', {
      body: Buffer.from(source.digest),
      contentType: 'text/plain',
    })
  })
}
