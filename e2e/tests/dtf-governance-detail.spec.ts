import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures/base'
import { DTF, dtfUrl } from '../helpers/test-data'

const GOVERNANCE_URL = dtfUrl(DTF.lcap, 'governance')

// Navigate to governance list, wait for proposals, click one matching the state badge
async function gotoProposalByState(page: Page, state: string) {
  await page.goto(GOVERNANCE_URL, { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByRole('heading', { name: 'Recent proposals' })
  ).toBeVisible()

  const proposalList = page.getByTestId('governance-proposals')
  // Find a proposal link that contains the state badge text
  const matchingLink = proposalList
    .locator('a[href*="/proposal/"]')
    .filter({ hasText: new RegExp(`^.*${state}$`, 'i') })

  const count = await matchingLink.count()
  if (count === 0) return null

  await matchingLink.first().click()
  await expect(page).toHaveURL(/\/governance\/proposal\//)
  return true
}

// Navigate to first proposal regardless of state
async function gotoFirstProposal(page: Page) {
  await page.goto(GOVERNANCE_URL, { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByRole('heading', { name: 'Recent proposals' })
  ).toBeVisible()

  const proposalList = page.getByTestId('governance-proposals')
  const firstLink = proposalList.locator('a[href*="/proposal/"]').first()
  await expect(firstLink).toBeVisible()
  await firstLink.click()
  await expect(page).toHaveURL(/\/governance\/proposal\//)
}

test.describe('Index DTF governance proposal detail', () => {
  test('renders proposal metadata and vote stats', async ({ page }) => {
    await gotoFirstProposal(page)

    await expect(page.getByText('Proposed by').first()).toBeVisible()
    await expect(page.getByText('Proposed on').first()).toBeVisible()
    await expect(page.getByText(/Current votes|Final votes/)).toBeVisible()
    await expect(page.getByText('Quorum')).toBeVisible()
    await expect(page.getByText('Majority support')).toBeVisible()
    await expect(page.getByText('For').first()).toBeVisible()
    await expect(page.getByText('Against').first()).toBeVisible()
    await expect(page.getByText('Abstain').first()).toBeVisible()
  })

  test('executed proposal shows final votes', async ({ page }) => {
    const found = await gotoProposalByState(page, 'Executed')
    test.skip(!found, 'No executed proposal in current snapshot')

    await expect(page.getByText('Final votes')).toBeVisible()
  })

  test('defeated proposal shows final votes', async ({ page }) => {
    const found = await gotoProposalByState(page, 'Defeated')
    test.skip(!found, 'No defeated proposal in current snapshot')

    await expect(page.getByText('Final votes')).toBeVisible()
  })

  test('returns to the governance list from proposal detail', async ({
    page,
  }) => {
    await gotoFirstProposal(page)

    await page.locator('a[href$="/governance"]').first().click()

    await expect(page).toHaveURL(/\/governance$/)
    await expect(
      page.getByRole('heading', { name: 'Recent proposals' })
    ).toBeVisible()
  })
})
