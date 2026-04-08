import { expect, test } from '../fixtures/base'
import { DTF, dtfUrl } from '../helpers/test-data'

test.describe('Index DTF navigation', () => {
  test('navigates between all tabs', async ({ page }) => {
    await page.goto(dtfUrl(DTF.lcap, 'overview'), {
      waitUntil: 'domcontentloaded',
    })
    const nav = page.getByTestId('dtf-nav')
    await expect(nav).toBeVisible()

    // Overview → Governance
    await nav.getByRole('link', { name: 'Governance' }).click()
    await expect(page).toHaveURL(/\/governance$/)

    // Governance → Mint + Redeem
    await nav.getByRole('link', { name: 'Mint + Redeem' }).click()
    await expect(page).toHaveURL(/\/issuance$/)

    // Mint + Redeem → Auctions
    await nav.getByRole('link', { name: 'Auctions' }).click()
    await expect(page).toHaveURL(/\/auctions$/)

    // Auctions → Details + Roles
    await nav.getByRole('link', { name: 'Details + Roles' }).click()
    await expect(page).toHaveURL(/\/settings$/)

    // Details + Roles → Overview
    await nav.getByRole('link', { name: 'Overview' }).click()
    await expect(page).toHaveURL(/\/overview$/)
  })

  test('navigates correctly across chains', async ({ page }) => {
    // Base DTF
    await page.goto(dtfUrl(DTF.lcap, 'overview'), {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByTestId('dtf-nav')).toBeVisible()

    // Mainnet DTF
    await page.goto(dtfUrl(DTF.open, 'overview'), {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByTestId('dtf-nav')).toBeVisible()
  })
})
