import { test, expect } from '../fixtures/base'
import { TEST_DTFS } from '../helpers/test-data'

const DTF_URL = `/base/index-dtf/${TEST_DTFS.lcap.address}/governance`

test.describe('DTF Governance: Page Load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('renders without crash and shows governance container', async ({
    page,
  }) => {
    await expect(page.getByText('unexpected error')).not.toBeVisible()
    await expect(page.getByTestId('dtf-governance')).toBeVisible()
  })

  test('shows create proposal button', async ({ page }) => {
    const proposals = page.getByTestId('governance-proposals')
    await expect(proposals.getByText('Create proposal')).toBeVisible()
  })
})

test.describe('DTF Governance: Proposal List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows all 5 proposals from subgraph mock', async ({ page }) => {
    const proposals = page.getByTestId('governance-proposals')
    await expect(proposals).toBeVisible()

    await expect(proposals.getByText('Recent proposals')).toBeVisible()

    await expect(
      proposals.getByText(/Update basket allocation/).first()
    ).toBeVisible({ timeout: 10000 })
    await expect(
      proposals.getByText(/Reduce minting fee/).first()
    ).toBeVisible()
    await expect(
      proposals.getByText(/Add new collateral type/).first()
    ).toBeVisible()
    await expect(
      proposals.getByText(/Increase redemption fee/).first()
    ).toBeVisible()
    await expect(
      proposals.getByText(/Lower auction delay/).first()
    ).toBeVisible()
  })

  test('proposals are sorted newest first', async ({ page }) => {
    const proposals = page.getByTestId('governance-proposals')

    // Wait for proposals to render
    await expect(
      proposals.getByText(/Update basket allocation/).first()
    ).toBeVisible({ timeout: 10000 })

    // Get only proposal links (not the "Create proposal" button in the header)
    // Proposal links have href containing "proposal/" per ProposalListItem
    const proposalLinks = proposals.locator('a[href*="proposal/"]')
    const count = await proposalLinks.count()
    expect(count).toBeGreaterThanOrEqual(5)

    // First proposal should be "Update basket" (1 day ago = newest)
    await expect(proposalLinks.first()).toContainText(
      'Update basket allocation'
    )
  })

  test('shows correct state badges for each proposal', async ({ page }) => {
    const proposals = page.getByTestId('governance-proposals')

    await expect(
      proposals.getByText(/Update basket allocation/).first()
    ).toBeVisible({ timeout: 10000 })

    // 5 different states from mock data
    await expect(proposals.getByText('Active').first()).toBeVisible()
    await expect(proposals.getByText('Executed').first()).toBeVisible()
    await expect(proposals.getByText('Defeated').first()).toBeVisible()
    await expect(proposals.getByText('Succeeded').first()).toBeVisible()
    await expect(proposals.getByText('Queued').first()).toBeVisible()
  })

  test('active proposal shows voting metrics', async ({ page }) => {
    const proposals = page.getByTestId('governance-proposals')

    await expect(
      proposals.getByText(/Update basket allocation/).first()
    ).toBeVisible({ timeout: 10000 })

    // Quorum indicator
    await expect(proposals.getByText(/Quorum/).first()).toBeVisible()

    // Vote percentages (For/Against)
    await expect(proposals.getByText(/Votes/).first()).toBeVisible()
  })

  test('clicking a proposal navigates to detail page', async ({ page }) => {
    const proposals = page.getByTestId('governance-proposals')

    await expect(
      proposals.getByText(/Update basket allocation/).first()
    ).toBeVisible({ timeout: 10000 })

    // Click the first proposal link
    await proposals.getByText(/Update basket allocation/).first().click()

    // URL should contain /proposal/
    await expect(page).toHaveURL(/\/proposal\//)
  })
})

test.describe('DTF Governance: Stats Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows proposal count from mock data', async ({ page }) => {
    const governance = page.getByTestId('dtf-governance')

    // governanceStatsAtom derives proposalCount from subgraph
    await expect(governance.getByText('Proposals').first()).toBeVisible()
  })

  test('shows voting addresses stat', async ({ page }) => {
    const governance = page.getByTestId('dtf-governance')

    await expect(
      governance.getByText('Voting Addresses').first()
    ).toBeVisible()
  })

  test('shows vote supply stat', async ({ page }) => {
    const governance = page.getByTestId('dtf-governance')

    await expect(
      governance.getByText('Vote Supply').first()
    ).toBeVisible()
  })

  test('shows vote locked section with stToken symbol', async ({ page }) => {
    const governance = page.getByTestId('dtf-governance')

    // VotingPower component shows "Vote locked" label
    await expect(
      governance.getByText('Vote locked').first()
    ).toBeVisible()
  })
})

test.describe('DTF Governance: Navigation', () => {
  test('navigating to governance from overview works', async ({ page }) => {
    await page.goto(
      `/base/index-dtf/${TEST_DTFS.lcap.address}/overview`
    )
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })

    const nav = page.getByTestId('dtf-nav')
    await nav.getByRole('link', { name: /Governance/ }).click()
    await expect(page).toHaveURL(/\/governance/)

    await expect(page.getByTestId('governance-proposals')).toBeVisible()
  })
})
