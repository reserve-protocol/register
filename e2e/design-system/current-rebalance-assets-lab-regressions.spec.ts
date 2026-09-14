import {
  test,
  expect,
  currentSelect,
  currentCapture,
} from './current-rebalance-helpers'

for (const theme of ['light', 'dark']) {
  for (const width of [1400, 900, 390, 320]) {
    test(`auction asset stacks retain every asset ${theme} ${width}`, async ({
      page,
      txLog,
    }, info) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(
        '/internal/design-system/components/table?current=repeat#auctions-browse-review'
      )
      const current = page.getByTestId('current-rebalance-workspace')
      const assets = current.getByTestId('current-assets')
      const selling = assets.locator(':scope > div').first()
      const buying = assets.locator(':scope > div').last()
      const expected = [
        'ETH, XRP, TRX, ADA, LINK, LTC, AVAX, BCH, SHIB',
        'BTCB, WBNB, SOL, HBAR, ZEC, XLM, HYPE, DOGE, SUI',
      ]
      for (const [index, group] of [selling, buying].entries()) {
        const stack = group.getByTestId('canonical-token-logo-stack')
        const label = group.getByTestId('current-asset-symbols')
        await expect(stack.locator('img')).toHaveCount(9)
        await expect(stack.locator('img').first()).toHaveCSS('width', '32px')
        await expect(label).toHaveText(expected[index])
        await expect(label).toHaveCSS('font-size', '14px')
        await expect(label).toHaveCSS('line-height', '20px')
        await expect(label).toHaveCSS(
          'color',
          await group
            .locator(':scope > p')
            .evaluate((el) => getComputedStyle(el).color)
        )
        expect(
          await stack
            .locator('img')
            .evaluateAll((images) =>
              images.map((image) => image.getAttribute('alt'))
            )
        ).toEqual(expected[index].split(', '))
        const gap = await label.evaluate(
          (el) =>
            el.getBoundingClientRect().top -
            el.previousElementSibling!.getBoundingClientRect().bottom
        )
        expect(gap).toBe(8)
        const boxes = await stack.locator('img').evaluateAll((images) =>
          images.map((image) => ({
            x: image.getBoundingClientRect().x,
            y: image.getBoundingClientRect().y,
          }))
        )
        expect(new Set(boxes.map((box) => box.y)).size).toBe(1)
        for (let i = 1; i < boxes.length; i++) {
          expect(boxes[i].x).toBeGreaterThan(boxes[i - 1].x)
          expect(boxes[i].x - boxes[i - 1].x).toBeLessThan(32)
        }
      }
      expect(
        await current.evaluate((el) => el.scrollWidth - el.clientWidth)
      ).toBeLessThanOrEqual(1)
      if (width === 1400) {
        await expect(buying.getByTestId('current-asset-symbols')).toHaveCSS(
          'height',
          '20px'
        )
        const plan = await current
          .getByTestId('current-auction-plan')
          .boundingBox()
        const divider = await current
          .getByTestId('current-operation-divider')
          .boundingBox()
        expect(divider!.x - plan!.x - plan!.width).toBe(24)
      }
      await currentCapture(
        page,
        current,
        info,
        `assets-${theme}-${width}-repeat`
      )
      await currentSelect(page, 'scene', 'remove')
      await expect(selling.locator('img')).toHaveCount(1)
      await expect(buying.locator('img')).toHaveCount(17)
      await expect(buying.getByTestId('current-asset-symbols')).toHaveText(
        'XRP, TRX, ADA, LINK, LTC, AVAX, BCH, SHIB, BTCB, WBNB, SOL, HBAR, ZEC, XLM, HYPE, DOGE, SUI'
      )
      await expect
        .poll(() => current.evaluate((el) => el.scrollWidth - el.clientWidth))
        .toBeLessThanOrEqual(1)
      await currentCapture(
        page,
        current,
        info,
        `assets-${theme}-${width}-remove`
      )
      await currentSelect(page, 'data', 'metadata-error')
      await expect(selling).toContainText('—')
      await expect(buying).toContainText('—')
      await expect(
        assets.getByTestId('canonical-token-logo-stack')
      ).toHaveCount(0)
      await currentSelect(page, 'data', 'pending')
      await expect(selling.locator('img')).toHaveCount(1)
      await currentSelect(page, 'data', 'ready')
      await currentSelect(page, 'scene', 'repeat')
      await page.setViewportSize({
        width: width === 1400 ? 320 : 1400,
        height: 900,
      })
      await expect(selling.locator('img')).toHaveCount(9)
      await currentSelect(page, 'scene', 'remove')
      await expect(buying.locator('img')).toHaveCount(17)
      await expect
        .poll(() => current.evaluate((el) => el.scrollWidth - el.clientWidth))
        .toBeLessThanOrEqual(1)
      await current.getByTestId('current-liquidity-toggle').click()
      await expect(
        current.getByTestId('current-liquidity-table').first()
      ).toBeVisible()
      expect(txLog).toHaveLength(0)
    })
  }
}
