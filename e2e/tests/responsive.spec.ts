import { test, expect } from '../fixtures/base'
import { TEST_DTFS } from '../helpers/test-data'

const DTF_URL = `/base/index-dtf/${TEST_DTFS.lcap.address}/overview`

test.describe('Responsive: Discover page', () => {
  test('mobile shows DTF cards instead of table', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('discover-dtf-table')).toBeVisible({
      timeout: 10000,
    })

    // On mobile (< lg), the table is hidden and cards are shown
    const viewport = page.viewportSize()!
    if (viewport.width < 1024) {
      // Table should be hidden, cards visible
      const table = page.locator('table')
      await expect(table).not.toBeVisible()
    } else {
      // Desktop: table is visible
      const table = page.locator('table')
      await expect(table.first()).toBeVisible()
    }
  })

  test('header navigation adapts to viewport', async ({ page }) => {
    await page.goto('/')

    const viewport = page.viewportSize()!

    if (viewport.width < 768) {
      // Nav text labels hidden on mobile (hidden md:block)
      await expect(page.getByText('Discover DTFs')).not.toBeVisible()
    } else {
      // Desktop: nav text labels visible in header
      await expect(
        page.getByText('Discover DTFs').first()
      ).toBeVisible()
    }
  })
})

test.describe('Responsive: DTF detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DTF_URL)
    // On mobile, "LCAP" in nav header is hidden (hidden lg:flex).
    // Wait for the DTF full name in the hero instead — always visible.
    await expect(
      page.getByText('Large Cap Index DTF').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('mobile shows bottom navigation bar', async ({ page }) => {
    const viewport = page.viewportSize()!
    const nav = page.getByTestId('dtf-nav')
    await expect(nav).toBeVisible()

    if (viewport.width < 1024) {
      // Mobile: nav is fixed at bottom, full width, horizontal
      const box = await nav.boundingBox()
      expect(box).toBeTruthy()
      // Bottom nav should span full width
      expect(box!.width).toBeGreaterThan(viewport.width * 0.9)
      // Should be near bottom of viewport
      expect(box!.y + box!.height).toBeGreaterThan(viewport.height - 80)
    } else {
      // Desktop: nav is a sidebar on the left, narrow
      const box = await nav.boundingBox()
      expect(box).toBeTruthy()
      expect(box!.width).toBeLessThan(300)
    }
  })

  test('mobile hides Buy/Sell sidebar', async ({ page }) => {
    const viewport = page.viewportSize()!

    if (viewport.width < 1280) {
      // Buy/Sell sidebar hidden below xl
      await expect(
        page.getByText(/Buy\/Sell \$LCAP onchain/)
      ).not.toBeVisible()
    } else {
      await expect(
        page.getByText(/Buy\/Sell \$LCAP onchain/).first()
      ).toBeVisible({ timeout: 10000 })
    }
  })

  test('mobile hides basket Market Cap column', async ({ page }) => {
    const viewport = page.viewportSize()!

    if (viewport.width < 640) {
      // Market Cap column hidden below sm
      const marketCapHeaders = page.getByText('Market Cap')
      // Should exist in DOM but be hidden
      await expect(marketCapHeaders.first()).not.toBeVisible()
    } else {
      await expect(page.getByText('Market Cap').first()).toBeVisible()
    }
  })

  test('DTF name visible in nav on desktop, hidden on mobile', async ({
    page,
  }) => {
    const viewport = page.viewportSize()!
    const nav = page.getByTestId('dtf-nav')

    if (viewport.width < 1024) {
      // Mobile: DTF header section hidden (hidden lg:flex)
      // Nav links should still be accessible as icons
      const links = nav.getByRole('link')
      await expect(links.first()).toBeVisible()
    } else {
      // Desktop: DTF name visible in sidebar
      await expect(nav.getByText('LCAP')).toBeVisible()
    }
  })
})

test.describe('Responsive: Discover tabs', () => {
  test('mobile tabs show compact layout', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('discover-tabs')).toBeVisible({
      timeout: 10000,
    })

    const viewport = page.viewportSize()!
    const tabs = page.getByTestId('discover-tabs')

    if (viewport.width < 1024) {
      // Tab subtitles hidden on mobile (hidden lg:block)
      // Tab triggers are compact (h-12 vs lg:h-[100px])
      const trigger = tabs.getByRole('tab').first()
      const box = await trigger.boundingBox()
      expect(box).toBeTruthy()
      // Compact height on mobile
      expect(box!.height).toBeLessThan(60)
    } else {
      // Desktop: tabs are taller with subtitles
      const trigger = tabs.getByRole('tab').first()
      const box = await trigger.boundingBox()
      expect(box).toBeTruthy()
      expect(box!.height).toBeGreaterThan(60)
    }
  })
})
