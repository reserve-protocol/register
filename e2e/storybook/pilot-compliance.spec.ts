import { expect, test } from '@playwright/test'

const earn =
  '/iframe.html?id=explorations-screen-pilots-participate-and-earn--pilot&viewMode=story'
const overview =
  '/iframe.html?id=explorations-screen-pilots-index-dtf-overview--pilot&viewMode=story'

test('pilot field triggers match Select geometry', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${earn}&globals=theme:${theme}`)
    const filters = page.getByTestId('earn-pilot-filters')
    const dtf = filters.getByRole('button', { name: 'Filter by DTFs' })
    const chain = filters.getByRole('combobox', { name: 'Filter by chain' })
    const sort = page.getByTestId('table-sort-menu')
    for (const control of [dtf, chain, sort]) {
      await expect(control).toHaveCSS('height', '44px')
      await expect(control).toHaveCSS('padding-left', '20px')
      await expect(control).toHaveCSS('padding-right', '18px')
      await expect(control).toHaveCSS('transform', 'none')
    }
  }
})

test('sort field keeps its title left and selected value beside the chevron', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${earn}&globals=theme:${theme}`)
    const sort = page.getByTestId('table-sort-menu')
    await expect(sort).toHaveAccessibleName('Sort by: Avg. 30d%')
    const title = sort.getByText('Sort by', { exact: true })
    await expect(title).toBeVisible()
    const value = sort.getByText('Avg. 30d%', { exact: true })
    const chevron = sort.locator('[data-slot="popup-chevron"]')
    const [t, v, c] = await Promise.all([
      title.boundingBox(),
      value.boundingBox(),
      chevron.boundingBox(),
    ])
    expect(v!.x - t!.x - t!.width).toBeGreaterThan(40)
    expect(c!.x - v!.x - v!.width).toBeCloseTo(12, 0)
    await sort.click()
    await page.getByRole('menuitemradio', { name: 'TVL', exact: true }).click()
    await expect(sort).toHaveAccessibleName('Sort by: TVL')
    await expect(sort).toBeFocused()
  }
})

test('Holdings panels follow the visible active tab across projections and hosts', async ({
  page,
}) => {
  for (const url of [
    overview,
    '/iframe.html?id=patterns-market-holdings--photon-exposure&viewMode=story',
  ]) {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(url)
    for (const width of [390, 1440, 390]) {
      await page.setViewportSize({ width, height: 844 })
      for (const name of ['Exposure', 'Collateral']) {
        const tab = page.getByRole('tab', { name, exact: true })
        await tab.click()
        const panel = page.getByRole('tabpanel', { name, exact: true })
        await expect(panel).toBeVisible()
        await expect(panel).toHaveAttribute('tabindex', '0')
        await expect(tab).toHaveAttribute(
          'aria-controls',
          (await panel.getAttribute('id')) as string
        )
        await expect(panel).toHaveAttribute(
          'aria-labelledby',
          (await tab.getAttribute('id')) as string
        )
      }
    }
  }
})

test('canonical filters use standard field geometry', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const multi =
    '/iframe.html?id=components-fields-and-selection-multi-select-filter--'
  for (const story of [
    'playground',
    'empty',
    'minimum-selection',
    'disabled-option',
    'long-labels',
  ]) {
    await page.goto(`${multi}${story}&viewMode=story`)
    const filter = page.getByRole('button', { name: 'Choose networks' })
    await expect(filter).toHaveCSS('height', '44px')
    await expect(filter).toHaveCSS('padding-left', '20px')
    await expect(filter).toHaveCSS('padding-right', '18px')
  }

  await page.goto(
    '/iframe.html?id=components-actions-menu--labeled-field&viewMode=story'
  )
  const trigger = page.getByRole('button', { name: 'Sort by: Avg. 30d%' })
  await expect(trigger).toHaveCSS('height', '44px')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await page.getByRole('menuitemradio', { name: 'TVL', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Sort by: TVL' })).toBeFocused()
})
