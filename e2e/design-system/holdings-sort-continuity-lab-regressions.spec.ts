import { test, expect } from '../fixtures/base'
import { assertUnchangedSource, readReviewSource } from './review-source'

for (const theme of ['light', 'dark']) {
  test(`Holdings explicit direction survives field and width changes ${theme}`, async ({
    page,
    txLog,
  }, info) => {
    const source = readReviewSource(process.cwd())
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto(
      '/internal/design-system/components/table#holdings-family-review'
    )
    const composition = page.getByTestId('holdings-composition')
    const menu = composition.getByTestId('table-sort-menu')
    const names = composition.locator(
      'tbody tr [data-slot="entity-identity-name"]:visible'
    )
    await composition.evaluate((el) => {
      el.style.width = '390px'
    })
    await expect(names).toHaveCount(10)
    await menu.click()
    await expect(page.getByTestId('table-sort-options')).toBeVisible()
    await page.getByTestId('table-sort-direction-asc').click()
    await expect(page.getByTestId('table-sort-options')).toHaveCount(0)
    await expect(menu).toHaveAttribute('aria-description', 'ascending')
    expect((await names.allTextContents()).slice(0, 3)).toEqual([
      'Avalanche',
      'Shiba Inu',
      'Sui',
    ])
    await menu.click()
    await expect(page.getByTestId('table-sort-options')).toBeVisible()
    await page.getByTestId('table-sort-field-change').click()
    await expect(page.getByTestId('table-sort-options')).toHaveCount(0)
    await expect(menu).toHaveAccessibleName('Sort by: Price Change (7d)')
    await expect(menu).toHaveAttribute('aria-description', 'ascending')
    expect((await names.allTextContents()).slice(0, 3)).toEqual([
      'TRON',
      'Litecoin',
      'BNB',
    ])
    await expect(menu).toBeFocused()
    for (const width of [767, 768]) {
      await composition.evaluate((el, size) => {
        el.style.width = `${size}px`
      }, width)
      await expect(names).toHaveCount(width < 768 ? 10 : 18)
      expect((await names.allTextContents()).slice(0, 3)).toEqual([
        'TRON',
        'Litecoin',
        'BNB',
      ])
    }
    const change = composition.getByTestId('sort-change')
    await expect(change.locator('..')).toHaveAttribute('aria-sort', 'ascending')
    await expect(change).toBeFocused()
    await expect(menu).toBeHidden()
    await composition.evaluate((el) => {
      el.style.scrollMarginTop = '140px'
      el.scrollIntoView({ block: 'start' })
    })
    await info.attach('ascending-mobile-to-desktop', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    await composition.getByTestId('sort-weight').click()
    expect((await names.allTextContents()).slice(0, 3)).toEqual([
      'Bitcoin',
      'Ethereum',
      'BNB',
    ])
    await composition.evaluate((el) => {
      el.style.width = '390px'
    })
    await expect(menu).toHaveAccessibleName('Sort by: Weight')
    await expect(menu).toHaveAttribute('aria-description', 'descending')
    await expect(menu).toBeFocused()
    expect((await names.allTextContents()).slice(0, 3)).toEqual([
      'Bitcoin',
      'Ethereum',
      'BNB',
    ])
    expect(txLog).toHaveLength(0)
    assertUnchangedSource(source, readReviewSource(process.cwd()))
    await info.attach('public-source-digest', {
      body: Buffer.from(source.digest),
      contentType: 'text/plain',
    })
  })
}
