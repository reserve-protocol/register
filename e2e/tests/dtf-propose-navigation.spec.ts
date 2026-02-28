/**
 * E2E tests for governance proposal type selection and navigation.
 * Covers the proposal creation entry point and routing to each form type.
 */
import { test, expect } from '../fixtures/base'
import { TEST_DTFS } from '../helpers/test-data'
import { BASE_URL, navigateToPropose } from '../helpers/proposal-helpers'

const GOV_URL = `/base/index-dtf/${TEST_DTFS.lcap.address}/governance`

test.describe('Propose: Type Selection & Navigation', () => {
  test('shows "Create proposal" button on governance page', async ({
    page,
  }) => {
    await page.goto(GOV_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })

    const proposals = page.getByTestId('governance-proposals')
    await expect(proposals.getByText('Create proposal')).toBeVisible()
  })

  test('clicking "Create proposal" navigates to type selection', async ({
    page,
  }) => {
    await page.goto(GOV_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })

    const proposals = page.getByTestId('governance-proposals')
    await proposals.getByText('Create proposal').click()

    await expect(page).toHaveURL(/\/propose$/)
    await expect(
      page.getByText('Select proposal type').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('shows all 4 proposal types', async ({ page }) => {
    await navigateToPropose(page, expect)

    await expect(page.getByText('DTF Basket').first()).toBeVisible()
    await expect(page.getByText('DTF Settings').first()).toBeVisible()
    await expect(page.getByText('Basket settings').first()).toBeVisible()
    await expect(page.getByText('DAO').first()).toBeVisible()
  })

  test('"DTF Basket" navigates to basket form', async ({ page }) => {
    await navigateToPropose(page, expect)
    await page.getByText('DTF Basket').first().click()

    await expect(page).toHaveURL(/\/propose\/basket$/)
    await expect(
      page.getByText('Basket change proposal').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('"DTF Settings" navigates to dtf settings form', async ({ page }) => {
    await navigateToPropose(page, expect)
    await page.getByText('DTF Settings').first().click()

    await expect(page).toHaveURL(/\/propose\/dtf$/)
    await expect(
      page.getByText('DTF settings proposal').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('"Basket settings" navigates to basket settings form', async ({
    page,
  }) => {
    await navigateToPropose(page, expect)
    await page.getByText('Basket settings').first().click()

    await expect(page).toHaveURL(/\/propose\/basket-settings$/)
    await expect(
      page.getByText('Basket settings proposal').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('"DAO" navigates to dao settings form', async ({ page }) => {
    await navigateToPropose(page, expect)
    await page.getByText('DAO').first().click()

    await expect(page).toHaveURL(/\/propose\/other$/)
    await expect(
      page.getByText('DAO settings proposal').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('back button returns to governance page', async ({ page }) => {
    await navigateToPropose(page, expect)

    // Back arrow link goes to governance
    const backLink = page.locator('a[href*="governance"]').first()
    await backLink.click()

    await expect(page).toHaveURL(/\/governance$/)
  })
})
