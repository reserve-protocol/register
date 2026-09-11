import { expect, test } from '../fixtures/base'

for (const width of [320, 375, 1400]) {
  test(`overview preserves its starting scroll position at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 812 })
    await page.goto('/internal/design-system/components')
    await expect(page.getByTestId('canonical-component-overview')).toBeVisible()
    await expect(
      page.getByTestId('components-overview').locator('h1')
    ).toBeInViewport()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(width)
  })
}

test('narrow table keeps its last column reachable without page overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/internal/design-system/components')
  const table = page.getByTestId('canonical-index-data-slice')
  await table.scrollIntoViewIfNeeded()
  await expect(table).toHaveCSS('overflow-x', 'auto')
  await table.evaluate((node) => {
    node.scrollLeft = node.scrollWidth
  })
  expect(await table.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0)
  const tableRect = await table.boundingBox()
  const lastColumn = await table
    .getByText('Market cap', { exact: true })
    .boundingBox()
  expect(lastColumn!.x + lastColumn!.width).toBeLessThanOrEqual(
    tableRect!.x + tableRect!.width
  )
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(375)
})

for (const width of [320, 359, 360, 375])
  test(`Stake label fits its intended boundary at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 812 })
    await page.goto(
      '/internal/design-system/components/transaction-action#transaction-composition-stake'
    )
    const mode = page
      .getByRole('group', { name: 'Staking task mode' })
      .getByRole('radio', {
        name: width <= 359 ? 'Stake' : 'Stake RSR',
        exact: true,
      })
    await mode.scrollIntoViewIfNeeded()
    if (width <= 359) {
      await expect(mode).toHaveAccessibleName('Stake')
      return
    }
    const gap = await mode.evaluate((node) => {
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
      const nodes: Text[] = []
      while (walker.nextNode()) nodes.push(walker.currentNode as Text)
      const bounds = (word: string) => {
        const text = nodes.find((text) => text.data.includes(word))!
        const start = text.data.indexOf(word)
        const range = document.createRange()
        range.setStart(text, start)
        range.setEnd(text, start + word.length)
        return range.getBoundingClientRect()
      }
      return bounds('RSR').left - bounds('Stake').right
    })
    expect(gap).toBeGreaterThan(2)
  })

test('an opened contained dialog retains focus trapping and returns focus when closed', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 375, height: 600 })
  await page.goto(
    '/internal/design-system/components/transaction-action#transaction-composition-vote-lock'
  )
  const surface = page.locator('#transaction-composition-vote-lock')
  const dialog = surface.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Close Vote Lock' }).click()
  const opener = surface.getByRole('button', {
    name: 'Vote-lock $RSR',
    exact: true,
  })
  await expect(opener).toBeFocused()
  await opener.click()
  await expect(dialog).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(dialog.locator(':focus')).toHaveCount(1)
  await page.keyboard.press('Shift+Tab')
  await testInfo.attach('focus-boundary', {
    contentType: 'application/json',
    body: Buffer.from(
      JSON.stringify(
        await dialog.evaluate((node) => ({
          active: document.activeElement?.outerHTML,
          elements: [
            ...node.querySelectorAll('button, input, a[href], [tabindex]'),
          ].map((e) => ({
            html: e.outerHTML,
            tabIndex: (e as HTMLElement).tabIndex,
            rects: e.getClientRects().length,
          })),
        }))
      )
    ),
  })
  await expect(dialog.locator(':focus')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()
})
