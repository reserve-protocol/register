import { expect, test, type Locator } from '@playwright/test'

const pilotUrl = (screen: string, theme: string) =>
  `/iframe.html?id=explorations-screen-pilots-${screen}--pilot&viewMode=story&globals=theme:${theme}`

const expectInside = async (item: Locator, frame: Locator) => {
  await expect
    .poll(async () => {
      const [a, b] = await Promise.all([
        item.boundingBox(),
        frame.boundingBox(),
      ])
      return Boolean(
        a &&
        b &&
        a.x >= b.x - 1 &&
        a.y >= b.y - 1 &&
        a.x + a.width <= b.x + b.width + 1 &&
        a.y + a.height <= b.y + b.height + 1
      )
    })
    .toBe(true)
}

test('overview chart exposes its existing label to assistive technology', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(pilotUrl('index-dtf-overview', 'light'))
  const chart = page.getByRole('group', {
    name: 'PHOTON YTD price history',
    exact: true,
  })
  await expect(chart).toBeVisible()
  const plot = chart.getByRole('application')
  await plot.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(
    page.getByTestId('chart-source-accessible-value')
  ).not.toContainText('$PHOTON')
})

test('pilots retain navigation and readable titles with a 200 percent default font', async ({
  page,
}) => {
  test.setTimeout(60_000)
  for (const width of [320, 390]) {
    for (const screen of ['index-dtf-overview', 'participate-and-earn']) {
      for (const theme of ['light', 'dark']) {
        await page.setViewportSize({ width, height: 844 })
        await page.goto(pilotUrl(screen, theme))
        await page.getByRole('heading', { level: 1 }).waitFor()
        await page.addStyleTag({
          content: 'html { font-size: 200% !important; }',
        })
        await page.evaluate(() => document.fonts.ready)
        const header = page.getByTestId('pilot-global-header')
        for (const control of await header.getByRole('button').all()) {
          if (await control.isVisible()) {
            await expectInside(control, header)
            const bounds = (await control.boundingBox())!
            expect(bounds.x).toBeGreaterThanOrEqual(0)
            expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1)
          }
        }
        const heading = page.getByRole('heading', { level: 1 })
        expect(
          await heading.evaluate((element) => {
            const style = getComputedStyle(element)
            return parseFloat(style.lineHeight) / parseFloat(style.fontSize)
          })
        ).toBeGreaterThanOrEqual(1)
        expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(
          (await header.boundingBox())!.height
        )
        if (screen === 'index-dtf-overview') {
          const actions = page.getByTestId('mobile-product-actions')
          const switcher = page.getByRole('button', {
            name: 'Switch DTF, current PHOTON',
          })
          for (const control of [
            switcher,
            ...(await actions.getByRole('button').all()),
          ]) {
            const bounds = (await control.boundingBox())!
            expect(bounds.x).toBeGreaterThanOrEqual(0)
            expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1)
            expect(bounds.y + bounds.height).toBeLessThanOrEqual(845)
          }
        }
        const utilities = page.getByRole('button', {
          name: 'Search, theme, and language',
          exact: true,
        })
        await utilities.click()
        const panel = page.getByRole('region', {
          name: 'Application utilities',
          exact: true,
        })
        await expect
          .poll(async () => {
            const bounds = await panel.boundingBox()
            return bounds ? bounds.y + bounds.height : Infinity
          })
          .toBeLessThanOrEqual(845)
        await page.keyboard.press('Escape')
        await page
          .getByRole('button', { name: 'Open global navigation', exact: true })
          .click()
        const dialog = page.getByRole('dialog', {
          name: 'Global navigation',
          exact: true,
        })
        await expect(dialog).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(
          page.getByRole('button', {
            name: 'Open global navigation',
            exact: true,
          })
        ).toBeFocused()
      }
    }
  }
})

test('mobile navigation remains reachable on short viewports and traps keyboard focus', async ({
  page,
}) => {
  for (const screen of ['index-dtf-overview', 'participate-and-earn']) {
    await page.setViewportSize({ width: 640, height: 360 })
    await page.goto(pilotUrl(screen, 'dark'))
    const trigger = page.getByRole('button', {
      name: 'Open global navigation',
      exact: true,
    })
    await trigger.click()
    const dialog = page.getByRole('dialog', {
      name: 'Global navigation',
      exact: true,
    })
    await expect
      .poll(async () => {
        const box = (await dialog.boundingBox())!
        return [
          box.x,
          box.width,
          Math.round(box.y),
          Math.round(360 - box.y - box.height),
        ]
      })
      .toEqual([104, 432, 16, 16])
    const links = dialog.getByRole('link')
    await links.last().focus()
    await expectInside(links.last(), dialog)
    await page.keyboard.press('Tab')
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement)
      )
    ).toBe(true)
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
  }
})

test('tablet navigation menus are centred and capped at 640px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 1180 })
  await page.goto(pilotUrl('index-dtf-overview', 'light'))
  for (const [opener, name] of [
    ['Open global navigation', 'Global navigation'],
    ['Switch DTF, current PHOTON', 'Switch DTF'],
  ]) {
    await page.getByRole('button', { name: opener, exact: true }).click()
    const dialog = page.getByRole('dialog', { name, exact: true })
    await expect
      .poll(async () => {
        const box = (await dialog.boundingBox())!
        return [box.x, box.width, box.height, Math.round(box.y)]
      })
      .toEqual([194, 432, 640, 270])
    await expect(
      dialog.locator('[data-slot$="navigation-overflow-fade"]')
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  }
})

test('keyboard focus on Holdings stays visible below the sticky header', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(pilotUrl('index-dtf-overview', 'light'))
  await page.getByTestId('chart-source-plot').getByRole('application').focus()
  const exposure = page.getByRole('tab', { name: 'Exposure', exact: true })
  for (
    let step = 0;
    step < 4 &&
    !(await exposure.evaluate((element) => element === document.activeElement));
    step++
  ) {
    await page.keyboard.press('Tab')
  }
  await expect(exposure).toBeFocused()
  await expect
    .poll(() =>
      exposure.evaluate((element) => {
        const bounds = element.getBoundingClientRect()
        return element.contains(
          document.elementFromPoint(
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2
          )
        )
      })
    )
    .toBe(true)
})

test('mobile search returns focus to utilities after dismissal in a reduced viewport', async ({
  page,
}) => {
  for (const screen of ['index-dtf-overview', 'participate-and-earn']) {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(pilotUrl(screen, 'light'))
    const utilities = page.getByRole('button', {
      name: 'Search, theme, and language',
      exact: true,
    })
    await utilities.click()
    await page.getByRole('button', { name: 'Search DTFs', exact: true }).click()
    const dialog = page.getByRole('dialog', {
      name: 'Search assets',
      exact: true,
    })
    const field = dialog.getByRole('searchbox', {
      name: 'Search assets',
      exact: true,
    })
    await expect(field).toBeFocused()
    await page.setViewportSize({ width: 390, height: 400 })
    await field.fill('PHOTON')
    await expectInside(field, dialog)
    await expect(field).toHaveCSS('font-size', '16px')
    await page.keyboard.press('Escape')
    await expect(utilities).toBeFocused()
  }
})

test('mobile product drawers return focus to the clicked opener', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(pilotUrl('index-dtf-overview', 'light'))
  for (const name of [
    'Switch DTF, current PHOTON',
    'Open PHOTON page navigation',
  ]) {
    const trigger = page.getByRole('button', { name, exact: true })
    await trigger.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
  }
})

test('enlarged-font floating controls do not obscure focused collateral actions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.goto(
    `${pilotUrl('index-dtf-overview', 'light')}&args=holdingsTab:collateral`
  )
  const bridged = page
    .getByRole('button', { name: 'Bridged', exact: true })
    .first()
  await expect(bridged).toBeVisible()
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  )
  for (const bridged of await page
    .getByRole('button', { name: 'Bridged', exact: true })
    .all()) {
    await bridged.focus()
    await expect(bridged).toBeFocused()
    await expect
      .poll(() =>
        bridged.evaluate((element) => {
          const bounds = element.getBoundingClientRect()
          return element.contains(
            document.elementFromPoint(
              bounds.x + bounds.width / 2,
              bounds.y + bounds.height / 2
            )
          )
        })
      )
      .toBe(true)
  }
})

test('Holdings facts reflow without overlapping when the default font grows', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.goto(pilotUrl('index-dtf-overview', 'light'))
  const details = page.locator('[data-slot=holding-details]').first()
  await expect(details).toBeVisible()
  for (const width of [320, 390, 430, 480, 511]) {
    await page.setViewportSize({ width, height: 844 })
    await expect
      .poll(async () => {
        const [row, cap] = await Promise.all([
          details.boundingBox(),
          details.locator('[data-slot=holding-market-cap]').boundingBox(),
        ])
        return Boolean(
          row && cap && Math.abs(cap.x + cap.width - row.x - row.width) < 0.5
        )
      })
      .toBe(true)
  }
  await page.setViewportSize({ width: 320, height: 844 })
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  await expect
    .poll(async () => {
      const [price, cap] = await Promise.all([
        details.getByText('Price Change (7d)', { exact: true }).boundingBox(),
        details.getByText('Market Cap', { exact: true }).boundingBox(),
      ])
      return Boolean(
        price &&
        cap &&
        (price.x + price.width <= cap.x || price.y + price.height <= cap.y)
      )
    })
    .toBe(true)
})
