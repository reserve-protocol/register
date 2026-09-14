import { test, expect, currentCapture } from './current-rebalance-helpers'
import { expectHelpToStayOpen } from './help-tooltip-assertions'

const route = '/internal/design-system/components/table'
const anchor = '#auctions-current-table-review'

for (const theme of ['light', 'dark']) {
  test(`completed reference and unknown round ${theme}`, async ({
    page,
    txLog,
  }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    for (const width of [1400, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      for (const query of [
        'current=complete',
        'current=ready&data=auction-error',
      ]) {
        await page.goto(`${route}?${query}${anchor}`)
        const table = page.getByTestId('current-rebalances-table')
        await expect(table).toBeVisible()
        const round = table
          .getByTestId('current-table-round')
          .filter({ visible: true })
        if (width === 1400) await expect(round).toHaveText('—')
        else await expect(round).toHaveCount(0)
        await currentCapture(
          page,
          table,
          info,
          `closeout-${theme}-${width}-${query.includes('complete') ? 'complete' : 'unknown'}`
        )
        await table.locator('a[data-table-focus^="details-"]:visible').click()
        const detail = page.getByTestId('current-retained-detail')
        await expect(detail).toBeVisible()
        await expect(detail.getByTestId('current-table-round')).toHaveCount(0)
        if (query === 'current=complete') {
          await expect(detail.locator('h3')).toHaveText('August 2026 Rebalance')
          await expect(
            detail.getByTestId('current-reference-identity')
          ).toHaveText('June 2026 Rebalance · Completed')
          await currentCapture(
            page,
            detail,
            info,
            `closeout-reference-${theme}-${width}`
          )
        } else {
          await expect(
            detail.getByTestId('current-table-status')
          ).toContainText('Unavailable')
        }
      }
    }
    expect(txLog).toHaveLength(0)
  })

  test(`desktop expiry is rebalance scoped ${theme}`, async ({
    page,
  }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto(`${route}?current=live${anchor}`)
    const table = page.getByTestId('current-rebalances-table')
    for (const width of [1072, 1400]) {
      await page.setViewportSize({ width, height: 900 })
      await expect(table.locator('thead')).toContainText('Rebalance expires in')
      await expect(
        table.getByTestId('current-table-round').filter({ visible: true })
      ).toContainText('Ends in')
      expect(
        await table.evaluate((el) => el.scrollWidth - el.clientWidth)
      ).toBeLessThanOrEqual(1)
      await currentCapture(
        page,
        table,
        info,
        `closeout-expiry-${theme}-${width}`
      )
    }
  })

  test.describe(`touch dismissal ${theme}`, () => {
    test.use({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 900 },
    })
    test('dismissal does not navigate and explicit links still work', async ({
      page,
      txLog,
    }, info) => {
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(`${route}?current=ready&viewer=member${anchor}`)
      const table = page.getByTestId('current-rebalances-table')
      const help = table.locator(
        '[data-testid="current-table-launcher-help"]:visible button'
      )
      const expiry = table.getByTestId('current-table-expiry')
      const details = table.locator('a[data-table-focus^="details-"]:visible')
      await currentCapture(
        page,
        table,
        info,
        `closeout-dismiss-before-${theme}`
      )
      await help.tap()
      await expectHelpToStayOpen(page)
      await expiry.tap()
      await expect(page.getByRole('tooltip')).toHaveCount(0)
      await expect(table).toBeVisible()
      await expect(page.getByTestId('current-retained-detail')).toHaveCount(0)
      await expiry.tap()
      await expect(page.getByTestId('current-retained-detail')).toBeVisible()
      await page.goBack()
      await expect(details).toBeFocused()
      await help.tap()
      await expectHelpToStayOpen(page)
      await details.tap()
      await expect(page.getByTestId('current-retained-detail')).toBeVisible()
      await page.goBack()
      await help.tap()
      await expectHelpToStayOpen(page)
      const proposer = table
        .getByTestId('rebalance-proposer-link')
        .filter({ visible: true })
      const destination = await proposer.getAttribute('href')
      const opened = page.waitForEvent('popup')
      await proposer.tap()
      const popup = await opened
      await expect(popup).toHaveURL(destination!)
      await popup.close()
      await expect(table).toBeVisible()
      await currentCapture(page, table, info, `closeout-dismiss-after-${theme}`)
      expect(txLog).toHaveLength(0)
    })
  })
}
