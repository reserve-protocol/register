import {
  test,
  expect,
  currentSelect,
  currentCapture,
  realTarget,
} from './current-rebalance-helpers'

for (const theme of ['light', 'dark'])
  for (const width of [1400, 900, 390, 320]) {
    test(`current rebalance section boundaries ${theme} ${width}`, async ({
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
      const current = page.getByTestId('current-rebalance-workspace')
      const auction = current.getByTestId('current-auction')
      const progress = current.getByTestId('current-progress')
      const toggle = auction.getByTestId('current-liquidity-toggle')
      await expect(toggle).toBeVisible()
      await expect
        .soft(current.getByTestId('current-context-divider'))
        .toHaveCount(1)
      await expect
        .soft(current.getByTestId('current-progress-divider'))
        .toHaveCount(1)
      expect.soft((await toggle.boundingBox())!.width).toBeLessThanOrEqual(300)
      await expect(toggle).toHaveCSS('font-size', '14px')
      await expect(progress.locator('h4')).toHaveCSS('font-size', '16px')
      await expect(auction.getByTestId('current-liquidity-count')).toBeVisible()
      await expect(current.getByTestId('current-assets')).not.toContainText(
        'liquidity'
      )
      const boundaries = async () =>
        current.evaluate((el) => {
          const rect = (id: string) =>
            el.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect()
          const context = rect('current-context-divider')
          const auction = rect('current-auction')
          const divider = rect('current-progress-divider')
          const progress = rect('current-progress')
          return {
            contextGap: auction.top - context.bottom,
            workingGap: divider.top - auction.bottom,
            progressGap: progress.top - divider.bottom,
            axis: Math.abs(divider.x - auction.x),
            width: Math.abs(divider.width - auction.width),
            overflow: el.scrollWidth - el.clientWidth,
          }
        })
      expect(await boundaries()).toMatchObject({
        contextGap: 24,
        workingGap: 24,
        progressGap: 24,
        axis: 0,
        width: 0,
        overflow: 0,
      })
      await currentCapture(page, current, info, `sections-${theme}-${width}`)
      await realTarget(toggle)
      await toggle.focus()
      await page.keyboard.press('Enter')
      await expect(toggle).toHaveAttribute('aria-expanded', 'true')
      await expect(
        auction.getByTestId('current-liquidity-summary')
      ).toBeVisible()
      const summary = auction.getByTestId('current-liquidity-summary')
      expect(
        await summary.evaluate((el) => {
          const label = el.querySelector('dt')!.getBoundingClientRect()
          const value = el.querySelector('dd')!.getBoundingClientRect()
          return value.left - label.right
        })
      ).toBe(8)
      await expect(summary.locator('dt')).toHaveCSS('font-size', '14px')
      await expect(summary.locator('dd')).toHaveCSS('font-size', '14px')
      await expect(auction.getByTestId('current-liquidity-table')).toHaveCount(
        2
      )
      const sizes = await auction.evaluate((el) => ({
        content: el.getBoundingClientRect().width,
        table: el
          .querySelector('[data-testid="current-liquidity-table"]')!
          .getBoundingClientRect().width,
      }))
      expect(Math.abs(sizes.content - sizes.table)).toBeLessThanOrEqual(1)
      await currentCapture(
        page,
        toggle,
        info,
        `sections-${theme}-${width}-expanded`
      )
      await currentCapture(
        page,
        progress,
        info,
        `sections-${theme}-${width}-progress`
      )
      await toggle.focus()
      await page.keyboard.press('Space')
      await expect(toggle).toHaveAttribute('aria-expanded', 'false')
      await expect(toggle).toBeFocused()
      await expect(
        auction.getByTestId('current-liquidity-summary')
      ).toBeHidden()
      await currentSelect(page, 'scene', 'live')
      await expect(auction.getByTestId('current-activity')).toBeVisible()
      const timer = auction.getByTestId('current-end-time').locator('../..')
      await expect(timer).toHaveCSS('column-gap', '8px')
      expect((await boundaries()).workingGap).toBe(24)
      await currentCapture(
        page,
        current,
        info,
        `sections-${theme}-${width}-live`
      )
      await currentSelect(page, 'scene', 'expired')
      await expect(current.getByTestId('current-context-divider')).toBeVisible()
      await expect(current.getByTestId('current-progress-divider')).toHaveCount(
        0
      )
      expect(txLog).toHaveLength(0)
    })
  }
