import { test, expect } from '../../../harness'

// Portfolio disconnected state: no wallet → the connect prompt. Capture-free
// (disconnected needs no portfolio data). Desktop + mobile. Previously
// zero-coverage general route.
test.use({ wallet: false })

test('portfolio: disconnected shows the connect prompt @smoke @mobile', async ({ harness }) => {
  const page = harness.page
  await page.goto('/portfolio')
  await expect(page.getByTestId('portfolio-connect-prompt')).toBeVisible({ timeout: 12_000 })
})
