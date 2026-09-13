import { test, expect } from '../fixtures/base'
import { readReviewSource, assertUnchangedSource } from './review-source'

test('owned positions are composed in the Table lab', async ({ page }) => {
  await page.goto(
    '/internal/design-system/components/table#owned-positions-review'
  )
  const review = page.getByTestId('owned-positions-review')
  await expect(review).toBeVisible()
  await expect(
    review.getByRole('heading', { name: 'Vote-locked positions' })
  ).toBeVisible()
  await expect(
    review
      .getByRole('button', { name: 'Modify vlRSR-LCAP', exact: true })
      .filter({ visible: true })
  ).toBeVisible()
})

for (const theme of ['light', 'dark']) {
  for (const width of [320, 390, 1400]) {
    test(`owned positions ${theme} ${width}`, async ({ page, txLog }, info) => {
      const source = readReviewSource(process.cwd())
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(
        '/internal/design-system/components/table#owned-positions-review'
      )
      const review = page.getByTestId('owned-positions-review')
      const table = review.getByTestId('owned-table')
      const select = async (label: string, option: string) => {
        await review.getByRole('combobox', { name: label }).click()
        await page.getByRole('option', { name: option, exact: true }).click()
      }
      for (const family of ['Vote-locked positions', 'Staked RSR Positions']) {
        await select('Position type', family)
        for (const mode of [
          'Default',
          'Long content',
          'Loading wallet position',
          'Zero / unavailable',
          'Loading',
        ]) {
          await select('Preview state', mode)
          await table.scrollIntoViewIfNeeded()
          await page.evaluate(() => document.fonts.ready)
          expect(
            await table.evaluate(
              (element) => element.scrollWidth <= element.clientWidth + 1
            )
          ).toBe(true)
          expect(
            await table.locator('*').evaluateAll((elements) =>
              elements
                .filter((element) => {
                  const css = getComputedStyle(element)
                  return (
                    /auto|scroll/.test(css.overflowX) &&
                    element.scrollWidth > element.clientWidth + 1
                  )
                })
                .map((element) => element.className)
            )
          ).toEqual([])
          const facts = table.locator(
            '[data-owned-row] [data-testid="canonical-metric-value"]:visible, [data-owned-row] a:visible, [data-owned-row] button:visible'
          )
          expect(
            await facts.evaluateAll((elements) =>
              elements
                .filter((element) => {
                  const bounds = element.getBoundingClientRect()
                  const surface = element
                    .closest('[data-testid="owned-table"]')!
                    .getBoundingClientRect()
                  const range = document.createRange()
                  range.selectNodeContents(element)
                  const text = range.getBoundingClientRect()
                  return (
                    bounds.left < surface.left ||
                    bounds.right > Math.min(innerWidth, surface.right) + 1 ||
                    text.right > Math.min(innerWidth, surface.right) + 1
                  )
                })
                .map((element) => element.textContent)
            )
          ).toEqual([])
          const clipped = await table
            .locator(
              '[data-owned-row] a:visible, [data-owned-row] button:visible'
            )
            .evaluateAll((elements) =>
              elements
                .filter((element) => {
                  const bounds = element.getBoundingClientRect()
                  const cell = element.closest('td')!.getBoundingClientRect()
                  return bounds.left < cell.left || bounds.right > cell.right
                })
                .map((element) => element.textContent)
            )
          expect(clipped).toEqual([])
          if (mode === 'Default' || mode === 'Long content')
            await info.attach(`${family}-${mode}`, {
              body: await page.screenshot({ animations: 'disabled' }),
              contentType: 'image/png',
            })
        }
        await select('Preview state', 'Empty')
        await expect(table).toHaveCount(0)
      }
      expect(txLog).toHaveLength(0)
      assertUnchangedSource(source, readReviewSource(process.cwd()))
    })
  }
}

test('vote-lock actions and disclosure retain focus across the responsive boundary', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto(
    '/internal/design-system/components/table#owned-positions-review'
  )
  const review = page.getByTestId('owned-positions-review')
  const visible = (key: string) =>
    review.locator(`[data-table-focus="${key}"]:visible`)
  await visible('governs-expand-shared').click()
  await expect(visible('governs-expand-shared')).toHaveAttribute(
    'aria-expanded',
    'true'
  )
  await page.keyboard.press('Escape')
  await expect(visible('governs-expand-shared')).toBeFocused()
  const modify = visible('modify-shared')
  await modify.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.setViewportSize({ width: 390, height: 900 })
  await page.keyboard.press('Escape')
  await expect(visible('modify-shared')).toBeFocused()
  await expect(visible('governs-expand-shared')).toHaveAttribute(
    'aria-expanded',
    'false'
  )
  await visible('underlying-shared').focus()
  await page.setViewportSize({ width: 1600, height: 1000 })
  await expect(visible('underlying-shared')).toBeFocused()
  await review.getByRole('combobox', { name: 'Preview state' }).click()
  await page.getByRole('option', { name: 'Empty', exact: true }).click()
  await expect(review.getByTestId('owned-table')).toHaveCount(0)
  await review.getByRole('combobox', { name: 'Preview state' }).click()
  await page.getByRole('option', { name: 'Default', exact: true }).click()
  await expect(visible('governs-expand-shared')).toHaveAttribute(
    'aria-expanded',
    'false'
  )
  await visible('underlying-shared').focus()
  await page.setViewportSize({ width: 390, height: 900 })
  await expect(visible('underlying-shared')).toBeFocused()
})

for (const theme of ['light', 'dark']) {
  for (const width of [390, 1400]) {
    test(`owned governed list opens without growing its row at ${width} ${theme}`, async ({
      page,
      txLog,
    }, info) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(
        '/internal/design-system/components/table#owned-positions-review'
      )
      const review = page.getByTestId('owned-positions-review')
      const trigger = review.locator(
        '[data-table-focus="governs-expand-shared"]:visible'
      )
      await trigger.scrollIntoViewIfNeeded()
      await page.evaluate(() => document.fonts.ready)
      await expect(trigger).toHaveText('+3')
      const row = trigger.locator('xpath=ancestor::tr')
      const before = await row.boundingBox()
      const lastName = review.locator(
        '[data-table-focus="governs-shared-1"]:visible'
      )
      expect(
        Math.abs(
          (await lastName.boundingBox())!.y - (await trigger.boundingBox())!.y
        )
      ).toBeLessThan(2)
      await trigger.hover()
      const list = page.getByTestId('owned-governed-assets')
      await expect(list).toBeVisible()
      await expect(list.getByRole('link')).toHaveCount(5)
      await list.hover()
      await expect(list).toBeVisible()
      expect((await row.boundingBox())?.height).toBe(before?.height)
      const bounds = (await list.boundingBox())!
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      await info.attach(`governed-list-${width}-${theme}`, {
        body: await page.screenshot(),
        contentType: 'image/png',
      })
      await page.mouse.move(0, 0)
      await expect(list).toBeHidden()
      await trigger.focus()
      await page.keyboard.press('Enter')
      await expect(list.getByRole('link').first()).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(list).toBeHidden()
      await expect(trigger).toBeFocused()
      await trigger.click()
      await expect(list).toBeVisible()
      await page.mouse.move(0, 0)
      await expect(list.getByRole('link').first()).toBeFocused()
      await page.setViewportSize({
        width: width === 390 ? 1400 : 390,
        height: 900,
      })
      await expect(list).toBeHidden()
      await expect(
        review.locator('[data-table-focus="governs-expand-shared"]:visible')
      ).toBeFocused()
      expect(txLog).toHaveLength(0)
    })
  }
}

test.describe('owned governed list with touch input', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } })
  test('tap opens the full list and outside tap dismisses it', async ({
    page,
  }) => {
    await page.goto(
      '/internal/design-system/components/table#owned-positions-review'
    )
    const review = page.getByTestId('owned-positions-review')
    const trigger = review.locator(
      '[data-table-focus="governs-expand-shared"]:visible'
    )
    await trigger.tap()
    const list = page.getByTestId('owned-governed-assets')
    await expect(list).toBeVisible()
    await expect(list.getByRole('link')).toHaveCount(5)
    await page.touchscreen.tap(5, 140)
    await expect(list).toBeHidden()
    await trigger.tap()
    await expect(list).toBeVisible()
    await review.getByRole('combobox', { name: 'Preview state' }).click()
    await page.getByRole('option', { name: 'Loading', exact: true }).click()
    await expect(list).toHaveCount(0)
  })
})

test('owned container threshold and realistic constrained preview', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1400, height: 1000 })
  await page.goto(
    '/internal/design-system/components/table#owned-positions-review'
  )
  const review = page.getByTestId('owned-positions-review')
  const composition = review.getByTestId('owned-composition')
  await review.getByRole('switch', { name: 'Constrained column' }).click()
  await expect
    .poll(async () => (await composition.boundingBox())?.width)
    .toBe(390)
  await composition.scrollIntoViewIfNeeded()
  await info.attach('390-container', {
    body: await page.screenshot(),
    contentType: 'image/png',
  })
  await review.getByRole('switch', { name: 'Constrained column' }).click()
  for (const width of [1071, 1072]) {
    await page.setViewportSize({ width, height: 1000 })
    await expect
      .poll(async () => (await composition.boundingBox())?.width)
      .toBe(width - 48)
    const header = review.getByTestId('owned-table').locator('thead')
    if (width === 1071) await expect(header).toBeHidden()
    else {
      await expect(header).toBeVisible()
      const apy = review
        .locator('tbody tr')
        .last()
        .getByTestId('canonical-metric-value')
        .filter({ visible: true })
        .first()
      await expect.poll(async () => (await apy.boundingBox())?.height).toBe(24)
    }
    await composition.scrollIntoViewIfNeeded()
    await info.attach(`threshold-${width - 48}`, {
      body: await page.screenshot(),
      contentType: 'image/png',
    })
  }
})

test('owned stake sorting retains the Portfolio direction convention across projections', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 1000 })
  await page.goto(
    '/internal/design-system/components/table#owned-positions-review'
  )
  const review = page.getByTestId('owned-positions-review')
  await review.getByRole('combobox', { name: 'Position type' }).click()
  await page
    .getByRole('option', { name: 'Staked RSR Positions', exact: true })
    .click()
  const first = review.locator('tbody tr').first()
  await review.getByTestId('sort-apy').click()
  await expect(first).toContainText('hyusdRSR')
  await expect(review.getByTestId('sort-apy')).toHaveAttribute(
    'aria-description',
    'ascending'
  )
  await review.getByTestId('sort-apy').click()
  await expect(first).toContainText('eusdRSR')
  await page.setViewportSize({ width: 390, height: 900 })
  const sort = review.getByTestId('table-sort-menu')
  await expect(sort).toHaveText('Sort by: APY')
  await expect(sort).toHaveAttribute('aria-description', 'descending')
  await sort.click()
  await page.getByTestId('table-sort-field-balance').click()
  await page.setViewportSize({ width: 1400, height: 1000 })
  await expect(review.getByTestId('sort-balance')).toHaveAttribute(
    'aria-description',
    'descending'
  )
  await expect(first).toContainText('eusdRSR')
})
