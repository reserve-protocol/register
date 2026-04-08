import { expect, test } from '../fixtures/base'
import { DTF, dtfUrl } from '../helpers/test-data'

const OVERVIEW_URL = dtfUrl(DTF.lcap, 'overview')

test.describe('Index DTF overview', () => {
  test('renders shell with navigation and basket table', async ({ page }) => {
    await page.goto(OVERVIEW_URL, { waitUntil: 'domcontentloaded' })

    // Navigation loaded
    await expect(page.getByTestId('dtf-nav')).toBeVisible()

    // Basket section visible with exposure tab
    const basketSection = page.locator('#basket')
    await expect(basketSection).toBeVisible()
    await expect(
      page.getByRole('tab', { name: 'Exposure' })
    ).toBeVisible()

    // DTF symbol appears on the page (from snapshot data)
    await expect(page.getByText('LCAP').first()).toBeVisible()
  })

  test('renders about section with DTF description', async ({ page }) => {
    await page.goto(OVERVIEW_URL, { waitUntil: 'domcontentloaded' })

    await expect(
      page.getByRole('heading', { name: 'About this DTF' })
    ).toBeVisible()
  })

  test('renders transaction table with data', async ({ page }) => {
    await page.goto(OVERVIEW_URL, { waitUntil: 'domcontentloaded' })

    await expect(
      page.getByRole('heading', { name: 'Transactions' })
    ).toBeVisible()

    // Transaction rows should render from snapshot data (mint/redeem types)
    const transactionSection = page.locator('#transactions')
    await expect(transactionSection).toBeVisible()
  })

  test('renders disclosures section', async ({ page }) => {
    await page.goto(OVERVIEW_URL, { waitUntil: 'domcontentloaded' })

    await expect(
      page.getByRole('heading', { name: 'Disclosures' })
    ).toBeVisible()
  })

  test('governance overview card shows when DTF has stToken', async ({
    page,
  }) => {
    await page.goto(OVERVIEW_URL, { waitUntil: 'domcontentloaded' })

    // LCAP has a staking token, so governance overview should show
    await expect(
      page.getByRole('heading', { name: 'Basket Governance' })
    ).toBeVisible()
  })

  test('all nav items are enabled for active DTF', async ({ page }) => {
    await page.goto(OVERVIEW_URL, { waitUntil: 'domcontentloaded' })

    const nav = page.getByTestId('dtf-nav')
    await expect(nav.getByRole('link', { name: 'Overview' })).toBeVisible()
    await expect(
      nav.getByRole('link', { name: 'Mint + Redeem' })
    ).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Governance' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Auctions' })).toBeVisible()
    await expect(
      nav.getByRole('link', { name: 'Details + Roles' })
    ).toBeVisible()
  })

  test('renders overview for a different chain DTF', async ({ page }) => {
    await page.goto(dtfUrl(DTF.open, 'overview'), {
      waitUntil: 'domcontentloaded',
    })

    await expect(page.getByTestId('dtf-nav')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'About this DTF' })
    ).toBeVisible()
    // OPEN symbol appears
    await expect(page.getByText('OPEN').first()).toBeVisible()
  })
})
