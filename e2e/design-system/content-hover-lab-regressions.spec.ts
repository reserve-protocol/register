import { test, expect, currentCapture } from './current-rebalance-helpers'
import type { Locator } from '@playwright/test'

async function settle(target: Locator) {
  await target.evaluate(async (el) => {
    await Promise.all(el.getAnimations().map((animation) => animation.finished))
  })
}

async function color(target: Locator) {
  return target.evaluate((el) => {
    const style = getComputedStyle(el)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const context = canvas.getContext('2d')!
    const read = (fill: string) => {
      context.clearRect(0, 0, 1, 1)
      context.fillStyle = fill
      context.fillRect(0, 0, 1, 1)
      return [...context.getImageData(0, 0, 1, 1).data]
    }
    return {
      actual: read(style.backgroundColor),
      card: read(`hsl(${style.getPropertyValue('--card')})`),
      seam: read(`hsl(${style.getPropertyValue('--secondary')})`),
      hover: read(style.getPropertyValue('--interactive-content-hover')),
    }
  })
}

for (const theme of ['light', 'dark']) {
  test(`interactive content hover ${theme}`, async ({ page, txLog }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto(
      '/internal/design-system/components/table?current=ready#auctions-current-table-review'
    )
    const retainedRows = [
      page.locator('[data-record-kind="governance"]').first(),
      page.getByTestId('earn-composition').locator('tbody tr').first(),
      page
        .getByTestId('current-rebalances-table')
        .first()
        .locator('tbody tr')
        .first(),
    ]
    for (const width of [390, 1400]) {
      await page.setViewportSize({ width, height: 900 })
      const rows = [
        ...retainedRows,
        page.getByTestId('table-family-positions').locator('tbody tr').first(),
        width === 1400
          ? page.getByTestId('discover-composition').locator('tbody tr').first()
          : page.getByTestId('discover-card').first(),
      ]
      const colors = []
      for (const [index, row] of rows.entries()) {
        await currentCapture(
          page,
          row,
          info,
          `content-hover-base-${theme}-${width}-${index}`
        )
        const before = await row.boundingBox()
        await row.hover()
        await settle(row)
        await expect.poll(async () => (await color(row)).actual[3]).toBe(255)
        const result = await color(row)
        colors.push(result.actual)
        expect
          .soft(result.actual[3], 'opaque hover, independent of substrate')
          .toBe(255)
        if (theme === 'light') {
          expect.soft(result.actual[0]).toBeGreaterThan(result.actual[1])
          expect.soft(result.actual[1]).toBeGreaterThan(result.actual[2])
          expect
            .soft(result.actual[2], 'lighter than the beige seam')
            .toBeGreaterThan(result.seam[2])
          expect
            .soft(result.actual[2], 'visible against the white card')
            .toBeLessThan(result.card[2])
        } else {
          result.actual
            .slice(0, 3)
            .forEach((channel, index) =>
              expect.soft(channel).toBeGreaterThan(result.card[index])
            )
        }
        expect.soft(await row.boundingBox()).toEqual(before)
        await info.attach(`content-hover-${theme}-${width}-${index}`, {
          body: await page.screenshot(),
          contentType: 'image/png',
        })
      }
      for (const actual of colors.slice(1))
        expect.soft(actual).toEqual(colors[0])
      const withdrawals = page
        .getByTestId('table-family-withdrawals')
        .locator('tbody tr')
        .first()
      await withdrawals.scrollIntoViewIfNeeded()
      await page.mouse.move(0, 0)
      await settle(withdrawals)
      const resting = await color(withdrawals)
      await withdrawals.hover()
      await settle(withdrawals)
      expect(await color(withdrawals)).toEqual(resting)
    }
    const history = page
      .getByRole('table', { name: 'Historical Rebalances' })
      .locator('tbody tr')
      .first()
    await history.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    await settle(history)
    const historyRest = await color(history)
    await history.hover()
    await settle(history)
    expect(await color(history)).toEqual(historyRest)
    await page.getByRole('combobox', { name: 'Earn preview state' }).click()
    await page
      .getByRole('option', { name: 'Loading opportunities', exact: true })
      .click()
    const loading = retainedRows[1]
    await loading.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    await settle(loading)
    const loadingRest = await color(loading)
    await loading.hover()
    await settle(loading)
    expect(await color(loading)).toEqual(loadingRest)
    expect(txLog).toHaveLength(0)
  })

  test(`content hover masks and loading ${theme}`, async ({ page }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto('/internal/design-system/components/table')
    await page.getByRole('combobox', { name: 'Discover card layout' }).click()
    await page.getByRole('option', { name: 'Full chart', exact: true }).click()
    const card = page.getByTestId('discover-card').first()
    const ticker = card.locator('[data-slot="card-asset-ticker"] .from-card')
    const chart = card.locator('[data-slot="discover-card-chart"] .to-card')
    await card.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    const resting = await ticker.evaluate(
      (el) => getComputedStyle(el).backgroundImage
    )
    await card.hover()
    await expect
      .poll(() => ticker.evaluate((el) => getComputedStyle(el).backgroundImage))
      .not.toBe(resting)
    for (const [mask, stop] of [
      [ticker, 'from'],
      [chart, 'to'],
    ] as const) {
      await expect
        .poll(() =>
          mask.evaluate((el, edge) => {
            const style = getComputedStyle(el)
            return style
              .getPropertyValue(`--tw-gradient-${edge}`)
              .includes(
                style.getPropertyValue('--interactive-content-hover').trim()
              )
          }, stop)
        )
        .toBe(true)
    }
    expect((await color(card.locator(':scope > div').first())).actual).toEqual(
      (await color(card)).actual
    )
    expect(
      (await color(card.locator('[data-slot="card-asset-ticker"] > div')))
        .actual
    ).toEqual((await color(card)).actual)
    await info.attach(`content-hover-full-card-${theme}`, {
      body: await page.screenshot(),
      contentType: 'image/png',
    })
    await page.getByRole('combobox', { name: 'Discover preview state' }).click()
    await page.getByRole('option', { name: 'Loading', exact: true }).click()
    const skeleton = page.getByTestId('discover-card-skeleton').first()
    const skeletonMask = skeleton.locator(
      '[data-slot="card-asset-ticker"] .from-card'
    )
    await skeleton.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    const skeletonRest = await color(skeleton)
    const maskRest = await skeletonMask.evaluate(
      (el) => getComputedStyle(el).backgroundImage
    )
    await skeleton.hover()
    await settle(skeleton)
    expect(await color(skeleton)).toEqual(skeletonRest)
    expect(
      await skeletonMask.evaluate((el) => getComputedStyle(el).backgroundImage)
    ).toBe(maskRest)
    await page.setViewportSize({ width: 1400, height: 900 })
    const loadingRow = page
      .getByTestId('discover-composition')
      .locator('tbody tr')
      .first()
    await loadingRow.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    await settle(loadingRow)
    const rowRest = await color(loadingRow)
    await loadingRow.hover()
    await settle(loadingRow)
    expect(await color(loadingRow)).toEqual(rowRest)
  })

  test(`neutral catalog content hover ${theme}`, async ({ page }) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto('/internal/design-system/foundations')
    const tile = page
      .getByTestId('foundation-visual-overview')
      .getByRole('link')
      .first()
    await tile.hover()
    await settle(tile.locator(':scope > div').first())
    expect((await color(tile)).actual).not.toEqual((await color(tile)).card)
    expect((await color(tile.locator(':scope > div').first())).actual).toEqual(
      (await color(tile)).actual
    )
    await tile.focus()
    await expect(tile).toBeFocused()
    await page.goto('/internal/design-system/components')
    const row = page.locator('[data-testid^="component-unrendered-"]').first()
    await row.hover()
    expect((await color(row)).actual).toEqual((await color(row)).hover)
  })
}
