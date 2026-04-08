import { expect, test } from '../fixtures/base'
import { DTF, dtfUrl } from '../helpers/test-data'

const ISSUANCE_URL = dtfUrl(DTF.lcap, 'issuance')

test.describe('Index DTF issuance', () => {
  test('renders the issuance page with zapper', async ({ page }) => {
    await page.goto(ISSUANCE_URL, { waitUntil: 'domcontentloaded' })

    await expect(page.getByTestId('dtf-issuance')).toBeVisible()
  })

  test('shows link to manual minting', async ({ page }) => {
    await page.goto(ISSUANCE_URL, { waitUntil: 'domcontentloaded' })

    await expect(
      page.getByText(/Having issues\? Switch to manual/)
    ).toBeVisible()
  })

  test('navigates to issuance from overview', async ({ page }) => {
    await page.goto(dtfUrl(DTF.lcap, 'overview'))
    await expect(page.getByTestId('dtf-nav')).toBeVisible()

    await page
      .getByTestId('dtf-nav')
      .getByRole('link', { name: 'Mint + Redeem' })
      .click()

    await expect(page).toHaveURL(/\/issuance$/)
    await expect(page.getByTestId('dtf-issuance')).toBeVisible()
  })
})
