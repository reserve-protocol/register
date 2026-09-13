import {
  test,
  expect,
  currentSelect,
  currentCapture,
} from './current-rebalance-helpers'

for (const width of [1400, 900, 390, 320]) {
  test(`auction owns its plan and action at ${width}`, async ({
    page,
    txLog,
  }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(
      '/internal/design-system/components/table?current=repeat#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    const auction = current.getByTestId('current-auction')
    await expect(auction.getByTestId('current-auction-heading')).toHaveText(
      'Auction 2'
    )
    await expect(auction.getByTestId('current-assets')).toBeVisible()
    await expect(auction.getByTestId('current-launch')).toHaveText(
      'Start auction 2'
    )
    await expect(auction.getByTestId('current-progress')).toHaveCount(0)
    await expect(current.getByTestId('current-progress')).toContainText('62.8%')
    await expect(current.getByTestId('current-progress')).toContainText(
      'Auctions completed'
    )
    await expect(current.getByTestId('current-progress')).not.toContainText(
      'Next auction target'
    )
    const geometry = await current.evaluate((el) => {
      const bounds = (id: string) =>
        el.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect()
      const auction = bounds('current-auction')
      const assets = bounds('current-assets')
      const operation = bounds('current-operation')
      const progress = bounds('current-progress')
      return {
        auctionBottom: auction.bottom,
        progressTop: progress.top,
        assetsTop: assets.top,
        assetsBottom: assets.bottom,
        operationTop: operation.top,
        assetsWidth: assets.width,
        operationWidth: operation.width,
        operationFill: getComputedStyle(
          el.querySelector('[data-testid="current-operation"]')!
        ).backgroundColor,
        overflow: el.scrollWidth - el.clientWidth,
      }
    })
    expect(geometry.progressTop).toBeGreaterThanOrEqual(geometry.auctionBottom)
    expect(geometry.operationFill).toBe('rgba(0, 0, 0, 0)')
    expect(geometry.overflow).toBeLessThanOrEqual(1)
    if (width >= 880) {
      expect(
        Math.abs(geometry.assetsTop - geometry.operationTop)
      ).toBeLessThanOrEqual(1)
      expect(
        geometry.assetsWidth / geometry.operationWidth
      ).toBeLessThanOrEqual(1.7)
    } else
      expect(geometry.operationTop).toBeGreaterThanOrEqual(
        geometry.assetsBottom
      )
    await currentCapture(page, current, info, `hierarchy-${width}-repeat`)
    await current.getByTestId('current-inspect').click()
    const references = page.getByTestId('current-rebalance-information')
    await expect(references).toContainText('Rebalance nonce')
    await expect(references).not.toContainText('Duration')
    await expect(references).not.toContainText('Expected Price Volatility')
    await page.keyboard.press('Escape')
    await currentSelect(page, 'scene', 'live')
    await expect(auction.getByTestId('current-activity')).toBeVisible()
    await expect(auction.getByTestId('current-bid-1')).toBeVisible()
    await expect(auction.getByTestId('current-end-time')).toBeVisible()
    await expect(auction.getByTestId('current-launch')).toHaveCount(0)
    expect(txLog).toHaveLength(0)
  })

  test(`liquidity is a full-width asset table at ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(
      '/internal/design-system/components/table?current=liquidity#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    await expect(current.getByTestId('current-messages')).toBeVisible()
    await current.getByTestId('current-liquidity-toggle').click()
    const tables = current.getByTestId('current-liquidity-table')
    await expect(tables).toHaveCount(2)
    await expect(tables.first().locator('thead th')).toHaveCount(4)
    await expect(tables.first().locator('tbody tr')).toHaveCount(9)
    const logo = tables
      .first()
      .locator('tbody tr')
      .first()
      .locator('img')
      .first()
    await expect(logo).toHaveCSS('width', '32px')
    await expect(logo).toHaveCSS('height', '32px')
    const name = tables
      .first()
      .locator('tbody tr')
      .first()
      .locator('[data-slot="entity-identity-name"]')
    expect(
      await name.evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
    await expect(current.getByTestId('current-leg-retry')).toHaveCount(1)
    const widths = await current.evaluate((el) => {
      const body = el
        .querySelector('[data-testid="current-working-grid"]')!
        .getBoundingClientRect()
      const table = el
        .querySelector('[data-testid="current-liquidity-table"]')!
        .getBoundingClientRect()
      return {
        body: body.width,
        table: table.width,
        x: table.x - body.x,
        overflow: el.scrollWidth - el.clientWidth,
      }
    })
    expect(Math.abs(widths.body - widths.table)).toBeLessThanOrEqual(2)
    expect(Math.abs(widths.x)).toBeLessThanOrEqual(1)
    expect(widths.overflow).toBeLessThanOrEqual(1)
    await currentCapture(
      page,
      tables.first(),
      info,
      `hierarchy-${width}-liquidity`
    )
    if (width === 320) {
      const detail = current.getByTestId('current-liquidity-ETH')
      await detail.focus()
      await page.setViewportSize({ width: 1400, height: 900 })
      await expect(detail).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(page.getByRole('dialog')).toContainText('Zapper timeout')
      await page.keyboard.press('Escape')
      await expect(detail).toBeFocused()
    }
  })
}

test('completion keeps one auction count and natural metric spacing', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto(
    '/internal/design-system/components/table?current=complete#auctions-browse-review'
  )
  const result = page.getByTestId('current-result')
  await expect(result.getByTestId('current-completed-auctions')).toHaveText('3')
  await expect
    .soft(result.getByTestId('current-result-auctions'))
    .toHaveCount(0)
  const gap = await result.evaluate((el) => {
    const metric = el.querySelector(':scope > dl > div')!
    const label = metric.querySelector('dt > span')!.getBoundingClientRect()
    return (
      metric.querySelector('dd')!.getBoundingClientRect().top - label.bottom
    )
  })
  expect(gap).toBeLessThanOrEqual(8)
  await currentCapture(page, result, info, 'hierarchy-complete')
})

test('expiry during indexing retains auction identity and a single recovery owner', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=ready#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  await currentSelect(page, 'outcome', 'indexing')
  await current.getByTestId('current-launch').click()
  await expect(current).toHaveAttribute('data-operation', 'indexing')
  await current.getByText('Lab simulation controls', { exact: true }).click()
  await current.getByTestId('current-expire').click()
  await currentSelect(page, 'data', 'error')
  await expect.soft(current.getByTestId('current-messages')).toHaveCount(1)
  await expect.soft(current.getByTestId('current-data-retry')).toHaveCount(1)
  await expect(
    current
      .getByTestId('current-operation')
      .getByRole('heading', { name: 'Auction 1', exact: true })
  ).toBeVisible()
  await expect(current.getByTestId('current-launch')).toBeDisabled()
  await current.getByTestId('current-data-retry').click()
  await expect(current.getByTestId('current-messages')).toHaveCount(0)
  await expect(current.getByTestId('current-launch')).toBeDisabled()
})
