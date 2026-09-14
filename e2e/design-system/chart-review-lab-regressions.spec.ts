import { test, expect, currentCapture } from './current-rebalance-helpers'
import type { Page } from '@playwright/test'

test('launch marker is a compact noninteractive annotation', async ({
  page,
}) => {
  await page.goto('/internal/design-system/components/chart')
  const plot = page.getByTestId('chart-source-plot')
  for (const width of [1400, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await settledOverview(page)
    const label = plot.getByText('DTF Launch', { exact: true })
    await expect(label).toHaveCSS('font-size', '12px')
    await expect(label).toHaveCSS('font-weight', '300')
    expect(await label.evaluate((el) => el.tagName)).toBe('text')
    await expect(label).toHaveCSS('pointer-events', 'none')
    const bounds = (await label.boundingBox())!
    const plotBounds = (await plot.boundingBox())!
    expect(bounds.x).toBeGreaterThanOrEqual(plotBounds.x + 8)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(
      plotBounds.x + plotBounds.width - 8
    )
    const caption = plot.getByText('Est. Historical Price ✱', { exact: true })
    await expect(caption).toBeVisible()
    await expect(caption).toHaveCSS('font-size', '12px')
    const captionBounds = (await caption.boundingBox())!
    expect(captionBounds.x + captionBounds.width + 8).toBeLessThanOrEqual(
      bounds.x
    )
    const markerLine = label.locator('..').locator('line')
    const lineBounds = (await markerLine.boundingBox())!
    expect(Math.abs(lineBounds.x - bounds.x - bounds.width / 2)).toBeLessThan(1)
    expect(lineBounds.y + lineBounds.height + 4).toBeLessThanOrEqual(bounds.y)
  }
})

test('source frames follow V1 surfaces and Home card spacing', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components/chart')
  const overview = page.getByTestId('chart-overview-source')
  const home = page.getByTestId('chart-card')
  for (const surface of [overview, home]) {
    await expect(surface).toHaveCSS('border-radius', '0px')
    await expect(surface).toHaveCSS('box-shadow', 'none')
    await expect(surface).toHaveCSS('border-top-width', '0px')
  }
  await expect(home).toHaveCSS('padding', '8px')
  await expect(home.getByTestId('chart-home-media')).toHaveCSS(
    'border-radius',
    '8px'
  )
  const title = home.getByRole('heading')
  const logo = home.getByTestId('canonical-chain-badged-logo')
  expect((await title.boundingBox())!.x - (await home.boundingBox())!.x).toBe(
    24
  )
  expect(
    (await title.boundingBox())!.y -
      ((await logo.boundingBox())!.y + (await logo.boundingBox())!.height)
  ).toBe(16)
  expect(
    (await home.getByTestId('chart-home-market-row').boundingBox())!.y -
      ((await title.boundingBox())!.y + (await title.boundingBox())!.height)
  ).toBe(8)
  await expect(overview.getByTestId('chart-source-title')).toHaveCSS(
    'font-size',
    '32px'
  )
  await expect(overview.getByTestId('chart-source-title')).toHaveCSS(
    'font-weight',
    '300'
  )
  await expect(title).toHaveCSS('font-size', '20px')
  await expect(title).toHaveCSS('font-weight', '500')
  await expect(overview.getByTestId('chart-source-title')).toHaveCSS(
    'color',
    await overview
      .getByTestId('chart-source-value')
      .evaluate((el) => getComputedStyle(el).color)
  )
})

test('source chart review preserves real geometry and axis context', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components/chart')
  const compact = page.getByTestId('chart-compact')
  await expect(compact).not.toContainText('LCAP')
  const box = (await compact.getByTestId('chart-plot').boundingBox())!
  expect(box.width).toBe(90)
  expect(box.height).toBe(40)
  const overview = page.getByTestId('chart-overview-source')
  await expect(overview.getByTestId('chart-source-title')).toHaveText(
    'Reserve AI Photonics DTF'
  )
  await expect(
    overview.locator('.recharts-xAxis .recharts-cartesian-axis-tick')
  ).toHaveCount(6)
  await expect(
    overview.locator('.recharts-yAxis .recharts-cartesian-axis-tick')
  ).toHaveCount(5)
  await expect(overview.getByText('DTF Launch', { exact: true })).toBeVisible()
})

async function openPressure(page: Page) {
  await page.goto('/internal/design-system/components/chart')
  await page.getByTestId('chart-pressure-toggle').locator('summary').click()
}

async function settledOverview(page: Page) {
  const plot = page.getByTestId('chart-source-plot')
  await expect
    .poll(() =>
      plot.evaluate((el) => {
        const svg = el.querySelector<SVGSVGElement>('svg.recharts-surface')
        const clip = svg?.querySelector<SVGRectElement>('defs clipPath rect')
        const paths = Array.from(
          el.querySelectorAll<SVGPathElement>('path.recharts-area-curve')
        )
        if (!svg || !clip || !paths.length) return false
        const width =
          el.clientWidth - parseFloat(getComputedStyle(el).paddingRight)
        const right = Math.max(
          ...paths.map((path) => path.getBBox().x + path.getBBox().width)
        )
        return (
          Math.abs(svg.getBoundingClientRect().width - width) < 1 &&
          Math.abs(right - clip.x.baseVal.value - clip.width.baseVal.value) < 1
        )
      })
    )
    .toBe(true)
}

test('source inspection changes only the readout, not the chart geometry', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components/chart')
  const chart = page.getByTestId('chart-overview-source')
  const plot = chart.getByTestId('chart-source-plot')
  const value = chart.getByTestId('chart-source-value')
  await settledOverview(page)
  await expect(value).toHaveText('$81.50')
  await plot.hover({ position: { x: 90, y: 100 } })
  await expect(value).not.toHaveText('$81.50')
  await expect(chart.getByTestId('chart-source-time')).toBeVisible()
  await expect(chart.getByTestId('chart-source-estimate')).toHaveText(
    'Est. Historical Price ✱'
  )
  await expect(chart.locator('.recharts-tooltip-wrapper')).not.toContainText(
    '$'
  )
  const plotHeight = (await plot.boundingBox())!.height
  await chart.getByTestId('chart-source-title').hover()
  await expect(value).toHaveText('$81.50')
  const svg = plot.locator('svg.recharts-surface')
  await svg.focus()
  await page.keyboard.press('ArrowRight')
  await expect(value).not.toHaveText('$81.50')
  await expect(chart.getByTestId('chart-source-time')).toBeVisible()
  await expect(
    chart.getByTestId('chart-source-accessible-value')
  ).toContainText('$')
  expect(await plot.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe(
    'none'
  )
  await page.keyboard.press('Tab')
  await expect(value).toHaveText('$81.50')
  const ticks = await plot
    .locator('.recharts-cartesian-axis-tick-value')
    .allTextContents()
  await page.getByTestId('chart-mode-current').click()
  await plot.hover({ position: { x: 90, y: 100 } })
  await expect(value).toHaveText('$81.50')
  await expect(chart.locator('.recharts-tooltip-wrapper')).toContainText('$')
  expect((await plot.boundingBox())!.height).toBe(plotHeight)
  expect(
    await plot.locator('.recharts-cartesian-axis-tick-value').allTextContents()
  ).toEqual(ticks)
})

async function scenario(page: Page, value: string) {
  await page.getByTestId('chart-scenario').click()
  await page.getByTestId(`chart-scenario-${value}`).click()
}

for (const theme of ['light', 'dark']) {
  test(`chart first review ${theme}`, async ({ page, txLog }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/internal/design-system/components/chart')
    const review = page.getByTestId('chart-first-review')
    await expect(review).toBeVisible()
    await expect(review.getByTestId('chart-card')).toContainText('$PHOTON')
    await expect(review.getByTestId('chart-card')).toContainText(
      '+76.30% (YTD)'
    )
    await expect(review.getByTestId('chart-full')).toHaveCount(0)
    for (const width of [320, 390, 768, 1400]) {
      await page.setViewportSize({ width, height: 900 })
      await settledOverview(page)
      const identity = (await review
        .getByTestId('chart-source-ticker')
        .boundingBox())!
      const status = (await review
        .locator('[data-testid="chart-source-return"]:visible')
        .boundingBox())!
      expect(
        status.x >= identity.x + identity.width ||
          status.y >= identity.y + identity.height
      ).toBe(true)
      await currentCapture(
        page,
        review.getByTestId('chart-overview-source'),
        info,
        `charts-${theme}-${width}`
      )
      expect(
        await review.evaluate((el) => el.scrollWidth - el.clientWidth)
      ).toBeLessThanOrEqual(1)
      await currentCapture(
        page,
        review.getByTestId('chart-card'),
        info,
        `charts-home-${theme}-${width}`
      )
    }
    await currentCapture(page, review, info, `charts-${theme}-comparison`)
    await page.getByTestId('chart-source-constrained').click()
    expect(
      (await review.getByTestId('chart-overview-source').boundingBox())!.width
    ).toBeLessThanOrEqual(390)
    await settledOverview(page)
    const footer = review.getByTestId('chart-source-footer')
    expect(
      await footer.evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
    await currentCapture(
      page,
      review.getByTestId('chart-overview-source'),
      info,
      `charts-constrained-${theme}`
    )
    await page.getByTestId('chart-pressure-toggle').locator('summary').click()
    await page.getByTestId('chart-constrained').click()
    expect(
      (await review.getByTestId('chart-full').boundingBox())!.width
    ).toBeLessThanOrEqual(390)
    await page.getByTestId('chart-density-review').locator('summary').click()
    await expect(
      page.getByTestId('chart-density-hourly').getByTestId('chart-plot')
    ).toHaveAttribute('data-point-count', '721')
    await expect(
      page.getByTestId('chart-density-daily').getByTestId('chart-plot')
    ).toHaveAttribute('data-point-count', '31')
    expect(
      (await page.getByTestId('chart-density-hourly').boundingBox())!.width
    ).toBeLessThanOrEqual(390)
    await currentCapture(
      page,
      page.getByTestId('chart-density-review'),
      info,
      `charts-${theme}-density`
    )
    expect(txLog).toHaveLength(0)
  })

  test(`chart inspection and pressure states ${theme}`, async ({
    page,
    txLog,
  }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.setViewportSize({ width: 390, height: 900 })
    await openPressure(page)
    const full = page.getByTestId('chart-full')
    const price = page.getByTestId('chart-current-value')
    await expect(price).toHaveText('$6.6391')
    await expect(full.getByTestId('chart-stroke')).toHaveAttribute('d', /C/)
    await page.getByTestId('chart-inspection').focus()
    await page.keyboard.press('ArrowLeft')
    await expect(price).toHaveText('$6.7457')
    await expect(page.getByTestId('chart-current-time')).toHaveText(
      '12 Sept 2026, 13:56 UTC'
    )
    await expect(page.getByTestId('chart-inspection')).toBeFocused()
    await expect(full.getByTestId('chart-inspection-marker')).toBeVisible()
    const svg = full.getByTestId('chart-inspection')
    await svg.click({ position: { x: 1, y: 100 } })
    await expect(price).toHaveText('$5.1873')
    await page.getByTestId('chart-range-7d').click()
    await expect(page.getByTestId('chart-range-7d')).toHaveAttribute(
      'aria-checked',
      'true'
    )
    await expect(full.getByTestId('chart-plot')).toHaveAttribute(
      'data-point-count',
      '169'
    )
    await expect(price).toHaveText('$6.6391')
    const height = (await full.getByTestId('chart-plot').boundingBox())!.height
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await scenario(page, 'loading')
    await expect(full.getByTestId('v1-skeleton').first()).toBeVisible()
    expect(
      await full
        .getByTestId('v1-skeleton')
        .first()
        .evaluate((el) => getComputedStyle(el).animationName)
    ).toBe('none')
    expect((await full.getByTestId('chart-plot').boundingBox())!.height).toBe(
      height
    )
    await expect(page.getByTestId('chart-range-7d')).toHaveAttribute(
      'aria-checked',
      'true'
    )
    await scenario(page, 'captured')
    await expect(full.getByTestId('chart-plot')).toHaveAttribute(
      'data-point-count',
      '169'
    )
    await page.getByTestId('chart-range-1m').click()
    for (const state of [
      'neutral',
      'zero',
      'empty',
      'unavailable',
      'gapped',
      'estimated',
      'single',
      'two',
      'long',
      'delayed',
    ]) {
      await scenario(page, state)
      await expect(page.getByTestId('chart-provenance')).toContainText(
        'Lab-simulated'
      )
      expect(
        await page
          .getByTestId('chart-first-review')
          .evaluate((el) => el.scrollWidth - el.clientWidth)
      ).toBeLessThanOrEqual(1)
      if (state === 'zero') await expect(price).toHaveText('$0.00')
      if (state === 'empty' || state === 'unavailable') {
        await expect(price).toHaveText('—')
        await expect(full.getByTestId('chart-stroke')).toHaveCount(0)
        await expect(
          full.getByText(state === 'empty' ? 'No data' : 'Unavailable', {
            exact: true,
          })
        ).toBeVisible()
      }
      if (state === 'gapped')
        await expect(full.getByTestId('chart-segment')).toHaveCount(2)
      if (state === 'estimated') {
        await expect(full.locator('[data-estimated="true"]')).toHaveCount(1)
        await expect(full.getByTestId('chart-annotation')).toHaveText(
          'Est. Historical Price ✱'
        )
      }
      if (state === 'single') {
        await expect(full.getByTestId('chart-single-point')).toHaveCount(1)
        await expect(full.getByTestId('chart-stroke')).toHaveCount(0)
      }
      if (state === 'two')
        await expect(full.getByTestId('chart-plot')).toHaveAttribute(
          'data-point-count',
          '2'
        )
      if (state === 'long') {
        await page.setViewportSize({ width: 320, height: 900 })
        await expect(price).toHaveText('$1,234,567,890.1234')
        expect(
          await full.evaluate((el) => el.scrollWidth - el.clientWidth)
        ).toBeLessThanOrEqual(1)
        expect(
          await page
            .getByTestId('chart-compact')
            .evaluate((el) => el.scrollWidth - el.clientWidth)
        ).toBeLessThanOrEqual(1)
      }
      await currentCapture(page, full, info, `charts-${theme}-${state}`)
    }
    expect(txLog).toHaveLength(0)
  })
}

test.describe('chart touch', () => {
  test.use({
    viewport: { width: 320, height: 900 },
    hasTouch: true,
    isMobile: true,
  })
  test('source Overview holds the actual selected sample on first touch', async ({
    page,
  }, info) => {
    await page.goto('/internal/design-system/components/chart')
    const chart = page.getByTestId('chart-overview-source')
    const plot = chart.getByTestId('chart-source-plot')
    await settledOverview(page)
    await plot.scrollIntoViewIfNeeded()
    const box = (await plot.boundingBox())!
    const plotOffset = await plot.evaluate(
      (el) =>
        el.getBoundingClientRect().top -
        el
          .closest('[data-testid="chart-overview-source"]')!
          .getBoundingClientRect().top
    )
    await page.touchscreen.tap(box.x + 1, box.y + 100)
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$47.41')
    await expect(chart.getByTestId('chart-source-time')).toHaveAttribute(
      'datetime',
      '2026-01-02T00:00:00.000Z'
    )
    await page.waitForTimeout(300)
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$47.41')
    await expect(chart.getByTestId('chart-source-time')).toHaveAttribute(
      'datetime',
      '2026-01-02T00:00:00.000Z'
    )
    await expect(chart.getByTestId('chart-source-estimate')).toHaveText(
      'Est. Historical Price ✱'
    )
    expect(
      await plot.evaluate(
        (el) =>
          el.getBoundingClientRect().top -
          el
            .closest('[data-testid="chart-overview-source"]')!
            .getBoundingClientRect().top
      )
    ).toBe(plotOffset)
    await info.attach('charts-source-touch', {
      body: await chart.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    await page.getByTestId('chart-mode-current').tap()
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$81.50')
    await page.getByTestId('chart-mode-header').tap()
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$81.50')
    await settledOverview(page)
    await plot.scrollIntoViewIfNeeded()
    const resetBox = (await plot.boundingBox())!
    await page.touchscreen.tap(resetBox.x + 1, resetBox.y + 100)
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$47.41')
    await expect(chart.getByTestId('chart-source-time')).toHaveAttribute(
      'datetime',
      '2026-01-02T00:00:00.000Z'
    )
    await page.waitForTimeout(300)
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$47.41')
    await expect(chart.getByTestId('chart-source-time')).toHaveAttribute(
      'datetime',
      '2026-01-02T00:00:00.000Z'
    )
    const scrollOffset = () =>
      plot.evaluate((el) => {
        let parent = el.parentElement
        while (parent) {
          if (
            parent.scrollHeight > parent.clientHeight &&
            ['auto', 'scroll'].includes(getComputedStyle(parent).overflowY)
          )
            return parent.scrollTop
          parent = parent.parentElement
        }
        return window.scrollY
      })
    const beforeScroll = await scrollOffset()
    const touch = await page.context().newCDPSession(page)
    const swipeBox = (await plot.boundingBox())!
    const x = swipeBox.x + swipeBox.width / 2
    const y = swipeBox.y + 160
    await touch.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y }],
    })
    for (const dy of [30, 60, 90, 120]) {
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: y - dy }],
      })
    }
    await touch.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    })
    await expect.poll(scrollOffset).toBeGreaterThan(beforeScroll)
    await touch.detach()
  })
  test('inspection and translated pressure', async ({ page, txLog }, info) => {
    await openPressure(page)
    const full = page.getByTestId('chart-full')
    await expect(full).toBeVisible()
    await full.getByTestId('chart-inspection').scrollIntoViewIfNeeded()
    const box = (await full.getByTestId('chart-inspection').boundingBox())!
    await page.touchscreen.tap(box.x + 1, box.y + 100)
    await expect(page.getByTestId('chart-current-value')).toHaveText('$5.1873')
    await page.touchscreen.tap(box.x + box.width - 1, box.y + 100)
    await expect(page.getByTestId('chart-current-value')).not.toHaveText(
      '$5.1873'
    )
    await page.setViewportSize({ width: 1400, height: 900 })
    await page
      .getByRole('button', { name: 'Select language', exact: true })
      .click()
    await page
      .getByRole('menuitemradio', { name: 'Español', exact: true })
      .click()
    await page.setViewportSize({ width: 320, height: 900 })
    await scenario(page, 'estimated')
    await expect(page.getByTestId('chart-first-review')).toContainText(
      'Gráficos de series temporales'
    )
    expect(
      await page
        .getByTestId('chart-first-review')
        .evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
    await currentCapture(page, full, info, 'charts-spanish-touch')
    expect(txLog).toHaveLength(0)
  })
})

test('chart retains range focus', async ({ page }) => {
  await openPressure(page)
  const range = page.getByTestId('chart-range-7d')
  await range.focus()
  await page.keyboard.press('Space')
  await expect(range).toHaveAttribute('aria-checked', 'true')
  await expect(range).toBeFocused()
})

test('chart inspection needs no visible arrow controls', async ({ page }) => {
  await openPressure(page)
  const full = page.getByTestId('chart-full')
  await expect(full).toBeVisible()
  await expect(full.getByTestId('chart-previous')).toHaveCount(0)
  await expect(full.getByTestId('chart-next')).toHaveCount(0)
  const plot = full.getByTestId('chart-inspection')
  const price = page.getByTestId('chart-current-value')
  await plot.hover({ position: { x: 1, y: 100 } })
  await expect(price).toHaveText('$5.1873')
  await page.getByTestId('chart-range-1m').hover()
  await expect(price).toHaveText('$6.6391')
  await expect(full.getByTestId('chart-inspection-marker')).toHaveCount(0)
  await plot.focus()
  await page.keyboard.press('Home')
  await page.keyboard.press('ArrowLeft')
  await expect(plot).toHaveAttribute('aria-valuenow', '0')
  await expect(plot).toHaveAttribute('aria-valuetext', /\$5\.1873/)
  await page.keyboard.press('End')
  await page.keyboard.press('ArrowRight')
  await expect(plot).toHaveAttribute('aria-valuenow', '30')
  await expect(price).toHaveText('$6.6391')
  await expect(plot).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(plot).not.toBeFocused()
  await expect(full.getByTestId('chart-inspection-marker')).toHaveCount(0)
})

test('chart inspection identifies estimated samples', async ({ page }) => {
  await openPressure(page)
  await scenario(page, 'estimated')
  await page
    .getByTestId('chart-full')
    .getByTestId('chart-inspection')
    .click({ position: { x: 1, y: 100 } })
  await expect(page.getByTestId('chart-current-quality')).toHaveText(
    'Est. Historical Price ✱'
  )
  await page.getByTestId('chart-inspection').focus()
  await expect(page.getByTestId('chart-inspection')).toHaveAttribute(
    'aria-valuetext',
    /Est\. Historical Price/
  )
  for (let index = 0; index < 8; index++)
    await page.keyboard.press('ArrowRight')
  await expect(page.getByTestId('chart-current-quality')).toHaveCount(0)
})
