import { currentCapture, expect, test } from './current-rebalance-helpers'

test('chart review selects the real Overview candlestick renderer', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components/chart')

  await page.getByTestId('chart-type-candles').click()
  const chart = page.getByTestId('chart-candlestick-source')
  await expect(chart).toBeVisible()
  await expect(chart.getByTestId('chart-source-title')).toHaveText(
    'Reserve AI Photonics DTF'
  )
  await expect(chart.getByTestId('chart-source-ticker')).toHaveText('$PHOTON')
  await expect(chart.getByTestId('chart-source-plot')).toHaveAttribute(
    'data-interval',
    '7d'
  )
  await expect(
    chart.locator('.recharts-xAxis .recharts-cartesian-axis-tick')
  ).toHaveCount(6)
  await expect(
    chart.locator('.recharts-yAxis .recharts-cartesian-axis-tick')
  ).toHaveCount(4)
  await expect(chart.getByText('DTF Launch', { exact: true })).toBeVisible()
  await settledCandles(chart)
  await currentCapture(page, chart, info, 'candlesticks-light-1400')
})

for (const { label, narrow, width } of [
  { label: 'two-column', narrow: false, width: 824 },
  { label: 'wide', narrow: false, width: 1400 },
  { label: 'constrained', narrow: true, width: 1400 },
] as const) {
  test(`candlestick source keeps its final visible glyph clear of right-aligned Y labels at ${label} width`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/internal/design-system/components/chart')
    await page.getByTestId('chart-type-candles').click()
    if (narrow) await page.getByTestId('chart-viewport-narrow').click()
    const chart = page.getByTestId('chart-candlestick-source')
    await settledCandles(chart)
    await page.evaluate(() => document.fonts.ready)

    const geometry = await chart
      .getByTestId('chart-source-plot')
      .evaluate((element) => {
        const candle = Array.from(
          element.querySelectorAll<SVGGElement>('.recharts-bar-rectangle')
        ).at(-1)
        const labels = Array.from(
          element.querySelectorAll<SVGTextElement>('.recharts-yAxis text')
        )
        if (!candle || !labels.length) return null
        const candleBounds = candle.getBBox()
        const labelBounds = labels.map((axisLabel) => axisLabel.getBBox())
        return {
          gap:
            Math.min(...labelBounds.map((bounds) => bounds.x)) -
            candleBounds.x -
            candleBounds.width,
          labelRightEdges: labelBounds.map((bounds) => bounds.x + bounds.width),
        }
      })

    expect(geometry).not.toBeNull()
    expect(geometry!.gap).toBeGreaterThanOrEqual(12)
    expect(geometry!.gap).toBeLessThanOrEqual(16)
    expect(
      Math.max(...geometry!.labelRightEdges) -
        Math.min(...geometry!.labelRightEdges)
    ).toBeLessThanOrEqual(1)
  })
}

test('candlestick inspection retains complete source OHLC for up and down candles', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components/chart')
  await page.getByTestId('chart-type-candles').click()
  const chart = page.getByTestId('chart-candlestick-source')
  const plot = chart.getByTestId('chart-source-plot')
  const svg = plot.locator('svg.recharts-surface')

  await settledCandles(chart)
  await svg.focus()
  await expectOhlc(chart, {
    open: '$47.41',
    high: '$50.53',
    low: '$46.75',
    close: '$49.83',
  })
  await expect(chart.getByText('2026-1-1 01:00', { exact: true })).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expectOhlc(chart, {
    open: '$49.83',
    high: '$50.07',
    low: '$45.34',
    close: '$48.46',
  })
  await expect(chart.getByText('2026-1-8 01:00', { exact: true })).toBeVisible()
  await expect(chart.getByTestId('chart-source-value')).toHaveText('$81.50')
  await expect(chart.getByTestId('chart-source-ticker')).toHaveText('$PHOTON')
  await expect(
    chart.locator('[data-testid="chart-source-return"]:visible')
  ).toHaveCount(1)
})

test.describe('candlestick touch inspection', () => {
  test.use({ hasTouch: true, isMobile: true })

  test('touch retains the full selected OHLC candle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto('/internal/design-system/components/chart')
    await page.getByTestId('chart-type-candles').click()
    const chart = page.getByTestId('chart-candlestick-source')
    await settledCandles(chart)
    const plot = chart.getByTestId('chart-source-plot')
    await plot.scrollIntoViewIfNeeded()
    const bounds = (await plot.boundingBox())!
    const candleBand = (bounds.width - 56) / 36

    await page.touchscreen.tap(
      bounds.x + 28 + candleBand * 1.5,
      bounds.y + bounds.height / 2
    )
    await expectOhlc(chart, {
      open: '$49.83',
      high: '$50.07',
      low: '$45.34',
      close: '$48.46',
    })
    const touchedAt = Date.now()
    await expect
      .poll(
        async () => {
          if (Date.now() - touchedAt < 500) return ''
          return chart.locator('.recharts-tooltip-wrapper').innerText()
        },
        { timeout: 1_500, intervals: [500] }
      )
      .toContain('2026-1-8 01:00')
    await expectOhlc(chart, {
      open: '$49.83',
      high: '$50.07',
      low: '$45.34',
      close: '$48.46',
    })
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$81.50')
    await expect(chart.getByTestId('chart-source-ticker')).toHaveText('$PHOTON')

    const scrollOffset = () => windowScrollOffset(plot)
    const beforeScroll = await scrollOffset()
    const touch = await page.context().newCDPSession(page)
    const x = bounds.x + bounds.width / 2
    const y = bounds.y + 160
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
})

for (const theme of ['light', 'dark']) {
  test(`candlestick lab tooltip uses the compact V1 surface ${theme}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto('/internal/design-system/components/chart')
    await page.getByTestId('chart-type-candles').click()
    const chart = page.getByTestId('chart-candlestick-source')
    const firstCandle = chart.locator('.recharts-bar-rectangle').first()

    await settledCandles(chart)
    await firstCandle.hover()
    await expectOhlc(chart, {
      open: '$47.41',
      high: '$50.53',
      low: '$46.75',
      close: '$49.83',
    })
    const tooltip = chart.getByTestId('chart-candlestick-source-tooltip')
    await expect(tooltip).toHaveCSS('border-radius', '8px')
    await expect(tooltip).toHaveCSS('border-top-width', '1px')
    await expect(tooltip).toHaveCSS('font-size', '14px')
    await expect(tooltip).toHaveCSS('line-height', '20px')
    expect(
      await tooltip.evaluate((element) => getComputedStyle(element).boxShadow)
    ).not.toBe('none')
    const timestamp = (await tooltip.locator('time').boundingBox())!
    const firstLabel = (await tooltip.getByText('Open').boundingBox())!
    expect(timestamp.y + timestamp.height).toBeLessThanOrEqual(firstLabel.y)
    const tooltipBounds = (await tooltip.boundingBox())!
    const chartBounds = (await chart.boundingBox())!
    expect(tooltipBounds.x).toBeGreaterThanOrEqual(chartBounds.x)
    expect(tooltipBounds.x + tooltipBounds.width).toBeLessThanOrEqual(
      chartBounds.x + chartBounds.width
    )
    await expect(chart.getByTestId('chart-mode-header')).toHaveCount(0)
    await expect(chart.getByTestId('chart-mode-current')).toHaveCount(0)
    await info.attach(`candlestick-tooltip-${theme}`, {
      body: await chart.screenshot({
        animations: 'disabled',
        path: process.env.CHART_REFINEMENT_CAPTURE_DIR
          ? `${process.env.CHART_REFINEMENT_CAPTURE_DIR}/candlestick-tooltip-${theme}.png`
          : undefined,
      }),
      contentType: 'image/png',
    })
  })
}

for (const width of [320, 390]) {
  test(`candlesticks render in the genuine ${width}px mobile preview`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 1728, height: 1000 })
    if (width === 390) {
      await page.addInitScript(() =>
        localStorage.setItem('theme-ui-color-mode', 'dark')
      )
    }
    await page.goto('/internal/design-system/components/chart')
    await page.getByTestId('chart-type-candles').click()
    await page.getByTestId('chart-viewport-mobile').click()
    await page.getByTestId(`chart-mobile-width-${width}`).click()
    const iframe = page.getByTestId('chart-mobile-preview')
    const preview = page.frameLocator('[data-testid="chart-mobile-preview"]')
    const chart = preview.getByTestId('chart-candlestick-source')

    await expect(preview.getByTestId('chart-preview-root')).toHaveAttribute(
      'data-chart-type',
      'candles'
    )
    await expect(chart.getByTestId('chart-source-title')).toHaveCSS(
      'font-size',
      '24px'
    )
    await expect(
      chart.locator('.recharts-cartesian-axis-tick-value')
    ).toHaveCount(0)
    await expect(chart.getByTestId('chart-source-footer')).toHaveAttribute(
      'data-chart-type',
      'candles'
    )
    await expect(chart.getByTestId('chart-footer-mobile-type')).toHaveText(
      'Candles'
    )
    await settledCandles(chart)
    await currentCapture(
      page,
      iframe,
      info,
      `candlesticks-${width === 390 ? 'dark' : 'light'}-mobile-${width}`
    )
  })
}

test('candlesticks stay contained in the narrow dark review', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.addInitScript(() =>
    localStorage.setItem('theme-ui-color-mode', 'dark')
  )
  await page.goto('/internal/design-system/components/chart')
  await page.getByTestId('chart-type-candles').click()
  await page.getByTestId('chart-viewport-narrow').click()
  const review = page.getByTestId('chart-review-narrow')
  const chart = review.getByTestId('chart-candlestick-source')

  expect(
    await chart.evaluate((element) => element.scrollWidth - element.clientWidth)
  ).toBeLessThanOrEqual(1)
  await expect(chart.getByTestId('chart-source-title')).toHaveCSS(
    'font-size',
    '32px'
  )
  await expect(
    chart.locator('.recharts-xAxis .recharts-cartesian-axis-tick')
  ).toHaveCount(6)
  await expect(chart.getByTestId('chart-footer-line')).toHaveText('Line')
  await expect(chart.getByTestId('chart-footer-candles')).toHaveText('Candles')
  await expect(chart.getByTestId('chart-footer-line')).not.toHaveClass(
    /text-foreground/
  )
  await expect(chart.getByTestId('chart-footer-candles')).toHaveClass(
    /text-foreground/
  )
  await settledCandles(chart)
  await currentCapture(page, review, info, 'candlesticks-dark-narrow')
})

test('line and candles round trip in the review and mobile document', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1728, height: 1000 })
  await page.goto('/internal/design-system/components/chart')
  await expect(page.getByTestId('chart-overview-source')).toBeVisible()
  await page.getByTestId('chart-type-candles').click()
  await expect(page.getByTestId('chart-candlestick-source')).toBeVisible()
  await page.getByTestId('chart-type-line').click()
  await expect(page.getByTestId('chart-overview-source')).toBeVisible()

  await page.getByTestId('chart-type-candles').click()
  await page.getByTestId('chart-viewport-mobile').click()
  const preview = page.frameLocator('[data-testid="chart-mobile-preview"]')
  await expect(preview.getByTestId('chart-candlestick-source')).toBeVisible()
  await page.getByTestId('chart-type-line').click()
  await expect(preview.getByTestId('chart-overview-source')).toBeVisible()
  await page.getByTestId('chart-type-candles').click()
  await expect(preview.getByTestId('chart-candlestick-source')).toBeVisible()
})

async function expectOhlc(
  chart: import('@playwright/test').Locator,
  expected: { open: string; high: string; low: string; close: string }
) {
  const tooltip = chart.locator('.recharts-tooltip-wrapper')
  await expect(tooltip.getByText('Open', { exact: true })).toBeVisible()
  await expect(tooltip.getByText('High', { exact: true })).toBeVisible()
  await expect(tooltip.getByText('Low', { exact: true })).toBeVisible()
  await expect(tooltip.getByText('Close', { exact: true })).toBeVisible()
  await expect(tooltip.getByText(expected.open, { exact: true })).toBeVisible()
  await expect(tooltip.getByText(expected.high, { exact: true })).toBeVisible()
  await expect(tooltip.getByText(expected.low, { exact: true })).toBeVisible()
  await expect(tooltip.getByText(expected.close, { exact: true })).toBeVisible()
}

async function settledCandles(chart: import('@playwright/test').Locator) {
  let previous = ''
  let stableReads = 0
  await expect
    .poll(
      async () => {
        const signature = await chart.evaluate((element) => {
          const candles = Array.from(
            element.querySelectorAll<SVGGraphicsElement>(
              '.recharts-bar-rectangle'
            )
          )
          if (candles.length !== 36) return ''
          return candles
            .map((candle) => {
              const bounds = candle.getBBox()
              return [bounds.x, bounds.y, bounds.width, bounds.height].join(',')
            })
            .join('|')
        })
        stableReads = signature && signature === previous ? stableReads + 1 : 0
        previous = signature
        return stableReads
      },
      { timeout: 3_000, intervals: [100] }
    )
    .toBeGreaterThanOrEqual(2)
}

function windowScrollOffset(plot: import('@playwright/test').Locator) {
  return plot.evaluate((element) => {
    let parent = element.parentElement
    while (parent) {
      if (
        parent.scrollHeight > parent.clientHeight &&
        ['auto', 'scroll'].includes(getComputedStyle(parent).overflowY)
      ) {
        return parent.scrollTop
      }
      parent = parent.parentElement
    }
    return window.scrollY
  })
}
