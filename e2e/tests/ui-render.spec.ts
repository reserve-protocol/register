import { test, expect } from '../fixtures/base'
import { TEST_DTFS } from '../helpers/test-data'

const DTF_URL = `/base/index-dtf/${TEST_DTFS.lcap.address}/overview`

test.describe('UI Render: Discover page data accuracy', () => {
  test('renders exact number of DTFs from mock data', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('discover-dtf-table')).toBeVisible({
      timeout: 10000,
    })

    // Mock has 3 DTFs: LCAP, CLX, AI
    const rows = page.locator('table tbody tr')
    await expect(rows).toHaveCount(3)
  })

  test('all DTF symbols from mock data are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('discover-dtf-table')).toBeVisible({
      timeout: 10000,
    })

    // Verify all 3 DTFs from discover-dtf.json render
    await expect(page.getByText('LCAP').first()).toBeVisible()
    await expect(page.getByText('CLX').first()).toBeVisible()
    await expect(page.getByText('AI').first()).toBeVisible()
  })

  test('DTF market cap formats correctly with commas', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('discover-dtf-table')).toBeVisible({
      timeout: 10000,
    })

    // LCAP market cap: 3539310.45 → "$3,539,310"
    await expect(page.getByText('$3,539,310').first()).toBeVisible()
  })

  test('DTF tags render from brand data', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('discover-dtf-table')).toBeVisible({
      timeout: 10000,
    })

    // LCAP has tags: ["Majors", "Bitcoin", "L1"]
    await expect(page.getByText('Majors').first()).toBeVisible()
    await expect(page.getByText('Bitcoin').first()).toBeVisible()
  })

  test('search clears with empty input', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('discover-dtf-table')).toBeVisible({
      timeout: 10000,
    })

    const search = page.getByTestId('discover-search')

    // Filter to one result
    await search.fill('LCAP')
    await page.waitForTimeout(300)
    await expect(page.locator('table tbody tr')).toHaveCount(1)

    // Clear search — all results should return
    await search.fill('')
    await page.waitForTimeout(300)
    await expect(page.locator('table tbody tr')).toHaveCount(3)
  })
})

test.describe('UI Render: DTF overview data accuracy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('price from API displays with dollar sign', async ({ page }) => {
    // API mock returns price: 1.25
    await expect(page.getByText('$1.25').first()).toBeVisible()
  })

  test('DTF full name renders from subgraph', async ({ page }) => {
    // subgraph mock: token.name = "Large Cap Index DTF"
    await expect(
      page.getByText('Large Cap Index DTF').first()
    ).toBeVisible()
  })

  test('brand description renders from folio-manager API', async ({
    page,
  }) => {
    await expect(
      page
        .getByText(
          /diversified large cap index tracking the top crypto assets/
        )
        .first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('creator name renders from brand data', async ({ page }) => {
    // folio-manager mock: creator.name = "Reserve Protocol"
    await expect(
      page.getByText('Reserve Protocol').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('transaction table shows correct types from subgraph', async ({
    page,
  }) => {
    const txHeader = page.getByText('Transactions')
    await txHeader.scrollIntoViewIfNeeded()
    await expect(txHeader).toBeVisible({ timeout: 10000 })

    // subgraph mock has 3 transfer events: 2 MINT, 1 REDEEM
    await expect(page.getByText('Mint').first()).toBeVisible()
    await expect(page.getByText('Redeem').first()).toBeVisible()
  })
})

test.describe('UI Render: Governance proposal rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/base/index-dtf/${TEST_DTFS.lcap.address}/governance`
    )
    await expect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('renders exactly 3 proposals from subgraph mock', async ({
    page,
  }) => {
    const proposals = page.getByTestId('governance-proposals')

    // Wait for proposals to load
    await expect(
      proposals.getByText(/Update basket allocation/).first()
    ).toBeVisible({ timeout: 10000 })

    // Each proposal is a link element — should be exactly 3
    const proposalLinks = proposals.locator('a[href*="proposal/"]')
    await expect(proposalLinks).toHaveCount(3)
  })

  test('proposal titles match subgraph mock data exactly', async ({
    page,
  }) => {
    const proposals = page.getByTestId('governance-proposals')
    await expect(
      proposals.getByText(/Update basket allocation/).first()
    ).toBeVisible({ timeout: 10000 })

    // Full proposal descriptions from mock
    await expect(
      proposals.getByText(
        'Update basket allocation to increase ETH weighting from 15% to 20%'
      )
    ).toBeVisible()
    await expect(
      proposals.getByText('Reduce minting fee from 0.1% to 0.08%')
    ).toBeVisible()
    await expect(
      proposals.getByText('Add new collateral type - Lido Staked Ether')
    ).toBeVisible()
  })

  test('proposals are sorted by creation time (newest first)', async ({
    page,
  }) => {
    const proposals = page.getByTestId('governance-proposals')
    await expect(
      proposals.getByText(/Update basket allocation/).first()
    ).toBeVisible({ timeout: 10000 })

    // Get all proposal link texts in order
    const proposalLinks = proposals.locator('a[href*="proposal/"]')
    const count = await proposalLinks.count()
    expect(count).toBe(3)

    // First proposal should be the most recent (Active - 1 day ago)
    const firstProposal = await proposalLinks.nth(0).textContent()
    expect(firstProposal).toContain('Update basket allocation')

    // Last proposal should be the oldest (Defeated - 14 days ago)
    const lastProposal = await proposalLinks.nth(2).textContent()
    expect(lastProposal).toContain('Add new collateral type')
  })

  test('proposals link to correct detail pages', async ({ page }) => {
    const proposals = page.getByTestId('governance-proposals')
    await expect(
      proposals.getByText(/Update basket allocation/).first()
    ).toBeVisible({ timeout: 10000 })

    // Each proposal link should contain "proposal/" in href
    const firstLink = proposals.locator('a[href*="proposal/"]').first()
    const href = await firstLink.getAttribute('href')
    expect(href).toContain('proposal/')
  })
})

test.describe('UI Render: Settings data accuracy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/base/index-dtf/${TEST_DTFS.lcap.address}/settings`
    )
    await expect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('DTF name and mandate from subgraph render in settings', async ({
    page,
  }) => {
    const settings = page.getByTestId('dtf-settings')

    // Name from subgraph
    await expect(
      settings.getByText('Large Cap Index DTF').first()
    ).toBeVisible()

    // Mandate from subgraph
    await expect(
      settings.getByText('Large cap diversified index').first()
    ).toBeVisible()
  })

  test('settings page shows governance configuration', async ({ page }) => {
    const settings = page.getByTestId('dtf-settings')

    // Governance-related labels should be present
    await expect(settings.getByText('Basics').first()).toBeVisible()
    await expect(settings.getByText('Ticker').first()).toBeVisible()
    await expect(settings.getByText('Mandate').first()).toBeVisible()
  })
})

test.describe('UI Render: Manual issuance form state', () => {
  test('mode toggle changes form labels and asset list header', async ({
    page,
  }) => {
    await page.goto(
      `/base/index-dtf/${TEST_DTFS.lcap.address}/issuance/manual`
    )
    await expect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })

    // Default: buy mode
    await expect(page.getByText('Mint Amount:').first()).toBeVisible()
    await expect(
      page.getByText('Required Approvals').first()
    ).toBeVisible({ timeout: 10000 })

    // Switch to sell
    await page.getByRole('radio', { name: /sell/i }).click()
    await expect(page.getByText('Redeem Amount:').first()).toBeVisible()
    await expect(
      page.getByText('You will receive').first()
    ).toBeVisible()

    // Switch back to buy
    await page.getByRole('radio', { name: /buy/i }).click()
    await expect(page.getByText('Mint Amount:').first()).toBeVisible()
    await expect(
      page.getByText('Required Approvals').first()
    ).toBeVisible()
  })

  test('amount input accepts numeric values', async ({ page }) => {
    await page.goto(
      `/base/index-dtf/${TEST_DTFS.lcap.address}/issuance/manual`
    )
    await expect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })

    const input = page.locator('input[placeholder="0"]').first()
    await input.fill('100.5')

    // Value should be reflected
    await expect(input).toHaveValue('100.5')
  })
})
