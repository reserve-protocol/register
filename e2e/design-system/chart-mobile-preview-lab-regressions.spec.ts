import { currentCapture, expect, test } from './current-rebalance-helpers'
import type { Locator } from '@playwright/test'

test('chart review modes are mutually exclusive', async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1000 })
  await page.goto('/internal/design-system/components/chart')

  await expect(page.getByTestId('chart-review-normal')).toBeVisible()
  await expect(page.getByTestId('chart-mobile-preview')).toHaveCount(0)

  await page.getByTestId('chart-viewport-narrow').click()
  await expect(page.getByTestId('chart-review-narrow')).toBeVisible()
  await expect(page.getByTestId('chart-source-title')).toHaveCSS(
    'font-size',
    '32px'
  )
  await expect(
    page
      .getByTestId('chart-source-plot')
      .locator('.recharts-cartesian-axis-tick-value')
  ).toHaveCount(11)
  await expect(page.getByTestId('chart-review-normal')).toHaveCount(0)
  await expect(page.getByTestId('chart-mobile-preview')).toHaveCount(0)

  await page.getByTestId('chart-viewport-normal').click()
  await expect(page.getByTestId('chart-review-normal')).toBeVisible()
  await expect(page.getByTestId('chart-review-narrow')).toHaveCount(0)

  await page.getByTestId('chart-viewport-mobile').click()
  await expect(page.getByTestId('chart-mobile-preview')).toBeVisible()
  await expect(page.getByTestId('chart-review-normal')).toHaveCount(0)
  await expect(page.getByTestId('chart-review-narrow')).toHaveCount(0)
})

for (const width of [320, 390]) {
  test(`mobile preview owns its ${width}px CSS and JavaScript viewport`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 1728, height: 1000 })
    await page.goto('/internal/design-system/components/chart')
    await page.getByTestId('chart-viewport-mobile').click()
    await page.getByTestId(`chart-mobile-width-${width}`).click()

    const iframe = page.getByTestId('chart-mobile-preview')
    await expect(iframe).toHaveAttribute('width', String(width))
    const preview = page.frameLocator('[data-testid="chart-mobile-preview"]')
    await expect(preview.getByTestId('chart-preview-root')).toHaveAttribute(
      'data-viewport-width',
      String(width)
    )
    await expect(preview.getByTestId('chart-source-title')).toHaveCSS(
      'font-size',
      '24px'
    )
    await expect(
      preview
        .getByTestId('chart-source-plot')
        .locator('.recharts-cartesian-axis-tick-value')
    ).toHaveCount(0)
    await expect(
      preview.getByText('Index DTF Overview · YTD line chart', { exact: true })
    ).toBeVisible()
    await expect(preview.getByTestId('chart-compact')).toBeVisible()
    await expectMarkerUnclipped(
      preview
        .getByTestId('chart-overview-source')
        .getByTestId('chart-latest-point-marker')
    )
    await expectMarkerUnclipped(
      preview
        .getByTestId('chart-compact')
        .getByTestId('chart-latest-point-marker')
    )
    await expectMarkerUnclipped(
      preview.getByTestId('chart-card').getByTestId('chart-latest-point-marker')
    )
    await expect(
      preview.getByText('Home · chart in highlighted-card context', {
        exact: true,
      })
    ).toBeVisible()
    await expect(
      preview.getByTestId('feature-card-launch-marker')
    ).toBeVisible()
    await expect(preview.getByTestId('feature-card-launch-label')).toHaveCSS(
      'opacity',
      '1'
    )
    await settledOverview(preview.getByTestId('chart-source-plot'))
    await currentCapture(
      page,
      iframe,
      info,
      `chart-mobile-preview-light-${width}`
    )
  })
}

test('mobile preview follows inspection mode and theme without a second chart set', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1728, height: 1000 })
  await page.addInitScript(() =>
    localStorage.setItem('theme-ui-color-mode', 'dark')
  )
  await page.goto('/internal/design-system/components/chart')
  await page.getByTestId('chart-viewport-mobile').click()
  const preview = page.frameLocator('[data-testid="chart-mobile-preview"]')

  await expect(preview.getByTestId('chart-preview-root')).toHaveAttribute(
    'data-theme',
    'dark'
  )
  await expect(preview.getByTestId('chart-overview-source')).toHaveCount(1)
  await expect(preview.getByTestId('chart-card')).toHaveCount(1)
  await settledOverview(preview.getByTestId('chart-source-plot'))
  await currentCapture(
    page,
    page.getByTestId('chart-mobile-preview'),
    info,
    'chart-mobile-preview-dark-390'
  )
  await page.getByTestId('chart-mode-current').click()
  await expect(preview.getByTestId('chart-preview-root')).toHaveAttribute(
    'data-inspection-mode',
    'current'
  )
  await expect(preview.getByTestId('chart-overview-source')).toHaveCount(1)
  await expect(preview.getByTestId('chart-card')).toHaveCount(1)
  await page
    .getByTestId('design-system-lab')
    .getByRole('button', { name: 'Toggle theme' })
    .click()
  await expect(preview.locator('html')).not.toHaveClass(/dark/)
  await expect(preview.getByTestId('chart-preview-root')).toHaveAttribute(
    'data-theme',
    'light'
  )
  await page.getByTestId('chart-viewport-normal').click()
  await expect(page.getByTestId('chart-source-title')).toHaveCSS(
    'font-size',
    '32px'
  )
  await expect(
    page
      .getByTestId('chart-source-plot')
      .locator('.recharts-cartesian-axis-tick-value')
  ).toHaveCount(11)
})

test.describe('mobile preview inspection', () => {
  test.use({ hasTouch: true, isMobile: true })

  test('touch and keyboard inspect inside the independent document', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1728, height: 1000 })
    await page.goto('/internal/design-system/components/chart')
    await page.getByTestId('chart-viewport-mobile').click()
    await page.getByTestId('chart-mobile-width-320').click()
    const preview = page.frameLocator('[data-testid="chart-mobile-preview"]')
    const chart = preview.getByTestId('chart-overview-source')
    const plot = chart.getByTestId('chart-source-plot')
    await plot.scrollIntoViewIfNeeded()
    const box = (await plot.boundingBox())!
    await page.touchscreen.tap(box.x + 5, box.y + 100)
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$47.41')
    await expect(chart.getByTestId('chart-source-time')).toHaveAttribute(
      'datetime',
      '2026-01-02T00:00:00.000Z'
    )

    await preview.locator('.recharts-surface').first().focus()
    await page.keyboard.press('ArrowRight')
    await expect(chart.getByTestId('chart-source-value')).not.toHaveText(
      '$81.50'
    )
  })
})

async function settledOverview(plot: Locator) {
  await expect
    .poll(() =>
      plot.evaluate((element) => {
        const svg = element.querySelector<SVGSVGElement>('svg.recharts-surface')
        const clip = svg?.querySelector<SVGRectElement>('defs clipPath rect')
        const paths = Array.from(
          element.querySelectorAll<SVGPathElement>('path.recharts-area-curve')
        )
        if (!svg || !clip || !paths.length) return false
        const isDrawComplete = Array.from(
          svg.querySelectorAll<SVGRectElement>(
            'clipPath[id^="animationClipPath-"] rect'
          )
        ).every((rect) => {
          const group = rect.parentElement?.parentElement?.nextElementSibling
          const area = group?.querySelector<SVGPathElement>(
            'path.recharts-area-area'
          )
          if (!area) return false
          const bounds = area.getBBox()
          return (
            rect.x.baseVal.value + rect.width.baseVal.value >=
            bounds.x + bounds.width - 1
          )
        })
        const width =
          element.clientWidth -
          parseFloat(getComputedStyle(element).paddingRight)
        const marker = element.querySelector<SVGCircleElement>(
          '[data-testid="chart-latest-point-marker"]'
        )
        const right = Math.max(
          ...paths.map((path) => path.getBBox().x + path.getBBox().width)
        )
        const expectedRight =
          marker?.cx.baseVal.value ??
          clip.x.baseVal.value + clip.width.baseVal.value
        return (
          isDrawComplete &&
          Math.abs(svg.getBoundingClientRect().width - width) < 1 &&
          Math.abs(right - expectedRight) < 1
        )
      })
    )
    .toBe(true)
}

async function expectMarkerUnclipped(marker: Locator) {
  await expect(marker).toBeVisible()
  const { markerBounds, svgBounds } = await marker.evaluate((element) => {
    const markerRect = element.getBoundingClientRect()
    const svgRect = (
      element as SVGElement
    ).ownerSVGElement!.getBoundingClientRect()
    return {
      markerBounds: {
        x: markerRect.x,
        y: markerRect.y,
        width: markerRect.width,
        height: markerRect.height,
      },
      svgBounds: {
        x: svgRect.x,
        y: svgRect.y,
        width: svgRect.width,
        height: svgRect.height,
      },
    }
  })
  expect(markerBounds.x).toBeGreaterThanOrEqual(svgBounds.x)
  expect(markerBounds.y).toBeGreaterThanOrEqual(svgBounds.y)
  expect(markerBounds.x + markerBounds.width).toBeLessThanOrEqual(
    svgBounds.x + svgBounds.width
  )
  expect(markerBounds.y + markerBounds.height).toBeLessThanOrEqual(
    svgBounds.y + svgBounds.height
  )
}
