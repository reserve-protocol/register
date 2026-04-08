import { expect, test } from '../fixtures/base'
import { MOCK_PROPOSALS } from '../helpers/subgraph-mocks'
import { TEST_DTFS } from '../helpers/test-data'

const DTF_URL = `/base/index-dtf/${TEST_DTFS.lcap.address}`

const proposalUrl = (index: number) =>
  `${DTF_URL}/governance/proposal/${MOCK_PROPOSALS[index].id}`

async function gotoProposal(
  page: import('@playwright/test').Page,
  index: number
) {
  await page.goto(proposalUrl(index), { waitUntil: 'domcontentloaded' })
}

test.describe('Index DTF governance proposal detail', () => {
  test('renders active proposal metadata and live vote stats', async ({
    page,
  }) => {
    await gotoProposal(page, 0)

    await expect(
      page.getByRole('heading', { name: /Update basket allocation/i })
    ).toBeVisible()
    await expect(page.getByText('Proposed by').first()).toBeVisible()
    await expect(page.getByText('Proposed on').first()).toBeVisible()
    await expect(page.getByText('Current votes')).toBeVisible()
    await expect(page.getByText('Quorum')).toBeVisible()
    await expect(page.getByText('Majority support')).toBeVisible()
    await expect(page.getByText('For').first()).toBeVisible()
    await expect(page.getByText('Against').first()).toBeVisible()
    await expect(page.getByText('Abstain').first()).toBeVisible()
  })

  test('renders executed proposal history and explorer action', async ({
    page,
  }) => {
    await gotoProposal(page, 1)

    await expect(
      page.getByRole('heading', { name: /Reduce minting fee/i })
    ).toBeVisible()
    await expect(page.getByText('Final votes')).toBeVisible()
    await expect(page.getByText('View execute tx')).toBeVisible()
    await expect(page.getByText('Vote on-chain')).not.toBeVisible()
  })

  test('renders queued proposal timeline state', async ({ page }) => {
    await gotoProposal(page, 4)

    await expect(
      page.getByRole('heading', { name: /Lower auction delay/i })
    ).toBeVisible()
    await expect(page.getByText('Queued').first()).toBeVisible()
    await expect(page.getByText('Final votes')).toBeVisible()
  })

  test('returns to the governance list from proposal detail', async ({
    page,
  }) => {
    await gotoProposal(page, 0)
    await expect(
      page.getByRole('heading', { name: /Update basket allocation/i })
    ).toBeVisible()

    await page.locator('a[href$="/governance"]').first().click()

    await expect(page).toHaveURL(/\/governance$/)
    await expect(
      page.getByRole('heading', { name: 'Recent proposals' })
    ).toBeVisible()
  })
})
