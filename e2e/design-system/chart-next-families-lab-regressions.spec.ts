import { expect, test, type Locator, type Page } from '@playwright/test'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { portfolioPressurePoints } from '../../src/views/internal/design-system/charts/next-families/fixtures/portfolio-pressure'

const preview =
  '/src/views/internal/design-system/charts/next-families/preview.html'
const evidence = path.resolve('test-results/design-system/charts/next-families')

test.beforeAll(async () => {
  await mkdir(evidence, { recursive: true })
})
const metricIds = ['price', 'apy', 'supply', 'staked-rsr'] as const
const metricUnits = {
  price: 'USD per hyUSD',
  apy: 'Annual percentage yield',
  supply: 'hyUSD',
  'staked-rsr': 'USD value of RSR staked',
}

for (const theme of ['light', 'dark'] as const) {
  test(`completed next chart families desktop ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1000 })
    await page.goto(`${preview}#embedded=true&theme=${theme}`)
    const review = page.getByTestId('next-chart-families-review')
    await expect(review).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    await expect(page.locator('.recharts-cartesian-grid')).toHaveCount(0)
    await expect(
      review.getByTestId('next-yield-history').locator('[data-metric-id]')
    ).toHaveCount(4)
    await page.screenshot({
      path: path.join(evidence, `metrics-portfolio-${theme}-1400-rest.png`),
      fullPage: true,
      animations: 'disabled',
    })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      )
    ).toBeLessThanOrEqual(1)

    for (const id of metricIds) {
      const chart = metric(review, id)
      const value = metricValue(chart, id)
      await expect(chart.getByTestId(`next-metric-${id}-descriptor`)).toHaveCSS(
        'font-size',
        '14px'
      )
      if (id === 'apy' || id === 'staked-rsr') {
        await expect(
          chart.getByTestId(`next-metric-${id}-descriptor`)
        ).toContainText('hyUSD')
      }
      await expect(value).toHaveCSS('font-size', '16px')
      await expect(chart.locator('output')).toContainText(metricUnits[id])
      const ticks = await chart
        .locator('.recharts-yAxis text')
        .allTextContents()
      expect(new Set(ticks).size).toBe(ticks.length)
      if (id === 'supply') {
        expect(new Set(ticks)).toEqual(new Set(['60K', '40K', '20K', '0']))
      }
      if (id === 'staked-rsr') {
        expect(new Set(ticks)).toEqual(new Set(['$45K', '$30K', '$15K', '$0']))
      }
      await assertAxisGeometry(chart)
      const restingAxisGeometry = await readAxisGeometry(chart)
      await assertLatestMarker(chart, '.recharts-area-curve')
      const surface = metricSurface(review, id)
      await assertCandidateInsets(surface, chart, 'footer')
      const exportButton = chart.getByRole('button', { name: 'Download CSV' })
      await expect(
        chart.locator('footer').getByRole('button', { name: 'Download CSV' })
      ).toHaveCount(1)
      expect(
        await exportButton.evaluate((node) => node.parentElement?.tagName)
      ).toBe('FOOTER')
      await assertRightInset(surface, exportButton)
      const restingHeaderHeight = (await chart.locator('header').boundingBox())!
        .height

      const plot = chart.getByRole('group', { name: /historical plot/ })
      await plot.focus()
      await page.keyboard.press('ArrowLeft')
      await expect(chart).toHaveAttribute('data-selected-timestamp', /\d+/)
      await expect(chart.locator('.latest-point-marker')).toHaveCount(0)
      await expect(
        chart.locator('.inspection-point-marker circle')
      ).toHaveCount(1)
      await expect(chart.locator('.recharts-active-dot')).toHaveCount(0)
      const time =
        id === 'price'
          ? chart.getByTestId('yield-price-time')
          : chart.getByTestId(`next-metric-${id}-time`)
      await expect(time).toHaveCSS('font-size', '14px')
      await expect(time).not.toHaveText('')
      if (id === 'price') {
        await expect(time).toHaveText('23 Aug 2026 · 21:45')
      }
      const inspectionAxisGeometry = await readAxisGeometry(chart)
      expect(inspectionAxisGeometry.plotRight).toBeCloseTo(
        restingAxisGeometry.plotRight,
        1
      )
      expect(inspectionAxisGeometry.y).toEqual(restingAxisGeometry.y)
      expect((await chart.locator('header').boundingBox())!.height).toBe(
        restingHeaderHeight
      )
      await assertMarkerOnCurve(chart, '.recharts-area-curve')
      await surface.screenshot({
        path: path.join(evidence, `yield-${id}-${theme}-1400-inspection.png`),
        animations: 'disabled',
      })
      await plot.evaluate((node) => (node as HTMLElement).blur())
      await expect(chart.locator('.inspection-point-marker')).toHaveCount(0)
      await assertLatestMarker(chart, '.recharts-area-curve')
    }

    const price = metric(review, 'price')
    const initialCount = Number(await price.getAttribute('data-point-count'))
    const initialAxisGeometry = await readAxisGeometry(price)
    await price.getByRole('radio', { name: '7D' }).click()
    await expect(price).toHaveAttribute('data-range', '7d')
    expect(Number(await price.getAttribute('data-point-count'))).toBeLessThan(
      initialCount
    )
    const rangedAxisGeometry = await readAxisGeometry(price)
    expect(
      Math.abs(rangedAxisGeometry.plotRight - initialAxisGeometry.plotRight)
    ).toBeLessThanOrEqual(1)
    expect(rangedAxisGeometry.y.map((tick) => Math.round(tick.right))).toEqual(
      initialAxisGeometry.y.map((tick) => Math.round(tick.right))
    )
    await expect(price.getByRole('radio', { name: '24H' })).toBeDisabled()
    const downloadPromise = page.waitForEvent('download')
    await price.getByRole('button', { name: 'Download CSV' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('hyUSD-historical-price-7d.csv')
    const downloadedCsv = await readFile((await download.path())!, 'utf8')
    expect(downloadedCsv).toMatch(/^Timestamp,Price USD\n/)
    expect(downloadedCsv).toContain('1787599025,1.137336285335922769')
    const apyExport = metric(review, 'apy').getByRole('button', {
      name: 'Download CSV',
    })
    await expect(apyExport).toBeDisabled()
    await expect(apyExport).toHaveAttribute(
      'title',
      'Unavailable for simulated APY input'
    )

    const portfolio = review.getByTestId('next-portfolio-history')
    const latest = portfolioPoint('2026-08-24')
    const previous = portfolioPoint('2026-08-17')
    await expect(price.locator('header')).not.toContainText('USD per hyUSD')
    await expect(price.locator('header').getByText('hyUSD')).toHaveCount(1)
    await expect(
      metric(review, 'supply').locator('header').getByText('hyUSD')
    ).toHaveCount(1)

    await expect(portfolio).toHaveAttribute('data-source-state', 'total')
    await expect(portfolio.locator('.recharts-area-curve')).toHaveCount(1)
    await expect(portfolio.getByTestId('next-portfolio-value')).toHaveCSS(
      'font-size',
      '32px'
    )
    await expect(portfolio.getByTestId('next-portfolio-value')).toHaveText(
      '$54,270.00'
    )
    await expect(portfolio.getByTestId('next-portfolio-time')).toHaveText(
      '24 Aug 2026'
    )
    await expect(portfolio.locator('output')).toContainText(
      '24 Aug 2026, total $54,270.00'
    )
    await expect(portfolio.getByTestId('next-portfolio-time')).toHaveCSS(
      'font-size',
      '14px'
    )
    await assertPortfolioControlPlacement(portfolio, 'desktop')
    await expect(portfolio.getByTestId('next-portfolio-key')).toHaveAttribute(
      'data-selected-timestamp',
      String(latest.timestamp)
    )
    await assertAxisGeometry(portfolio)
    await assertLatestMarker(portfolio, '.recharts-area-curve')
    const portfolioSurface = review.getByTestId('next-portfolio-review-surface')
    await assertCandidateInsets(
      portfolioSurface,
      portfolio,
      '[data-testid="next-portfolio-key"]'
    )
    await portfolioSurface.screenshot({
      path: path.join(evidence, `portfolio-${theme}-1400-total-rest.png`),
      animations: 'disabled',
    })
    await expect(
      portfolio.getByTestId('next-portfolio-indexDTFs-amount')
    ).toHaveText('$28,600.00')
    await expect(portfolio.getByText('Total', { exact: true })).toHaveCount(0)
    for (const entry of await portfolio.locator('[data-category]').all()) {
      await expect(entry.locator('dt span').nth(1)).toHaveCSS(
        'font-size',
        '14px'
      )
      await expect(entry.locator('dd')).toHaveCSS('font-size', '14px')
    }

    const portfolioPlot = portfolio.getByRole('group', {
      name: /Portfolio value and category history/,
    })
    await portfolioPlot.focus()
    await page.keyboard.press('ArrowLeft')
    await expect(portfolio).toHaveAttribute(
      'data-selected-timestamp',
      String(previous.timestamp)
    )
    await expect(portfolio.getByTestId('next-portfolio-time')).toHaveText(
      '17 Aug 2026'
    )
    await expect(portfolio.getByTestId('next-portfolio-value')).toHaveText(
      '$52,090.00'
    )
    await expect(portfolio.getByTestId('next-portfolio-key')).toHaveAttribute(
      'data-selected-timestamp',
      String(previous.timestamp)
    )
    await expect(
      portfolio.getByTestId('next-portfolio-indexDTFs-amount')
    ).toHaveText('$27,400.00')
    await expect(portfolio.locator('.latest-point-marker')).toHaveCount(0)
    await expect(
      portfolio.locator('.inspection-point-marker circle')
    ).toHaveCount(1)
    await expect(portfolio.locator('.selected-timestamp-guide')).toHaveCount(1)
    await assertSelectedMarker(
      portfolio,
      previous.timestamp,
      '.recharts-area-curve'
    )
    await portfolioSurface.screenshot({
      path: path.join(evidence, `portfolio-${theme}-1400-inspection.png`),
      animations: 'disabled',
    })

    await review.getByRole('radio', { name: 'Composition' }).click()
    await expect(portfolio).toHaveAttribute('data-source-state', 'composition')
    await expect(portfolio.locator('.recharts-area-area')).toHaveCount(5)
    await expect(portfolio.locator('.portfolio-total-contour')).toHaveCount(1)
    await expect(portfolio.locator('.selected-timestamp-guide')).toHaveCount(0)
    await assertLatestMarker(portfolio, '.portfolio-total-contour')
    expect(
      await portfolio
        .locator('.recharts-area-area')
        .evaluateAll((paths) => paths.map((path) => path.getAttribute('fill')))
    ).toEqual([
      'hsl(var(--primary))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--primary) / 0.58)',
    ])
    await expect(portfolio.getByTestId('next-portfolio-time')).toHaveText(
      '24 Aug 2026'
    )
    await expect(
      portfolio
        .getByTestId('next-portfolio-ranges')
        .getByRole('radio', { name: '3M' })
    ).toBeChecked()
    expect(
      await portfolio
        .locator('.recharts-xAxis text')
        .evaluateAll((ticks) =>
          ticks.map((tick) => tick.getAttribute('text-anchor'))
        )
    ).toEqual(['start', 'middle', 'end'])
    await portfolioSurface.screenshot({
      path: path.join(evidence, `portfolio-${theme}-1400-composition.png`),
      animations: 'disabled',
    })

    await portfolioPlot.focus()
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press('ArrowLeft')
    }
    const middle = portfolioPoint('2026-07-13')
    await expect(portfolio).toHaveAttribute(
      'data-selected-timestamp',
      String(middle.timestamp)
    )
    await expect(portfolio.getByTestId('next-portfolio-time')).toHaveText(
      '13 Jul 2026'
    )
    await expect(
      portfolio.getByTestId('next-portfolio-indexDTFs-amount')
    ).toHaveText('$23,750.00')
    await expect(
      portfolio.locator('.inspection-point-marker circle')
    ).toHaveCount(1)
    await expect(portfolio.locator('.selected-timestamp-guide')).toHaveCount(1)
    await assertSelectedMarker(
      portfolio,
      middle.timestamp,
      '.portfolio-total-contour'
    )
    await assertGuideAboveComposition(portfolio)
    await portfolioSurface.screenshot({
      path: path.join(
        evidence,
        `portfolio-${theme}-1400-composition-inspection.png`
      ),
      animations: 'disabled',
    })

    const portfolio24h = portfolio.getByRole('radio', { name: '24H' })
    await expect(portfolio24h).toBeDisabled()
    await expect(portfolio24h).toHaveAccessibleDescription(
      'Unavailable in this weekly capture'
    )
    await portfolio.getByRole('radio', { name: '1Y' }).click()
    await expect(portfolio).toHaveAttribute('data-range', '1y')
    await expect(portfolio).toHaveAttribute(
      'data-point-count',
      String(portfolioPressurePoints.length)
    )
    await expect(portfolioPlot).not.toHaveAttribute('aria-describedby')
    const availableTicks = await portfolio
      .locator('.recharts-xAxis text')
      .allTextContents()
    expect(availableTicks).toHaveLength(3)
    expect(availableTicks[0]).toBe('24 Aug 2025')
    expect(availableTicks.at(-1)).toBe('24 Aug 2026')
    await expect(portfolio.locator('.selected-timestamp-guide')).toHaveCount(0)
    await expect(portfolio.locator('.latest-point-marker circle')).toHaveCount(
      1
    )
    await portfolio.getByRole('radio', { name: '3M' }).click()
    await expect(portfolio).toHaveAttribute(
      'data-point-count',
      String(portfolioPointsFrom('2026-05-24').length)
    )
  })
}

for (const theme of ['light', 'dark'] as const) {
  for (const width of [320, 1400]) {
    test(`Portfolio known-zero holdings lifecycle ${theme} ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(`${preview}#embedded=true&theme=${theme}`)
      const review = page.getByTestId('next-chart-families-review')
      await page.evaluate(() => document.fonts.ready)
      const portfolio = review.getByTestId('next-portfolio-history')
      const portfolioPlot = portfolio.getByRole('group', {
        name: /Portfolio value and category history/,
      })
      const surface = review.getByTestId('next-portfolio-review-surface')
      await portfolio.scrollIntoViewIfNeeded()
      await assertAvailableHistoryGeometry(portfolio, width, '24 May', '24 Aug')
      const totalBounds = await readSeriesHorizontalBounds(
        portfolio,
        '.recharts-area-curve'
      )

      await hoverPortfolioPoint(page, portfolio, '2026-05-24')
      await assertZeroPortfolioReadout(portfolio, '24 May 2026')
      await assertSelectedMarker(
        portfolio,
        portfolioPoint('2026-05-24').timestamp,
        '.recharts-area-curve'
      )

      await assertPortfolioZeroImmediatelyBeforeOnset(portfolio)

      await selectPortfolioWithKeyboard(page, portfolio, '2026-05-31')
      expect(
        await portfolioPlot.evaluate((node) => getComputedStyle(node).boxShadow)
      ).not.toBe('none')
      await assertZeroPortfolioReadout(portfolio, '31 May 2026')
      const zeroGeometry = await markerGeometry(
        portfolio,
        '.recharts-area-curve',
        false
      )
      await surface.screenshot({
        path: path.join(evidence, `portfolio-${theme}-${width}-zero.png`),
        animations: 'disabled',
      })

      await selectPortfolioWithKeyboard(page, portfolio, '2026-06-01')
      await expect(portfolio.getByTestId('next-portfolio-value')).toHaveText(
        '$35,400.00'
      )
      const positiveGeometry = await markerGeometry(
        portfolio,
        '.recharts-area-curve',
        false
      )
      expect(positiveGeometry.marker.x - zeroGeometry.marker.x).toBeLessThan(10)
      expect(zeroGeometry.marker.y - positiveGeometry.marker.y).toBeGreaterThan(
        40
      )

      await review.getByRole('radio', { name: 'Composition' }).click()
      expect(
        await readSeriesHorizontalBounds(portfolio, '.portfolio-total-contour')
      ).toEqual(totalBounds)
      await selectPortfolioWithKeyboard(page, portfolio, '2026-05-24')
      await assertZeroPortfolioReadout(portfolio, '24 May 2026')
      await assertSelectedMarker(
        portfolio,
        portfolioPoint('2026-05-24').timestamp,
        '.portfolio-total-contour'
      )
      await surface.screenshot({
        path: path.join(
          evidence,
          `portfolio-${theme}-${width}-composition-zero.png`
        ),
        animations: 'disabled',
      })
      await expect(portfolioPlot).toHaveCSS('touch-action', 'auto')
    })
  }
}

for (const theme of ['light', 'dark'] as const) {
  for (const width of [320, 390]) {
    test(`Portfolio legend mobile layout ${theme} ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(`${preview}#embedded=true&theme=${theme}`)
      const review = page.getByTestId('next-chart-families-review')
      const portfolio = review.getByTestId('next-portfolio-history')
      await page.evaluate(() => document.fonts.ready)
      await portfolio.scrollIntoViewIfNeeded()

      await assertMobilePortfolioLegend(portfolio)

      await review.getByRole('radio', { name: 'Composition' }).click()
      await assertMobilePortfolioLegend(portfolio)

      await portfolio.getByRole('radio', { name: 'YTD' }).click()
      const plot = portfolio.getByRole('group', {
        name: /Portfolio value and category history/,
      })
      await plot.focus()
      for (let step = 0; step < portfolioPressurePoints.length; step += 1) {
        await page.keyboard.press('ArrowLeft')
      }
      await expect(
        portfolio.getByTestId('next-portfolio-indexDTFs-amount')
      ).toHaveText('$0.00')
      await assertMobilePortfolioLegend(portfolio)

      await review.getByRole('radio', { name: 'Empty' }).click()
      await expect(
        portfolio.getByTestId('next-portfolio-indexDTFs-amount')
      ).toHaveText('—')
      await assertMobilePortfolioLegend(portfolio)

      await review.getByRole('radio', { name: 'Default' }).click()
      const pressureRow = portfolio.locator('[data-category="stakedRSR"]')
      await pressureRow
        .locator('dt span')
        .nth(1)
        .evaluate((node) => {
          node.textContent =
            'Staked Reserve Rights held across delegated accounts'
        })
      await portfolio
        .getByTestId('next-portfolio-stakedRSR-amount')
        .evaluate((node) => {
          node.textContent = '$9,876,543,210.00'
        })
      const pressureGeometry = await assertMobilePortfolioLegend(portfolio)
      expect(pressureGeometry.labelHeights.stakedRSR).toBeGreaterThan(20)
      await page.getByTestId('next-portfolio-review-surface').screenshot({
        path: path.join(
          evidence,
          `portfolio-legend-pressure-${theme}-${width}.png`
        ),
        animations: 'disabled',
      })
    })
  }
}

test('Portfolio legend desktop layout stays compact', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 1000 })
  await page.goto(`${preview}#embedded=true&theme=light`)
  const portfolio = page.getByTestId('next-portfolio-history')
  await page.evaluate(() => document.fonts.ready)
  await portfolio.scrollIntoViewIfNeeded()
  await assertDesktopPortfolioLegend(portfolio)
})

test('empty review keeps all four metrics and recovers without stale inspection', async ({
  page,
}) => {
  await page.goto(`${preview}#theme=light`)
  await page.getByRole('radio', { name: 'Narrow' }).click()
  const review = page.getByTestId('next-chart-families-review')
  await expect(page.getByTestId('preview-narrow')).toBeVisible()
  await review.getByRole('radio', { name: 'Empty' }).click()
  await expect(review.locator('[data-metric-id]')).toHaveCount(4)
  for (const id of metricIds) {
    const chart = metric(review, id)
    await expect(chart).toHaveAttribute('data-point-count', '0')
    await expect(chart.getByText('No data', { exact: true })).toBeVisible()
    await expect(chart.locator('output')).toContainText(metricUnits[id])
  }
  await expect(metricValue(metric(review, 'supply'), 'supply')).toHaveText(
    '— hyUSD'
  )
  await expect(
    review.getByTestId('next-portfolio-history').getByText('No data available')
  ).toBeVisible()
  await review.getByRole('radio', { name: 'Default' }).click()
  for (const id of metricIds) {
    const chart = metric(review, id)
    await expect(chart).toHaveAttribute('data-point-count', /[1-9]/)
    await expect(chart.locator('.recharts-yAxis text')).not.toHaveCount(0)
    await assertAxisGeometry(chart)
  }
  await expect(review.getByTestId('next-portfolio-history')).toHaveAttribute(
    'data-selected-timestamp',
    String(portfolioPoint('2026-08-24').timestamp)
  )
})

for (const theme of ['light', 'dark'] as const) {
  for (const width of [320, 390, 1400]) {
    test(`empty chart canvases ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(`${preview}#embedded=true&theme=${theme}`)
      const review = page.getByTestId('next-chart-families-review')
      await review.getByRole('radio', { name: 'Empty' }).click()
      await page.evaluate(() => document.fonts.ready)
      for (const id of metricIds) {
        const chart = metric(review, id)
        await expect(chart).toHaveAttribute('data-point-count', '0')
        await expect(chart.getByText('No data', { exact: true })).toBeVisible()
        await expect(chart.locator('.latest-point-marker')).toHaveCount(0)
        await expect(chart.locator('.inspection-point-marker')).toHaveCount(0)
      }
      await expect(
        review
          .getByTestId('next-portfolio-history')
          .getByText('No data available')
      ).toBeVisible()
      await expect(
        review
          .getByTestId('next-portfolio-history')
          .getByTestId('next-portfolio-time')
      ).toHaveText('No portfolio history')
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth
        )
      ).toBeLessThanOrEqual(1)
      await review.screenshot({
        path: path.join(evidence, `empty-review-${theme}-${width}.png`),
        animations: 'disabled',
      })
    })
  }
}

test('standalone controls expose real iframe previews', async ({ page }) => {
  await page.goto(`${preview}#theme=light`)
  for (const width of [390, 320]) {
    await page.getByRole('radio', { name: `${width}px` }).click()
    const frame = page.getByTestId(`preview-mobile-${width}`)
    await expect(frame).toBeVisible()
    expect((await frame.boundingBox())!.width).toBe(width)
    await expect(
      page
        .frameLocator(`[data-testid="preview-mobile-${width}"]`)
        .getByTestId('next-chart-families-review')
    ).toBeVisible()
  }
})

for (const [width, placement] of [
  [620, 'narrow'],
  [688, 'desktop'],
] as const) {
  test(`Portfolio range layout uses ${placement} placement at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto(`${preview}#embedded=true&theme=light`)
    const review = page.getByTestId('next-chart-families-review')
    const portfolio = review.getByTestId('next-portfolio-history')
    await page.evaluate(() => document.fonts.ready)
    await portfolio.scrollIntoViewIfNeeded()
    await assertPortfolioControlPlacement(portfolio, placement)
    await review.getByTestId('next-portfolio-review-surface').screenshot({
      path: path.join(
        evidence,
        `portfolio-light-${width}-${placement}-ranges.png`
      ),
      animations: 'disabled',
    })
  })
}

for (const theme of ['light', 'dark'] as const) {
  for (const width of [390, 320]) {
    test(`touch scrolling cannot update chart readouts ${theme} at ${width}px`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width, height: 844 },
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 1,
      })
      const page = await context.newPage()
      await page.goto(`${preview}#embedded=true&theme=${theme}`)
      const review = page.getByTestId('next-chart-families-review')
      await expect(review).toBeVisible()
      await page.evaluate(() => document.fonts.ready)

      for (const id of metricIds) {
        const chart = metric(review, id)
        const before = await chart.getAttribute('data-selected-timestamp')
        const plot = chart.getByRole('group', { name: /historical plot/ })
        await plot.scrollIntoViewIfNeeded()
        const bounds = (await plot.boundingBox())!
        await page.touchscreen.tap(bounds.x + 24, bounds.y + bounds.height / 2)
        expect(await chart.getAttribute('data-selected-timestamp')).toBe(before)
        await expect(plot).toHaveCSS('touch-action', 'auto')
        await assertAxisGeometry(chart)
        await assertLatestMarker(chart, '.recharts-area-curve')
        if (theme === 'light' && width === 390 && id === 'price') {
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
          expect(await chart.getAttribute('data-selected-timestamp')).toBe(
            before
          )
          await touch.detach()
        }
      }

      const portfolio = review.getByTestId('next-portfolio-history')
      const before = await portfolio.getAttribute('data-selected-timestamp')
      const portfolioPlot = portfolio.getByRole('group', {
        name: /Portfolio value and category history/,
      })
      await portfolioPlot.scrollIntoViewIfNeeded()
      const bounds = (await portfolioPlot.boundingBox())!
      await page.touchscreen.tap(bounds.x + 24, bounds.y + bounds.height / 2)
      await expect(portfolio).toHaveAttribute(
        'data-selected-timestamp',
        before!
      )
      await expect(portfolio.getByTestId('next-portfolio-value')).toHaveCSS(
        'font-size',
        '24px'
      )
      await assertAxisGeometry(portfolio)
      await assertLatestMarker(portfolio, '.recharts-area-curve')
      await assertPortfolioControlPlacement(portfolio, 'narrow')
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        )
      ).toBeLessThanOrEqual(1)

      await page.screenshot({
        path: path.join(
          evidence,
          `metrics-portfolio-${theme}-${width}-rest.png`
        ),
        fullPage: true,
        animations: 'disabled',
      })
      const portfolioSurface = review.getByTestId(
        'next-portfolio-review-surface'
      )
      await assertCandidateInsets(
        portfolioSurface,
        portfolio,
        '[data-testid="next-portfolio-key"]'
      )
      await portfolioSurface.screenshot({
        path: path.join(evidence, `portfolio-${theme}-${width}-rest.png`),
        animations: 'disabled',
      })
      if (width === 390) {
        await portfolioPlot.focus()
        await page.keyboard.press('ArrowLeft')
        await expect(
          portfolio.locator('.selected-timestamp-guide')
        ).toHaveCount(1)
        await assertSelectedMarker(
          portfolio,
          portfolioPoint('2026-08-17').timestamp,
          '.recharts-area-curve'
        )
        await portfolioSurface.screenshot({
          path: path.join(
            evidence,
            `portfolio-${theme}-${width}-total-inspection.png`
          ),
          animations: 'disabled',
        })
        await review.getByRole('radio', { name: 'Composition' }).click()
        await assertLatestMarker(portfolio, '.portfolio-total-contour')
        await portfolioSurface.screenshot({
          path: path.join(
            evidence,
            `portfolio-${theme}-${width}-composition-rest.png`
          ),
          animations: 'disabled',
        })
        await portfolioPlot.focus()
        await page.keyboard.press('ArrowLeft')
        await assertSelectedMarker(
          portfolio,
          portfolioPoint('2026-08-17').timestamp,
          '.portfolio-total-contour'
        )
        await portfolioSurface.screenshot({
          path: path.join(
            evidence,
            `portfolio-${theme}-${width}-composition-inspection.png`
          ),
          animations: 'disabled',
        })
      }
      await portfolio.getByTestId('next-portfolio-value').evaluate((node) => {
        node.textContent = '$12,345,678,901.23'
      })
      await portfolio
        .getByTestId('next-portfolio-stakedRSR-amount')
        .evaluate((node) => {
          node.textContent = '$9,876,543,210.00'
        })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        )
      ).toBeLessThanOrEqual(1)
      await context.close()
    })
  }
}

function metric(review: Locator, id: (typeof metricIds)[number]): Locator {
  return id === 'price'
    ? review.getByTestId('yield-price-pilot')
    : review.locator(`[data-metric-id="${id}"]`)
}

function metricValue(chart: Locator, id: (typeof metricIds)[number]): Locator {
  return id === 'price'
    ? chart.getByTestId('yield-price-value')
    : chart.getByTestId(`next-metric-${id}-value`)
}

function metricSurface(
  review: Locator,
  id: (typeof metricIds)[number]
): Locator {
  return review.getByTestId(
    id === 'price'
      ? 'yield-price-review-surface'
      : `next-metric-${id}-review-surface`
  )
}

function portfolioPoint(date: string) {
  const point = portfolioPressurePoints.find(
    (candidate) =>
      new Date(candidate.timestamp * 1000).toISOString().slice(0, 10) === date
  )
  if (!point) throw new Error(`Missing Portfolio fixture point for ${date}`)
  return point
}

function portfolioPointsFrom(date: string) {
  const timestamp = portfolioPoint(date).timestamp
  return portfolioPressurePoints.filter((point) => point.timestamp >= timestamp)
}

async function selectPortfolioWithKeyboard(
  page: Page,
  portfolio: Locator,
  date: string
) {
  const points = portfolioPointsFrom('2026-05-24')
  const target = portfolioPoint(date)
  const targetIndex = points.findIndex(
    (point) => point.timestamp === target.timestamp
  )
  expect(targetIndex).toBeGreaterThanOrEqual(0)
  const plot = portfolio.getByRole('group', {
    name: /Portfolio value and category history/,
  })
  await plot.evaluate((node) => (node as HTMLElement).blur())
  await plot.focus()
  for (let step = 0; step < points.length; step += 1) {
    await page.keyboard.press('ArrowLeft')
  }
  for (let step = 0; step < targetIndex; step += 1) {
    await page.keyboard.press('ArrowRight')
  }
  await expect(portfolio).toHaveAttribute(
    'data-selected-timestamp',
    String(target.timestamp)
  )
}

async function hoverPortfolioPoint(
  page: Page,
  portfolio: Locator,
  date: string
) {
  const target = portfolioPoint(date)
  const first = portfolioPoint('2026-05-24')
  const last = portfolioPoint('2026-08-24')
  const geometry = await markerGeometry(portfolio, '.recharts-area-curve', true)
  const progress =
    (target.timestamp - first.timestamp) / (last.timestamp - first.timestamp)
  const x =
    geometry.curveStart.x +
    progress * (geometry.curveEnd.x - geometry.curveStart.x)
  const plot = portfolio.getByRole('group', {
    name: /Portfolio value and category history/,
  })
  const bounds = (await plot.boundingBox())!
  await page.mouse.move(x, bounds.y + bounds.height / 2)
  await expect(portfolio).toHaveAttribute(
    'data-selected-timestamp',
    String(target.timestamp)
  )
}

async function assertZeroPortfolioReadout(portfolio: Locator, date: string) {
  await expect(portfolio.getByTestId('next-portfolio-value')).toHaveText(
    '$0.00'
  )
  await expect(portfolio.getByTestId('next-portfolio-time')).toHaveText(date)
  for (const category of [
    'indexDTFs',
    'yieldDTFs',
    'stakedRSR',
    'voteLocked',
    'rsr',
  ]) {
    await expect(
      portfolio.getByTestId(`next-portfolio-${category}-amount`)
    ).toHaveText('$0.00')
  }
  await expect(portfolio.locator('output')).toContainText(
    `${date}, total $0.00`
  )
}

async function assertPortfolioZeroImmediatelyBeforeOnset(portfolio: Locator) {
  const first = portfolioPoint('2026-05-24')
  const last = portfolioPoint('2026-08-24')
  const onset = portfolioPoint('2026-06-01')
  const geometry = await portfolio.evaluate(
    (element, { firstTimestamp, lastTimestamp, onsetTimestamp }) => {
      const curve = element.querySelector(
        '.recharts-area-curve'
      ) as SVGPathElement
      const curveLength = curve.getTotalLength()
      const curveStart = curve.getPointAtLength(0)
      const curveEnd = curve.getPointAtLength(curveLength)
      const onsetX =
        curveStart.x +
        ((onsetTimestamp - firstTimestamp) / (lastTimestamp - firstTimestamp)) *
          (curveEnd.x - curveStart.x)
      const sampleX = onsetX - 1
      let low = 0
      let high = curveLength
      for (let step = 0; step < 40; step += 1) {
        const middle = (low + high) / 2
        if (curve.getPointAtLength(middle).x < sampleX) low = middle
        else high = middle
      }
      const sample = curve.getPointAtLength((low + high) / 2)
      return {
        baselineY: curveStart.y,
        sampleY: sample.y,
      }
    },
    {
      firstTimestamp: first.timestamp,
      lastTimestamp: last.timestamp,
      onsetTimestamp: onset.timestamp,
    }
  )

  expect(Math.abs(geometry.sampleY - geometry.baselineY)).toBeLessThanOrEqual(
    0.5
  )
}

async function readAxisGeometry(chart: Locator) {
  return chart.evaluate((element) => {
    const candidate = element.getBoundingClientRect()
    const bounds = (node: Element) => {
      const box = node.getBoundingClientRect()
      return { left: box.left, right: box.right }
    }
    const curve = element.querySelector(
      '.recharts-area-curve'
    ) as SVGPathElement
    const pathEnd = curve.getPointAtLength(curve.getTotalLength())
    const pathStart = curve.getPointAtLength(0)
    const plotLeft = pathStart.matrixTransform(curve.getScreenCTM()!).x
    const plotRight = pathEnd.matrixTransform(curve.getScreenCTM()!).x
    const wrapper = curve.closest('[role="group"]')!.getBoundingClientRect()
    return {
      left: candidate.left,
      right: candidate.right,
      plotLeft,
      plotRight,
      wrapper: { left: wrapper.left, right: wrapper.right },
      x: [...element.querySelectorAll('.recharts-xAxis text')].map(bounds),
      y: [...element.querySelectorAll('.recharts-yAxis text')].map(bounds),
    }
  })
}

async function assertAxisGeometry(chart: Locator) {
  const geometry = await readAxisGeometry(chart)
  const plotLeft = geometry.left + 4
  const contentLeft = geometry.left + 24
  const right = geometry.right - 24
  expect(geometry.plotLeft).toBeCloseTo(plotLeft, 0)
  expect(geometry.wrapper.left).toBeCloseTo(geometry.left, 0)
  expect(geometry.wrapper.right).toBeCloseTo(geometry.right, 0)
  for (const tick of geometry.x) {
    expect(tick.left).toBeGreaterThanOrEqual(plotLeft - 1)
    expect(tick.right).toBeLessThanOrEqual(right + 1)
  }
  for (const tick of geometry.y) {
    expect(tick.left).toBeGreaterThanOrEqual(contentLeft - 1)
    expect(tick.right).toBeLessThanOrEqual(right + 1)
  }
  for (const tick of geometry.y) {
    expect(tick.right).toBeCloseTo(right, 0)
  }
  const nearestLabelEdge = Math.min(...geometry.y.map((tick) => tick.left))
  expect(nearestLabelEdge - geometry.plotRight - 4).toBeGreaterThanOrEqual(12)
  expect(nearestLabelEdge - geometry.plotRight - 4).toBeLessThanOrEqual(16)
  if (geometry.x.length > 1) {
    expect(Math.abs(geometry.x[0].left - plotLeft)).toBeLessThanOrEqual(1)
    expect(
      Math.abs(geometry.x.at(-1)!.right - geometry.plotRight)
    ).toBeLessThanOrEqual(1)
  }
}

async function assertAvailableHistoryGeometry(
  chart: Locator,
  width: number,
  firstLabel: string,
  lastLabel: string
) {
  const geometry = await chart.evaluate((element) => {
    const candidate = element.getBoundingClientRect()
    const bounds = (node: Element) => {
      const box = node.getBoundingClientRect()
      return { left: box.left, right: box.right }
    }
    const curve = element.querySelector(
      '.recharts-area-curve'
    ) as SVGPathElement
    const curveStart = curve
      .getPointAtLength(0)
      .matrixTransform(curve.getScreenCTM()!)
    return {
      candidateLeft: candidate.left,
      curveStartX: curveStart.x,
      ticks: [...element.querySelectorAll('.recharts-xAxis text')].map(
        (tick) => ({ text: tick.textContent, ...bounds(tick) })
      ),
    }
  })

  expect(geometry.ticks).toHaveLength(width > 500 ? 3 : 2)
  expect(geometry.curveStartX - geometry.candidateLeft).toBeCloseTo(4, 0)
  expect(geometry.ticks[0].text).toBe(firstLabel)
  expect(geometry.ticks.at(-1)!.text).toBe(lastLabel)
  expect(
    Math.abs(geometry.curveStartX - geometry.ticks[0].left)
  ).toBeLessThanOrEqual(1)
}

async function readSeriesHorizontalBounds(
  chart: Locator,
  curveSelector: string
) {
  return chart.evaluate((element, selector) => {
    const curveRoot = element.querySelector(selector)!
    const curve = (
      curveRoot.tagName.toLowerCase() === 'path'
        ? curveRoot
        : curveRoot.querySelector('path')
    ) as SVGPathElement
    const start = curve
      .getPointAtLength(0)
      .matrixTransform(curve.getScreenCTM()!)
    const end = curve
      .getPointAtLength(curve.getTotalLength())
      .matrixTransform(curve.getScreenCTM()!)
    return {
      left: Math.round(start.x * 100) / 100,
      right: Math.round(end.x * 100) / 100,
    }
  }, curveSelector)
}

async function assertLatestMarker(chart: Locator, curveSelector: string) {
  const geometry = await markerGeometry(chart, curveSelector, true)
  expect(Math.abs(geometry.marker.x - geometry.curve.x)).toBeLessThanOrEqual(1)
  expect(Math.abs(geometry.marker.y - geometry.curve.y)).toBeLessThanOrEqual(1)
  assertMarkerPresentation(geometry)
}

async function assertMarkerOnCurve(chart: Locator, curveSelector: string) {
  const geometry = await markerGeometry(chart, curveSelector, false)
  expect(Math.abs(geometry.marker.x - geometry.curve.x)).toBeLessThanOrEqual(1)
  expect(Math.abs(geometry.marker.y - geometry.curve.y)).toBeLessThanOrEqual(1)
  assertMarkerPresentation(geometry)
}

async function assertSelectedMarker(
  chart: Locator,
  timestamp: number,
  curveSelector: string
) {
  const geometry = await markerGeometry(chart, curveSelector, false)
  const first = portfolioPoint('2026-05-24')
  const last = portfolioPoint('2026-08-24')
  const expectedProgress =
    (timestamp - first.timestamp) / (last.timestamp - first.timestamp)
  const expectedX =
    geometry.curveStart.x +
    expectedProgress * (geometry.curveEnd.x - geometry.curveStart.x)
  expect(Math.abs(geometry.marker.x - expectedX)).toBeLessThanOrEqual(1)
  expect(Math.abs(geometry.marker.x - geometry.curve.x)).toBeLessThanOrEqual(1)
  expect(Math.abs(geometry.marker.y - geometry.curve.y)).toBeLessThanOrEqual(1)
  expect(Math.abs(geometry.guideX! - geometry.marker.x)).toBeLessThanOrEqual(1)
  assertMarkerPresentation(geometry)
}

async function markerGeometry(
  chart: Locator,
  curveSelector: string,
  useEndpoint: boolean
) {
  return chart.evaluate(
    (element, { curveSelector, useEndpoint }) => {
      const curveRoot = element.querySelector(curveSelector)!
      const curve = (
        curveRoot.tagName.toLowerCase() === 'path'
          ? curveRoot
          : curveRoot.querySelector('path')
      ) as SVGPathElement
      const marker = element.querySelector(
        '.latest-point-marker circle, circle.latest-point-marker, .inspection-point-marker circle, circle.inspection-point-marker'
      ) as SVGCircleElement
      const guide = element.querySelector(
        '.selected-timestamp-guide line, line.selected-timestamp-guide'
      ) as SVGLineElement | null
      const toScreen = (node: SVGGraphicsElement, x: number, y: number) =>
        new DOMPoint(x, y).matrixTransform(node.getScreenCTM()!)
      const markerPoint = toScreen(
        marker,
        Number(marker.getAttribute('cx')),
        Number(marker.getAttribute('cy'))
      )
      const curveLength = curve.getTotalLength()
      const curveStart = curve
        .getPointAtLength(0)
        .matrixTransform(curve.getScreenCTM()!)
      const curveEnd = curve
        .getPointAtLength(curveLength)
        .matrixTransform(curve.getScreenCTM()!)
      let curvePoint = curveEnd
      if (!useEndpoint) {
        let low = 0
        let high = curveLength
        for (let step = 0; step < 30; step += 1) {
          const middle = (low + high) / 2
          const point = curve
            .getPointAtLength(middle)
            .matrixTransform(curve.getScreenCTM()!)
          if (point.x < markerPoint.x) low = middle
          else high = middle
        }
        curvePoint = curve
          .getPointAtLength((low + high) / 2)
          .matrixTransform(curve.getScreenCTM()!)
      }
      const svgBounds = marker.ownerSVGElement!.getBoundingClientRect()
      const markerStyle = getComputedStyle(marker)
      const curveStyle = getComputedStyle(curve)
      const hostBackground = getComputedStyle(
        element.parentElement!
      ).backgroundColor
      const guideX = guide
        ? toScreen(
            guide,
            Number(guide.getAttribute('x1')),
            Number(guide.getAttribute('y1'))
          ).x
        : undefined
      return {
        marker: { x: markerPoint.x, y: markerPoint.y },
        curve: { x: curvePoint.x, y: curvePoint.y },
        curveStart: { x: curveStart.x, y: curveStart.y },
        curveEnd: { x: curveEnd.x, y: curveEnd.y },
        guideX,
        fill: markerStyle.fill,
        line: curveStyle.stroke,
        ring: markerStyle.stroke,
        hostBackground,
        radius: Number(marker.getAttribute('r')),
        strokeWidth: Number(marker.getAttribute('stroke-width')),
        svg: {
          left: svgBounds.left,
          right: svgBounds.right,
          top: svgBounds.top,
          bottom: svgBounds.bottom,
        },
      }
    },
    { curveSelector, useEndpoint }
  )
}

function assertMarkerPresentation(
  geometry: Awaited<ReturnType<typeof markerGeometry>>
) {
  expect(geometry.fill).toBe(geometry.line)
  expect(geometry.ring).toBe(geometry.hostBackground)
  expect(geometry.radius).toBe(3)
  expect(geometry.strokeWidth).toBe(2)
  const clearance = geometry.radius + geometry.strokeWidth / 2
  expect(geometry.marker.x - clearance).toBeGreaterThanOrEqual(
    geometry.svg.left
  )
  expect(geometry.marker.x + clearance).toBeLessThanOrEqual(geometry.svg.right)
  expect(geometry.marker.y - clearance).toBeGreaterThanOrEqual(geometry.svg.top)
  expect(geometry.marker.y + clearance).toBeLessThanOrEqual(geometry.svg.bottom)
}

async function assertCandidateInsets(
  surface: Locator,
  chart: Locator,
  bottomSelector: string
) {
  const geometry = await surface.evaluate((element, selector) => {
    const surface = element.getBoundingClientRect()
    const chart = element.querySelector(
      '[data-metric-id], [data-testid="next-portfolio-history"]'
    )!
    const header = chart.querySelector('header')!.getBoundingClientRect()
    const bottom = chart.querySelector(selector)!.getBoundingClientRect()
    return {
      top: header.top - surface.top,
      bottom: surface.bottom - bottom.bottom,
    }
  }, bottomSelector)
  expect(geometry.top).toBe(24)
  expect(geometry.bottom).toBe(24)
  await expect(chart.locator('header')).toBeVisible()
}

async function readPortfolioLegendGeometry(portfolio: Locator) {
  return portfolio.evaluate((element) => {
    const key = element.querySelector(
      '[data-testid="next-portfolio-key"]'
    ) as HTMLElement
    const keyBounds = key.getBoundingClientRect()
    const keyStyle = getComputedStyle(key)
    const bounds = (node: Element) => {
      const box = node.getBoundingClientRect()
      return {
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
      }
    }
    const rows = [...key.querySelectorAll('[data-category]')].map((row) => {
      const children = [...row.children]
      const term = row.querySelector('dt')
      const description = row.querySelector('dd') ?? children.at(-1)!
      const label = term?.querySelector('span:last-child') ?? children[1]
      const termBounds = term
        ? bounds(term)
        : {
            left: bounds(children[0]).left,
            right: bounds(children[1]).right,
            top: Math.min(bounds(children[0]).top, bounds(children[1]).top),
            bottom: Math.max(
              bounds(children[0]).bottom,
              bounds(children[1]).bottom
            ),
            width: bounds(children[1]).right - bounds(children[0]).left,
            height:
              Math.max(bounds(children[0]).bottom, bounds(children[1]).bottom) -
              Math.min(bounds(children[0]).top, bounds(children[1]).top),
          }
      return {
        category: row.getAttribute('data-category')!,
        rowTag: row.tagName,
        termTag: term?.tagName ?? 'NONE',
        descriptionTag: description.tagName,
        row: bounds(row),
        term: termBounds,
        description: bounds(description),
        label: bounds(label),
      }
    })
    return {
      keyTag: key.tagName,
      key: bounds(key),
      contentLeft: keyBounds.left + Number.parseFloat(keyStyle.paddingLeft),
      contentRight: keyBounds.right - Number.parseFloat(keyStyle.paddingRight),
      clientWidth: key.clientWidth,
      scrollWidth: key.scrollWidth,
      documentOverflow: document.documentElement.scrollWidth - innerWidth,
      rows,
    }
  })
}

async function assertMobilePortfolioLegend(portfolio: Locator) {
  const geometry = await readPortfolioLegendGeometry(portfolio)
  expect(geometry.documentOverflow).toBeLessThanOrEqual(1)
  expect(geometry.scrollWidth - geometry.clientWidth).toBeLessThanOrEqual(1)
  expect(geometry.rows.map((row) => row.category)).toEqual([
    'indexDTFs',
    'yieldDTFs',
    'stakedRSR',
    'voteLocked',
    'rsr',
  ])
  for (const row of geometry.rows) {
    expect(row.row.left).toBeCloseTo(geometry.contentLeft, 0)
    expect(row.row.right).toBeCloseTo(geometry.contentRight, 0)
    expect(row.description.right).toBeCloseTo(geometry.contentRight, 0)
    expect(row.description.left - row.term.right).toBeGreaterThanOrEqual(8)
  }
  const amountRightEdges = geometry.rows.map((row) =>
    Math.round(row.description.right)
  )
  expect(new Set(amountRightEdges).size).toBe(1)
  for (let index = 1; index < geometry.rows.length; index += 1) {
    expect(
      geometry.rows[index].row.top - geometry.rows[index - 1].row.bottom
    ).toBe(12)
  }
  expect(geometry.keyTag).toBe('DL')
  for (const row of geometry.rows) {
    expect(row.rowTag).toBe('DIV')
    expect(row.termTag).toBe('DT')
    expect(row.descriptionTag).toBe('DD')
  }
  return {
    ...geometry,
    labelHeights: Object.fromEntries(
      geometry.rows.map((row) => [row.category, row.label.height])
    ) as Record<string, number>,
  }
}

async function assertDesktopPortfolioLegend(portfolio: Locator) {
  const geometry = await readPortfolioLegendGeometry(portfolio)
  const contentWidth = geometry.contentRight - geometry.contentLeft
  expect(geometry.keyTag).toBe('DL')
  expect(geometry.rows.map((row) => row.category)).toEqual([
    'indexDTFs',
    'yieldDTFs',
    'stakedRSR',
    'voteLocked',
    'rsr',
  ])
  for (const row of geometry.rows) {
    expect(row.row.width).toBeLessThan(contentWidth)
    expect(row.description.left - row.term.right).toBe(8)
  }
  const firstLine = geometry.rows.filter(
    (row) => Math.abs(row.row.top - geometry.rows[0].row.top) <= 1
  )
  expect(firstLine.length).toBeGreaterThan(1)
  for (let index = 1; index < firstLine.length; index += 1) {
    expect(firstLine[index].row.left - firstLine[index - 1].row.right).toBe(24)
  }
}

async function assertRightInset(surface: Locator, target: Locator) {
  const [surfaceBounds, targetBounds] = await Promise.all([
    surface.boundingBox(),
    target.boundingBox(),
  ])
  expect(
    surfaceBounds!.x +
      surfaceBounds!.width -
      (targetBounds!.x + targetBounds!.width)
  ).toBe(24)
  await expect(target).toHaveAttribute('data-action-treatment', 'utility')
  expect(targetBounds!.height).toBe(20)
}

async function assertPortfolioControlPlacement(
  portfolio: Locator,
  placement: 'desktop' | 'narrow'
) {
  const geometry = await portfolio.evaluate((element) => {
    const box = (selector: string) => {
      const bounds = element.querySelector(selector)!.getBoundingClientRect()
      return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
      }
    }
    return {
      header: box('header'),
      label: box('header p:first-child'),
      value: box('[data-testid="next-portfolio-value"]'),
      time: box('[data-testid="next-portfolio-time"]'),
      ranges: box('[data-testid="next-portfolio-ranges"]'),
      plot: box(
        '[role="group"][aria-label^="Portfolio value and category history"]'
      ),
    }
  })
  expect(geometry.value.top - geometry.label.bottom).toBe(8)
  expect(geometry.time.top - geometry.value.bottom).toBe(8)
  expect(geometry.ranges.bottom).toBeLessThanOrEqual(geometry.plot.top)
  if (placement === 'desktop') {
    expect(
      Math.abs(geometry.ranges.top - geometry.header.top)
    ).toBeLessThanOrEqual(1)
    expect(geometry.header.right - geometry.ranges.right).toBe(24)
  } else {
    expect(geometry.ranges.top - geometry.time.bottom).toBe(16)
    expect(geometry.ranges.left - geometry.header.left).toBe(24)
  }
}

async function assertGuideAboveComposition(portfolio: Locator) {
  const geometry = await portfolio.evaluate((element) => {
    const guide = element.querySelector(
      '.selected-timestamp-guide line, line.selected-timestamp-guide'
    ) as SVGLineElement
    const filledBand = element.querySelector(
      '.recharts-area-area'
    ) as SVGPathElement
    const guideStyle = getComputedStyle(guide)
    const start = new DOMPoint(
      Number(guide.getAttribute('x1')),
      Number(guide.getAttribute('y1'))
    ).matrixTransform(guide.getScreenCTM()!)
    const end = new DOMPoint(
      Number(guide.getAttribute('x2')),
      Number(guide.getAttribute('y2'))
    ).matrixTransform(guide.getScreenCTM()!)
    return {
      height: Math.abs(end.y - start.y),
      stroke: guideStyle.stroke,
      strokeWidth: Number(guide.getAttribute('stroke-width')),
      isAfterFilledBands: Boolean(
        filledBand.compareDocumentPosition(guide) &
        Node.DOCUMENT_POSITION_FOLLOWING
      ),
    }
  })
  expect(geometry.height).toBeGreaterThan(200)
  expect(geometry.stroke).not.toBe('none')
  expect(geometry.stroke).not.toBe('rgba(0, 0, 0, 0)')
  expect(geometry.strokeWidth).toBe(1)
  expect(geometry.isAfterFilledBands).toBe(true)
}

function windowScrollOffset(plot: Locator) {
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
