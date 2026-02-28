import { test, expect } from '../fixtures/base'

test.describe('Earn: Navigation', () => {
  test('earn page renders with navigation tabs', async ({ page }) => {
    await page.goto('/earn/index-dtf')

    // All 3 nav tabs visible
    await expect(
      page.getByText('Index DTF Governance').first()
    ).toBeVisible({ timeout: 10000 })
    await expect(
      page.getByText('Yield DTF Staking').first()
    ).toBeVisible()
    await expect(page.getByText('DeFi Yield').first()).toBeVisible()
  })

  test('navigate between earn tabs updates content', async ({ page }) => {
    await page.goto('/earn/index-dtf')

    // Verify Index DTF page renders
    await expect(
      page.getByText('Vote-Lock on Index DTFs').first()
    ).toBeVisible({ timeout: 10000 })

    // Click Yield DTF tab
    await page.getByText('Yield DTF Staking').first().click()
    await expect(page).toHaveURL(/\/earn\/yield-dtf/)
    await expect(
      page.getByText('Stake RSR on Yield DTFs').first()
    ).toBeVisible({ timeout: 10000 })

    // Click DeFi Yield tab
    await page.getByText('DeFi Yield').first().click()
    await expect(page).toHaveURL(/\/earn\/defi/)
    await expect(
      page.getByText('Provide liquidity across DeFi').first()
    ).toBeVisible({ timeout: 10000 })

    // Click back to Index DTF
    await page.getByText('Index DTF Governance').first().click()
    await expect(page).toHaveURL(/\/earn\/index-dtf/)
    await expect(
      page.getByText('Vote-Lock on Index DTFs').first()
    ).toBeVisible()
  })

  test('direct URL to each earn sub-route loads', async ({ page }) => {
    // Index DTF
    await page.goto('/earn/index-dtf')
    await expect(
      page.getByText('Vote-Lock on Index DTFs').first()
    ).toBeVisible({ timeout: 10000 })

    // Yield DTF
    await page.goto('/earn/yield-dtf')
    await expect(
      page.getByText('Stake RSR on Yield DTFs').first()
    ).toBeVisible({ timeout: 10000 })

    // DeFi
    await page.goto('/earn/defi')
    await expect(
      page.getByText('Provide liquidity across DeFi').first()
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Earn: Index DTF Governance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/earn/index-dtf')
    await expect(
      page.getByText('Vote-Lock on Index DTFs').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('header shows benefits on desktop', async ({ page }) => {
    const viewport = page.viewportSize()!
    if (viewport.width >= 768) {
      await expect(
        page.getByText('No Slashing Risk').first()
      ).toBeVisible()
      await expect(
        page.getByText('7-day unlock delays').first()
      ).toBeVisible()
      await expect(
        page.getByText('Payouts in DTF').first()
      ).toBeVisible()
    }
  })

  test('vote lock table renders with position data', async ({ page }) => {
    // Wait for data to load — mock has 2 positions (LCAP, CLX)
    await expect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText('CLX').first()).toBeVisible()

    // Table headers
    await expect(page.getByText('Gov. Token').first()).toBeVisible()
    await expect(page.getByText('Avg. 30d%').first()).toBeVisible()
  })

  test('vote lock positions show TVL and APR data', async ({ page }) => {
    await expect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })

    // LCAP TVL: $3,125,000
    await expect(page.getByText('$3,125,000').first()).toBeVisible()

    // LCAP APR: 8.42%
    await expect(page.getByText('8.42%').first()).toBeVisible()

    // CLX APR: 5.67%
    await expect(page.getByText('5.67%').first()).toBeVisible()
  })

  test('vote lock positions show governs column', async ({ page }) => {
    await expect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })

    // Governs column header
    await expect(page.getByText('Governs').first()).toBeVisible()
  })

  test('FAQ accordion renders with vote lock questions', async ({
    page,
  }) => {
    const faqTitle = page.getByText(
      'Vote Lock Frequently Asked Questions'
    )
    await faqTitle.scrollIntoViewIfNeeded()
    await expect(faqTitle).toBeVisible()

    // First FAQ is open by default (defaultValue="item-1")
    await expect(
      page.getByText('What is vote-locking?').first()
    ).toBeVisible()
    await expect(
      page
        .getByText(/locking an ERC20 token for a set period/)
        .first()
    ).toBeVisible()

    // Click second FAQ
    await page
      .getByText('Do I need to vote on proposals to earn rewards?')
      .first()
      .click()
    await expect(
      page
        .getByText(/You earn rewards as long as your ERC2O tokens/)
        .first()
    ).toBeVisible()
  })
})

test.describe('Earn: Yield DTF Staking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/earn/yield-dtf')
    await expect(
      page.getByText('Stake RSR on Yield DTFs').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('header shows staking benefits', async ({ page }) => {
    await expect(
      page.getByText('Slashing Risk').first()
    ).toBeVisible()
    await expect(
      page.getByText('14-day unlock delays').first()
    ).toBeVisible()
    await expect(
      page.getByText('Payouts in RSR').first()
    ).toBeVisible()
  })

  test('FAQ accordion renders with staking questions', async ({
    page,
  }) => {
    const faqTitle = page.getByText(
      'Staking Frequently Asked Questions'
    )
    await faqTitle.scrollIntoViewIfNeeded()
    await expect(faqTitle).toBeVisible()

    // First FAQ open by default
    await expect(
      page.getByText('What is staking?').first()
    ).toBeVisible()
    await expect(
      page
        .getByText(
          /depositing RSR into a Yield DTF to provide first-loss capital/
        )
        .first()
    ).toBeVisible()
  })

  test('table shows loading skeleton or empty state', async ({
    page,
  }) => {
    // Subgraph returns empty tokens for yield DTFs → table shows loading/empty
    // Verify the table container renders without crash
    await expect(page.getByText('Gov. Token').first()).toBeVisible({
      timeout: 10000,
    })
  })
})

test.describe('Earn: DeFi Yield', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/earn/defi')
    await expect(
      page.getByText('Provide liquidity across DeFi').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('heading and info tooltip render', async ({ page }) => {
    await expect(
      page
        .getByText(
          /DeFi yield opportunities for DTFs in Aerodrome, Convex/
        )
        .first()
    ).toBeVisible()

    await expect(
      page.getByText('How are APYs so high?').first()
    ).toBeVisible()
  })

  test('page renders without crash when pools are empty', async ({
    page,
  }) => {
    // With no pool data, featured pools should show skeletons and
    // main table should render
    // Just verify no crash — page loads and content is visible
    await expect(
      page.getByText('Provide liquidity across DeFi').first()
    ).toBeVisible()
  })
})
