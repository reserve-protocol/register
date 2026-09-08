import { expect, test } from '../fixtures/base'

for (const theme of ['light', 'dark']) {
  test(`Zapper direction control stays above quote search in ${theme}`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript((value) => {
      localStorage.setItem('theme-ui-color-mode', value)
    }, theme)
    await page.goto(
      '/internal/design-system/components/transaction-action#transaction-composition-rfq'
    )
    const composition = page.getByTestId('transaction-composition-rfq')
    const pair = composition.getByTestId('transaction-amount-pair')
    const direction = pair.locator(':scope > div > button')
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 1000 })
      for (const state of [2, 1]) {
        await composition
          .getByTestId(
            `transaction-composition-rfq-state-group-0-option-${state}`
          )
          .click()
        await direction.scrollIntoViewIfNeeded()
        if (state === 1) {
          await expect(
            composition.getByTestId('zapper-quote-animation')
          ).toBeVisible()
          await expect(direction).toBeDisabled()
        } else {
          await expect(direction).toBeEnabled()
        }
        const lowerHalfIsUncovered = await direction.evaluate((button) => {
          const box = button.getBoundingClientRect()
          const previous = button.style.pointerEvents
          // Hit testing is enabled only to measure paint order of the disabled control.
          button.style.pointerEvents = 'auto'
          const front = document.elementFromPoint(
            box.x + box.width / 2,
            box.y + box.height * 0.75
          )
          button.style.pointerEvents = previous
          return front !== null && button.contains(front)
        })
        expect(
          lowerHalfIsUncovered,
          `${width}/${state}: arrow lower half`
        ).toBe(true)
        if (state === 1 && width !== 320) {
          await pair.screenshot({
            path: testInfo.outputPath(`quote-search-${width}.png`),
          })
        }
      }
    }
  })
}
