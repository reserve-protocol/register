import { test, expect } from '../fixtures/base'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

test.use({ hasTouch: true })

for (const reduced of [false, true]) {
  test(`discover asset strip ${reduced ? 'reduced touch' : 'hover motion'}`, async ({
    page,
    txLog,
  }, info) => {
    const before = readReviewSource(process.cwd())
    const guard = watchReviewSource(process.cwd())
    try {
      await page.setViewportSize({ width: reduced ? 390 : 1400, height: 900 })
      await page.emulateMedia({
        reducedMotion: reduced ? 'reduce' : 'no-preference',
      })
      await page.goto(
        '/internal/design-system/components/table#discover-family-review'
      )
      const trigger = reduced
        ? page
            .getByTestId('discover-cells')
            .getByRole('button', { name: 'Basket', exact: true })
        : page
            .getByTestId('discover-composition')
            .locator('tbody tr')
            .first()
            .getByRole('button', { name: 'Basket', exact: true })
            .filter({ visible: true })
      await expect(trigger).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      if (reduced) await trigger.tap()
      else await trigger.hover()
      const popup = page.getByRole('dialog', { name: 'Collateral:' })
      const strip = popup.getByRole('list', { name: 'Collateral:' })
      await expect(popup).toBeVisible()
      const sample = async (milliseconds: number) =>
        strip.evaluate(async (element, duration) => {
          const frames: { time: number; x: number }[] = []
          const start = performance.now()
          await new Promise<void>((resolve) => {
            const tick = () => {
              frames.push({
                time: performance.now() - start,
                x: element.scrollLeft,
              })
              if (performance.now() - start >= duration) resolve()
              else requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          })
          return frames
        }, milliseconds)
      if (reduced) {
        const frames = await sample(1400)
        expect(Math.max(...frames.map((frame) => frame.x))).toBe(0)
        await expect(strip).toBeFocused()
        const box = (await strip.boundingBox())!
        const session = await page.context().newCDPSession(page)
        const y = box.y + box.height / 2
        const settled = strip.evaluate(
          (element) =>
            new Promise<void>((resolve) =>
              element.addEventListener('scrollend', () => resolve(), {
                once: true,
              })
            )
        )
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: box.x + box.width * 0.8, y }],
        })
        for (const fraction of [0.7, 0.6, 0.5, 0.4, 0.3, 0.2])
          await session.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: box.x + box.width * fraction, y }],
          })
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchEnd',
          touchPoints: [],
        })
        await session.detach()
        await settled
        await expect
          .poll(() => strip.evaluate((el) => el.scrollLeft))
          .toBeGreaterThan(0)
        await page.keyboard.press('End')
        await expect
          .poll(() => strip.evaluate((el) => el.scrollLeft))
          .toBeGreaterThan(0)
        await page.keyboard.press('Home')
        await expect.poll(() => strip.evaluate((el) => el.scrollLeft)).toBe(0)
      } else {
        const width = await strip
          .locator('ul')
          .first()
          .evaluate((el) => el.scrollWidth)
        const frames = await sample((width / 72 + 2.5) * 1000)
        const cruiseStart = frames.find((frame) => frame.time >= 1600)!
        const cruiseEnd = frames.find((frame) => frame.time >= 2600)!
        const velocity =
          (cruiseEnd.x - cruiseStart.x) /
          ((cruiseEnd.time - cruiseStart.time) / 1000)
        expect(velocity).toBeGreaterThan(68)
        expect(velocity).toBeLessThan(76)
        expect(
          frames.some(
            (frame, index) =>
              index > 0 && frames[index - 1].x - frame.x > width / 2
          )
        ).toBe(true)
        await info.attach('motion-samples', {
          body: Buffer.from(JSON.stringify({ width, velocity, frames })),
          contentType: 'application/json',
        })
        await info.attach('hover-strip', {
          body: await page.screenshot(),
          contentType: 'image/png',
        })
        const triggerBox = (await trigger.boundingBox())!
        const popupBox = (await popup.boundingBox())!
        const x = triggerBox.x + triggerBox.width / 2
        await page.mouse.move(x, triggerBox.y + triggerBox.height - 1)
        await page.mouse.move(x, popupBox.y + 12, { steps: 12 })
        await expect(popup).toBeVisible()
        const paused = await sample(1400)
        expect(
          Math.max(...paused.map((frame) => frame.x)) -
            Math.min(...paused.map((frame) => frame.x))
        ).toBeLessThan(2)
        await page.mouse.move(0, 0)
        await expect(popup).toBeHidden()
        await trigger.hover()
        await expect(popup).toBeVisible()
        expect(await strip.evaluate((el) => el.scrollLeft)).toBeLessThan(8)
        await trigger.click()
        await expect(strip).toBeFocused()
        await page.keyboard.press('ArrowRight')
        await expect
          .poll(() => strip.evaluate((el) => el.scrollLeft))
          .toBeGreaterThanOrEqual(72)
      }
      await info.attach('horizontal-strip', {
        body: await page.screenshot(),
        contentType: 'image/png',
      })
      await page.keyboard.press('Escape')
      await expect(popup).toBeHidden()
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
