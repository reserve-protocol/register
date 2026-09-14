import {
  test,
  expect,
  currentSelect,
  currentCapture,
} from './current-rebalance-helpers'

for (const theme of ['light', 'dark']) {
  for (const width of [1400, 900, 390, 320]) {
    test(`auction purpose and review controls ${theme} ${width}`, async ({
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
      const simulation = current.getByText('Lab simulation controls', {
        exact: true,
      })
      expect(await simulation.evaluate((el) => !!el.closest('article'))).toBe(
        false
      )
      await expect(current.getByTestId('current-auction-heading')).toHaveText(
        'Auction 2 · Precision rebalancing'
      )
      await expect(current.getByTestId('current-auction-status')).toContainText(
        'Anyone can launch in'
      )
      await expect(current.getByTestId('current-launch')).toBeEnabled()
      if (width === 390) {
        const clock = await current
          .getByTestId('current-permissionless-time')
          .boundingBox()
        const pill = await current
          .getByTestId('current-auction-status')
          .getByTestId('lifecycle-status-pill')
          .boundingBox()
        expect(
          Math.abs(clock!.y + clock!.height / 2 - pill!.y - pill!.height / 2)
        ).toBeLessThanOrEqual(1)
      }
      await expect(
        current.getByTestId('current-progress').locator('h4')
      ).toHaveCSS('font-size', '14px')
      const help = current
        .getByTestId('current-target-label')
        .getByRole('button')
      await help.focus()
      await page.keyboard.press('Enter')
      await expect(page.getByRole('tooltip')).toContainText(
        'not a guaranteed result'
      )
      await page.keyboard.press('Escape')
      const targetPair = await help.evaluate((el) => {
        const fact = el.closest('dt')!.parentElement!
        return Math.abs(
          fact.querySelector('dt')!.getBoundingClientRect().top -
            fact.querySelector('dd')!.getBoundingClientRect().top
        )
      })
      expect(targetPair).toBeLessThanOrEqual(1)
      await currentCapture(
        page,
        current,
        info,
        `clarity-${theme}-${width}-repeat`
      )
      await currentSelect(page, 'viewer', 'member')
      await expect(current.getByTestId('current-launch')).toBeDisabled()
      await simulation.click()
      await current.getByTestId('current-advance-phase').click()
      await expect(
        current.getByTestId('current-permissionless-time')
      ).toHaveCount(0)
      await expect(current.getByTestId('current-launch')).toBeEnabled()
      await currentSelect(page, 'scene', 'remove')
      await expect(current.getByTestId('current-auction-heading')).toHaveText(
        'Auction 1 · Token removal'
      )
      await currentSelect(page, 'scene', 'progressing')
      await expect(current.getByTestId('current-auction-heading')).toHaveText(
        'Auction 2 · Progressive rebalancing'
      )
      await currentSelect(page, 'data', 'pending')
      await expect(current.getByTestId('current-auction-heading')).toHaveText(
        'Auction 2'
      )
      await expect(current.getByTestId('current-launch')).toBeDisabled()
      expect(
        await current.evaluate((el) => el.scrollWidth - el.clientWidth)
      ).toBeLessThanOrEqual(1)
      expect(txLog).toHaveLength(0)
    })
  }
}
