import { test, expect } from '../fixtures/base'
import { readFileSync } from 'node:fs'
import type { DefiLlamaPool } from '../../src/types/defillama'
import { readReviewSource, assertUnchangedSource } from './review-source'

const pools: DefiLlamaPool[] = JSON.parse(
  readFileSync(
    'src/views/internal/design-system/table-family/defi-snapshot.json',
    'utf8'
  )
)
test.use({ defiPools: [pools, { scope: 'test' }] })
for (const width of [390, 1400]) {
  test(`DeFi source table ${width}`, async ({ page, txLog }, info) => {
    const source = readReviewSource(process.cwd())
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(() => {
      window.open = (url) => {
        document.documentElement.dataset.externalDestination = String(url)
        return null
      }
    })
    await page.goto('/earn/defi')
    const table = page.getByTestId('earn-defi').locator('table')
    const rows = table.locator('tbody tr')
    await expect(rows).toHaveCount(5)
    await expect(rows.first()).toContainText('Beefy')
    await expect(rows.first()).toContainText('12.5%')
    await table.scrollIntoViewIfNeeded()
    await page.evaluate(() => document.fonts.ready)
    await info.attach('source-default', {
      body: await page.screenshot(),
      contentType: 'image/png',
    })
    await table.locator('thead th').last().click()
    await expect(rows.first()).toContainText('Uniswap')
    await rows
      .first()
      .locator('td')
      .first()
      .getByText('RSR-WETH', { exact: true })
      .click()
    await expect(page.locator('html')).toHaveAttribute(
      'data-external-destination',
      'https://app.uniswap.org/explore/pools/ethereum/0x32d9259e6792b2150fd50395d971864647fa27b2'
    )
    expect(txLog).toHaveLength(0)
    assertUnchangedSource(source, readReviewSource(process.cwd()))
    await info.attach('public-source-digest', {
      body: Buffer.from(source.digest),
      contentType: 'text/plain',
    })
  })
}
