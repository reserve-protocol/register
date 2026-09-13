import {
  test,
  expect,
  currentSelect,
  currentCapture,
  realTarget,
} from './current-rebalance-helpers'

for (const theme of ['light', 'dark'])
  for (const width of [1400, 900, 390, 320]) {
    test(`rebalance header compact provenance ${theme} ${width}`, async ({
      page,
      txLog,
    }, info) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(
        '/internal/design-system/components/table?current=repeat#auctions-browse-review'
      )
      await page.evaluate(() => document.fonts.ready)
      const current = page.getByTestId('current-rebalance-workspace')
      const trigger = current.getByTestId('current-inspect')
      const expiry = current.getByTestId('current-expiry')
      await expect(expiry).toBeVisible()
      const geometry = await current.evaluate((el) => {
        const expiry = el
          .querySelector('[data-testid="current-expiry"]')!
          .getBoundingClientRect()
        const metadata = el.querySelector(
          '[data-testid="current-header-metadata"]'
        )
        const heading = el.querySelector('h3')!.getBoundingClientRect()
        return {
          belongsToMetadata: !!metadata?.querySelector(
            '[data-testid="current-expiry"]'
          ),
          belowTitle: expiry.top >= heading.bottom,
          clockCount: metadata?.querySelectorAll('svg').length ?? -1,
          expiryLeft: el
            .querySelector('[data-testid="current-expiry"]')!
            .parentElement!.getBoundingClientRect().left,
          metadataLeft: metadata?.getBoundingClientRect().left,
          overflow: el.scrollWidth - el.clientWidth,
        }
      })
      expect(geometry.belongsToMetadata).toBe(true)
      expect(geometry.belowTitle).toBe(true)
      expect(geometry.clockCount).toBe(0)
      if (width <= 390) expect(geometry.expiryLeft).toBe(geometry.metadataLeft)
      expect(geometry.overflow).toBeLessThanOrEqual(1)
      await expect(trigger).toHaveCSS('font-size', '14px')
      await expect(expiry.locator('..')).toHaveCSS('font-size', '14px')
      await expect(expiry).toHaveCSS('font-weight', '300')
      await realTarget(trigger)
      await trigger.hover()
      await expect(trigger).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await currentCapture(page, current, info, `header-${theme}-${width}`)
      await trigger.click()
      const panel = page.getByTestId('current-rebalance-information')
      await expect(panel).toBeVisible()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(trigger.locator('svg')).toHaveCSS(
        'transform',
        'matrix(-1, 0, 0, -1, 0, 0)'
      )
      await expect(panel.getByRole('link')).toHaveCount(2)
      const bounds = await panel.boundingBox()
      expect(bounds!.x).toBeGreaterThanOrEqual(8)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width - 8)
      await currentCapture(page, current, info, `header-${theme}-${width}-open`)
      await page.keyboard.press('Escape')
      await expect(panel).toBeHidden()
      await expect(trigger).toBeFocused()
      await page.keyboard.press('Space')
      await expect(panel).toBeVisible()
      await expect(panel).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(panel.getByRole('link').first()).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(panel).toBeHidden()
      await expect(trigger).toBeFocused()
      await currentSelect(page, 'scene', 'expired')
      await expect(current.getByTestId('current-expiry')).toHaveCount(0)
      await expect(current.locator('header')).toContainText('Ended')
      await trigger.click()
      await expect(panel).toContainText('Available until')
      await expect(panel).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(panel).toBeHidden()
      expect(txLog).toHaveLength(0)
    })
  }
