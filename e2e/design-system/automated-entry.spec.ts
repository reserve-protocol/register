import { expect, test } from '../fixtures/base'

for (const theme of ['light', 'dark']) {
  test(`Automated introduction icon has a visible neutral container in ${theme}`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(
      (value) => localStorage.setItem('theme-ui-color-mode', value),
      theme
    )
    await page.goto(
      '/internal/design-system/components/transaction-action#transaction-composition-staged'
    )
    const message = page
      .getByTestId('automated-mint-swap-guidance')
      .getByTestId('canonical-inline-message')
    await expect(message).toBeVisible()
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 1000 })
      const icon = message.locator(':scope > span[aria-hidden="true"]')
      const background = await icon.evaluate(
        (element) => getComputedStyle(element).backgroundColor
      )
      expect(background).not.toBe('rgba(0, 0, 0, 0)')
      expect(background).not.toBe(
        await message.evaluate(
          (element) => getComputedStyle(element).backgroundColor
        )
      )
      expect((await icon.boundingBox())!.height).toBe(32)
      expect((await message.locator('a').boundingBox())!.height).toBe(32)
      await message.screenshot({
        path: testInfo.outputPath(`guidance-${width}.png`),
      })
    }
  })
}
