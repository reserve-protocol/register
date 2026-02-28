/**
 * E2E tests for Basket proposal form (rendering focus).
 * Full basket change flow requires extensive price/token mock data,
 * so we focus on form rendering and navigation.
 */
import { test, expect } from '../fixtures/wallet'
import { navigateToProposalForm } from '../helpers/proposal-helpers'

test.describe('Basket Proposal: Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToProposalForm(page, expect, 'basket')
  })

  test('shows form header', async ({ page }) => {
    await expect(
      page.getByText('Basket change proposal').first()
    ).toBeVisible()
    await expect(page.getByText('$LCAP').first()).toBeVisible()
  })

  test('shows overview sidebar with timeline', async ({ page }) => {
    await expect(
      page.getByText('Configure proposal').first()
    ).toBeVisible({ timeout: 5000 })
    await expect(
      page.getByText('Finalize basket proposal').first()
    ).toBeVisible()
    await expect(
      page.getByText('Review & describe your proposal').first()
    ).toBeVisible()
    await expect(
      page.getByText('Voting delay begins').first()
    ).toBeVisible()
  })

  test('shows basket composition section', async ({ page }) => {
    await expect(
      page.getByText('Set basket composition').first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('cancel button navigates back to governance', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page).toHaveURL(/\/governance$/)
  })
})
