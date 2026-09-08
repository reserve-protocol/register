import { expect, test } from '../fixtures/base'

for (const theme of ['light', 'dark']) {
  test(`Active transaction actions retain primary emphasis while waiting in ${theme}`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(
      (value) => localStorage.setItem('theme-ui-color-mode', value),
      theme
    )
    await page.goto('/internal/design-system/components/transaction-action')
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 1400 })
      for (const [family, group, state] of [
        ['rfq', 0, 4],
        ['vote-lock', 0, 2],
        ['stake', 0, 2],
        ['atomic', 2, 1],
        ['staged', 2, 0],
      ] as const) {
        const composition = page.getByTestId(
          `transaction-composition-${family}`
        )
        await composition
          .getByTestId(
            `transaction-composition-${family}-state-group-${group}-option-${state}`
          )
          .click()
        const action = composition.locator('button[aria-busy="true"]')
        await expect(action).toHaveCount(1)
        await expect(action).toBeDisabled()
        await expect(action).toHaveAttribute('data-tone', 'primary')
        await expect(action.locator('svg.animate-spin')).toBeVisible()
        expect(
          await action
            .locator('svg.animate-spin')
            .evaluate((icon) => getComputedStyle(icon).animationName)
        ).not.toBe('none')
        const box = (await action.boundingBox())!
        expect(box.height).toBeGreaterThanOrEqual(44)
        if (family === 'atomic') {
          const upcoming = composition.getByTestId(
            'manual-issuance-transaction-action'
          )
          await expect(upcoming).toBeDisabled()
          await expect(upcoming).not.toHaveAttribute('aria-busy', 'true')
          expect(
            await upcoming.evaluate(
              (el) => getComputedStyle(el).backgroundColor
            )
          ).not.toBe(
            await action.evaluate((el) => getComputedStyle(el).backgroundColor)
          )
        }
        await action.scrollIntoViewIfNeeded()
        const surface = composition.getByTestId(
          family === 'rfq'
            ? 'zapper-shell'
            : family === 'atomic'
              ? 'manual-issuance-task'
              : family === 'staged'
                ? 'automated-mint-workspace'
                : 'canonical-dialog-surface'
        )
        await surface.screenshot({
          path: testInfo.outputPath(`${family}-${width}.png`),
        })
      }
    }
  })
}
