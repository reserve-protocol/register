import { expect, test } from '../fixtures/base'
import { DTF, dtfUrl } from '../helpers/test-data'

const AUCTIONS_URL = dtfUrl(DTF.lcap, 'auctions')

test.describe('Index DTF auctions', () => {
  test('renders the auctions page', async ({ page }) => {
    await page.goto(AUCTIONS_URL, { waitUntil: 'domcontentloaded' })

    await expect(page.getByTestId('dtf-auctions')).toBeVisible()
  })

  test('navigates to auctions from overview', async ({ page }) => {
    await page.goto(dtfUrl(DTF.lcap, 'overview'))
    await expect(page.getByTestId('dtf-nav')).toBeVisible()

    await page
      .getByTestId('dtf-nav')
      .getByRole('link', { name: 'Auctions' })
      .click()

    await expect(page).toHaveURL(/\/auctions$/)
    await expect(page.getByTestId('dtf-auctions')).toBeVisible()
  })
})
