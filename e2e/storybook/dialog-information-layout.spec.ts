import { expect, test } from '@playwright/test'

for (const theme of ['light', 'dark']) {
  test(`informational dialogs keep headers and final content reachable (${theme})`, async ({
    page,
  }) => {
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 480 })
      for (const [story, title, openerName] of [
        [
          'whitepaper-information',
          'CFB Token Whitepapers',
          'Review CFB Whitepaper',
        ],
        ['asset-bridge-information', 'NVIDIA', 'NVIDIA'],
        ['bridged-crypto-information', 'BTCB Token', 'BTCB Token'],
      ]) {
        await page.goto(
          `/iframe.html?id=components-feedback-and-overlays-dialog--${story}&viewMode=story&globals=theme:${theme}`
        )
        const opener = page.getByRole('button', {
          name: openerName,
          exact: true,
        })
        await opener.click()
        const dialog = page.getByRole('dialog', { name: title, exact: true })
        const close = dialog.getByRole('button', {
          name: 'Close dialog',
          exact: true,
        })
        if (story === 'whitepaper-information') {
          await dialog.screenshot({
            animations: 'disabled',
            path: test
              .info()
              .outputPath(`whitepaper-initial-${theme}-${width}.png`),
          })
          await dialog
            .getByRole('button', {
              name: 'Summary of Changes from v1',
              exact: true,
            })
            .click()
        }
        await dialog.evaluate(async (element) => {
          await Promise.allSettled(
            element
              .getAnimations({ subtree: true })
              .map((animation) => animation.finished)
          )
        })
        const headerTop = (await close.boundingBox())!.y
        const box = (await dialog.boundingBox())!
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(width + 1)
        expect(
          await dialog.evaluate(
            (element) => element.scrollWidth <= element.clientWidth
          )
        ).toBe(true)
        expect(
          await dialog.evaluate(
            (element) =>
              [...element.querySelectorAll('*')].filter(
                (child) =>
                  /auto|scroll/.test(getComputedStyle(child).overflowY) &&
                  child.scrollHeight > child.clientHeight + 1
              ).length
          )
        ).toBeLessThanOrEqual(1)
        const lastAction =
          story === 'whitepaper-information'
            ? dialog.getByText(
                'Expanded J.1 to include energy usage data and the sources and methodologies used for its calculation.',
                { exact: false }
              )
            : dialog.getByRole('button', {
                name: 'Read about risks',
                exact: true,
              })
        await lastAction.scrollIntoViewIfNeeded()
        await expect(lastAction).toBeInViewport()
        await expect(close).toBeInViewport()
        expect((await close.boundingBox())!.y).toBeCloseTo(headerTop, 0)
        await dialog.screenshot({
          animations: 'disabled',
          path: test.info().outputPath(`${story}-${theme}-${width}.png`),
        })
        await dialog.evaluate((element) => {
          const body = [...element.querySelectorAll('*')].find((child) =>
            /auto|scroll/.test(getComputedStyle(child).overflowY)
          )
          if (body) body.scrollTop = body.scrollHeight
        })
        await expect(lastAction).toBeInViewport()
        const bodyBottom = await dialog.evaluate((element) => {
          const body = [...element.querySelectorAll('*')].find((child) =>
            /auto|scroll/.test(getComputedStyle(child).overflowY)
          )!
          return body.getBoundingClientRect().bottom
        })
        const finalAction = (await lastAction.boundingBox())!
        expect(
          bodyBottom - finalAction.y - finalAction.height
        ).toBeLessThanOrEqual(32)
        if (story !== 'whitepaper-information') {
          await lastAction.click()
          await expect(close).toBeInViewport()
          const riskHeaderTop = (await close.boundingBox())!.y
          const lastRisk = dialog.getByText(
            story === 'asset-bridge-information'
              ? 'Valuation & NAV risks'
              : 'Liquidity risk',
            { exact: true }
          )
          await lastRisk.scrollIntoViewIfNeeded()
          await expect(lastRisk).toBeInViewport()
          await expect(close).toBeInViewport()
          expect((await close.boundingBox())!.y).toBeCloseTo(riskHeaderTop, 0)
          expect((await dialog.boundingBox())!.y).toBeGreaterThanOrEqual(0)
          await dialog.screenshot({
            animations: 'disabled',
            path: test
              .info()
              .outputPath(`${story}-risks-${theme}-${width}.png`),
          })
        }
        await close.click()
        await expect(dialog).toBeHidden()
        await expect(opener).toBeFocused()
      }
    }
  })
}
