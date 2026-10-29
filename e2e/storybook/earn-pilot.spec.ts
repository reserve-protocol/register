import { expect, test, type Page } from '@playwright/test'

const pilot =
  '/iframe.html?id=explorations-screen-pilots-participate-and-earn--pilot&viewMode=story'

test('earn offers Binance in every category on desktop and phone', async ({
  page,
}) => {
  for (const family of ['index', 'yield', 'defi']) {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${pilot}&args=family:${family}`)
    const binance = page.getByRole('radio', { name: 'Binance', exact: true })
    await expect(binance).toBeVisible()
    await binance.click()
    await expect(binance).toHaveAttribute('aria-checked', 'true')
    const table = page.getByRole('table')
    if (family === 'index') {
      await expect(table).toContainText('NEOCLOUD')
      await expect(table).not.toContainText('SQUILL')
    } else {
      await expect(table).toContainText('No matching opportunities')
    }
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(
      page.getByRole('combobox', { name: 'Filter by chain' })
    ).toHaveText('Binance')
    await choosePhoneChain(page, 'All chains')
    await expect(table).not.toContainText('No matching opportunities')
    await choosePhoneChain(page, 'Binance')
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(binance).toHaveAttribute('aria-checked', 'true')
  }
})

test('earn hero keeps the filters stationary across categories and responsive widths', async ({
  page,
}) => {
  for (const width of [1440, 1024, 640, 639, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(pilot)
    const filters = page.getByTestId('earn-pilot-filters')
    await expect(filters).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    const filterTop = () =>
      filters.evaluate((node) => node.getBoundingClientRect().top + scrollY)
    const initialTop = await filterTop()
    for (const { label, title } of [
      { label: 'Yield DTF Staking', title: 'Stake RSR on Yield DTFs' },
      {
        label: 'DeFi Yield',
        title: 'Provide liquidity across DeFi & earn more with your DTFs',
      },
      { label: 'Index DTF Governance', title: 'Vote-Lock on Index DTFs' },
    ]) {
      if (width < 640) {
        await page.getByRole('combobox', { name: 'Participate & Earn' }).click()
        await page.getByRole('option', { name: label, exact: true }).click()
      } else {
        await page.getByRole('tab', { name: label, exact: true }).click()
      }
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
      await expect(page.getByRole('table')).toHaveCount(1)
      await expect.poll(filterTop).toBeCloseTo(initialTop, 0)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
    }
  }
})

test('earn filter and sort triggers share the field boundary in both themes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 844 })
  for (const theme of ['light', 'dark']) {
    await page.goto(`${pilot}&globals=theme:${theme}`)
    const field = page
      .getByTestId('earn-pilot-filters')
      .getByTestId('canonical-text-input')
    await expect(field).toBeVisible()
    const border = await field.evaluate(
      (node) => getComputedStyle(node).borderColor
    )
    for (const control of [
      page.getByRole('button', { name: 'Filter by DTFs', exact: true }),
      page.getByRole('combobox', { name: 'Filter by chain', exact: true }),
      page.getByTestId('table-sort-menu'),
    ]) {
      await expect(control).toHaveCSS('border-color', border)
      await expect(control).toHaveCSS('border-top-width', '1px')
    }
  }
})

test('earn mobile sort dropdown exposes fields and direction with focus return', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const { family, name, first } of [
    { family: 'index', name: 'Gov. Token', first: 'SQUILL' },
    { family: 'yield', name: 'Governs', first: 'bsdethRSR' },
  ]) {
    await page.goto(`${pilot}&args=family:${family}`)
    const sort = page.getByTestId('table-sort-menu')
    await expect(sort.locator('[data-slot="popup-chevron"]')).toBeVisible()
    const bounds = (await sort.boundingBox())!
    const search = (await page
      .getByTestId('earn-pilot-filters')
      .getByTestId('canonical-text-input')
      .boundingBox())!
    expect(bounds.x).toBe(search.x)
    expect(bounds.width).toBe(search.width)
    expect(bounds.height).toBeGreaterThanOrEqual(44)
    await sort.focus()
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('menuitemradio', { name, exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('menuitemradio', { name: 'Descending', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
    if (family === 'index') {
      await page.screenshot({
        path: 'test-results/earn-sort-dropdown-open.png',
        animations: 'disabled',
      })
    }
    await page.getByRole('menuitemradio', { name: 'TVL', exact: true }).click()
    await expect(sort).toHaveAccessibleName('Sort by: TVL')
    await expect(sort).toBeFocused()
    await sort.click()
    await expect(
      page.getByRole('menuitemradio', { name: 'TVL', exact: true })
    ).toHaveAttribute('aria-checked', 'true')
    await page
      .getByRole('menuitemradio', { name: 'Ascending', exact: true })
      .click()
    await expect(sort).toHaveAttribute('aria-description', 'ascending')
    await expect(
      page
        .getByRole('table', { name: 'Earn opportunities' })
        .getByRole('row')
        .first()
    ).toContainText(first)
    await sort.click()
    await page.keyboard.press('Escape')
    await expect(sort).toBeFocused()
    await sort.click()
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(page.getByTestId('table-sort-options')).toHaveCount(0)
    await expect(sort).toBeHidden()
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(sort).toHaveAccessibleName('Sort by: TVL')
  }
  await page.goto(
    '/iframe.html?id=patterns-market-earn-and-owned-positions--index-governance&viewMode=story'
  )
  const defaultSort = page.getByTestId('table-sort-menu')
  await expect(defaultSort).toHaveAttribute(
    'data-action-treatment',
    'standalone'
  )
  await expect(defaultSort.locator('[data-slot="popup-chevron"]')).toHaveCount(
    0
  )
  await defaultSort.click()
  await expect(
    page.getByRole('menuitemradio', { name: 'TVL', exact: true })
  ).toBeVisible()
})

test('earn search and DTF filters combine with chain selection and recover from no results', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(pilot)
  const table = page.getByRole('table', { name: 'Earn opportunities' })
  const search = page.getByRole('searchbox', {
    name: 'Search gov token or DTF',
  })
  await search.fill(' pHoToN ')
  await expect(table.getByRole('row')).toHaveCount(3)
  await expect(table).toContainText('25.88%')
  await page.getByRole('button', { name: 'Clear search', exact: true }).click()
  await expect(table.getByRole('row')).toHaveCount(9)
  const dtfs = page.getByRole('button', { name: 'Filter by DTFs', exact: true })
  await dtfs.click()
  await page.getByRole('checkbox', { name: 'OPEN', exact: true }).check()
  await expect(table.getByRole('row')).toHaveCount(9)
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await expect(table.getByRole('row')).toHaveCount(3)
  await expect(table).toContainText('SQUILL')
  await search.fill('RSR')
  await expect(table).toContainText('No matching opportunities')
  await page.getByRole('button', { name: 'Clear search', exact: true }).click()
  await expect(table).toContainText('SQUILL')
  await page.getByRole('radio', { name: 'Base', exact: true }).click()
  await expect(table).toContainText('No matching opportunities')
  await page.getByRole('radio', { name: 'Ethereum', exact: true }).click()
  await expect(table).toContainText('SQUILL')
  await dtfs.click()
  await page.getByRole('button', { name: 'Clear', exact: true }).click()
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.getByRole('radio', { name: 'All chains', exact: true }).click()
  await expect(table.getByRole('row')).toHaveCount(9)
  await search.fill('sQuI')
  await expect(table.getByRole('row')).toHaveCount(3)
})

test('earn filters use the right family and remain usable on phones', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${pilot}&args=family:yield`)
  await page
    .getByRole('searchbox', { name: 'Search DTF name or symbol' })
    .fill('bsdETH')
  const table = page.getByRole('table', { name: 'Earn opportunities' })
  await expect(table).toContainText('bsdethRSR')
  await expect(table).not.toContainText('eusdRSR')
  await choosePhoneChain(page, 'Ethereum')
  await expect(table).toContainText('No matching opportunities')
  await choosePhoneChain(page, 'Base')
  await expect(table).toContainText('bsdethRSR')
  await page.setViewportSize({ width: 640, height: 844 })
  await expect(
    page.getByRole('radio', { name: 'Base', exact: true })
  ).toHaveAttribute('aria-checked', 'true')
  await expect(
    page.getByRole('combobox', { name: 'Filter by chain' })
  ).toHaveCount(0)
  await page.setViewportSize({ width: 639, height: 844 })
  await expect(
    page.getByRole('combobox', { name: 'Filter by chain' })
  ).toHaveText('Base')
  await choosePhoneChain(page, 'Ethereum')
  await page.getByRole('combobox', { name: 'Participate & Earn' }).click()
  await page.getByRole('option', { name: 'DeFi Yield', exact: true }).click()
  await page
    .getByRole('searchbox', { name: 'Search pool', exact: true })
    .fill('BeEfY')
  const defi = page.getByRole('table', { name: 'DeFi Yield' })
  await expect(defi).toContainText('eUSD-USDC')
  await expect(defi).not.toContainText('RSR-WETH')
  await choosePhoneChain(page, 'Ethereum')
  await expect(defi).toContainText('No matching opportunities')
  await choosePhoneChain(page, 'Base')
  await expect(defi).toContainText('eUSD-USDC')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.screenshot({
    path: 'test-results/earn-pilot-filtered-phone.png',
    fullPage: true,
  })
})

test('earn screen reuses opportunity tables across its three categories', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(pilot)
  await expect(
    page.getByRole('heading', { name: 'Vote-Lock on Index DTFs' })
  ).toBeVisible()
  const opportunities = page.getByRole('table', { name: 'Earn opportunities' })
  await expect(opportunities.getByRole('row').nth(1)).toContainText('25.88%')
  await page.getByTestId('sort-rate').click()
  await expect(opportunities.getByRole('row').nth(1)).toContainText('2.29%')
  await page
    .getByRole('tab', { name: 'Yield DTF Staking', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Stake RSR on Yield DTFs' })
  ).toBeVisible()
  await expect(opportunities).toContainText('6.12%')
  await page.getByRole('tab', { name: 'DeFi Yield', exact: true }).click()
  await expect(
    page.getByRole('table', { name: 'DeFi Yield', exact: true })
  ).toBeVisible()
  await page.getByRole('tab', { name: 'DeFi Yield', exact: true }).focus()
  await page.keyboard.press('Home')
  const indexTab = page.getByRole('tab', {
    name: 'Index DTF Governance',
    exact: true,
  })
  await expect(indexTab).toHaveAttribute('aria-selected', 'true')
  await expect(indexTab).toBeFocused()
  await expect(indexTab).toBeInViewport({ ratio: 1 })
  await page.keyboard.press('End')
  await expect(
    page.getByRole('tab', { name: 'DeFi Yield', exact: true })
  ).toHaveAttribute('aria-selected', 'true')
  await expect(
    page.getByRole('tab', { name: 'DeFi Yield', exact: true })
  ).toBeFocused()
  await page.setViewportSize({ width: 390, height: 844 })
  const category = page.getByRole('combobox', { name: 'Participate & Earn' })
  await expect(category).toHaveText('DeFi Yield')
  await category.click()
  await page.getByRole('option', { name: 'Index DTF Governance' }).click()
  await expect(
    page.getByRole('heading', { name: 'Vote-Lock on Index DTFs' })
  ).toBeVisible()
  await expect(category).toBeFocused()
  await expect(page.getByText(/^Use any ERC20 to govern/)).toHaveCSS(
    'font-size',
    '16px'
  )
  const dtf = await page
    .getByRole('button', { name: 'Filter by DTFs' })
    .boundingBox()
  const chain = await page
    .getByRole('combobox', { name: 'Filter by chain' })
    .boundingBox()
  expect(dtf!.y).toBe(chain!.y)
  await category.click()
  await page.getByRole('option', { name: 'DeFi Yield', exact: true }).click()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.screenshot({
    path: 'test-results/earn-pilot-defi-phone.png',
    fullPage: true,
  })
})

test('earn screen fits desktop and phone with pinned shared navigation in both themes', async ({
  page,
}) => {
  const runtimeRequests: string[] = []
  page.on('request', (request) => {
    if (
      /alchemy|infura|walletconnect|api\.reserve|api-staging\.reserve|thegraph/i.test(
        request.url()
      )
    )
      runtimeRequests.push(request.url())
  })
  for (const theme of ['light', 'dark']) {
    for (const width of [1440, 1024, 640, 639, 390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(`${pilot}&globals=theme:${theme}`)
      await expect(
        page.getByRole('heading', { name: 'Vote-Lock on Index DTFs' })
      ).toBeVisible()
      await expect(page.getByTestId('earn-pilot-viewport')).toHaveCSS(
        'font-family',
        /TWK Lausanne/
      )
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true)
      if (width === 390) {
        await page
          .getByRole('button', { name: 'Open global navigation', exact: true })
          .click()
        const drawer = page.getByRole('dialog', {
          name: 'Global navigation',
          exact: true,
        })
        await expect(drawer).toBeVisible()
        await expect(
          drawer.getByRole('link', { name: 'Participate & Earn', exact: true })
        ).toHaveAttribute('aria-current', 'page')
        await drawer
          .getByRole('button', { name: 'Close global navigation', exact: true })
          .click()
        await expect(drawer).toBeHidden()
        await expect(
          page.getByRole('button', {
            name: 'Open global navigation',
            exact: true,
          })
        ).toBeFocused()
      }
      await page.screenshot({
        path: `test-results/earn-pilot-${theme}-${width}.png`,
        fullPage: true,
      })
      await page.evaluate(() => window.scrollTo(0, 400))
      expect(
        (await page.getByTestId('pilot-global-header').boundingBox())!.y
      ).toBe(0)
    }
  }
  expect(runtimeRequests).toEqual([])
  await page.goto(`${pilot}&args=state:loading`)
  await expect(
    page.getByRole('heading', { name: 'Vote-Lock on Index DTFs' })
  ).toBeVisible()
  await expect(page.getByTestId('earn-open-shared-rsr')).toHaveCount(0)
  await expect(
    page.locator('main [data-testid="v1-skeleton"]:visible').first()
  ).toBeVisible()
  await page.screenshot({
    path: 'test-results/earn-pilot-loading.png',
    fullPage: true,
  })
})

test('earn Docs controls carry the chosen family and state to the full screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 960, height: 900 })
  await page.goto(
    '/iframe.html?id=explorations-screen-pilots-participate-and-earn--docs&viewMode=docs'
  )
  const frame = page.getByTestId('earn-pilot-review-frame')
  await expect(frame).toBeVisible()
  await page.getByRole('radio', { name: 'yield', exact: true }).check()
  await expect(
    page.getByRole('heading', { name: 'Stake RSR on Yield DTFs' })
  ).toBeVisible()
  await page
    .locator('tr')
    .filter({ has: page.getByText('Data state', { exact: true }) })
    .getByRole('combobox')
    .selectOption('missing')
  const controls = (await page.getByRole('table').first().boundingBox())!
  expect(controls.y + controls.height).toBeLessThanOrEqual(
    (await frame.boundingBox())!.y
  )
  const opened = page.waitForEvent('popup')
  await page.getByRole('link', { name: /^Open full screen/ }).click()
  const screen = await opened
  await expect(
    screen.getByRole('heading', { name: 'Stake RSR on Yield DTFs' })
  ).toBeVisible()
  await expect(screen.getByTestId('earn-pilot-review-frame')).toHaveCount(0)
  await expect(
    screen.getByRole('table', { name: 'Earn opportunities' })
  ).toContainText('—')
  await screen.close()
})

async function choosePhoneChain(page: Page, name: string) {
  await page.getByRole('combobox', { name: 'Filter by chain' }).click()
  await page.getByRole('option', { name, exact: true }).click()
}

test('earn filtered-to-zero offers Clear filters that restores every row', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${pilot}&args=family:yield`)
  const table = page.getByRole('table', { name: 'Earn opportunities' })
  await expect(table).toContainText('bsdethRSR')
  const rows = await table.getByRole('row').count()
  expect(rows).toBeGreaterThan(1)
  await page
    .getByRole('searchbox', { name: 'Search DTF name or symbol' })
    .fill('no such dtf')
  await expect(table).toContainText('No matching opportunities')
  await table
    .getByRole('button', { name: 'Clear filters', exact: true })
    .click()
  await expect(table.getByRole('row')).toHaveCount(rows)
  await expect(
    page.getByRole('searchbox', { name: 'Search DTF name or symbol' })
  ).toHaveValue('')
})
