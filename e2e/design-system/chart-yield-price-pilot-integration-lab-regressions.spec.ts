import path from 'node:path'
import { expect, test } from './current-rebalance-helpers'
import { mkdir } from 'node:fs/promises'

const evidence = path.resolve('test-results/design-system/charts/next-families')

test.beforeAll(async () => {
  await mkdir(evidence, { recursive: true })
})

for (const theme of ['light', 'dark']) {
  test(`Price pilot main route context ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto(
      '/internal/design-system/components/chart#yield-price-pilot'
    )
    const pilot = page.getByTestId('yield-price-pilot')
    await expect(pilot).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('data-color-mode', theme)
    await expect(pilot).toHaveAttribute('id', 'yield-price-pilot')
    await page.evaluate(() => document.fonts.ready)
    await page
      .getByTestId('yield-price-context')
      .evaluate((node) => node.scrollIntoView({ block: 'center' }))
    await page.mouse.move(0, 0)
    await page.screenshot({
      path: path.join(evidence, `main-route-${theme}-context.png`),
      animations: 'disabled',
    })
    await expect(pilot.getByTestId('yield-price-ticker')).toHaveText('hyUSD')
    await expect(
      pilot.locator('footer').getByRole('button', { name: 'Download CSV' })
    ).toHaveCount(1)
    await expect(pilot.locator('.latest-point-marker circle')).toHaveCount(1)
    await expect(pilot.locator('output')).toContainText('USD per hyUSD')
    await expect(page.getByTestId('yield-price-context')).toContainText(
      'Touch value inspection is unsupported'
    )
    await expect(pilot.locator('footer')).not.toContainText('24H unavailable')
    await expect(page.locator('[data-metric-id="price"]')).toHaveCount(1)
    await expect(page.getByTestId('next-metric-apy')).toBeAttached()
    await expect(page.getByTestId('next-portfolio-history')).toBeAttached()
    await expect(page.getByTestId('next-yield-history')).toContainText(
      'Four chart-only candidates'
    )
  })
}
