import { test, expect } from '../fixtures/base'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

test('auction browse whole-record hit regions keep provenance independent', async ({
  page,
  txLog,
}, info) => {
  const source = readReviewSource(process.cwd())
  const guard = watchReviewSource(process.cwd())
  try {
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto(
      '/internal/design-system/components/table#auctions-records-review'
    )
    const row = page.getByTestId('rebalance-list-record').nth(1)
    await row.evaluate((el) => {
      el.scrollIntoView({ block: 'center' })
      el.addEventListener('click', (event) => {
        event.preventDefault()
        const anchor = (event.target as Element).closest('a')
        ;(el as HTMLElement).dataset.clickedHref =
          anchor?.getAttribute('href') ?? 'none'
      })
    })
    const recordHref = (await row
      .getByTestId('rebalance-record-link')
      .getAttribute('href'))!
    for (const target of [
      row.locator('time'),
      row.getByTestId('rebalance-metric-value').first(),
    ]) {
      const box = (await target.boundingBox())!
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      await expect(row).toHaveAttribute('data-clicked-href', recordHref)
    }
    const box = (await row.boundingBox())!
    await page.mouse.click(box.x + 8, box.y + 8)
    await expect(row).toHaveAttribute('data-clicked-href', recordHref)
    const proposer = row.getByTestId('rebalance-proposer-link')
    await proposer.click()
    await expect(row).toHaveAttribute(
      'data-clicked-href',
      (await proposer.getAttribute('href'))!
    )
    expect(txLog).toHaveLength(0)
  } finally {
    guard.close()
    assertUnchangedSource(source, readReviewSource(process.cwd()), [
      ...guard.changes,
    ])
    await info.attach('public-source-digest', {
      body: Buffer.from(source.digest),
      contentType: 'text/plain',
    })
  }
})
