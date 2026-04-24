import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures/base'
import { DTF, dtfUrl } from '../helpers/test-data'

const GOVERNANCE_URL = dtfUrl(DTF.lcap, 'governance')

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

  test('renders proposals with vote stats', async ({ page }) => {
    await gotoGovernance(page)

    const proposalList = page.getByTestId('governance-proposals')
    const proposalLinks = proposalList.locator('a[href*="/proposal/"]')

    // At least one proposal renders with vote information
    await expect(proposalLinks.first()).toBeVisible()
    await expect(proposalList.getByText('Votes:').first()).toBeVisible()
  })

  test('opens proposal details from the list', async ({ page }) => {
    await gotoGovernance(page)

    const proposalList = page.getByTestId('governance-proposals')
    const firstLink = proposalList.locator('a[href*="/proposal/"]').first()
    await expect(firstLink).toBeVisible()
    await firstLink.click()

    await expect(page).toHaveURL(/\/governance\/proposal\//)
  })

  test('navigates from overview into governance through the product nav', async ({
    page,
  }) => {
    await page.goto(dtfUrl(DTF.lcap, 'overview'), {
      waitUntil: 'domcontentloaded',
    })
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
