import { test, expect, currentCapture } from './current-rebalance-helpers'

test.use({ hasTouch: true })

for (const theme of ['light', 'dark']) {
  test(`Earn compact rate rhythm and help ${theme}`, async ({
    page,
    txLog,
  }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto(
      '/internal/design-system/components/table#earn-family-review'
    )
    const review = page.getByTestId('earn-review')
    const record = review.getByTestId('earn-record-cmc')
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 900 })
      for (const state of ['Default', 'Long content']) {
        await review
          .getByRole('combobox', { name: 'Earn preview state' })
          .click()
        await page.getByRole('option', { name: state, exact: true }).click()
        await page.evaluate(() => document.fonts.ready)
        await currentCapture(
          page,
          record,
          info,
          `earn-rate-${theme}-${width}-${state}`
        )
        const geometry = await record.evaluate((el) => {
          const cell = el.closest('td')!
          const fact = el.querySelector('[data-slot="earn-rate-fact"]')!
          const frame = fact.getBoundingClientRect()
          const rate = fact
            .querySelector('[data-slot="earn-rate"]')!
            .getBoundingClientRect()
          const help = fact.querySelector('button')!.getBoundingClientRect()
          return {
            valueTop: rate.top - frame.top,
            valueHeight: rate.height,
            valueRight: frame.right - rate.right,
            helpTop: help.top - frame.top,
            overflow: cell.scrollWidth - cell.clientWidth,
          }
        })
        expect.soft(geometry.helpTop, 'help belongs to the label line').toBe(0)
        expect
          .soft(
            geometry.valueTop,
            'the value follows the label by one text row and gap'
          )
          .toBe(24)
        expect
          .soft(geometry.valueHeight, 'no control enlarges the value line')
          .toBe(24)
        expect
          .soft(geometry.valueRight, 'APR/APY ends on the content edge')
          .toBeCloseTo(0, 0)
        expect.soft(geometry.overflow).toBeLessThanOrEqual(1)
        await expect(record.locator('[data-slot="earn-rate"]')).toHaveText(
          '2.29%APR'
        )
      }
    }

    const help = record.getByRole('button', {
      name: 'How is this rate calculated?',
      exact: true,
    })
    await expect(
      help,
      'the unchanged accessible name describes an icon-only action'
    ).toHaveText('')
    await help.focus()
    await page.keyboard.press('Enter')
    const explanation = review.getByRole('button', {
      name: 'How is the estimated APY or APR calculated?',
    })
    await expect(explanation).toBeFocused()
    await expect(explanation).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Enter')
    await expect(explanation).toHaveAttribute('aria-expanded', 'false')
    await currentCapture(page, record, info, `earn-rate-${theme}-before-touch`)
    const touch = await help.evaluate((el) => {
      const r = el.getBoundingClientRect()
      const x = r.x + r.width / 2
      const hits = [
        [x, r.y - 11],
        [x, r.bottom + 11],
        [r.x - 11, r.y + r.height / 2],
        [r.right + 11, r.y + r.height / 2],
      ].map(([px, py]) => el.contains(document.elementFromPoint(px, py)))
      return { x, y: r.y - 11, hits }
    })
    expect(
      touch.hits,
      '44px touch target without inflating the text row'
    ).toEqual([true, true, true, true])
    await page.touchscreen.tap(touch.x, touch.y)
    await expect(explanation).toBeFocused()
    await expect(explanation).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    expect(txLog).toHaveLength(0)
  })
}
