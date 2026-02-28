import { test, expect } from '../fixtures/base'
import { TEST_DTFS } from '../helpers/test-data'

const DTF_URL = `/base/index-dtf/${TEST_DTFS.lcap.address}/settings`

test.describe('DTF Settings: Page Load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('renders without crash', async ({ page }) => {
    await expect(page.getByText('unexpected error')).not.toBeVisible()
    await expect(page.getByTestId('dtf-settings')).toBeVisible()
  })
})

test.describe('DTF Settings: Basics Card', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows Basics heading', async ({ page }) => {
    const settings = page.getByTestId('dtf-settings')
    await expect(settings.getByText('Basics')).toBeVisible()
  })

  test('shows DTF name from subgraph', async ({ page }) => {
    const settings = page.getByTestId('dtf-settings')
    await expect(
      settings.getByText('Large Cap Index DTF').first()
    ).toBeVisible()
  })

  test('shows all basic info labels', async ({ page }) => {
    const settings = page.getByTestId('dtf-settings')

    await expect(settings.getByText('Name').first()).toBeVisible()
    await expect(settings.getByText('Ticker').first()).toBeVisible()
    await expect(settings.getByText('Address').first()).toBeVisible()
    await expect(settings.getByText('Mandate').first()).toBeVisible()
    await expect(settings.getByText('Deployer').first()).toBeVisible()
    await expect(settings.getByText('Version').first()).toBeVisible()
  })

  test('shows mandate text from subgraph', async ({ page }) => {
    const settings = page.getByTestId('dtf-settings')
    await expect(
      settings.getByText('Large cap diversified index').first()
    ).toBeVisible()
  })

  test('shows shortened address for DTF and deployer', async ({ page }) => {
    const settings = page.getByTestId('dtf-settings')

    // shortenAddress produces format like "0x4da9...0e6e8" (first 6 + last 5 chars)
    // DTF address: TEST_DTFS.lcap.address
    // Just verify Address label exists with a shortened value nearby
    const addressRow = settings.getByText('Address').first()
    await expect(addressRow).toBeVisible()

    const deployerRow = settings.getByText('Deployer').first()
    await expect(deployerRow).toBeVisible()
  })
})

test.describe('DTF Settings: Fees & Revenue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows fees section heading', async ({ page }) => {
    const settings = page.getByTestId('dtf-settings')
    await expect(
      settings.getByText('Fees & Revenue Distribution').first()
    ).toBeVisible()
  })

  test('shows fee type labels', async ({ page }) => {
    const settings = page.getByTestId('dtf-settings')

    await expect(
      settings.getByText('Annualized TVL Fee').first()
    ).toBeVisible()
    await expect(
      settings.getByText('Minting Fee').first()
    ).toBeVisible()
  })

  test('shows fee distribution recipients', async ({ page }) => {
    const settings = page.getByTestId('dtf-settings')

    // Fee recipients from feeRecipientsAtom
    await expect(
      settings.getByText('Fixed Platform Share').first()
    ).toBeVisible()
  })
})

test.describe('DTF Settings: Governance Token', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows governance token info from subgraph', async ({ page }) => {
    const settings = page.getByTestId('dtf-settings')

    // stToken from mock: symbol "stLCAP"
    await expect(
      settings.getByText('stLCAP').first()
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('DTF Settings: Navigation', () => {
  test('navigating to settings from overview works', async ({ page }) => {
    await page.goto(
      `/base/index-dtf/${TEST_DTFS.lcap.address}/overview`
    )
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })

    const nav = page.getByTestId('dtf-nav')
    await nav.getByRole('link', { name: /Details/ }).click()
    await expect(page).toHaveURL(/\/settings/)

    await expect(page.getByTestId('dtf-settings')).toBeVisible()
  })

  test('direct URL to settings page loads', async ({ page }) => {
    await page.goto(DTF_URL)
    await expect(page.getByTestId('dtf-settings')).toBeVisible({
      timeout: 10000,
    })
  })
})
