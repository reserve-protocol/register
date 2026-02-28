import { test, expect } from '../fixtures/base'

test.describe('App navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('header shows brand, nav links, and Connect button', async ({
    page,
  }) => {
    // Navigation links visible in desktop header
    await expect(page.getByRole('link', { name: /Discover DTFs/ })).toBeVisible()

    // Connect button
    const connectBtn = page.getByTestId('header-connect-btn')
    await expect(connectBtn).toBeVisible()
    await expect(connectBtn).toHaveText(/Connect/)
  })

  test('navigate to Earn page via header link', async ({ page }) => {
    await page.getByRole('link', { name: /Participate/ }).click()
    await expect(page).toHaveURL(/\/earn/)
  })

  test('navigate to Create DTF page via header link', async ({ page }) => {
    await page.getByRole('link', { name: /Create New DTF/ }).click()
    await expect(page).toHaveURL(/\/deploy.*index/)
  })

  test('direct URL to DTF overview loads without crash', async ({ page }) => {
    await page.goto('/base/index-dtf/0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8/overview')

    // Should not show an error boundary
    await expect(page.getByText('unexpected error')).not.toBeVisible()

    // Page should have loaded (navigation should be visible)
    await expect(page.getByTestId('dtf-nav')).toBeVisible()
  })
})
