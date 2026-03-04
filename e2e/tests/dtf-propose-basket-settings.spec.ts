/**
 * E2E tests for Basket Settings proposal form.
 * Uses tradingGovernance — 2 sections: Governance and Roles.
 */
import { test, expect } from '../fixtures/wallet'
import {
  navigateToProposalForm,
  openSection,
  fillProposalTitle,
} from '../helpers/proposal-helpers'

// Helper: wait for form to fully initialize (updater populates fields)
async function waitForFormReady(page: import('@playwright/test').Page) {
  await expect(page.getByText('$LCAP').first()).toBeVisible({ timeout: 15000 })
  await page.waitForTimeout(1500)
}

test.describe('Basket Settings: Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToProposalForm(page, expect, 'basket-settings')
  })

  test('shows form header', async ({ page }) => {
    await expect(
      page.getByText('Basket settings proposal').first()
    ).toBeVisible()
    await expect(page.getByText('$LCAP').first()).toBeVisible()
  })

  test('shows 2 accordion sections', async ({ page }) => {
    const form = page.locator('.bg-secondary.rounded-4xl').first()
    await expect(form).toBeVisible({ timeout: 5000 })

    await expect(form.getByText('Governance').first()).toBeVisible()
    await expect(form.getByText('Roles').first()).toBeVisible()
  })

  test('confirm button disabled with no changes', async ({ page }) => {
    const confirmBtn = page.getByRole('button', {
      name: 'Confirm & prepare proposal',
    })
    await expect(confirmBtn).toBeVisible()
    await expect(confirmBtn).toBeDisabled()
  })

  test('cancel button navigates back to governance', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page).toHaveURL(/\/governance$/)
  })
})

test.describe('Basket Settings: Governance Section', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToProposalForm(page, expect, 'basket-settings')
    await waitForFormReady(page)
    await openSection(page, expect, 'governance')
  })

  test('shows all 5 governance parameter groups', async ({ page }) => {
    const section = page.locator('#propose-section-governance')

    await expect(section.getByText('Voting Delay').first()).toBeVisible({
      timeout: 5000,
    })
    await expect(section.getByText('Voting Period').first()).toBeVisible()
    await expect(
      section.getByText('Proposal Threshold').first()
    ).toBeVisible()
    await expect(section.getByText('Voting Quorum').first()).toBeVisible()
    await expect(section.getByText('Execution Delay').first()).toBeVisible()
  })

  test('each param shows toggle options', async ({ page }) => {
    const section = page.locator('#propose-section-governance')
    const radios = section.getByRole('radio')
    const count = await radios.count()
    // 5 params × 4 options each = 20 radios minimum
    expect(count).toBeGreaterThanOrEqual(20)
  })

  test('clicking toggle option enables confirm button', async ({ page }) => {
    const section = page.locator('#propose-section-governance')

    await section.getByRole('radio', { name: '3 days' }).first().click()

    const confirmBtn = page.getByRole('button', {
      name: 'Confirm & prepare proposal',
    })
    await expect(confirmBtn).toBeEnabled({ timeout: 10000 })
  })
})

test.describe('Basket Settings: Roles Section', () => {
  test('shows guardian field when opened', async ({ page }) => {
    await navigateToProposalForm(page, expect, 'basket-settings')
    await openSection(page, expect, 'roles')

    const section = page.locator('#propose-section-roles')
    await expect(section.getByText('Guardian').first()).toBeVisible({
      timeout: 5000,
    })
  })
})

test.describe('Basket Settings: Full Flow', () => {
  test('complete basket settings proposal flow', async ({ page }) => {
    await navigateToProposalForm(page, expect, 'basket-settings')
    await waitForFormReady(page)

    // 1. Open Governance and change a param
    await openSection(page, expect, 'governance')
    const section = page.locator('#propose-section-governance')
    await section.getByRole('radio', { name: '3 days' }).first().click()

    // 2. Verify sidebar shows change
    await expect(
      page.getByText('Proposed changes').first()
    ).toBeVisible({ timeout: 10000 })

    // 3. Click confirm
    const confirmBtn = page.getByRole('button', {
      name: 'Confirm & prepare proposal',
    })
    await expect(confirmBtn).toBeEnabled({ timeout: 10000 })
    await confirmBtn.click()

    // 4. Fill title
    await expect(page.locator('#title')).toBeVisible({ timeout: 5000 })
    await fillProposalTitle(page, 'E2E Test: Update basket voting period')

    // 5. Wait for submit to be enabled and click
    const submitBtn = page.getByRole('button', {
      name: 'Submit proposal onchain',
    })
    await expect(submitBtn).toBeEnabled({ timeout: 10000 })
    await submitBtn.click()

    // 6. Verify success
    await expect(page.getByText('Proposal created').first()).toBeVisible({
      timeout: 15000,
    })
  })
})
