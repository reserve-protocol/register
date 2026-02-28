import { test, expect } from '../fixtures/base'
import { TEST_DTFS } from '../helpers/test-data'

test.describe('Discover page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders TVL header with protocol metrics', async ({ page }) => {
    const tvlHeading = page.getByText('TVL in Reserve')
    await expect(tvlHeading).toBeVisible()

    // TVL value from mock: $130,196,760
    await expect(page.getByText('$130,196,760')).toBeVisible()
  })

  test('shows Index DTF list with data from API', async ({ page }) => {
    // Default tab is "Index DTFs" — table should render with mocked data
    const table = page.getByTestId('discover-dtf-table')
    await expect(table).toBeVisible()

    // Check that DTF names from mock data appear (use first() to avoid
    // strict mode — desktop table + mobile card both render)
    await expect(page.getByText(TEST_DTFS.lcap.name).first()).toBeVisible()
    await expect(page.getByText(TEST_DTFS.clx.name).first()).toBeVisible()
    await expect(page.getByText(TEST_DTFS.ai.name).first()).toBeVisible()
  })

  test('can switch between DTF category tabs', async ({ page }) => {
    const tabs = page.getByTestId('discover-tabs')
    await expect(tabs).toBeVisible()

    // Click Yield DTFs tab
    await tabs.getByRole('tab', { name: /Yield DTFs/ }).click()

    // Index DTF table should no longer be visible
    await expect(page.getByTestId('discover-dtf-table')).not.toBeVisible()

    // Click back to Index DTFs
    await tabs.getByRole('tab', { name: /Index DTFs/ }).click()
    await expect(page.getByTestId('discover-dtf-table')).toBeVisible()
  })

  test('clicking a DTF row navigates to overview page', async ({ page }) => {
    // Wait for table to load
    const table = page.getByTestId('discover-dtf-table')
    await expect(table).toBeVisible()

    // Click the first DTF link (use the link inside the desktop table)
    await table.locator('a').filter({ hasText: TEST_DTFS.lcap.name }).first().click()

    // Should navigate to the DTF overview page
    await expect(page).toHaveURL(
      new RegExp(`/base/index-dtf/${TEST_DTFS.lcap.address}/overview`)
    )
  })

  test('search filter narrows down the DTF list', async ({ page }) => {
    const table = page.getByTestId('discover-dtf-table')
    await expect(table).toBeVisible()

    // All 3 DTFs should be visible initially
    await expect(page.getByText(TEST_DTFS.lcap.name).first()).toBeVisible()
    await expect(page.getByText(TEST_DTFS.ai.name).first()).toBeVisible()

    // Type in the search filter
    const searchInput = page.getByPlaceholder('Search by name, ticker, tag or collateral')
    await searchInput.fill('Large Cap')

    // Only LCAP should remain visible
    await expect(page.getByText(TEST_DTFS.lcap.name).first()).toBeVisible()
    await expect(page.getByText(TEST_DTFS.ai.name)).not.toBeVisible()
  })
})
