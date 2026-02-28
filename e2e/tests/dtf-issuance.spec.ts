import { test, expect } from '../fixtures/wallet'
import { TEST_DTFS } from '../helpers/test-data'

const ISSUANCE_URL = `/base/index-dtf/${TEST_DTFS.lcap.address}/issuance`
const MANUAL_URL = `/base/index-dtf/${TEST_DTFS.lcap.address}/issuance/manual`

test.describe('DTF Issuance: Page Load', () => {
  test('renders without crash', async ({ page }) => {
    await page.goto(ISSUANCE_URL)
    await expect(page.getByText('unexpected error')).not.toBeVisible()
    await expect(page.getByTestId('dtf-nav')).toBeVisible()
  })

  test('navigation to issuance from overview works', async ({ page }) => {
    await page.goto(
      `/base/index-dtf/${TEST_DTFS.lcap.address}/overview`
    )
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })

    const nav = page.getByTestId('dtf-nav')
    await nav.getByRole('link', { name: /Mint/ }).click()
    await expect(page).toHaveURL(/\/issuance/)
  })

  test('direct URL to issuance page loads', async ({ page }) => {
    await page.goto(ISSUANCE_URL)
    await expect(page.getByTestId('dtf-nav')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('DTF Manual Issuance: Mint Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(MANUAL_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows mint form with amount input', async ({ page }) => {
    await expect(page.getByText('Mint Amount:').first()).toBeVisible()
    await expect(
      page.locator('input[placeholder="0"]').first()
    ).toBeVisible()
  })

  test('shows required approvals section', async ({ page }) => {
    await expect(
      page.getByText('Required Approvals').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('shows link back to zap minting', async ({ page }) => {
    await expect(
      page.getByText(/Having issues minting/).first()
    ).toBeVisible()
  })
})

test.describe('DTF Manual Issuance: Mode Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(MANUAL_URL)
    await expect(page.getByText('LCAP').first()).toBeVisible({ timeout: 10000 })
  })

  test('defaults to mint (buy) mode', async ({ page }) => {
    await expect(page.getByText('Mint Amount:').first()).toBeVisible()
  })

  test('can switch to redeem (sell) mode', async ({ page }) => {
    await page.getByRole('radio', { name: /sell/i }).click()

    await expect(page.getByText('Redeem Amount:').first()).toBeVisible()
    await expect(
      page.getByText('You will receive').first()
    ).toBeVisible()
  })

  test('can switch back to mint after redeem', async ({ page }) => {
    // Switch to redeem
    await page.getByRole('radio', { name: /sell/i }).click()
    await expect(page.getByText('Redeem Amount:').first()).toBeVisible()

    // Switch back to mint
    await page.getByRole('radio', { name: /buy/i }).click()
    await expect(page.getByText('Mint Amount:').first()).toBeVisible()
  })
})
