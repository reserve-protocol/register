import {
  test,
  expect,
  currentCapture,
  realTarget,
} from './current-rebalance-helpers'

const route = '/internal/design-system/components/table'
const anchor = '#auctions-current-table-review'

test('current table ready navigation preserves context', async ({
  page,
  txLog,
}, info) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto(`${route}?current=repeat${anchor}`)
  const table = page.getByTestId('current-rebalances-table')
  await expect(table).toBeVisible()
  await expect(
    table
      .getByText('Only launcher can start', { exact: true })
      .filter({ visible: true })
  ).toBeVisible()
  await expect(
    table.getByText('Auction 2', { exact: true }).filter({ visible: true })
  ).toBeVisible()
  await expect(page.getByTestId('historical-rebalances-table')).toBeVisible()
  await currentCapture(page, table, info, 'table-ready-desktop')
  const details = table
    .getByRole('link', { name: 'Details', exact: true })
    .filter({ visible: true })
  await details.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('current-retained-detail')).toBeVisible()
  await expect(table).toHaveCount(0)
  await expect(page.getByTestId('historical-rebalances-table')).toHaveCount(0)
  await page.goBack()
  await expect(table).toBeVisible()
  await expect(details).toBeFocused()
  expect(txLog.length).toBe(0)
})

test('current table controls and responsive focus retain context', async ({
  page,
  txLog,
}, info) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto(`${route}?current=ready${anchor}`)
  const table = page.getByTestId('current-rebalances-table')
  await page.getByTestId('current-table-viewer').click()
  await page.getByTestId('current-table-viewer-member').click()
  await expect(
    table
      .getByText('Only launcher can start', {
        exact: true,
      })
      .filter({ visible: true })
  ).toBeVisible()
  await page.getByTestId('current-table-scene').click()
  await page.getByTestId('current-table-scene-permissionless').click()
  await expect(
    table.getByTestId('current-table-status').filter({ visible: true })
  ).toHaveText('Anyone can start')
  await page.getByText('Data and simulation', { exact: true }).click()
  await page.getByTestId('current-table-data').click()
  await page.getByTestId('current-table-data-auction-error').click()
  await expect(
    table.getByText('Unavailable', { exact: true }).filter({ visible: true })
  ).toBeVisible()
  await page.getByTestId('current-table-data').click()
  await page.getByTestId('current-table-data-ready').click()
  await page.getByRole('switch', { name: 'Wrong network', exact: true }).click()
  await expect(
    table.getByText('Switch to BNB Smart Chain', { exact: true })
  ).toHaveCount(0)
  await table.getByRole('link', { name: 'Details', exact: true }).click()
  await expect(
    page
      .getByTestId('current-retained-detail')
      .getByTestId('current-table-status')
  ).toContainText('Switch to BNB Smart Chain')
  await page.goBack()
  await page.getByText('Data and simulation', { exact: true }).click()
  await page.getByRole('switch', { name: 'Wrong network', exact: true }).click()
  const proposer = table
    .getByTestId('rebalance-proposer-link')
    .filter({ visible: true })
  await proposer.evaluate((el) =>
    el.addEventListener('click', (event) => event.preventDefault(), {
      once: true,
    })
  )
  await proposer.click()
  await expect(page.getByTestId('current-retained-detail')).toHaveCount(0)
  const details = table
    .getByRole('link', { name: 'Details', exact: true })
    .filter({ visible: true })
  await details.focus()
  for (const width of [1071, 1072, 390, 1400]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(details).toBeFocused()
    expect(
      await table.evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
  }
  await page.getByTestId('history-constrain').click()
  await expect
    .poll(() => table.evaluate((el) => el.getBoundingClientRect().width))
    .toBe(390)
  await realTarget(details.locator('..'))
  await currentCapture(
    page,
    page.getByTestId('current-table-heading'),
    info,
    'table-constrained-column'
  )
  expect(txLog.length).toBe(0)
})

for (const width of [1400, 390])
  test(`current table reference ownership ${width}`, async ({
    page,
    txLog,
  }, info) => {
    await page.setViewportSize({ width, height: 1000 })
    for (const [scene, caption] of [
      ['repeat', 'August 2026 Rebalance · Start auction 2'],
      ['no-bids', 'August 2026 Rebalance · Bids · 2'],
    ]) {
      await page.goto(`${route}?current=${scene}${anchor}`)
      await page
        .getByTestId('current-rebalances-table')
        .getByRole('link', { name: 'Details', exact: true })
        .click()
      const detail = page.getByTestId('current-retained-detail')
      const reference = detail.getByTestId('current-detail-reference')
      await expect(
        reference.getByTestId('current-reference-identity')
      ).toHaveText(caption)
      await expect(
        reference.getByText('Read-only ·', { exact: false })
      ).toBeVisible()
      await expect(reference.locator('time')).toHaveAttribute(
        'dateTime',
        '2026-09-13'
      )
      await expect
        .poll(() =>
          reference
            .getByRole('img')
            .evaluate(
              (el: HTMLImageElement) => el.complete && el.naturalWidth > 0
            )
        )
        .toBe(true)
      if (scene === 'no-bids')
        await expect(
          detail
            .getByTestId('current-table-round')
            .getByText('Bids · 0', { exact: true })
        ).toBeVisible()
      await currentCapture(
        page,
        detail,
        info,
        `table-reference-${scene}-${width}`
      )
    }
    expect(txLog.length).toBe(0)
  })

for (const theme of ['light', 'dark'])
  for (const width of [1400, 900, 390, 320]) {
    test(`current table composition ${theme} ${width}`, async ({
      page,
      txLog,
    }, info) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      for (const scene of ['repeat', 'live', 'hybrid']) {
        await page.goto(`${route}?current=${scene}${anchor}`)
        await page.evaluate(() => document.fonts.ready)
        const table = page.getByTestId('current-rebalances-table')
        await expect(table).toBeVisible()
        await realTarget(
          table
            .getByRole('link', { name: 'Details', exact: true })
            .filter({ visible: true })
            .locator('..')
        )
        const geometry = await table.evaluate((el) => ({
          overflow: el.scrollWidth - el.clientWidth,
          rowBorders: [...el.querySelectorAll('tbody tr')].map(
            (row) => getComputedStyle(row).borderTopWidth
          ),
          headerBorders: [...el.querySelectorAll('thead tr')].map(
            (row) => getComputedStyle(row).borderBottomWidth
          ),
        }))
        expect(geometry.overflow).toBeLessThanOrEqual(1)
        expect(geometry.rowBorders).toEqual(['0px'])
        expect(geometry.headerBorders).toEqual(['0px'])
        await currentCapture(
          page,
          page.getByTestId('current-table-heading'),
          info,
          `table-${scene}-${theme}-${width}`
        )
      }
      expect(txLog.length).toBe(0)
    })
  }

test('current table distinguishes availability from viewer eligibility and missing data', async ({
  page,
  txLog,
}, info) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  const cases = [
    [
      'current=ready&viewer=member',
      'Only launcher can start',
      'Only the auction launcher can start auctions',
      'detail',
    ],
    [
      'current=ready&viewer=visitor',
      'Only launcher can start',
      'Connect wallet',
      'detail',
    ],
    [
      'current=ready&network=wrong',
      'Only launcher can start',
      'Switch to BNB Smart Chain',
      'detail',
    ],
    [
      'current=permissionless&viewer=member',
      'Anyone can start',
      'Start auction 1',
      'detail',
    ],
    [
      'current=hybrid&viewer=member',
      'Confirm target weights',
      'Only launcher can start',
      'status',
    ],
    [
      'current=live&data=price-error&viewer=visitor',
      'Ongoing',
      'Bids · 2',
      'round',
    ],
    ['current=no-bids', 'Ongoing', 'Bids · 0', 'round'],
    [
      'current=live&data=auction-error',
      'Unavailable',
      'Auction query failed',
      'status',
    ],
    ['current=ready&data=pending', 'Loading', 'Prices pending', 'status'],
    [
      'current=indexing',
      'Launching...',
      'Lab: launch confirmed; waiting for auction data. Launch remains disabled.',
      'status',
    ],
    ['current=complete', 'Completed', 'Rebalance Finished', 'detail'],
  ]
  for (const [query, status, instruction, placement] of cases) {
    await page.goto(`${route}?${query}${anchor}`)
    const table = page.getByTestId('current-rebalances-table')
    const statusCell = table
      .getByTestId('current-table-status')
      .filter({ visible: true })
    await expect(statusCell.getByText(status, { exact: true })).toBeVisible()
    await expect(statusCell).toHaveText(
      status + (placement === 'status' ? instruction : '')
    )
    if (placement === 'round')
      await expect(
        table.getByTestId('current-table-round').filter({ visible: true })
      ).toContainText(instruction)
    if (placement === 'detail')
      await expect(table.getByText(instruction, { exact: true })).toHaveCount(0)
    const hasHelp =
      status === 'Only launcher can start' ||
      query === 'current=hybrid&viewer=member'
    await expect(table.getByRole('button')).toHaveCount(hasHelp ? 1 : 0)
    if (hasHelp)
      await expect(table.getByRole('button')).toHaveAccessibleName(
        'Only launcher can start'
      )
    if (query.includes('auction-error')) {
      await expect(table.getByText('Auction 1', { exact: true })).toHaveCount(0)
      await expect(table.getByText('Ends in', { exact: true })).toHaveCount(0)
    }
    if (
      query === cases[0][0] ||
      query === 'current=indexing' ||
      query === 'current=complete'
    )
      await currentCapture(
        page,
        table,
        info,
        `table-edge-${query.replaceAll(/[=&]/g, '-')}`
      )
  }
  expect(txLog.length).toBe(0)
})

test('current table empty loading multiple rows and independent destinations', async ({
  page,
  txLog,
}, info) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  for (const scene of ['empty', 'loading']) {
    await page.goto(`${route}?current=${scene}${anchor}`)
    const current = page.getByTestId('current-table-review')
    await expect(page.getByTestId('current-rebalances-table')).toHaveCount(0)
    await expect(
      current.getByText(scene === 'empty' ? 'No rebalances found' : 'Loading', {
        exact: true,
      })
    ).toHaveCount(1)
    await expect(page.getByTestId('historical-rebalances-table')).toBeVisible()
  }
  await page.goto(`${route}?current=multiple${anchor}`)
  const table = page.getByTestId('current-rebalances-table')
  await expect(table.locator('tbody tr')).toHaveCount(2)
  const history = page.getByTestId('historical-rebalances-table')
  await expect(
    history.getByText('July Rebalance 2026', { exact: true })
  ).toHaveCount(0)
  const proposer = table
    .getByTestId('rebalance-proposer-link')
    .filter({ visible: true })
    .first()
  await expect(proposer).toHaveAttribute('target', '_blank')
  await expect(proposer).toHaveAttribute('href', /bscscan\.com\/address/)
  await currentCapture(page, table, info, 'table-multiple-desktop')
  const row = table.locator('tbody tr').last()
  await row
    .getByText('Auction 1', { exact: true })
    .filter({ visible: true })
    .click()
  await expect(
    page
      .getByTestId('current-retained-detail')
      .getByRole('heading', { name: 'July Rebalance 2026' })
  ).toBeVisible()
  const reference = page.getByTestId('current-detail-reference')
  await expect(
    reference.getByRole('heading', { name: 'Reference', exact: true })
  ).toBeVisible()
  await expect(reference.getByTestId('current-reference-identity')).toHaveText(
    'August 2026 Rebalance · Start auction 1'
  )
  await expect
    .poll(() =>
      reference
        .getByRole('img')
        .evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)
    )
    .toBe(true)
  await currentCapture(
    page,
    page.getByTestId('current-retained-detail'),
    info,
    'table-july-reference-desktop'
  )
  await page.getByRole('link', { name: 'Back', exact: true }).click()
  await expect(
    row
      .getByRole('link', { name: 'Details', exact: true })
      .filter({ visible: true })
  ).toBeFocused()
  await page.goto(`${route}?current=ready&rebalance-preview=wrong-id${anchor}`)
  await expect(
    page.getByText(
      'Lab: no proposal matches this route. No launch state is inferred.',
      { exact: true }
    )
  ).toBeVisible()
  await expect(
    page.getByTestId('current-retained-detail').getByRole('img')
  ).toHaveCount(0)
  expect(txLog.length).toBe(0)
})
