import { test, expect, currentCapture } from './current-rebalance-helpers'

const url =
  '/internal/design-system/components/table#auctions-current-table-review'

test('current table simplifies status without losing actionable context', async ({
  page,
  txLog,
}, info) => {
  await page.setViewportSize({ width: 1400, height: 1000 })
  await page.goto(url)
  const table = page.getByTestId('current-rebalances-table')
  const rowFor = (id: string) =>
    table.locator('tbody tr').filter({
      has: page.locator(`[data-table-focus="details-all-${id}"]`),
    })
  for (const [id, status] of [
    ['ready', 'Only launcher can start'],
    ['permissionless', 'Anyone can start'],
    ['restricted', 'Only launcher can start'],
    ['visitor', 'Only launcher can start'],
    ['network', 'Only launcher can start'],
    ['hybrid', 'Confirm target weights'],
    ['live', 'Ongoing'],
    ['no-bids', 'Ongoing'],
    ['complete', 'Completed'],
  ]) {
    const row = rowFor(id)
    await expect(
      row.getByTestId('current-table-status').filter({ visible: true })
    ).toHaveText(status)
    const arrow = row.locator(`[data-table-focus="details-all-${id}"]:visible`)
    await expect(arrow).toHaveAccessibleName('Details')
    await expect(arrow).toHaveText('')
    await expect(arrow).toHaveAttribute('data-tone', 'secondary')
    await arrow.scrollIntoViewIfNeeded()
    const shape = await arrow.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      const area = el.parentElement!.getBoundingClientRect()
      const style = getComputedStyle(el)
      return {
        width: rect.width,
        height: rect.height,
        radius: parseFloat(style.borderRadius),
        targetWidth: area.width,
        targetHeight: area.height,
        edgeHits: [
          [area.x + 1, area.y + area.height / 2],
          [area.right - 1, area.y + area.height / 2],
          [area.x + area.width / 2, area.y + 1],
          [area.x + area.width / 2, area.bottom - 1],
        ].map(([x, y]) => el.contains(document.elementFromPoint(x, y))),
      }
    })
    expect(shape.width).toBe(32)
    expect(shape.height).toBe(32)
    expect(shape.radius).toBeGreaterThanOrEqual(16)
    expect(shape.targetWidth).toBe(44)
    expect(shape.targetHeight).toBe(44)
    expect(shape.edgeHits).toEqual([true, true, true, true])
  }
  for (const [id, note] of [
    ['hybrid-restricted', 'Only launcher can start'],
    ['auction-error', 'Auction query failed'],
    ['price-error', 'Price unavailable'],
    [
      'indexing',
      'Lab: launch confirmed; waiting for auction data. Launch remains disabled.',
    ],
  ])
    await expect(
      rowFor(id).getByTestId('current-table-status').filter({ visible: true })
    ).toContainText(note)
  for (const [id, bids] of [
    ['live', 'Bids · 2'],
    ['no-bids', 'Bids · 0'],
  ])
    await expect(
      rowFor(id).getByTestId('current-table-round').filter({ visible: true })
    ).toContainText(bids)
  for (const [id, instruction] of [
    ['restricted', 'Only the auction launcher can start auctions'],
    ['visitor', 'Connect wallet'],
    ['network', 'Switch to BNB Smart Chain'],
    ['hybrid', 'Manage Weights'],
    [
      'hybrid-restricted',
      'Community launch is not available for this rebalance',
    ],
  ]) {
    const arrow = rowFor(id).locator(
      `[data-table-focus="details-all-${id}"]:visible`
    )
    await arrow.scrollIntoViewIfNeeded()
    const rect = await arrow.boundingBox()
    await page.mouse.click(rect!.x - 4, rect!.y + rect!.height / 2)
    await expect(
      page
        .getByTestId('current-retained-detail')
        .getByTestId('current-table-status')
    ).toContainText(instruction)
    await page.goBack()
    await expect(
      rowFor(id).locator(`[data-table-focus="details-all-${id}"]:visible`)
    ).toBeFocused()
  }
  await currentCapture(
    page,
    page.getByTestId('current-table-heading'),
    info,
    'table-status-navigation-desktop'
  )
  expect(txLog.length).toBe(0)
})

test('current table defaults to all state examples with distinct navigation', async ({
  page,
  txLog,
}, info) => {
  await page.setViewportSize({ width: 1400, height: 1000 })
  await page.goto(url)
  const table = page.getByTestId('current-rebalances-table')
  await expect(table).toHaveCount(18)
  await expect(table.locator('tbody tr')).toHaveCount(18)
  const examples = page.getByTestId('current-table-example')
  const labels = [
    'First auction · restricted',
    'First auction · permissionless',
    'Connected non-launcher',
    'Disconnected visitor',
    'Wrong network',
    'Hybrid · weights required',
    'Hybrid · weights required · Connected non-launcher',
    'Auction live · bids',
    'Auction live · no bids',
    'Next auction · prior run',
    'Confirmed → indexing delayed',
    'Prices pending',
    'Price unavailable',
    'Auction query failed',
    'Token metadata missing',
    'Token out of bounds',
    'Metrics unavailable',
    'Target reached · window open',
  ]
  await expect(examples).toHaveCount(labels.length)
  for (const [index, label] of labels.entries()) {
    const example = examples.nth(index)
    await expect(example).toHaveAccessibleName(label)
    await expect(example.getByRole('heading')).toHaveText(label)
    await expect(example.getByTestId('current-rebalances-table')).toHaveCount(1)
    await expect(example.locator('tbody tr')).toHaveCount(1)
    await expect(
      example.locator('h4 + [data-testid="current-rebalances-table"]')
    ).toHaveCount(1)
  }
  await expect(page.getByTestId('current-table-scene')).toHaveText('All')
  await expect(page.getByTestId('current-table-viewer')).toHaveCount(0)
  await expect(table.getByTestId('current-table-preview-label')).toHaveCount(0)
  const details = table.getByRole('link', { name: 'Details', exact: true })
  const destinations = await details.evaluateAll((links) =>
    links.map((link) => link.getAttribute('href'))
  )
  expect(new Set(destinations).size).toBe(18)
  const noBids = table
    .locator('tbody tr')
    .filter({ has: page.locator('[data-table-focus="details-all-no-bids"]') })
  await expect(
    noBids.getByText('Bids · 0', { exact: true }).filter({ visible: true })
  ).toBeVisible()
  await noBids.getByRole('link', { name: 'Details', exact: true }).click()
  await expect(
    page
      .getByTestId('current-retained-detail')
      .getByTestId('current-table-round')
  ).toContainText('Bids · 0')
  await page.goBack()
  await expect(
    noBids.getByRole('link', { name: 'Details', exact: true })
  ).toBeFocused()
  await expect(table.locator('tbody tr')).toHaveCount(18)
  const proposer = noBids
    .getByTestId('rebalance-proposer-link')
    .filter({ visible: true })
  await proposer.focus()
  await page.setViewportSize({ width: 390, height: 1000 })
  await expect(proposer).toBeFocused()
  await page.setViewportSize({ width: 1400, height: 1000 })
  await expect(proposer).toBeFocused()
  await currentCapture(
    page,
    page.getByTestId('current-table-heading'),
    info,
    'all-states-desktop-top'
  )
  await currentCapture(page, examples.nth(8), info, 'all-states-desktop-middle')
  await currentCapture(page, examples.last(), info, 'all-states-desktop-end')
  await expect(page.getByTestId('historical-rebalances-table')).toBeVisible()
  await expect(page.getByTestId('historical-rebalances-table')).toHaveCount(1)
  expect(txLog.length).toBe(0)
})

test('current table all states fit dark phone and retain individual previews', async ({
  page,
  txLog,
}, info) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.addInitScript(() =>
    localStorage.setItem('theme-ui-color-mode', 'dark')
  )
  await page.goto(url)
  const table = page.getByTestId('current-rebalances-table')
  await expect(table.locator('tbody tr')).toHaveCount(18)
  await expect(table.getByTestId('current-table-preview-label')).toHaveCount(0)
  expect(
    await table.evaluateAll((elements) =>
      Math.max(...elements.map((el) => el.scrollWidth - el.clientWidth))
    )
  ).toBeLessThanOrEqual(1)
  const unknown = table
    .locator('tbody tr')
    .filter({ hasText: 'Auction query failed' })
  await expect(
    unknown.getByText('Unavailable', { exact: true }).filter({ visible: true })
  ).toBeVisible()
  await expect(unknown.locator('[data-status-role="actionable"]')).toHaveCount(
    0
  )
  await currentCapture(
    page,
    page.getByTestId('current-table-heading'),
    info,
    'all-states-dark-phone-top'
  )
  await currentCapture(
    page,
    page.getByRole('region', { name: 'Auction query failed', exact: true }),
    info,
    'all-states-dark-phone-unavailable'
  )
  await page.getByTestId('current-table-scene').click()
  await page.getByTestId('current-table-scene-live').click()
  await expect(table).toHaveCount(1)
  await expect(page.getByTestId('current-table-example')).toHaveCount(0)
  await expect(table.locator('tbody tr')).toHaveCount(1)
  await expect(page.getByTestId('current-table-viewer')).toBeVisible()
  await page.getByTestId('current-table-scene').click()
  await page.getByTestId('current-table-scene-all').click()
  await expect(table).toHaveCount(18)
  await expect(table.locator('tbody tr')).toHaveCount(18)
  expect(txLog.length).toBe(0)
})
