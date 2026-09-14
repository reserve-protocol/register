import {
  test,
  expect,
  currentSelect,
  currentCapture,
  realTarget,
} from './current-rebalance-helpers'
import { advanceTime, freezeTime } from '../helpers/clock'

for (const width of [1400, 900, 390, 320]) {
  test(`saved weights expose the configuration at ${width}`, async ({
    page,
    txLog,
  }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(
      '/internal/design-system/components/table?current=hybrid#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    await expect(current.getByTestId('current-launch')).toBeDisabled()
    await currentCapture(
      page,
      current,
      info,
      `states-${width}-weights-required`
    )
    await current.getByTestId('current-edit').click()
    const input = current.getByTestId('current-units-1')
    await realTarget(input)
    await input.fill('0.0375')
    await currentCapture(
      page,
      current.getByTestId('current-weight-editor'),
      info,
      `states-${width}-weights-editor`
    )
    await current.getByTestId('current-weights-save').click()
    const saved = current.getByTestId('current-saved-weight-1')
    await expect(saved).toContainText('HYPE')
    await expect(saved).toContainText('0.0375')
    await expect(saved).toContainText('3.92%')
    await expect(current.getByTestId(/^current-saved-weight-\d+$/)).toHaveCount(
      8
    )
    await expect(current.getByTestId('current-launch')).toBeEnabled()
    const symbol = current
      .getByTestId('current-saved-weight-0')
      .getByText('uDOGE', { exact: true })
    expect((await symbol.boundingBox())!.height).toBeLessThanOrEqual(24)
    await expect(saved.getByRole('cell').nth(1)).toHaveCSS('font-size', '16px')
    for (const row of await current
      .getByRole('table', { name: 'Weights saved' })
      .getByRole('row')
      .all())
      await expect(row).toHaveCSS('border-bottom-width', '0px')
    await currentCapture(page, current, info, `states-${width}-weights-saved`)
    await current.getByTestId('current-edit').click()
    await input.fill('0.08')
    await current.getByTestId('current-weights-discard').click()
    await expect(saved).toContainText('0.0375')
    await expect(saved).not.toContainText('0.08')
    await currentSelect(page, 'data', 'price-error')
    await expect(saved.getByRole('cell').nth(1)).toHaveText('0.0375')
    await expect(saved.getByRole('cell').nth(2)).toHaveText('—')
    await expect(current.getByTestId('current-edit')).toBeDisabled()
    await expect(current.getByTestId('current-launch')).toBeDisabled()
    await currentCapture(
      page,
      current,
      info,
      `states-${width}-saved-price-error`
    )
    await currentSelect(page, 'data', 'pending')
    await expect(saved).not.toContainText('3.92%')
    await expect(saved.getByRole('cell').nth(1)).toHaveText('0.0375')
    const allocation = saved.getByRole('cell').nth(2)
    const loading = allocation.getByTestId('v1-skeleton')
    expect((await loading.boundingBox())!.x).toBeGreaterThanOrEqual(
      (await allocation.boundingBox())!.x + 7
    )
    const placeholder = (await loading.boundingBox())!
    const cell = (await allocation.boundingBox())!
    expect(placeholder.x + placeholder.width).toBeLessThanOrEqual(
      cell.x + cell.width
    )
    await currentCapture(
      page,
      current,
      info,
      `states-${width}-saved-prices-pending`
    )
    await currentSelect(page, 'data', 'price-error')
    await current.getByTestId('current-data-retry').click()
    await expect(saved.getByRole('cell').nth(2)).toHaveText('3.92%')
    await expect(current.getByTestId('current-launch')).toBeEnabled()
    expect(
      await current.evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
    expect(txLog).toHaveLength(0)
  })

  test(`live exchanges and selected markers stay connected at ${width}`, async ({
    page,
    txLog,
  }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(
      '/internal/design-system/components/table?current=live#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    const bid = current.getByTestId('current-bid-1')
    await expect(bid).toContainText('500 ETH')
    await expect(bid).toContainText('11 BTCB')
    await expect(
      current.getByText('Bidding is ongoing...', { exact: true })
    ).toHaveCount(0)
    await bid.click()
    await expect(bid).toHaveAttribute('aria-expanded', 'true')
    await expect(current.getByTestId('current-chart-selected-bid')).toHaveText(
      'Bid #1'
    )
    await expect(current.getByTestId('current-bid-detail')).toContainText(
      '11 BTCB'
    )
    await currentCapture(
      page,
      current.getByTestId('current-auction'),
      info,
      `states-${width}-live`
    )
    await currentSelect(page, 'scene', 'no-bids')
    await expect(current.getByTestId('current-empty-bids')).toBeVisible()
    await expect(current.getByTestId('current-bid-1')).toHaveCount(0)
    await currentCapture(
      page,
      current.getByTestId('current-auction'),
      info,
      `states-${width}-no-bids`
    )
    expect(
      await current.evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
    expect(txLog).toHaveLength(0)
  })
}

test('initial context stays compact and outcome groups retain every metric', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto(
    '/internal/design-system/components/table?current=ready#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  await expect(current.getByTestId('current-progress')).toHaveAttribute(
    'data-initial',
    'true'
  )
  await expect(current.getByTestId('current-progress')).toContainText(
    'Current basket deviation'
  )
  await currentCapture(page, current, info, 'states-initial')
  await currentSelect(page, 'scene', 'repeat')
  await expect(current.getByTestId('current-progress')).not.toHaveAttribute(
    'data-initial',
    'true'
  )
  await expect(current.getByTestId('current-progress')).toContainText('62.8%')
  await currentSelect(page, 'scene', 'complete')
  await expect(current.getByTestId('current-outcome-primary')).toContainText(
    'Rebalance accuracy'
  )
  await expect(current.getByTestId('current-outcome-financial')).toContainText(
    'NAV Change'
  )
  for (const label of [
    'Execution progress',
    'Current basket deviation',
    'Auctions completed',
    'Total traded so far',
    'Total price impact',
  ])
    await expect(current.getByText(label, { exact: true })).toHaveCount(1)
  await expect(current.getByRole('progressbar')).toHaveCount(0)
  await currentCapture(page, current, info, 'states-complete')
  await currentSelect(page, 'scene', 'expired')
  await currentCapture(page, current, info, 'states-expired')
})

for (const width of [1400, 320]) {
  test(`risk consequences and launch steps stay with the action at ${width}`, async ({
    page,
    txLog,
  }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await freezeTime(page, Date.parse('2026-08-01T00:00:00Z') / 1000)
    await page.goto(
      '/internal/design-system/components/table?current=liquidity#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    const operation = current.getByTestId('current-operation')
    await expect(
      operation.getByText('Ondo limits', { exact: true })
    ).toBeVisible()
    await expect(operation.getByTestId('current-effective-size')).toContainText(
      '2%'
    )
    await expect(current.getByTestId('current-messages')).toContainText(
      'High price impact'
    )
    await currentCapture(
      page,
      current.getByTestId('current-auction'),
      info,
      `states-${width}-risk`
    )
    await currentSelect(page, 'scene', 'remove')
    if (width === 1400) {
      const groups = await current
        .getByTestId('current-assets')
        .locator(':scope > div')
        .all()
      expect((await groups[1].boundingBox())!.width).toBeGreaterThan(
        (await groups[0].boundingBox())!.width * 2
      )
    }
    await currentCapture(page, current, info, `states-${width}-removal`)
    await currentSelect(page, 'scene', 'ready')
    await currentSelect(page, 'outcome', 'indexing')
    await current.getByTestId('current-launch').click()
    for (const step of ['wallet', 'pending', 'indexing']) {
      await expect(current).toHaveAttribute('data-operation', step)
      const status = operation.getByTestId('current-operation-status')
      const launch = operation.getByTestId('current-launch')
      await expect(launch).toBeDisabled()
      const message = await status.boundingBox()
      expect(message!.y + message!.height).toBeLessThanOrEqual(
        (await launch.boundingBox())!.y
      )
      await currentCapture(page, operation, info, `states-${width}-${step}`)
      if (step !== 'indexing') await advanceTime(page, 1200)
    }
    await expect(operation.getByTestId('current-index-refresh')).toBeEnabled()
    expect(
      await current.evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
    expect(txLog).toHaveLength(0)
  })
}
