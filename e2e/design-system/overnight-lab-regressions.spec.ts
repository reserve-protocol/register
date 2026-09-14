import { test, expect } from '../fixtures/base'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

let source: ReturnType<typeof readReviewSource>
let guard: ReturnType<typeof watchReviewSource>
test.beforeEach(() => {
  source = readReviewSource(process.cwd())
  guard = watchReviewSource(process.cwd())
})
test.afterEach(async ({ txLog }, info) => {
  guard.close()
  expect(txLog).toHaveLength(0)
  assertUnchangedSource(source, readReviewSource(process.cwd()), [
    ...guard.changes,
  ])
  await info.attach('public-source-digest', {
    body: Buffer.from(source.digest),
    contentType: 'text/plain',
  })
})

for (const theme of ['light', 'dark']) {
  test(`Earn identity stays out of rate ${theme}`, async ({ page }, info) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto(
      '/internal/design-system/components/table#earn-family-review'
    )
    await page.evaluate(() => document.fonts.ready)
    const composition = page.getByTestId('earn-composition')
    await composition.evaluate((el) => {
      el.style.scrollMarginTop = '120px'
      el.scrollIntoView({ block: 'start' })
    })
    const records = composition.locator('[data-testid^="earn-record-"]:visible')
    await expect(records).toHaveCount(4)
    const collisions = await records.evaluateAll((nodes) =>
      nodes.flatMap((node) => {
        const supporting = node.querySelector(
          '[data-slot="entity-identity-supporting"]'
        )!
        const range = document.createRange()
        range.selectNodeContents(supporting)
        const rate = node
          .querySelector('[data-slot="earn-rate-fact"]')!
          .getBoundingClientRect()
        const intersects = [...range.getClientRects()].some(
          (text) =>
            text.right > rate.left &&
            text.left < rate.right &&
            text.top < rate.bottom &&
            text.bottom > rate.top
        )
        return intersects
          ? [
              {
                text: supporting.textContent,
                width: supporting.clientWidth,
                scroll: supporting.scrollWidth,
                whiteSpace: getComputedStyle(supporting).whiteSpace,
              },
            ]
          : []
      })
    )
    await info.attach('identity-rate', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    expect(collisions).toEqual([])
  })

  test(`Owned amount remains one readable number ${theme}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto(
      '/internal/design-system/components/table#owned-positions-review'
    )
    const review = page.getByTestId('owned-positions-review')
    for (const [label, option] of [
      ['Position type', 'Staked RSR Positions'],
      ['Preview state', 'Long content'],
    ]) {
      await review.getByRole('combobox', { name: label }).click()
      await page.getByRole('option', { name: option, exact: true }).click()
    }
    const table = review.getByTestId('owned-table')
    await table.evaluate((el) => {
      el.style.scrollMarginTop = '120px'
      el.scrollIntoView({ block: 'start' })
    })
    await page.evaluate(() => document.fonts.ready)
    const value = table
      .getByText('$12,345,678.90', { exact: true })
      .filter({ visible: true })
    const balance = table
      .getByText('123,456,789.123456', { exact: true })
      .filter({ visible: true })
    await expect(value).toBeVisible()
    await expect(balance).toBeVisible()
    await info.attach('long-amount', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    for (const number of [value, balance]) {
      const geometry = await number.evaluate((el) => {
        const range = document.createRange()
        range.selectNodeContents(el)
        const bounds = el.getBoundingClientRect()
        return {
          lines: [...range.getClientRects()].length,
          right: bounds.right,
          scroll: el.scrollWidth,
          width: el.clientWidth,
        }
      })
      expect(geometry.lines).toBe(1)
      expect(geometry.right).toBeLessThanOrEqual(320)
      expect(geometry.scroll).toBeLessThanOrEqual(geometry.width + 1)
    }
  })

  for (const width of [320, 390, 768, 1400]) {
    test(`Governance visual inventory ${theme} ${width}`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto('/internal/design-system/components/table')
      const records = page.locator('[data-record-kind="governance"]')
      await expect(records).toHaveCount(13)
      await page.evaluate(() => document.fonts.ready)
      const geometry = await records.evaluateAll((nodes) =>
        nodes.map((node) => {
          const bounds = node.getBoundingClientRect()
          return {
            state: node.getAttribute('data-proposal-state'),
            width: bounds.width,
            height: bounds.height,
            scrollWidth: node.scrollWidth,
            right: bounds.right,
          }
        })
      )
      await info.attach('geometry', {
        body: Buffer.from(JSON.stringify(geometry)),
        contentType: 'text/plain',
      })
      for (const state of [
        'pending',
        'active',
        'contested-active',
        'queued',
        'optimistic-succeeded',
        'quorum-not-reached',
      ]) {
        const record = records.locator(`:scope[data-proposal-state="${state}"]`)
        await record.evaluate((el) => {
          el.style.scrollMarginTop = '120px'
          el.scrollIntoView({ block: 'start' })
        })
        await info.attach(state, {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
      }
      await records.first().getByTestId('proposal-record-link').focus()
      await expect(
        records.first().getByTestId('proposal-record-link')
      ).toBeFocused()
    })
  }
}
