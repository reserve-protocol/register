import { test, expect, currentCapture } from './current-rebalance-helpers'
import { expectHelpToStayOpen } from './help-tooltip-assertions'

const route =
  '/internal/design-system/components/table?current=ready&viewer=member#auctions-current-table-review'

for (const theme of ['light', 'dark']) {
  test(`auction tables constrained composition ${theme}`, async ({
    page,
    txLog,
  }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto(route)
    await page.evaluate(() => document.fonts.ready)
    const current = page.getByTestId('current-rebalances-table')
    const history = page.getByTestId('historical-rebalances-table')
    for (const width of [390, 320, 383, 384, 430, 608, 768, 1072]) {
      await page.setViewportSize({ width, height: 900 })
      await currentCapture(page, current, info, `current-${theme}-${width}`)
      const status = current
        .getByTestId('current-table-status')
        .filter({ visible: true })
      const round = current
        .getByTestId('current-table-round')
        .filter({ visible: true })
      const statusBox = (await status.boundingBox())!
      const roundBox = (await round.boundingBox())!
      const helpBox = (await status.getByRole('button').boundingBox())!
      if (width < 1072) {
        const arrowBox = (await current
          .locator('a[data-table-focus^="details-"]:visible')
          .boundingBox())!
        const tableBox = (await current.boundingBox())!
        const pairedStatus = tableBox.width >= 352
        const anchorBox = pairedStatus
          ? (await status.getByTestId('lifecycle-status-pill').boundingBox())!
          : roundBox
        expect
          .soft(
            Math.abs(
              arrowBox.y +
                arrowBox.height / 2 -
                anchorBox.y -
                anchorBox.height / 2
            ),
            'arrow pairs with status, with an auction-row fallback below 352px'
          )
          .toBeLessThanOrEqual(1)
        const expiry = current.getByTestId('current-table-expiry')
        await expect(expiry).toHaveText(/Rebalance expires in/)
        const valueBox = (await expiry
          .getByTestId('current-table-expiry-value')
          .boundingBox())!
        expect
          .soft(
            arrowBox.x + arrowBox.width,
            'visible circle aligns with expiry'
          )
          .toBeCloseTo(valueBox.x + valueBox.width, 0)
        expect(valueBox.x + valueBox.width).toBeCloseTo(
          tableBox.x + tableBox.width - 24,
          0
        )
        expect((await expiry.boundingBox())!.y).toBeGreaterThanOrEqual(
          Math.max(
            statusBox.y + statusBox.height,
            arrowBox.y + arrowBox.height
          ) + 12
        )
      }
      expect
        .soft(
          statusBox.y >= roundBox.y + roundBox.height + 15 ||
            roundBox.x >= helpBox.x + helpBox.width + 12,
          `status and auction must not collide at ${width}`
        )
        .toBe(true)
      const textLines = await status
        .getByTestId('lifecycle-status-pill')
        .evaluate((el) => {
          const range = document.createRange()
          range.selectNode(el.lastChild!)
          return (
            range.getBoundingClientRect().height /
            parseFloat(getComputedStyle(el).lineHeight)
          )
        })
      expect
        .soft(textLines, `pill stays one line at ${width}`)
        .toBeLessThanOrEqual(1.1)
      const bottomStrip = await current.evaluate(
        (el) =>
          el.getBoundingClientRect().bottom -
          el.querySelector('tbody tr:last-child')!.getBoundingClientRect()
            .bottom
      )
      expect.soft(bottomStrip, 'hover surface reaches the table bottom').toBe(0)
      await currentCapture(
        page,
        history.locator('tbody tr').first(),
        info,
        `history-${theme}-${width}`
      )
      if (width === 320) {
        const title = history
          .getByTestId('history-record-title')
          .filter({ visible: true })
          .first()
        expect
          .soft(
            (await title.boundingBox())!.height,
            'title gets the full phone width'
          )
          .toBeLessThanOrEqual(24)
      }
      for (const table of [current, history])
        expect(
          await table.evaluate((el) => el.scrollWidth - el.clientWidth)
        ).toBeLessThanOrEqual(1)
    }
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.getByTestId('history-constrain').click()
    await currentCapture(page, current, info, `current-${theme}-column-390`)
    const status = current
      .getByTestId('current-table-status')
      .filter({ visible: true })
    const round = current
      .getByTestId('current-table-round')
      .filter({ visible: true })
    expect
      .soft((await status.boundingBox())!.y)
      .toBeGreaterThan((await round.boundingBox())!.y)
    await page.getByTestId('history-preview-state').click()
    await page.getByTestId('history-state-unavailable').click()
    await currentCapture(
      page,
      history.locator('tbody tr').last(),
      info,
      `history-${theme}-long-title-column-390`
    )
    expect(txLog.length).toBe(0)
  })
}

for (const width of [320, 390]) {
  for (const theme of ['light', 'dark']) {
    test.describe(`historical metric help on a touch device ${width} ${theme}`, () => {
      test.use({ hasTouch: true, viewport: { width, height: 900 } })
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
        test(`${field} opens on the first tap and can be dismissed`, async ({
          page,
          txLog,
        }, info) => {
          await page.addInitScript(
            (mode) => localStorage.setItem('theme-ui-color-mode', mode),
            theme
          )
          await page.goto(route)
          const row = page
            .getByTestId('historical-rebalances-table')
            .locator('tbody tr')
            .first()
          await currentCapture(page, row, info, `history-touch-${field}`)
          const button = row
            .getByTestId(`history-help-${field}`)
            .filter({ visible: true })
            .getByRole('button')
          await button.tap()
          await expect(page.getByRole('tooltip')).toHaveText(explanation)
          await expectHelpToStayOpen(page)
          await button.tap()
          await expect(page.getByRole('tooltip')).toHaveCount(0)
          await button.tap()
          await expect(page.getByRole('tooltip')).toHaveText(explanation)
          await expectHelpToStayOpen(page)
          await info.attach(`history-touch-${field}-${width}-${theme}-open`, {
            body: await page.screenshot({ animations: 'disabled' }),
            contentType: 'image/png',
          })
          await expect(page.getByRole('tooltip')).toBeVisible()
          await page.keyboard.press('Escape')
          await expect(page.getByRole('tooltip')).toHaveCount(0)
          await expect(page).toHaveURL(
            new RegExp('auctions-current-table-review$')
          )
          expect(txLog.length).toBe(0)
        })
      }
    })
  }
}

test('all current states fit intermediate container widths', async ({
  page,
  txLog,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto(
    '/internal/design-system/components/table#auctions-current-table-review'
  )
  const tables = page.getByTestId('current-rebalances-table')
  await expect(tables).toHaveCount(18)
  for (const width of [288, 351, 352, 353, 390, 430, 576, 1023, 1024]) {
    await tables.evaluateAll((elements, size) => {
      elements.forEach((el) => (el.style.width = `${size}px`))
    }, width)
    const failures = await tables.evaluateAll((elements) =>
      elements.flatMap((table, index) => {
        const status = Array.from(
          table.querySelectorAll('[data-testid="current-table-status"]')
        ).find((el) => el.getBoundingClientRect().height > 0)!
        const round = Array.from(
          table.querySelectorAll('[data-testid="current-table-round"]')
        ).find((el) => el.getBoundingClientRect().height > 0)!
        const pill = status.querySelector(
          '[data-testid="lifecycle-status-pill"]'
        )!
        const range = document.createRange()
        range.selectNode(pill.lastChild!)
        const statusBox = status.getBoundingClientRect()
        const roundBox = round?.getBoundingClientRect()
        const errors = []
        const arrow = Array.from(
          table.querySelectorAll('a[data-table-focus^="details-"]')
        ).find((el) => el.getBoundingClientRect().height > 0)!
        const arrowBox = arrow.getBoundingClientRect()
        const help = status.querySelector('button')
        if (table.getBoundingClientRect().width < 1024) {
          const anchorBox =
            roundBox && table.getBoundingClientRect().width < 352
              ? roundBox
              : pill.getBoundingClientRect()
          if (
            Math.abs(
              arrowBox.y +
                arrowBox.height / 2 -
                anchorBox.y -
                anchorBox.height / 2
            ) > 1
          )
            errors.push('arrow alignment')
          if (roundBox && statusBox.y < roundBox.bottom + 15)
            errors.push('status before auction')
          if (
            help &&
            Math.abs(help.getBoundingClientRect().y - arrowBox.y) < 20 &&
            help.getBoundingClientRect().right + 12 > arrowBox.left - 6
          )
            errors.push('overlapping help/link targets')
        }
        if (table.scrollWidth > table.clientWidth + 1) errors.push('overflow')
        if (
          range.getBoundingClientRect().height >
          parseFloat(getComputedStyle(pill).lineHeight) + 1
        )
          errors.push('wrapped pill')
        if (
          roundBox &&
          Math.abs(statusBox.y - roundBox.y) < 1 &&
          pill.getBoundingClientRect().right > roundBox.left - 12
        )
          errors.push('pill/auction overlap')
        return errors.map((error) => `${index}: ${error}`)
      })
    )
    expect(failures, `all 18 examples at ${width}px container`).toEqual([])
  }
  expect(txLog.length).toBe(0)
})
