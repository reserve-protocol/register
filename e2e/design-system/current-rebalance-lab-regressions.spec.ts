import { test, expect } from '../fixtures/base'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

for (const width of [1400, 390]) {
  test(`current rebalance composition ${width}`, async ({
    page,
    txLog,
  }, info) => {
    const source = readReviewSource(process.cwd())
    const guard = watchReviewSource(process.cwd())
    try {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(
        '/internal/design-system/components/table#auctions-browse-review'
      )
      await page.evaluate(() => document.fonts.ready)
      const current = page.getByTestId('current-rebalance-workspace')
      await expect(current).toHaveCount(1)
      for (const scene of ['ready', 'live']) {
        if (scene !== 'ready') {
          await page.getByTestId('current-scene').click()
          await page.getByTestId(`current-scene-${scene}`).click()
        }
        await current.evaluate((el) => {
          el.scrollIntoView({ block: 'start' })
          let parent = el.parentElement
          while (parent) {
            if (
              parent.scrollHeight > parent.clientHeight &&
              ['auto', 'scroll'].includes(getComputedStyle(parent).overflowY)
            ) {
              parent.scrollTop -= 145
              break
            }
            parent = parent.parentElement
          }
        })
        await expect(current).toHaveAttribute(
          'data-stage',
          scene === 'ready' ? 'preparing' : 'live'
        )
        const geometry = await current.evaluate((el) => ({
          width: el.clientWidth,
          scroll: el.scrollWidth,
        }))
        expect(geometry.scroll).toBeLessThanOrEqual(geometry.width + 1)
        for (const fact of await current
          .getByTestId('current-inline-fact')
          .all()) {
          const sizes = await fact.evaluate((el) =>
            [...el.children].map((child) => {
              const style = getComputedStyle(child)
              return [style.fontSize, style.lineHeight]
            })
          )
          expect(sizes).toEqual([
            ['14px', '20px'],
            ['14px', '20px'],
          ])
        }
        await info.attach(`current-${scene}-${width}`, {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
      }
      expect(txLog).toHaveLength(0)
    } finally {
      guard.close()
      assertUnchangedSource(source, readReviewSource(process.cwd()), [
        ...guard.changes,
      ])
    }
  })
}
