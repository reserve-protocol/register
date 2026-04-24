import { expect, test } from '../fixtures/base'
import { DTF, dtfUrl } from '../helpers/test-data'

const SETTINGS_URL = dtfUrl(DTF.lcap, 'settings')

test.describe('Index DTF settings', () => {
  test('renders all main info sections', async ({ page }) => {
    await page.goto(SETTINGS_URL, { waitUntil: 'domcontentloaded' })

    await expect(page.getByTestId('dtf-settings')).toBeVisible()

    // Basics section
    await expect(page.getByText('Name').first()).toBeVisible()
    await expect(page.getByText('Ticker').first()).toBeVisible()

    // Fees section
    await expect(
      page.getByText('Fees & Revenue Distribution').first()
    ).toBeVisible()
  })

  test('renders governance configuration sections', async ({ page }) => {
    await page.goto(SETTINGS_URL, { waitUntil: 'domcontentloaded' })

    // Governance sections — LCAP has basket + non-basket governance
    await expect(
      page.getByText('Basket Governance').first()
    ).toBeVisible()

    // Governance params visible
    await expect(page.getByText('Voting Delay').first()).toBeVisible()
    await expect(page.getByText('Voting Period').first()).toBeVisible()
  })

  test('renders roles section', async ({ page }) => {
    await page.goto(SETTINGS_URL, { waitUntil: 'domcontentloaded' })

    await expect(page.getByText('Roles').first()).toBeVisible()
  })

  test('navigates to settings from overview via nav', async ({ page }) => {
    await page.goto(dtfUrl(DTF.lcap, 'overview'), {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByTestId('dtf-nav')).toBeVisible()

    await page
      .getByTestId('dtf-nav')
      .getByRole('link', { name: 'Details + Roles' })
      .click()

    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.getByTestId('dtf-settings')).toBeVisible()
  })
})
