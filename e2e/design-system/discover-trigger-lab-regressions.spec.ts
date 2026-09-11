import { test, expect } from '../fixtures/base'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

for (const [theme, width] of [
  ['light', 1400],
  ['dark', 1400],
] as const) {
  test(`discover trigger ${theme} ${width}`, async ({ page, txLog }, info) => {
    const before = readReviewSource(process.cwd())
    const guard = watchReviewSource(process.cwd())
    try {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(
        '/internal/design-system/components/table#discover-family-review'
      )
      const composition = page.getByTestId('discover-composition')
      const row = composition.locator('tbody tr').first()
      const trigger = row
        .getByRole('button', { name: 'Basket', exact: true })
        .filter({ visible: true })
      await expect(trigger).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      const geometry = await trigger.evaluate((button) => {
        const b = button.getBoundingClientRect()
        const frame = button
          .querySelector('[data-slot="logo-stack-frame"]')!
          .getBoundingClientRect()
        const art = button
          .querySelector('[data-slot="logo-stack-artwork"]')!
          .getBoundingClientRect()
        const count = button
          .querySelector('[data-slot="token-stack-count"]')!
          .getBoundingClientRect()
        return {
          height: b.height,
          art: art.width,
          left: frame.left - b.left,
          top: frame.top - b.top,
          bottom: b.bottom - frame.bottom,
          border: getComputedStyle(button).borderLeftWidth,
          countRight: b.right - count.right,
        }
      })
      expect(geometry.height).toBe(44)
      expect(geometry.art).toBe(24)
      expect(geometry.left).toBeCloseTo(8, 0)
      expect(geometry.top).toBeCloseTo(8, 0)
      expect(geometry.bottom).toBeCloseTo(8, 0)
      expect(geometry.border).toBe('1px')
      expect(geometry.countRight).toBeCloseTo(17, 0)
      await expect(trigger.locator('svg')).toHaveCount(0)
      if (width === 1400) {
        for (const available of [1352, 1152]) {
          await composition.evaluate((el, value) => {
            el.style.width = `${value}px`
          }, available)
          const supporting = row.locator(
            'td:visible [data-slot="entity-identity-supporting"]'
          )
          await expect(supporting).toHaveCSS('height', '20px')
          const heading = composition.locator('thead th').nth(1)
          const art = trigger
            .locator('[data-slot="logo-stack-artwork"]')
            .first()
          expect(
            Math.abs(
              (await heading.boundingBox())!.x +
                12 -
                (await art.boundingBox())!.x
            )
          ).toBeLessThanOrEqual(1)
        }
        await composition.evaluate((el) => {
          el.style.width = ''
        })
      }
      await page.mouse.move(0, 0)
      const idle = await trigger.evaluate(
        (el) => getComputedStyle(el).backgroundColor
      )
      await row.locator('td:visible').last().hover()
      await expect
        .poll(() =>
          trigger.evaluate((el) => getComputedStyle(el).backgroundColor)
        )
        .not.toBe(idle)
      await expect(trigger).toHaveAttribute('data-state', 'closed')
      await info.attach('row-hover', {
        body: await page.screenshot(),
        contentType: 'image/png',
      })
      const directHover = await trigger.evaluate((el) => {
        const probe = document.createElement('span')
        probe.style.backgroundColor = 'hsl(var(--muted))'
        el.appendChild(probe)
        const color = getComputedStyle(probe).backgroundColor
        probe.remove()
        return color
      })
      await expect(trigger).not.toHaveCSS('background-color', directHover)
      await trigger.hover()
      await expect(trigger).toHaveCSS('background-color', directHover)
      await expect(
        page.getByRole('dialog', { name: 'Collateral:' })
      ).toBeVisible()
      await page.mouse.move(0, 0)
      await row.getByRole('link').filter({ visible: true }).focus()
      await page.keyboard.press('Tab')
      await expect(trigger).toBeFocused()
      await expect(trigger).toHaveCSS('background-color', directHover)
      await info.attach('trigger-focus', {
        body: await page.screenshot(),
        contentType: 'image/png',
      })
      await trigger.click()
      await expect(
        page.getByRole('dialog', { name: 'Collateral:' })
      ).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(trigger).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(
        page.getByRole('list', { name: 'Collateral:' })
      ).toBeFocused()
      const outside = page.getByRole('switch', {
        name: 'Constrained Discover column',
      })
      await outside.click()
      await expect(
        page.getByRole('dialog', { name: 'Collateral:' })
      ).toHaveCount(0)
      await expect(outside).toBeFocused()
      await expect(page).toHaveURL(/#discover-family-review$/)
      expect(txLog).toHaveLength(0)
    } finally {
      guard.close()
      assertUnchangedSource(before, readReviewSource(process.cwd()), [
        ...guard.changes,
      ])
      await info.attach('public-source-digest', {
        body: Buffer.from(before.digest),
        contentType: 'text/plain',
      })
    }
  })
}
