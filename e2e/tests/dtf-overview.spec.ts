import { test, expect } from '../fixtures/base'
import { TEST_DTFS } from '../helpers/test-data'

const DTF_URL = `/base/index-dtf/${TEST_DTFS.lcap.address}/overview`

test.describe('DTF Overview: Page Load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('renders without error and nav is visible', async ({ page }) => {
    await expect(page.getByText('unexpected error')).not.toBeVisible()
    await expect(page.getByTestId('dtf-nav')).toBeVisible()
  })

  test('shows DTF name from subgraph mock', async ({ page }) => {
    await expect(
      page.getByText('Large Cap Index DTF').first()
    ).toBeVisible()
  })

  test('shows DTF price from API mock', async ({ page }) => {
    await expect(page.getByText('$1.25').first()).toBeVisible()
  })

  test('shows creator brand from folio-manager mock', async ({ page }) => {
    await expect(
      page.getByText('Reserve Protocol').first()
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('DTF Overview: Navigation Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows all nav tabs', async ({ page }) => {
    const nav = page.getByTestId('dtf-nav')
    await expect(nav.getByRole('link', { name: /Overview/ })).toBeVisible()
    await expect(nav.getByRole('link', { name: /Mint/ })).toBeVisible()
    await expect(nav.getByRole('link', { name: /Governance/ })).toBeVisible()
    await expect(nav.getByRole('link', { name: /Auctions/ })).toBeVisible()
    await expect(nav.getByRole('link', { name: /Details/ })).toBeVisible()
  })

  test('clicking tabs updates URL and clicking back works', async ({
    page,
  }) => {
    const nav = page.getByTestId('dtf-nav')

    await nav.getByRole('link', { name: /Governance/ }).click()
    await expect(page).toHaveURL(/\/governance/)

    await nav.getByRole('link', { name: /Auctions/ }).click()
    await expect(page).toHaveURL(/\/auctions/)

    await nav.getByRole('link', { name: /Details/ }).click()
    await expect(page).toHaveURL(/\/settings/)

    await nav.getByRole('link', { name: /Overview/ }).click()
    await expect(page).toHaveURL(/\/overview/)
  })

  test('Overview tab is highlighted on initial load', async ({ page }) => {
    const nav = page.getByTestId('dtf-nav')
    const overviewLink = nav.getByRole('link', { name: /Overview/ })
    // Active link should have a distinguishing style (aria-current or specific class)
    await expect(overviewLink).toHaveAttribute('aria-current', 'page')
  })
})

test.describe('DTF Overview: About Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows about heading and brand description', async ({ page }) => {
    await expect(page.getByText('About this DTF')).toBeVisible({
      timeout: 10000,
    })
    await expect(
      page
        .getByText(
          /diversified large cap index tracking the top crypto assets/
        )
        .first()
    ).toBeVisible()
  })
})

test.describe('DTF Overview: Basket Composition', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows basket table with Exposure and Collateral tabs', async ({
    page,
  }) => {
    await expect(page.getByText('Exposure').first()).toBeVisible()
    await expect(page.getByText('Collateral').first()).toBeVisible()
  })

  test('shows Weight column header', async ({ page }) => {
    await expect(page.getByText('Weight').first()).toBeVisible()
  })

  test('basket table renders with sortable Weight column', async ({
    page,
  }) => {
    // Basket overview has sortable columns (Weight, Performance)
    // Weight column header should be clickable
    const weightButton = page.getByRole('button', { name: /Weight/ }).first()
    await expect(weightButton).toBeVisible({ timeout: 10000 })
  })
})

test.describe('DTF Overview: Governance Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows governance section when stToken exists', async ({ page }) => {
    // Mock DTF has stToken defined → governance section renders
    await expect(
      page.getByText('Basket Governance').first()
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('DTF Overview: Transaction History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows Transactions heading', async ({ page }) => {
    const txHeader = page.getByText('Transactions')
    await txHeader.scrollIntoViewIfNeeded()
    await expect(txHeader).toBeVisible({ timeout: 10000 })
  })

  test('shows Mint and Redeem transaction types from mock', async ({
    page,
  }) => {
    const txHeader = page.getByText('Transactions')
    await txHeader.scrollIntoViewIfNeeded()

    // 2 mints and 1 redeem from subgraph mock
    await expect(page.getByText('Mint').first()).toBeVisible()
    await expect(page.getByText('Redeem').first()).toBeVisible()
  })

  test('transaction table has column headers', async ({ page }) => {
    const txHeader = page.getByText('Transactions')
    await txHeader.scrollIntoViewIfNeeded()

    await expect(page.getByText('Type').first()).toBeVisible()
    await expect(page.getByText('Amount').first()).toBeVisible()
  })
})

test.describe('DTF Overview: Buy/Sell Sidebar', () => {
  test('shows Buy/Sell call-to-action with DTF symbol', async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })

    await expect(
      page.getByText(/Buy\/Sell \$LCAP onchain/).first()
    ).toBeVisible({ timeout: 10000 })
  })
})
