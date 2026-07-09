import { expect, test } from '../../fixtures/base'

// Sanity: the app boots fully offline. The base fixture fails this test at
// teardown if any `[E2E] unmocked` call occurred (see fixtures/base.ts), so a
// green run proves home loads without touching a live boundary.
test('home renders the app shell offline @smoke', async ({ page }) => {
  await page.goto('/')

  // App shell mounted — not a white screen. The header is always present.
  await expect(page.getByTestId('header-connect-btn')).toBeVisible()

  // Body has real content, not a crashed/empty root.
  await expect(page.locator('body')).not.toBeEmpty()
})
