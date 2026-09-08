import { expect, test } from '../fixtures/base'

test('Transaction section navigation stays above contained previews while scrolling', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/transaction-action#transaction-composition-rfq'
  )
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    for (const id of ['rfq', 'stake', 'vote-lock', 'staged', 'atomic']) {
      const stage = page.getByTestId(`transaction-composition-${id}-stage`)
      await stage.evaluate((el) =>
        window.scrollTo(
          0,
          window.scrollY + el.getBoundingClientRect().top + 120
        )
      )
      const nav = page.locator(
        'nav[aria-labelledby="transaction-system-review-title"]'
      )
      await expect
        .poll(
          () =>
            nav.evaluate((el) => {
              const r = el.getBoundingClientRect()
              return el.contains(
                document.elementFromPoint(r.left + 35, r.top + r.height / 2)
              )
            }),
          { message: `${width}/${id}: navigation above preview` }
        )
        .toBe(true)
      await nav
        .locator('a[href="#transaction-composition-atomic"]')
        .click({ trial: true })
    }
  }
})

test('Contained dialog backdrops cover the entire transaction canvas', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/transaction-action#transaction-composition-stake'
  )
  for (const width of [390, 1280, 1600]) {
    await page.setViewportSize({ width, height: 900 })
    for (const id of ['stake', 'vote-lock']) {
      const stage = page.getByTestId(`transaction-composition-${id}-stage`)
      const stageBox = (await stage.boundingBox())!
      const layerBox = (await stage
        .getByTestId('transaction-contained-modal-layer')
        .boundingBox())!
      for (const edge of ['x', 'y', 'width', 'height'] as const) {
        expect(
          Math.abs(layerBox[edge] - stageBox[edge]),
          `${width}/${id}/${edge}`
        ).toBeLessThanOrEqual(2)
      }
    }
  }
})

test('Tall transaction previews fit their canvas without clipping', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(
    '/internal/design-system/components/transaction-action#transaction-composition-rfq'
  )
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const [id, group, option] of [
      ['rfq', 2, 1],
      ['stake', 0, 2],
      ['vote-lock', 2, 0],
    ] as const) {
      await page
        .getByTestId(
          `transaction-composition-${id}-state-group-${group}-option-${option}`
        )
        .click()
      const stage = page.getByTestId(`transaction-composition-${id}-stage`)
      const content = stage.locator(
        id === 'rfq'
          ? '[data-testid="zapper-outcome-composition"]'
          : '[role="dialog"]'
      )
      const s = (await stage.boundingBox())!
      const c = (await content.boundingBox())!
      expect(c.y, `${id}: top`).toBeGreaterThanOrEqual(s.y)
      expect(c.y + c.height, `${id}: bottom`).toBeLessThanOrEqual(
        s.y + s.height
      )
      await page.setViewportSize({ width, height: Math.ceil(s.height) + 300 })
      await stage.screenshot({
        path: testInfo.outputPath(`${id}-${width}.png`),
      })
    }
  }
})
