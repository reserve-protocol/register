import { test, expect } from '../fixtures/base'
import {
  readReviewSource,
  watchReviewSource,
  assertUnchangedSource,
} from './review-source'

for (const theme of ['light', 'dark'])
  for (const width of [390, 1400]) {
    test(`auction history table ${theme} ${width}`, async ({
      page,
      txLog,
    }, info) => {
      const source = readReviewSource(process.cwd())
      const guard = watchReviewSource(process.cwd())
      try {
        await page.setViewportSize({ width, height: 900 })
        await page.addInitScript(
          (mode) => localStorage.setItem('theme-ui-color-mode', mode),
          theme
        )
        await page.goto(
          '/internal/design-system/components/table#auctions-browse-review'
        )
        await page.evaluate(() => document.fonts.ready)
        const review = page.getByTestId('auctions-history-review')
        const table = review.getByTestId('historical-rebalances-table')
        const rows = table.locator('tbody tr')
        await expect(rows).toHaveCount(3)
        const cardColor = await table.evaluate((el) => {
          const probe = document.createElement('div')
          probe.style.backgroundColor = 'hsl(var(--card))'
          el.append(probe)
          const color = getComputedStyle(probe).backgroundColor
          probe.remove()
          return color
        })
        await expect(table).toHaveCSS('background-color', cardColor)
        await expect(review.getByTestId('history-container')).toHaveCSS(
          'background-color',
          cardColor
        )
        await expect(
          table.locator('[data-slot="history-row-seam"]')
        ).toHaveCount(0)
        for (const row of await rows.all()) {
          await expect(row).toHaveCSS('border-top-width', '0px')
          await expect(row).toHaveCSS('border-bottom-width', '0px')
        }
        const visible = (id: string) =>
          table.locator(`[data-testid="${id}"]:visible`)
        const state = async (name: string) => {
          await review.getByTestId('history-preview-state').click()
          await page.getByTestId(`history-state-${name}`).click()
        }
        const capture = async (name: string) => {
          const capturedRow =
            width === 390 && name === 'unavailable-long-title'
              ? rows.last()
              : rows.first()
          await (width === 390 ? capturedRow : table).evaluate((el) =>
            el.scrollIntoView({ block: 'center' })
          )
          const box = (await capturedRow.boundingBox())!
          expect(box.y).toBeGreaterThanOrEqual(60)
          expect(box.y + box.height).toBeLessThanOrEqual(900)
          await page.mouse.move(0, 0)
          await info.attach(`history-${theme}-${width}-${name}`, {
            body: await page.screenshot({ animations: 'disabled' }),
            contentType: 'image/png',
          })
        }
        await expect(rows).toHaveCount(3)
        await expect(page.getByTestId('rebalance-active-section')).toHaveCount(
          0
        )
        await expect(page.getByTestId('rebalance-selected-detail')).toHaveCount(
          0
        )
        await expect(visible('history-record-title')).toHaveCount(3)
        await expect(
          table.locator('a:not([data-testid="rebalance-proposer-link"])')
        ).toHaveCount(0)
        await expect(visible('history-priceImpact')).toHaveText([
          '−1.51%',
          '+0.12%',
          '0%',
        ])
        await expect(visible('history-navChange')).toHaveText([
          '−0.18%',
          '+0.04%',
          '0%',
        ])
        await expect(visible('history-priceImpactUsd')).toHaveText([
          '$1,272',
          '$14',
          '$0',
        ])
        await expect(visible('history-record-title').first()).toHaveCSS(
          'font-size',
          '16px'
        )
        await expect(visible('rebalance-proposer-link').first()).toHaveCSS(
          'font-size',
          '14px'
        )
        await expect(table.locator('thead')).toBeVisible({
          visible: width === 1400,
        })
        const container = (await review
          .getByTestId('history-container')
          .boundingBox())!
        expect((await table.boundingBox())!.width).toBe(container.width)
        if (width === 390) {
          const cell = rows.first().locator('td:visible')
          await expect(cell).toHaveCount(1)
          expect((await cell.boundingBox())!.width).toBe(container.width)
          expect(
            (await visible('history-record-title').first().boundingBox())!
              .height
          ).toBeLessThanOrEqual(72)
        }
        if (width === 1400) {
          expect(container.width).toBeGreaterThan(1000)
          const identityWidth = await visible('history-record-title')
            .first()
            .evaluate((el) => el.closest('td')!.getBoundingClientRect().width)
          expect(identityWidth - container.width * 0.3).toBeGreaterThanOrEqual(
            40
          )
          expect(identityWidth - container.width * 0.3).toBeLessThanOrEqual(65)
          for (const field of [
            'accuracy',
            'navChange',
            'priceImpact',
            'traded',
          ]) {
            const centering = await visible(`history-${field}`)
              .first()
              .evaluate((el) => {
                const cell = el.closest('td')!
                const box = cell.getBoundingClientRect()
                const content = cell.firstElementChild!.getBoundingClientRect()
                return Math.abs(
                  content.y + content.height / 2 - box.y - box.height / 2
                )
              })
            expect(centering).toBeLessThanOrEqual(1)
          }
        }
        expect(
          await table.evaluate((el) => el.scrollWidth <= el.clientWidth)
        ).toBe(true)
        await capture('default')
        for (const [field, explanation] of [
          [
            'accuracy',
            'A measure of how closely the new basket rebalanced compared to the proposed basket',
          ],
          [
            'navChange',
            'How much the value of the DTF basket changed due to the latest rebalance',
          ],
        ]) {
          const help = visible(`history-help-${field}`)
            .first()
            .locator('button')
          await help.focus()
          await expect(page.getByRole('tooltip')).toHaveText(explanation)
          await info.attach(`history-${theme}-${width}-help-${field}`, {
            body: await page.screenshot({ animations: 'disabled' }),
            contentType: 'image/png',
          })
          await page.keyboard.press('Escape')
          await expect(page.getByRole('tooltip')).toHaveCount(0)
          const reachable = await help.evaluate((el) => {
            const box = el.getBoundingClientRect()
            const x = box.x + box.width / 2
            const y = box.y + box.height / 2
            return [
              [-21, 0],
              [21, 0],
              [0, -21],
              [0, 21],
            ].every(([dx, dy]) =>
              el.contains(document.elementFromPoint(x + dx, y + dy))
            )
          })
          expect(reachable).toBe(true)
          await help.click()
          await expect(page.getByRole('tooltip')).toHaveText(explanation)
          await page.keyboard.press('Escape')
          await expect(page.getByRole('tooltip')).toHaveCount(0)
          await expect(help).toBeFocused()
        }
        const heights = await rows.evaluateAll((elements) =>
          elements.map((el) => el.getBoundingClientRect().height)
        )
        await state('loading')
        await expect(table).toHaveAttribute('aria-busy', 'true')
        await expect(table.locator('a')).toHaveCount(0)
        expect(
          await rows.evaluateAll((elements) =>
            elements.map((el) => el.getBoundingClientRect().height)
          )
        ).toEqual(heights)
        await capture('loading')
        await state('metrics-loading')
        await expect(visible('history-record-title')).toHaveCount(3)
        await expect(visible('history-priceImpact')).toHaveCount(0)
        await expect(visible('history-navChange')).toHaveCount(0)
        await expect(visible('history-priceImpactUsd')).toHaveCount(0)
        await capture('metrics-loading')
        await state('unavailable')
        await expect(visible('history-traded')).toHaveText(['—', '—', '—'])
        await expect(visible('history-navChange')).toHaveText(['—', '—', '—'])
        await expect(visible('history-priceImpactUsd')).toHaveText([
          '—',
          '—',
          '—',
        ])
        await expect(visible('lifecycle-status-pill')).toHaveText([
          'Completed',
          'Completed',
          'Completed',
        ])
        await state('expired')
        await expect(visible('lifecycle-status-pill').last()).toHaveText(
          'Expired'
        )
        await expect(visible('history-traded').last()).toHaveText('$0')
        await capture('expired')
        await state('pressure')
        await expect(visible('history-traded').last()).toHaveText('—')
        await expect(visible('lifecycle-status-pill').last()).toHaveText(
          'Expired'
        )
        await capture('unavailable-long-title')
        await state('zero')
        await expect(visible('history-traded')).toHaveText(['$0', '$0', '$0'])
        await expect(visible('history-navChange')).toHaveText([
          '0%',
          '0%',
          '0%',
        ])
        await expect(visible('history-priceImpactUsd')).toHaveText([
          '$0',
          '$0',
          '$0',
        ])
        await expect(visible('history-priceImpact')).toHaveText([
          '0%',
          '0%',
          '0%',
        ])
        await state('empty')
        await expect(review.getByTestId('history-empty')).toBeVisible()
        await expect(table).toHaveCount(0)
        await state('default')
        await expect(visible('history-record-title')).toHaveCount(3)
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
  }

test('auction history static rows, provenance links and projection boundary', async ({
  page,
  txLog,
}, info) => {
  const source = readReviewSource(process.cwd())
  const guard = watchReviewSource(process.cwd())
  try {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto(
      '/internal/design-system/components/table#auctions-browse-review'
    )
    const table = page.getByTestId('historical-rebalances-table')
    const row = table.locator('tbody tr').first()
    const title = () =>
      row.locator('[data-testid="history-record-title"]:visible')
    await row.evaluate((el) => {
      el.scrollIntoView({ block: 'center' })
      el.addEventListener('click', (event) => {
        event.preventDefault()
        ;(el as HTMLElement).dataset.clickedHref =
          (event.target as Element).closest('a')?.getAttribute('href') ?? 'none'
      })
    })
    const rowColor = await row.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    )
    for (const target of [
      title(),
      row.locator('time:visible'),
      row.locator('[data-testid="history-traded"]:visible'),
    ]) {
      const box = (await target.boundingBox())!
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      await expect(row).toHaveAttribute('data-clicked-href', 'none')
      await expect(row).toHaveCSS('background-color', rowColor)
    }
    const proposer = () =>
      row.locator('[data-testid="rebalance-proposer-link"]:visible')
    await proposer().click()
    await expect(row).toHaveAttribute(
      'data-clicked-href',
      (await proposer().getAttribute('href'))!
    )
    await proposer().focus()
    await page.setViewportSize({ width: 390, height: 900 })
    await expect(proposer()).toBeFocused()
    await page.setViewportSize({ width: 1400, height: 900 })
    await expect(proposer()).toBeFocused()
    const help = () =>
      table
        .locator('[data-testid="history-help-navChange"]:visible')
        .first()
        .locator('button')
    await help().focus()
    await expect(page.getByRole('tooltip')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    await page.setViewportSize({ width: 390, height: 900 })
    await expect(help()).toBeFocused()
    await expect(page.getByRole('tooltip')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    await page.setViewportSize({ width: 1400, height: 900 })
    await expect(help()).toBeFocused()
    await expect(page.getByRole('tooltip')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    await proposer().focus()
    const outer = page.getByTestId('history-container')
    for (const width of [895, 896, 897]) {
      await outer.evaluate((el, pixels) => {
        ;(el as HTMLElement).style.width = `${pixels}px`
      }, width)
      await expect(table.locator('thead')).toBeVisible({
        visible: width >= 896,
      })
      expect(
        await table.evaluate((el) => el.scrollWidth <= el.clientWidth)
      ).toBe(true)
      if (width >= 896) {
        expect(
          (await table
            .locator('tbody tr')
            .last()
            .locator('[data-testid="rebalance-metadata"]:visible')
            .boundingBox())!.height
        ).toBeLessThanOrEqual(40)
      }
      await row.evaluate((el) => el.scrollIntoView({ block: 'center' }))
      await info.attach(`history-boundary-${width}`, {
        body: await page.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      })
    }
    await outer.evaluate((el) => {
      ;(el as HTMLElement).style.width = ''
    })
    await page.getByTestId('history-constrain').click()
    await expect(outer).toHaveCSS('width', '390px')
    await expect(table.locator('thead')).toBeHidden()
    await page.setViewportSize({ width: 320, height: 900 })
    const phoneWidth = (await outer.boundingBox())!.width
    expect((await row.locator('td:visible').boundingBox())!.width).toBe(
      phoneWidth
    )
    expect(await table.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true
    )
    expect((await title().boundingBox())!.height).toBeLessThanOrEqual(72)
    await row.evaluate((el) => el.scrollIntoView({ block: 'center' }))
    expect(
      (await row
        .locator('[data-testid="history-accuracy"]:visible')
        .boundingBox())!.y
    ).toBe(
      (await row
        .locator('[data-testid="history-navChange"]:visible')
        .boundingBox())!.y
    )
    await info.attach('history-phone-320', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    await page.getByTestId('history-earlier-review').click()
    await expect(page.getByTestId('auctions-browse-review')).toBeVisible()
    await page.goto(
      '/internal/design-system/components/table#auctions-browse-review'
    )
    await expect(table).toBeVisible()
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
