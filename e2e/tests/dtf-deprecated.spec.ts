import { expect, test } from '../fixtures/base'
import { DTF, dtfUrl } from '../helpers/test-data'

const OVERVIEW_URL = dtfUrl(DTF.deprecated_base, 'overview')

test.describe('Deprecated Index DTF', () => {
  test('renders overview page with navigation', async ({ page }) => {
    await page.goto(OVERVIEW_URL, { waitUntil: 'domcontentloaded' })

    await expect(page.getByTestId('dtf-nav')).toBeVisible()
    // DTF symbol should still appear
    await expect(page.getByText('VTF').first()).toBeVisible()
  })

  test('disables governance and auctions nav items', async ({ page }) => {
    await page.goto(OVERVIEW_URL, { waitUntil: 'domcontentloaded' })

    const nav = page.getByTestId('dtf-nav')

    // Overview and Mint + Redeem should be enabled (rendered as <a> links)
    await expect(nav.getByRole('link', { name: 'Overview' })).toBeVisible()
    await expect(
      nav.getByRole('link', { name: 'Mint + Redeem' })
    ).toBeVisible()

    // Governance and Auctions should NOT be rendered as links
    // They are rendered as disabled spans/divs, so getByRole('link') should find 0
    await expect(
      nav.getByRole('link', { name: 'Governance' })
    ).toHaveCount(0)
    await expect(
      nav.getByRole('link', { name: 'Auctions' })
    ).toHaveCount(0)

    // But the text should still be visible (just not clickable)
    await expect(nav.getByText('Governance').first()).toBeVisible()
    await expect(nav.getByText('Auctions').first()).toBeVisible()

    // Details + Roles should still work
    await expect(
      nav.getByRole('link', { name: 'Details + Roles' })
    ).toBeVisible()
  })

  test('can still navigate to settings on deprecated DTF', async ({
    page,
  }) => {
    await page.goto(OVERVIEW_URL, { waitUntil: 'domcontentloaded' })

    await page
      .getByTestId('dtf-nav')
      .getByRole('link', { name: 'Details + Roles' })
      .click()

    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.getByTestId('dtf-settings')).toBeVisible()
  })

  test('can navigate to issuance on deprecated DTF', async ({ page }) => {
    await page.goto(OVERVIEW_URL, { waitUntil: 'domcontentloaded' })

    await page
      .getByTestId('dtf-nav')
      .getByRole('link', { name: 'Mint + Redeem' })
      .click()

    await expect(page).toHaveURL(/\/issuance$/)
    await expect(page.getByTestId('dtf-issuance')).toBeVisible()
  })
})
