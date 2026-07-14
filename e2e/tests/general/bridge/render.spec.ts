import { test, expect } from '../../../harness'

// Bridge is a STATIC link page (external bridge cards + copyable addresses) — no
// form/quote/network calls. Render + mobile, capture-free.
test.use({ wallet: false })

test('bridge: static page renders @smoke @mobile', async ({ harness }) => {
  const page = harness.page
  await page.goto('/bridge')
  await expect(page.getByTestId('bridge-page').first()).toBeVisible({ timeout: 12_000 })
})
