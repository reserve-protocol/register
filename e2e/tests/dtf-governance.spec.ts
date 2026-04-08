import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures/base'
import { TEST_DTFS } from '../helpers/test-data'

const DTF_URL = `/base/index-dtf/${TEST_DTFS.lcap.address}`
const GOVERNANCE_URL = `${DTF_URL}/governance`

async function gotoGovernance(page: Page) {
  await page.goto(GOVERNANCE_URL, { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByRole('heading', { name: 'Recent proposals' })
  ).toBeVisible()
}

test.describe('Index DTF governance list', () => {
  test('renders the governance shell with proposal list and sidebar stats', async ({
    page,
  }) => {
    await gotoGovernance(page)

    await expect(page.getByTestId('dtf-governance')).toBeVisible()
    await expect(page.getByTestId('governance-proposals')).toBeVisible()
    await expect(page.getByText('Voting Addresses').first()).toBeVisible()
    await expect(page.getByText('Vote Supply').first()).toBeVisible()
  })

  test('shows mocked proposals in newest-first order with mixed states', async ({
    page,
  }) => {
    await gotoGovernance(page)

    const proposals = page.getByTestId('governance-proposals')
    const proposalLinks = proposals.locator('a[href*="/proposal/"]')

    await expect(proposalLinks).toHaveCount(5)
    await expect(proposalLinks.first()).toContainText('Update basket allocation')
    await expect(proposals.getByText('Active').first()).toBeVisible()
    await expect(proposals.getByText('Executed').first()).toBeVisible()
    await expect(proposals.getByText('Defeated').first()).toBeVisible()
    await expect(proposals.getByText('Succeeded').first()).toBeVisible()
    await expect(proposals.getByText('Queued').first()).toBeVisible()
  })

  test('opens proposal details from the list', async ({ page }) => {
    await gotoGovernance(page)

    await page
      .getByRole('link', { name: /Update basket allocation/i })
      .first()
      .click()

    await expect(page).toHaveURL(/\/governance\/proposal\//)
    await expect(
      page.getByRole('heading', { name: /Update basket allocation/i })
    ).toBeVisible()
  })

  test('navigates from overview into governance through the product nav', async ({
    page,
  }) => {
    await page.goto(`${DTF_URL}/overview`)
    await expect(page.getByTestId('dtf-nav')).toBeVisible()

    await page
      .getByTestId('dtf-nav')
      .getByRole('link', { name: 'Governance' })
      .click()

    await expect(page).toHaveURL(/\/governance$/)
    await expect(
      page.getByRole('heading', { name: 'Recent proposals' })
    ).toBeVisible()
  })
})
