import type { Page, Expect } from '@playwright/test'
import { TEST_DTFS } from './test-data'

const DTF_ADDRESS = TEST_DTFS.lcap.address
const BASE_URL = `/base/index-dtf/${DTF_ADDRESS}/governance`

/** Navigate to proposal type selection page */
export async function navigateToPropose(page: Page, expect: Expect) {
  await page.goto(`${BASE_URL}/propose`)
  await expect(
    page.getByText('Select proposal type').first()
  ).toBeVisible({ timeout: 10000 })
}

/** Navigate directly to a proposal form and wait for DTF data to load */
export async function navigateToProposalForm(
  page: Page,
  expect: Expect,
  type: 'basket' | 'dtf' | 'basket-settings' | 'other'
) {
  await page.goto(`${BASE_URL}/propose/${type}`)
  // Wait for DTF data — forms depend on indexDTFAtom being populated
  await expect(page.getByText('$LCAP').first()).toBeVisible({ timeout: 15000 })
}

/** Fill the proposal title in the description form */
export async function fillProposalTitle(page: Page, title: string) {
  await page.locator('#title').fill(title)
}

/**
 * Open an accordion section by its ID.
 * Uses the `#propose-section-{id}` locator to avoid matching sidebar nav links.
 *
 * Section IDs per form:
 * - DTF Settings: mandate, roles, fees, auction, tokens, governance
 * - Basket Settings: governance, roles
 * - DAO Settings: revenue-tokens, governance, roles
 * - Basket: basket
 */
export async function openSection(
  page: Page,
  expect: Expect,
  sectionId: string
) {
  const item = page.locator(`#propose-section-${sectionId}`)
  await expect(item).toBeVisible({ timeout: 5000 })
  // Click the accordion trigger button within the item
  await item.locator('button').first().click()
}

export { DTF_ADDRESS, BASE_URL }
