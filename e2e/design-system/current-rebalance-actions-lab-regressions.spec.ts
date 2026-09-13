import {
  test,
  expect,
  currentSelect,
  realTarget,
} from './current-rebalance-helpers'

test('launch confirmation waits for auction data, then ends into the next auction', async ({
  page,
  txLog,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=ready#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  await currentSelect(page, 'outcome', 'indexing')
  await realTarget(current.getByTestId('current-launch'))
  await current.getByTestId('current-launch').click()
  await expect(current).toHaveAttribute('data-operation', 'wallet')
  await currentSelect(page, 'outcome', 'success')
  await expect(current).toHaveAttribute('data-operation', 'indexing')
  await expect(current.getByTestId('current-launch')).toBeDisabled()
  await current.getByTestId('current-index-refresh').click()
  await expect(current).toHaveAttribute('data-stage', 'live')
  await expect(current.getByTestId('current-launch')).toHaveCount(0)
  await current.getByText('Lab simulation controls', { exact: true }).click()
  await current.getByTestId('current-end-auction').click()
  await expect(current).toHaveAttribute('data-stage', 'preparing')
  await expect(current.getByTestId('current-launch')).toHaveText(
    'Start auction 2'
  )
  await expect(current.getByTestId('current-progress')).toContainText('0%')
  expect(txLog).toHaveLength(0)
})

test('visitor, launcher, non-launcher, wrong-network and phase crossing have independent gates', async ({
  page,
  txLog,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=ready#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  await currentSelect(page, 'viewer', 'visitor')
  await expect(current.getByTestId('current-connect')).toBeEnabled()
  await expect(
    current.getByText('Only the auction launcher can start auctions')
  ).toBeVisible()
  await current.getByTestId('current-connect').click()
  await expect(page.getByTestId('current-viewer')).toContainText(
    'Connected launcher'
  )
  await expect(current.getByTestId('current-launch')).toBeEnabled()
  await currentSelect(page, 'viewer', 'member')
  await expect(current.getByTestId('current-launch')).toBeDisabled()
  await current.getByText('Lab simulation controls', { exact: true }).click()
  await current.getByTestId('current-advance-phase').click()
  await expect(current.getByTestId('current-launch')).toBeEnabled()
  await expect(current.getByTestId('current-permissionless-time')).toHaveCount(
    0
  )
  if (!(await page.getByTestId('current-wrong-network').isVisible()))
    await page.getByText('Data and simulation', { exact: true }).click()
  await page.getByTestId('current-wrong-network').click()
  await current.getByTestId('current-network').click()
  await expect(current.getByTestId('current-launch')).toBeEnabled()
  expect(txLog).toHaveLength(0)
})

for (const outcome of ['reject', 'revert'])
  test(`retry after ${outcome} retains auction identity`, async ({
    page,
    txLog,
  }) => {
    await page.goto(
      '/internal/design-system/components/table?current=ready#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    await currentSelect(page, 'outcome', outcome)
    await current.getByTestId('current-launch').click()
    await expect(current).toHaveAttribute(
      'data-operation',
      outcome === 'reject' ? 'rejected' : 'failed'
    )
    await expect(current.getByTestId('current-launch')).toBeEnabled()
    await currentSelect(page, 'outcome', 'success')
    await current.getByTestId('current-launch').click()
    await expect(current).toHaveAttribute('data-stage', 'live')
    await expect(current).toContainText('August 2026 Rebalance')
    expect(txLog).toHaveLength(0)
  })

test('all missing-data branches fail closed, and retry recovers without replacing identity', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=ready#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  for (const data of [
    'pending',
    'price-error',
    'auction-error',
    'metadata-error',
    'bounds',
    'error',
  ]) {
    await currentSelect(page, 'data', data)
    await expect(current.getByTestId('current-launch')).toBeDisabled()
    await expect(current.getByTestId('current-progress')).not.toContainText(
      '$0'
    )
    await expect(current).toContainText('August 2026 Rebalance')
    if (data !== 'pending' && data !== 'bounds') {
      await current.getByTestId('current-data-retry').click()
      await expect(current.getByTestId('current-launch')).toBeEnabled()
    }
  }
})

test('keyboard bids, completion and single history handoff preserve context', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=live#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  const bid = current.getByTestId('current-bid-1')
  await bid.focus()
  await page.keyboard.press('Enter')
  await expect(current.getByTestId('current-bid-detail')).toContainText(
    '500 ETH'
  )
  await page.setViewportSize({ width: 390, height: 900 })
  await expect(current.getByTestId('current-bid-detail')).toContainText(
    '500 ETH'
  )
  await current.getByText('Lab simulation controls', { exact: true }).click()
  await current.getByTestId('current-complete').click()
  await expect(current.getByTestId('current-result')).toBeVisible()
  await current.getByTestId('current-history-handoff').click()
  await expect(current).toHaveCount(0)
  await expect(
    page.getByTestId('historical-rebalances-table').locator('tbody tr')
  ).toHaveCount(4)
  await expect(
    page
      .getByTestId('historical-rebalances-table')
      .getByTestId('history-record-title')
      .filter({ hasText: 'August 2026 Rebalance' })
  ).toHaveCount(2)
  await expect(
    page.getByRole('heading', { name: 'Historical Rebalances', exact: true })
  ).toBeFocused()
})

test('liquidity leg retry and browser filler reset guard work without sending', async ({
  page,
  txLog,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=liquidity#auctions-browse-review'
  )
  let current = page.getByTestId('current-rebalance-workspace')
  await expect(current.getByTestId('current-effective-size')).toContainText(
    '2%'
  )
  await expect(current.getByText('High price impact')).toBeVisible()
  await current.getByTestId('current-liquidity-toggle').click()
  await current.getByTestId('current-leg-retry').click()
  await expect(current.getByTestId('current-leg-retry')).toHaveCount(0)
  await currentSelect(page, 'scene', 'filler')
  current = page.getByTestId('current-rebalance-workspace')
  await expect(current.getByTestId('current-filler-action')).toHaveText('Stop')
  await current.getByText('Lab simulation controls', { exact: true }).click()
  await current.getByRole('button', { name: 'Submit filler order' }).click()
  await expect(current.getByTestId('current-filler')).toContainText(
    '1 order submitted'
  )
  await currentSelect(page, 'scene', 'ready')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByTestId('current-guard-stay').click()
  await expect(current.getByTestId('current-filler-action')).toHaveText('Stop')
  await current.getByTestId('current-filler-action').click()
  await expect(current.getByTestId('current-filler-action')).toHaveText('Start')
  await currentSelect(page, 'scene', 'ready')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(txLog).toHaveLength(0)
})
