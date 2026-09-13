import { expect, type Locator } from '@playwright/test'

export async function expectDiscoverCardSurfaces(composition: Locator) {
  const list = composition.locator('ul[aria-label="Discover DTF sample"]')
  await expect(list).toHaveCSS('padding', '2px')
  await expect(list).toHaveCSS('row-gap', '2px')
  await expect(list).toHaveCSS('column-gap', '2px')
  const geometry = await list.evaluate((el) => {
    const box = el.getBoundingClientRect()
    const items = [...el.children].map((item) => {
      const card = item.firstElementChild!
      const media = card.firstElementChild!
      const rect = card.getBoundingClientRect()
      const style = getComputedStyle(card)
      const topRow =
        media.firstElementChild!.firstElementChild!.getBoundingClientRect()
      const footer = card.lastElementChild!
      const ticker = card
        .querySelector('[data-slot="card-asset-ticker"]')!
        .firstElementChild!.getBoundingClientRect()
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        filled: rect.height === item.getBoundingClientRect().height,
        radius: style.borderRadius,
        background: style.backgroundColor,
        image: style.backgroundImage,
        mediaRadius: getComputedStyle(media).borderRadius,
        mediaBackground: getComputedStyle(media).backgroundColor,
        mediaImage: getComputedStyle(media).backgroundImage,
        contentInsets: [
          topRow.left - rect.left,
          rect.right - topRow.right,
          topRow.top - rect.top,
          footer.firstElementChild!.getBoundingClientRect().left - rect.left,
          rect.right - footer.lastElementChild!.getBoundingClientRect().right,
        ],
        footerBottomPadding: getComputedStyle(footer).paddingBottom,
        tickerInsets: [ticker.left - rect.left, rect.right - ticker.right],
        footerTypography: [...footer.children].map((child) => {
          const style = getComputedStyle(child)
          return { fontSize: style.fontSize, lineHeight: style.lineHeight }
        }),
      }
    })
    const top = Math.min(...items.map((item) => item.top))
    const firstRow = items.filter((item) => item.top === top)
    const nextRow = items.find((item) => item.top > top)
    return {
      insets: [
        Math.min(...items.map((item) => item.left)) - box.left,
        box.right - Math.max(...items.map((item) => item.right)),
        top - box.top,
        box.bottom - Math.max(...items.map((item) => item.bottom)),
      ],
      seam: nextRow!.top - Math.max(...firstRow.map((item) => item.bottom)),
      background: getComputedStyle(el).backgroundColor,
      items,
    }
  })
  expect(geometry.insets).toEqual([2, 2, 2, 2])
  expect(geometry.seam).toBe(2)
  for (const item of geometry.items) {
    expect(item.contentInsets).toEqual([24, 24, 24, 24, 24])
    expect(item.tickerInsets).toEqual([4, 4])
    expect(item.footerBottomPadding).toBe('24px')
    expect(item.footerTypography).toEqual([
      { fontSize: '14px', lineHeight: '20px' },
      { fontSize: '14px', lineHeight: '20px' },
    ])
    expect(item.filled).toBe(true)
    expect(item.radius).toBe('0px')
    expect(item.mediaRadius).toBe('0px')
    expect(item.image).toBe('none')
    expect(item.mediaImage).toBe('none')
    expect(item.mediaBackground).toBe(item.background)
    expect(item.background).not.toBe(geometry.background)
    expect(geometry.background).not.toBe('rgba(0, 0, 0, 0)')
  }
}
