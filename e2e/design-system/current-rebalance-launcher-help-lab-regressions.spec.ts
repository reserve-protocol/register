import { test, expect, currentCapture } from './current-rebalance-helpers'

const url =
  '/internal/design-system/components/table#auctions-current-table-review'
const explanation =
  'The auction launcher is the account authorized to start auctions during the restricted period.'

for (const width of [1400, 390, 320]) {
  for (const scenario of ['ready', 'hybrid-restricted']) {
    test.describe(`launcher help ${scenario} at ${width}px`, () => {
      test.use({ hasTouch: width < 1400 })
      test('explains restricted access without navigating the row', async ({
        page,
        txLog,
      }, info) => {
        await page.setViewportSize({ width, height: 900 })
        if (width === 320)
          await page.addInitScript(() =>
            localStorage.setItem('theme-ui-color-mode', 'dark')
          )
        await page.goto(url)
        const example = page.getByTestId('current-table-example').filter({
          has: page.locator(`[data-table-focus="details-all-${scenario}"]`),
        })
        const help = example
          .getByTestId('current-table-launcher-help')
          .filter({ visible: true })
        const button = help.getByRole('button')
        await expect(button).toHaveAccessibleName('Only launcher can start')
        const status = example
          .getByTestId('current-table-status')
          .filter({ visible: true })
        await expect(status).toHaveText(
          scenario === 'ready'
            ? 'Only launcher can start'
            : 'Confirm target weightsOnly launcher can start'
        )
        const helpText =
          scenario === 'ready'
            ? explanation
            : 'Community launch is not available for this rebalance'
        if (scenario === 'hybrid-restricted') {
          const summary = status.getByTestId('current-table-access-summary')
          await expect(summary).toHaveText('Only launcher can start')
          const geometry = await summary.evaluate((el) => ({
            height: el.getBoundingClientRect().height,
            lineHeight: parseFloat(getComputedStyle(el).lineHeight),
          }))
          expect(geometry.height).toBe(geometry.lineHeight)
        }
        await expect(
          page
            .getByTestId('current-table-launcher-help')
            .filter({ visible: true })
        ).toHaveCount(6)
        await currentCapture(
          page,
          example,
          info,
          `launcher-label-${scenario}-${width}`
        )
        if (width < 1400) await button.tap()
        else {
          await example
            .getByTestId('rebalance-proposer-link')
            .filter({ visible: true })
            .focus()
          await page.keyboard.press('Tab')
          await expect(button).toBeFocused()
        }
        await expect(page.getByRole('tooltip')).toHaveText(helpText)
        await expect(page.getByTestId('current-retained-detail')).toHaveCount(0)
        const name = `launcher-help-${scenario}-${width}`
        await info.attach(name, {
          body: await page.screenshot({
            animations: 'disabled',
            path: process.env.CURRENT_REBALANCE_CAPTURE_DIR
              ? `${process.env.CURRENT_REBALANCE_CAPTURE_DIR}/${name}.png`
              : info.outputPath(`${name}.png`),
          }),
          contentType: 'image/png',
        })
        await expect(page.getByRole('tooltip')).toHaveText(helpText)
        if (width < 1400) {
          await button.tap()
          await expect(page.getByRole('tooltip')).toHaveCount(0)
          await button.tap()
          await expect(page.getByRole('tooltip')).toHaveText(helpText)
        }
        await page.getByRole('tooltip').locator('..').click()
        await expect(page.getByTestId('current-retained-detail')).toHaveCount(0)
        await page.keyboard.press('Escape')
        await expect(page.getByRole('tooltip')).toHaveCount(0)
        if (width === 1400) {
          await button.focus()
          await page.setViewportSize({ width: 390, height: 900 })
          await expect(button).toBeFocused()
          await page.setViewportSize({ width, height: 900 })
          await expect(button).toBeFocused()
        }
        expect(
          await example.evaluate((el) => el.scrollWidth - el.clientWidth)
        ).toBeLessThanOrEqual(1)
        if (scenario === 'hybrid-restricted') {
          await page.keyboard.press('Escape')
          const arrow = example.locator(
            `[data-table-focus="details-all-${scenario}"]:visible`
          )
          await arrow.click()
          await expect(
            page.getByTestId('current-retained-detail')
          ).toContainText(helpText)
          await page.goBack()
          await expect(arrow).toBeFocused()
        }
        expect(txLog.length).toBe(0)
      })
    })
  }
}
