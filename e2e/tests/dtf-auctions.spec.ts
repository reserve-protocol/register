import { test, expect } from '../fixtures/base'
import { TEST_DTFS } from '../helpers/test-data'

const DTF_URL = `/base/index-dtf/${TEST_DTFS.lcap.address}/auctions`

test.describe('DTF Auctions: Page Load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('renders without crash', async ({ page }) => {
    await expect(page.getByText('unexpected error')).not.toBeVisible()
    await expect(page.getByTestId('dtf-auctions')).toBeVisible()
  })

  test('shows both Active and Historical section headers', async ({
    page,
  }) => {
    await expect(page.getByText('Active Rebalances')).toBeVisible()
    await expect(page.getByText('Historical Rebalances')).toBeVisible()
  })
})

test.describe('DTF Auctions: Active Rebalances', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows empty state when no active rebalances', async ({ page }) => {
    // Mock rebalance has availableUntil 7 days ago → all historical
    await expect(
      page.getByText('No rebalances found').first()
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('DTF Auctions: Historical Rebalances', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('historical section renders without crash', async ({ page }) => {
    // The mock has 1 historical rebalance matched to the "Executed" proposal
    // via executionBlock === blockNumber ('19208345')
    // Section renders either rebalance items or "No rebalances found"
    const historicalHeader = page.getByText('Historical Rebalances')
    await expect(historicalHeader).toBeVisible({ timeout: 10000 })
  })
})

test.describe('DTF Auctions: Navigation', () => {
  test('navigating to auctions from overview works', async ({ page }) => {
    await page.goto(
      `/base/index-dtf/${TEST_DTFS.lcap.address}/overview`
    )
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })

    const nav = page.getByTestId('dtf-nav')
    await nav.getByRole('link', { name: /Auctions/ }).click()
    await expect(page).toHaveURL(/\/auctions/)

    await expect(page.getByTestId('dtf-auctions')).toBeVisible()
  })

  test('direct URL to auctions page loads', async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('Active Rebalances')).toBeVisible({
      timeout: 10000,
    })
  })
})
