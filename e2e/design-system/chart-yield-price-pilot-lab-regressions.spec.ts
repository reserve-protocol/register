import { expect, test, type Locator } from '@playwright/test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const preview =
  '/src/views/internal/design-system/charts/next-families/preview.html'
const evidence = path.resolve('test-results/design-system/charts/next-families')

test.beforeAll(async () => {
  await mkdir(evidence, { recursive: true })
})
const captured: {
  price: {
    data: { token: { snapshots: { timestamp: string; priceUSD: string }[] } }
  }
} = JSON.parse(
  readFileSync(
    'src/views/internal/design-system/charts/next-families/fixtures/hyusd-history.json',
    'utf8'
  )
)
const snapshots = [...captured.price.data.token.snapshots].sort(
  (a, b) => Number(a.timestamp) - Number(b.timestamp)
)

test('Price pilot distinguishes captured inspection values and keeps ordinary ranges complete', async ({
  page,
}) => {
  await page.goto(`${preview}#embedded=true&theme=light`)
  const pilot = page.getByTestId('yield-price-pilot')
  await expect(pilot).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await expect(
    pilot.locator('footer').getByRole('button', { name: 'Download CSV' })
  ).toHaveCount(1)
  await expect(pilot.locator('.latest-point-marker circle')).toHaveCount(1)
  await pilot.screenshot({ path: path.join(evidence, 'first-price-pilot.png') })
  const value = pilot.getByTestId('yield-price-value')
  await expect(value).toHaveCSS('font-size', '16px')
  const plot = pilot.getByRole('group', { name: /hyUSD Price historical plot/ })
  await plot.focus()
  const bounds = (await plot.boundingBox())!
  await page.mouse.move((await curveStartX(pilot)) + 2, bounds.y + 80)
  await expect(pilot).toHaveAttribute('data-selected-timestamp', '1785122241')
  await expect(value).toHaveText('$1.1372')
  await page.keyboard.press('ArrowRight')
  await expect(pilot).toHaveAttribute('data-selected-timestamp', '1785276971')
  await expect(value).toHaveText('$1.1371')
  await expect(pilot.getByTestId('yield-price-ticker')).toHaveText('hyUSD')
  await expect(pilot.locator('output')).toContainText('USD per hyUSD')
  await pilot.getByRole('radio', { name: '1Y', exact: true }).click()
  await expect(pilot).toHaveAttribute('data-point-count', '29')
  await expect(plot).not.toHaveAttribute('aria-describedby')
  await expect(value).toHaveText('$1.137')
  const geometry = await readPartialHistoryGeometry(pilot)
  expect(geometry.ticks).toHaveLength(3)
  expect(geometry.ticks[0].text).toBe('27 Jul')
  expect(geometry.ticks.at(-1)!.text).toBe('24 Aug')
  expect(
    Math.abs(geometry.curveStart.x - geometry.ticks[0].left)
  ).toBeLessThanOrEqual(1)
  expect(
    Math.abs(geometry.area.left - geometry.curveStart.x)
  ).toBeLessThanOrEqual(1)
  expect(Math.abs(geometry.curveEnd.x - geometry.marker.x)).toBeLessThanOrEqual(
    1
  )
  expect(
    Math.abs(geometry.ticks.at(-1)!.right - geometry.marker.x)
  ).toBeLessThanOrEqual(1)
  await expect(page.getByTestId('yield-price-context')).not.toContainText(
    'Selecting 1Y'
  )
  await page
    .getByTestId('yield-price-context')
    .screenshot({ path: path.join(evidence, 'price-light-1y-context.png') })
})

for (const theme of ['light', 'dark']) {
  for (const width of [320, 390, 824, 1400]) {
    test(`Price pilot text geometry and inspection ${theme} ${width}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(`${preview}#embedded=true&theme=${theme}`)
      const pilot = page.getByTestId('yield-price-pilot')
      const surface = page.getByTestId('yield-price-review-surface')
      await expect(pilot).toBeVisible()
      await expect(surface).toHaveCSS('padding-top', '24px')
      await expect(surface).toHaveCSS('padding-bottom', '24px')
      await expect(surface).toHaveCSS('padding-left', '0px')
      await expect(surface).toHaveCSS('padding-right', '0px')
      await page.evaluate(() => document.fonts.ready)
      await surface.scrollIntoViewIfNeeded()
      await expect(pilot).toHaveAttribute('data-point-count', '29')
      const plot = pilot.getByRole('group', {
        name: /hyUSD Price historical plot/,
      })
      await expect(plot).toHaveCSS('height', '208px')
      await expect(pilot.getByTestId('next-metric-price-descriptor')).toHaveCSS(
        'font-size',
        '14px'
      )
      await expect(pilot.getByTestId('yield-price-value')).toHaveCSS(
        'font-size',
        '16px'
      )
      await expect(pilot.getByTestId('yield-price-time')).toHaveCSS(
        'font-size',
        '14px'
      )
      await expect(pilot.getByTestId('yield-price-ticker')).toHaveText('hyUSD')
      await expect(pilot.locator('output')).toContainText('USD per hyUSD')
      const restGeometry = await readGeometry(pilot)
      assertGeometry(restGeometry)
      await expect(pilot.locator('.latest-point-marker circle')).toHaveCount(1)
      await surface.screenshot({
        path: path.join(evidence, `price-${theme}-${width}-rest.png`),
      })
      await page.screenshot({
        path: path.join(evidence, `context-${theme}-${width}.png`),
      })

      await plot.focus()
      expect(
        await plot.evaluate((node) => getComputedStyle(node).boxShadow)
      ).not.toBe('none')
      await page.keyboard.press('ArrowLeft')
      await expect(pilot).toHaveAttribute(
        'data-selected-timestamp',
        snapshots.at(-2)!.timestamp
      )
      await expect(pilot.locator('.latest-point-marker')).toHaveCount(0)
      await expect(
        pilot.locator('.inspection-point-marker circle')
      ).toHaveCount(1)
      await expect(pilot.locator('.recharts-active-dot')).toHaveCount(0)
      await expect(pilot.getByTestId('yield-price-ticker')).toHaveText('hyUSD')
      await expect(pilot.locator('output')).toContainText('USD per hyUSD')
      const hoverGeometry = await readGeometry(pilot)
      assertGeometry(hoverGeometry)
      expect(hoverGeometry.plot).toEqual(restGeometry.plot)
      await surface.screenshot({
        path: path.join(evidence, `price-${theme}-${width}-inspection.png`),
      })

      const bounds = (await plot.boundingBox())!
      await page.mouse.move((await curveStartX(pilot)) + 2, bounds.y + 80)
      await expect(pilot).toHaveAttribute(
        'data-selected-timestamp',
        snapshots[0].timestamp
      )
      await expect(pilot.getByTestId('yield-price-value')).toHaveText('$1.1372')
      const endpoint = await pilot
        .locator('.recharts-area-curve')
        .evaluate((curve: SVGPathElement) => {
          const point = curve
            .getPointAtLength(curve.getTotalLength())
            .matrixTransform(curve.getScreenCTM()!)
          return { x: point.x }
        })
      await page.mouse.move(endpoint.x, bounds.y + 80)
      await expect(pilot).toHaveAttribute(
        'data-selected-timestamp',
        snapshots.at(-1)!.timestamp
      )
      await page.mouse.move(bounds.x + 10, bounds.y - 10)
      await expect(pilot.getByTestId('yield-price-time')).toHaveText('')
      await expect(pilot.locator('.inspection-point-marker')).toHaveCount(0)
      await expect(pilot.locator('.latest-point-marker circle')).toHaveCount(1)
      await expect(pilot.getByTestId('yield-price-value')).toHaveText('$1.137')
      await page.keyboard.press('ArrowLeft')
      await page.keyboard.press('Tab')
      await expect(pilot.getByTestId('yield-price-time')).toHaveText('')

      for (const range of ['7D', '1Y', '30D']) {
        await pilot.getByRole('radio', { name: range, exact: true }).click()
        await expect(pilot).toHaveAttribute('data-range', range.toLowerCase())
        await expect(pilot.getByTestId('yield-price-time')).toHaveText('')
        await pilot
          .getByTestId('historical-range-scrollport')
          .evaluate((node) => {
            node.scrollLeft = 0
          })
        assertGeometry(await readGeometry(pilot))
      }
      await expect(
        pilot.getByRole('radio', { name: '24H', exact: true })
      ).toBeDisabled()
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        )
      ).toBeLessThanOrEqual(1)
      await testInfo.attach('measured-geometry', {
        body: JSON.stringify({ restGeometry, hoverGeometry }, null, 2),
        contentType: 'application/json',
      })
      await writeFile(
        path.join(evidence, `geometry-${theme}-${width}.json`),
        JSON.stringify({ restGeometry, hoverGeometry }, null, 2)
      )
    })
  }
}

test('Price pilot export retains captured values and empty recovery', async ({
  page,
}) => {
  await page.goto(`${preview}#embedded=true&theme=light`)
  const pilot = page.getByTestId('yield-price-pilot')
  await pilot.getByRole('radio', { name: '7D', exact: true }).click()
  await expect(pilot).toHaveAttribute('data-point-count', '7')
  const downloadPromise = page.waitForEvent('download')
  await pilot.getByRole('button', { name: 'Download CSV' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('hyUSD-historical-price-7d.csv')
  const content = await readFile((await download.path())!, 'utf8')
  const latestTimestamp = Number(snapshots.at(-1)!.timestamp)
  const expectedRows = captured.price.data.token.snapshots.filter(
    (point) => Number(point.timestamp) >= latestTimestamp - 7 * 86400
  )
  expect(content.trim()).toBe(
    [
      'Timestamp,Price USD',
      ...expectedRows.map((point) => `${point.timestamp},${point.priceUSD}`),
    ].join('\n')
  )
  await page.getByRole('radio', { name: 'Empty', exact: true }).click()
  await expect(pilot).toHaveAttribute('data-point-count', '0')
  await expect(pilot.getByText('No data', { exact: true })).toBeVisible()
  await expect(pilot.getByTestId('yield-price-ticker')).toHaveText('hyUSD')
  await expect(pilot.locator('output')).toContainText('USD per hyUSD')
  await expect(
    pilot.getByRole('button', { name: 'Download CSV' })
  ).toBeDisabled()
  await page.getByRole('radio', { name: 'Default', exact: true }).click()
  await expect(pilot).toHaveAttribute('data-point-count', '7')
  await expect(
    pilot.getByRole('button', { name: 'Download CSV' })
  ).toBeEnabled()
})

for (const width of [320, 390]) {
  test(`Price pilot unsupported touch remains explicit at ${width}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      hasTouch: true,
      isMobile: true,
    })
    const page = await context.newPage()
    await page.goto(`${preview}#embedded=true&theme=light`)
    const pilot = page.getByTestId('yield-price-pilot')
    const plot = pilot.getByRole('group', {
      name: /hyUSD Price historical plot/,
    })
    await plot.scrollIntoViewIfNeeded()
    const bounds = (await plot.boundingBox())!
    await page.touchscreen.tap(bounds.x + 25, bounds.y + 80)
    await expect(pilot.getByTestId('yield-price-time')).toHaveText('')
    await expect(pilot.locator('.inspection-point-marker')).toHaveCount(0)
    await expect(pilot.locator('.latest-point-marker circle')).toHaveCount(1)
    await expect(page.getByTestId('yield-price-context')).toContainText(
      'Touch value inspection is unsupported'
    )
    await expect(plot).toHaveCSS('touch-action', 'auto')
    await plot.focus()
    await page.keyboard.press('ArrowLeft')
    await expect(pilot).toHaveAttribute(
      'data-selected-timestamp',
      snapshots.at(-2)!.timestamp
    )
    await page.keyboard.press('Tab')
    await expect(pilot.getByTestId('yield-price-time')).toHaveText('')
    await page.mouse.move((await curveStartX(pilot)) + 2, bounds.y + 80)
    await expect(pilot).toHaveAttribute(
      'data-selected-timestamp',
      snapshots[0].timestamp
    )
    await context.close()
  })
}

async function readGeometry(pilot: Locator) {
  return pilot.evaluate((element) => {
    const bounds = (target: Element) => {
      const box = target.getBoundingClientRect()
      return {
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
      }
    }
    const curve = element.querySelector(
      '.recharts-area-curve'
    ) as SVGPathElement
    const curveEnd = curve
      .getPointAtLength(curve.getTotalLength())
      .matrixTransform(curve.getScreenCTM()!)
    const curveStart = curve
      .getPointAtLength(0)
      .matrixTransform(curve.getScreenCTM()!)
    const marker = element.querySelector(
      '.latest-point-marker circle, circle.latest-point-marker, .inspection-point-marker circle, circle.inspection-point-marker'
    ) as SVGCircleElement
    const markerPoint = new DOMPoint(
      Number(marker.getAttribute('cx')),
      Number(marker.getAttribute('cy'))
    ).matrixTransform(marker.getScreenCTM()!)
    return {
      candidate: bounds(element),
      plot: bounds(element.querySelector('[role="group"]')!),
      footer: bounds(element.querySelector('footer')!),
      plotLeft: curveStart.x,
      plotRight: curveEnd.x,
      marker: {
        x: markerPoint.x,
        y: markerPoint.y,
        radius: Number(marker.getAttribute('r')),
        strokeWidth: Number(marker.getAttribute('stroke-width')),
      },
      svg: bounds(marker.ownerSVGElement!),
      row: {
        value: bounds(
          element.querySelector('[data-testid="yield-price-value"]')!
        ),
        dot: bounds(element.querySelector('header span[aria-hidden="true"]')!),
        ticker: bounds(
          element.querySelector('[data-testid="yield-price-ticker"]')!
        ),
      },
      ticks: [
        ...element.querySelectorAll(
          '.recharts-xAxis text, .recharts-yAxis text'
        ),
      ].map((node) => ({
        text: node.textContent,
        axis: node.closest('.recharts-xAxis') ? 'x' : 'y',
        fontSize: getComputedStyle(node).fontSize,
        ...bounds(node),
      })),
      readout: [
        ...element.querySelectorAll(
          'header p, header span, footer p, footer button'
        ),
      ]
        .filter((node) => node.textContent?.trim())
        .map((node) => {
          const range = document.createRange()
          range.selectNodeContents(node)
          const box = range.getBoundingClientRect()
          return {
            text: node.textContent,
            left: box.left,
            right: box.right,
            top: box.top,
            bottom: box.bottom,
            fontSize: getComputedStyle(node).fontSize,
          }
        }),
    }
  })
}

async function curveStartX(pilot: Locator) {
  return pilot.locator('.recharts-area-curve').evaluate((curve) => {
    const path = curve as SVGPathElement
    return path.getPointAtLength(0).matrixTransform(path.getScreenCTM()!).x
  })
}

async function readPartialHistoryGeometry(pilot: Locator) {
  return pilot.evaluate((element) => {
    const bounds = (node: Element) => {
      const box = node.getBoundingClientRect()
      return {
        left: box.left,
        right: box.right,
        top: box.top,
        width: box.width,
        height: box.height,
      }
    }
    const curve = element.querySelector(
      '.recharts-area-curve'
    ) as SVGPathElement
    const marker = element.querySelector(
      '.latest-point-marker circle, circle.latest-point-marker'
    ) as SVGCircleElement
    const toScreen = (node: SVGGraphicsElement, x: number, y: number) =>
      new DOMPoint(x, y).matrixTransform(node.getScreenCTM()!)
    const point = (value: DOMPoint) => ({ x: value.x, y: value.y })
    return {
      plot: bounds(element.querySelector('[role="group"]')!),
      area: bounds(element.querySelector('.recharts-area-area')!),
      ticks: [...element.querySelectorAll('.recharts-xAxis text')].map(
        (tick) => ({ text: tick.textContent, ...bounds(tick) })
      ),
      curveStart: point(
        curve.getPointAtLength(0).matrixTransform(curve.getScreenCTM()!)
      ),
      curveEnd: point(
        curve
          .getPointAtLength(curve.getTotalLength())
          .matrixTransform(curve.getScreenCTM()!)
      ),
      marker: point(
        toScreen(
          marker,
          Number(marker.getAttribute('cx')),
          Number(marker.getAttribute('cy'))
        )
      ),
    }
  })
}

function assertGeometry(geometry: Awaited<ReturnType<typeof readGeometry>>) {
  const plotLeft = geometry.candidate.left + 4
  const contentLeft = geometry.candidate.left + 24
  const right = geometry.candidate.right - 24
  expect(geometry.candidate.width).toBeLessThanOrEqual(672)
  expect(geometry.plot.left).toBeCloseTo(geometry.candidate.left, 0)
  expect(geometry.plot.right).toBeCloseTo(geometry.candidate.right, 0)
  expect(geometry.plotLeft).toBeCloseTo(plotLeft, 0)
  expect(geometry.row.dot.left - geometry.row.value.right).toBe(8)
  expect(geometry.row.ticker.left - geometry.row.dot.right).toBe(8)
  for (const text of geometry.readout) {
    expect(text.left, `${text.text} left`).toBeGreaterThanOrEqual(
      contentLeft - 1
    )
    expect(text.right, `${text.text} right`).toBeLessThanOrEqual(right + 1)
  }
  for (const tick of geometry.ticks.filter((tick) => tick.axis === 'x')) {
    expect(tick.left, `${tick.text} left`).toBeGreaterThanOrEqual(plotLeft - 1)
    expect(tick.right, `${tick.text} right`).toBeLessThanOrEqual(right + 1)
  }
  for (const axis of ['x', 'y']) {
    const ticks = geometry.ticks.filter((tick) => tick.axis === axis)
    expect(ticks.length).toBeGreaterThanOrEqual(2)
    expect(new Set(ticks.map((tick) => tick.text)).size).toBe(ticks.length)
  }
  for (const tick of geometry.ticks.filter((tick) => tick.axis === 'y')) {
    expect(tick.right).toBeCloseTo(right, 0)
    expect(tick.right).toBeLessThanOrEqual(right + 1)
  }
  const yTicks = geometry.ticks.filter((tick) => tick.axis === 'y')
  const nearestLabelEdge = Math.min(...yTicks.map((tick) => tick.left))
  expect(nearestLabelEdge - geometry.plotRight - 4).toBeGreaterThanOrEqual(12)
  expect(nearestLabelEdge - geometry.plotRight - 4).toBeLessThanOrEqual(16)
  expect(geometry.ticks.every((tick) => tick.fontSize === '12px')).toBe(true)
  expect(
    geometry.readout.every((text) => ['14px', '16px'].includes(text.fontSize))
  ).toBe(true)
  const dateTicks = geometry.ticks.filter((tick) => tick.axis === 'x')
  expect(Math.abs(dateTicks[0].left - plotLeft)).toBeLessThanOrEqual(1)
  expect(
    Math.abs(dateTicks.at(-1)!.right - geometry.plotRight)
  ).toBeLessThanOrEqual(1)
  const markerClearance =
    geometry.marker.radius + geometry.marker.strokeWidth / 2
  expect(geometry.marker.x - markerClearance).toBeGreaterThanOrEqual(
    geometry.svg.left
  )
  expect(geometry.marker.x + markerClearance).toBeLessThanOrEqual(
    geometry.svg.right
  )
}
