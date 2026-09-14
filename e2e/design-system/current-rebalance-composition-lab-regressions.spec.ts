import {
  test,
  expect,
  currentSelect,
  currentCapture,
} from './current-rebalance-helpers'

for (const width of [1400, 900, 390, 320]) {
  test(`auction preparation shares one compact workspace at ${width}`, async ({
    page,
    txLog,
  }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(
      '/internal/design-system/components/table?current=repeat#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    const auction = current.getByTestId('current-auction')
    const disclosure = auction.getByTestId('current-liquidity-toggle')
    await expect(auction.getByTestId('current-launch')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    const measure = await auction.evaluate((el) => {
      const box = (id: string) =>
        el.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect()
      const launch = box('current-launch')
      const trigger = box('current-liquidity-toggle')
      const status = box('lifecycle-status-pill')
      const assets = el.querySelector('[data-testid="current-assets"]')!
      const [selling, buying] = Array.from(assets.children).map((group) =>
        group.getBoundingClientRect()
      )
      return {
        actionBottom: launch.bottom,
        triggerBottom: trigger.bottom,
        triggerTop: trigger.top,
        actionLeft: launch.left,
        triggerRight: trigger.right,
        statusRight: status.right,
        auctionRight: el.getBoundingClientRect().right,
        sellingTop: selling.top,
        sellingBottom: selling.bottom,
        buyingTop: buying.top,
        buyingBottom: buying.bottom,
        actionTop: launch.top,
        overflow: el.scrollWidth - el.clientWidth,
      }
    })
    if (width >= 880) {
      expect(measure.triggerTop - measure.buyingBottom).toBeGreaterThanOrEqual(
        12
      )
      expect(measure.triggerTop - measure.buyingBottom).toBeLessThanOrEqual(20)
      expect(measure.triggerRight).toBeLessThan(measure.actionLeft)
      expect(
        Math.abs(measure.sellingTop - measure.buyingTop)
      ).toBeLessThanOrEqual(1)
      await expect(
        auction.getByTestId('current-operation-divider')
      ).toBeVisible()
    } else {
      expect(measure.buyingTop).toBeGreaterThanOrEqual(measure.sellingBottom)
      expect(measure.actionTop).toBeGreaterThanOrEqual(measure.buyingBottom)
      expect(measure.triggerTop).toBeGreaterThanOrEqual(measure.actionBottom)
      await expect(
        auction.getByTestId('current-operation-divider')
      ).toBeHidden()
    }
    expect(measure.overflow).toBeLessThanOrEqual(1)
    expect(
      Math.abs(measure.statusRight - measure.auctionRight)
    ).toBeLessThanOrEqual(1)
    await currentCapture(page, current, info, `composition-${width}-repeat`)
    await disclosure.click()
    await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
    const table = auction.getByTestId('current-liquidity-table').first()
    await expect(table).toBeVisible()
    const tableBox = await table.boundingBox()
    const auctionBox = await auction.boundingBox()
    expect(Math.abs(tableBox!.width - auctionBox!.width)).toBeLessThanOrEqual(2)
    await page.setViewportSize({
      width: width >= 880 ? 390 : 1400,
      height: 900,
    })
    await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
    await expect(table).toBeVisible()
    await disclosure.click()
    await currentSelect(page, 'scene', 'live')
    await expect(auction.getByTestId('current-end-time')).toBeVisible()
    await auction.getByTestId('current-bid-1').click()
    await expect(auction.getByTestId('current-bid-detail')).toBeVisible()
    await page.setViewportSize({ width, height: 900 })
    await expect(auction.getByTestId('current-bid-detail')).toBeVisible()
    const liveHeading = await auction.evaluate((el) => {
      const title = el
        .querySelector('[data-testid="current-auction-heading"]')!
        .getBoundingClientRect()
      const status = el
        .querySelector('[data-testid="lifecycle-status-pill"]')!
        .getBoundingClientRect()
      return Math.abs(title.y + title.height / 2 - status.y - status.height / 2)
    })
    if (width >= 880) expect(liveHeading).toBeLessThanOrEqual(1)
    else expect(liveHeading).toBeGreaterThan(24)
    expect(
      await auction.evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
    await currentCapture(page, current, info, `composition-${width}-live`)
    expect(txLog).toHaveLength(0)
  })
}
