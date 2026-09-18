import { expect, test, type Locator } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const chartPreview =
  '/src/views/internal/design-system/charts/next-families/preview.html'
const evidence = path.resolve('test-results/design-system/charts/text-controls')

test.beforeAll(async () => {
  await mkdir(evidence, { recursive: true })
})

test('canonical text controls keep compact geometry opt-in', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 900 })
  await page.goto('/internal/design-system/components/segmented-control')
  const sheet = page.getByTestId('segmented-control-state-sheet')
  const compact = sheet.getByRole('group', {
    name: 'Compact chart data type',
  })
  const marketCap = compact.getByRole('radio', { name: 'Market cap' })
  await compact.scrollIntoViewIfNeeded()
  await expect(compact).toHaveAttribute('data-text-only-density', 'compact')
  expect((await compact.boundingBox())!.height).toBe(24)
  expect((await marketCap.boundingBox())!.height).toBe(24)

  const verticalTarget = await targetPoints(marketCap, 8)
  expect(verticalTarget).toMatchObject({
    above: true,
    below: true,
  })
  const horizontalTarget = await targetPoints(marketCap, 3)
  expect(horizontalTarget).toMatchObject({
    left: true,
    right: true,
  })
  await page.mouse.click(
    targetPoint(verticalTarget, 'above').x,
    targetPoint(verticalTarget, 'above').y
  )
  await expect(marketCap).toBeChecked()
  await expect(compact.getByRole('radio', { name: 'Supply' })).toBeDisabled()

  const currentText = sheet.getByRole('group', {
    name: 'Chart data type',
    exact: true,
  })
  await expect(currentText).not.toHaveAttribute('data-text-only-density')
  expect((await currentText.boundingBox())!.height).toBe(44)
  const contained = sheet.getByRole('group', { name: 'Chart presentation' })
  await expect(contained).toHaveAttribute('data-presentation', 'contained')
  await expect(contained).not.toHaveAttribute('data-text-only-density')
  expect((await contained.boundingBox())!.height).toBe(32)

  await page.goto('/internal/design-system/components/button')
  const utility = page
    .getByRole('button', { name: 'Download CSV', exact: true })
    .first()
  await expect(utility).toHaveAttribute('data-action-treatment', 'utility')
  expect((await utility.boundingBox())!.height).toBe(20)
  const resting = await interactionSurface(utility)
  await utility.hover()
  expect(await interactionSurface(utility)).toEqual(resting)
  const utilityTarget = await targetPoints(utility, 10)
  expect(utilityTarget.above).toBe(true)
  expect(utilityTarget.below).toBe(true)
  await page.mouse.click(
    targetPoint(utilityTarget, 'above').x,
    targetPoint(utilityTarget, 'above').y
  )
  await utility.focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(utility).toBeFocused()
  expect(
    await utility.evaluate((node) => getComputedStyle(node).boxShadow)
  ).not.toBe('none')
  await utility.screenshot({
    path: path.join(evidence, 'canonical-csv-utility-focus.png'),
    animations: 'disabled',
  })
})

for (const theme of ['light', 'dark'] as const) {
  test(`chart text controls align and stay visually quiet on ${theme} desktop`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 1000 })
    await page.goto(`${chartPreview}#embedded=true&theme=${theme}`)
    await page.evaluate(() => document.fonts.ready)
    const review = page.getByTestId('next-chart-families-review')
    const portfolioSurface = review.getByTestId('next-portfolio-review-surface')
    const portfolio = review.getByTestId('next-portfolio-history')
    const portfolioRanges = portfolio.getByTestId('historical-range-scrollport')
    const finalRange = portfolioRanges.getByRole('radio', { name: 'All' })
    const opticalInset = await visibleTopRightInset(
      portfolioSurface,
      finalRange
    )
    expect(opticalInset.top).toBeCloseTo(24, 0)
    expect(opticalInset.right).toBeCloseTo(24, 0)
    expect((await finalRange.boundingBox())!.height).toBe(24)

    const price = review.getByTestId('yield-price-pilot')
    const exportAction = price.getByRole('button', { name: 'Download CSV' })
    const footer = price.locator('footer')
    const priceRanges = price.getByRole('group', {
      name: 'Historical range',
      exact: true,
    })
    const priceSurface = review.getByTestId('yield-price-review-surface')
    await expect.poll(() => visibleText(exportAction)).toBe('Download CSV')
    await expect(exportAction.locator('svg')).toHaveAttribute(
      'aria-hidden',
      'true'
    )
    expect((await exportAction.boundingBox())!.height).toBe(20)
    expect(await bottomOpticalInset(priceSurface, footer)).toBeCloseTo(24, 0)
    expect(
      await verticalCenterOffset(priceRanges, exportAction)
    ).toBeLessThanOrEqual(0.5)
    expect(await expandedTargetsFitSurface(priceSurface)).toBe(true)
    const resting = await interactionSurface(exportAction)
    await exportAction.hover()
    expect(await interactionSurface(exportAction)).toEqual(resting)
    await price.screenshot({
      path: path.join(evidence, `yield-price-${theme}-desktop-csv-hover.png`),
      animations: 'disabled',
    })

    const downloadPromise = page.waitForEvent('download')
    const exportTarget = await targetPoints(exportAction, 10)
    await page.mouse.click(
      targetPoint(exportTarget, 'below').x,
      targetPoint(exportTarget, 'below').y
    )
    await downloadPromise
    await exportAction.focus()
    await expect(exportAction).toBeFocused()
    await price.screenshot({
      path: path.join(evidence, `yield-price-${theme}-desktop-csv-focus.png`),
      animations: 'disabled',
    })

    const apy = review.getByTestId('next-metric-apy')
    const disabledExport = apy.getByRole('button', { name: 'Download CSV' })
    await expect(disabledExport).toBeDisabled()
    await expect(disabledExport).toHaveAttribute(
      'title',
      'Unavailable for simulated APY input'
    )
    await expect(disabledExport).toHaveAccessibleDescription(
      'Unavailable for simulated APY input'
    )
    await apy.screenshot({
      path: path.join(evidence, `yield-apy-${theme}-desktop-csv-disabled.png`),
      animations: 'disabled',
    })
  })
}

for (const theme of ['light', 'dark'] as const) {
  test(`chart CSV label follows its container boundary on ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 1000 })
    await page.goto(`${chartPreview}#embedded=true&theme=${theme}`)
    await page.evaluate(() => document.fonts.ready)
    const price = page.getByTestId('yield-price-pilot')
    const scrollport = price.getByTestId('historical-range-scrollport')
    const exportAction = price.getByRole('button', { name: 'Download CSV' })

    for (const width of [320, 351, 352, 390] as const) {
      await price.evaluate((node, containerWidth) => {
        node.style.width = `${containerWidth}px`
      }, width)
      await expect
        .poll(async () => (await price.boundingBox())!.width)
        .toBe(width)
      await expect
        .poll(() => visibleText(exportAction))
        .toBe(width < 352 ? 'CSV' : 'Download CSV')
      expect(await visualActionsDoNotOverlap(scrollport, exportAction)).toBe(
        true
      )
      expect(await expandedTargetsDoNotOverlap(scrollport, exportAction)).toBe(
        true
      )
      await price.screenshot({
        path: path.join(
          evidence,
          `yield-price-${theme}-container-${width}-csv.png`
        ),
        animations: 'disabled',
      })
    }
  })

  for (const width of [320, 390] as const) {
    test(`chart text targets scroll or fit without clipping at ${width}px ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`${chartPreview}#embedded=true&theme=${theme}`)
      await page.evaluate(() => document.fonts.ready)
      const review = page.getByTestId('next-chart-families-review')
      const price = review.getByTestId('yield-price-pilot')
      const scrollport = price.getByTestId('historical-range-scrollport')
      const exportAction = price.getByRole('button', { name: 'Download CSV' })
      await expect
        .poll(() => visibleText(exportAction))
        .toBe(width < 352 ? 'CSV' : 'Download CSV')
      await expect(exportAction.locator('svg')).toHaveAttribute(
        'aria-hidden',
        'true'
      )
      await scrollport.scrollIntoViewIfNeeded()
      const rangeScroll = await scrollToEndIfNeeded(scrollport)
      expect(
        Math.abs(rangeScroll.scrollLeft - rangeScroll.overflow)
      ).toBeLessThanOrEqual(1)
      await scrollport.evaluate((node) => {
        node.scrollLeft = 0
      })

      const firstEnabled = scrollport.getByRole('radio', { name: '7D' })
      const firstTarget = await targetPoints(firstEnabled, 8)
      expect(firstTarget.above).toBe(true)
      expect(firstTarget.below).toBe(true)
      await page.mouse.click(
        targetPoint(firstTarget, 'above').x,
        targetPoint(firstTarget, 'above').y
      )
      await expect(price).toHaveAttribute('data-range', '7d')

      await scrollToEndIfNeeded(scrollport)
      const last = scrollport.getByRole('radio', { name: '1Y' })
      const lastTarget = await targetPoints(last, 2)
      expect(lastTarget.right).toBe(true)
      await page.mouse.click(
        targetPoint(lastTarget, 'right').x,
        targetPoint(lastTarget, 'right').y
      )
      await expect(price).toHaveAttribute('data-range', '1y')
      await last.focus()
      await expect(last).toBeFocused()
      expect(await focusFitsScrollport(scrollport, last)).toBe(true)

      expect(await visualActionsDoNotOverlap(scrollport, exportAction)).toBe(
        true
      )
      expect(await expandedTargetsDoNotOverlap(scrollport, exportAction)).toBe(
        true
      )
      const exportTarget = await targetPoints(exportAction, 10)
      const downloadPromise = page.waitForEvent('download')
      await page.mouse.click(
        targetPoint(exportTarget, 'above').x,
        targetPoint(exportTarget, 'above').y
      )
      await downloadPromise
      await exportAction.hover()
      await price.screenshot({
        path: path.join(
          evidence,
          `yield-price-${theme}-${width}-scroll-csv-hover.png`
        ),
        animations: 'disabled',
      })

      const portfolio = review.getByTestId('next-portfolio-history')
      const portfolioScrollport = portfolio.getByTestId(
        'historical-range-scrollport'
      )
      await portfolioScrollport.scrollIntoViewIfNeeded()
      const portfolioScroll = await scrollToEndIfNeeded(portfolioScrollport)
      expect(
        Math.abs(portfolioScroll.scrollLeft - portfolioScroll.overflow)
      ).toBeLessThanOrEqual(1)
      const portfolioLast = portfolioScrollport.getByRole('radio', {
        name: 'All',
      })
      await portfolioLast.focus()
      expect(
        await focusFitsScrollport(portfolioScrollport, portfolioLast)
      ).toBe(true)
      await page.screenshot({
        path: path.join(
          evidence,
          `text-controls-${theme}-${width}-portfolio-focus.png`
        ),
        fullPage: true,
        animations: 'disabled',
      })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        )
      ).toBeLessThanOrEqual(1)
    })
  }
}

type TargetGeometry = {
  above: boolean
  below: boolean
  left: boolean
  right: boolean
  points: Record<'above' | 'below' | 'left' | 'right', { x: number; y: number }>
}

async function targetPoints(target: Locator, distance: number) {
  return target.evaluate((node, hitDistance): TargetGeometry => {
    const bounds = node.getBoundingClientRect()
    const points = {
      above: { x: bounds.x + bounds.width / 2, y: bounds.y - hitDistance },
      below: {
        x: bounds.x + bounds.width / 2,
        y: bounds.bottom + hitDistance,
      },
      left: { x: bounds.x - hitDistance, y: bounds.y + bounds.height / 2 },
      right: {
        x: bounds.right + hitDistance,
        y: bounds.y + bounds.height / 2,
      },
    }
    const owns = ({ x, y }: { x: number; y: number }) =>
      document.elementFromPoint(x, y)?.closest('button') === node
    return {
      above: owns(points.above),
      below: owns(points.below),
      left: owns(points.left),
      right: owns(points.right),
      points,
    }
  }, distance)
}

function targetPoint(
  geometry: TargetGeometry,
  side: keyof TargetGeometry['points']
) {
  return geometry.points[side]
}

async function interactionSurface(target: Locator) {
  return target.evaluate((node) => {
    const style = getComputedStyle(node)
    return {
      background: style.backgroundColor,
      borderStyle: style.borderStyle,
      borderWidth: style.borderWidth,
      borderRadius: style.borderRadius,
    }
  })
}

async function visibleText(target: Locator) {
  return target.evaluate((node) => (node as HTMLElement).innerText.trim())
}

async function visibleTopRightInset(surface: Locator, target: Locator) {
  const [surfaceBounds, targetBounds] = await Promise.all([
    surface.boundingBox(),
    target.boundingBox(),
  ])
  return {
    top: targetBounds!.y - surfaceBounds!.y,
    right:
      surfaceBounds!.x +
      surfaceBounds!.width -
      (targetBounds!.x + targetBounds!.width),
  }
}

async function bottomOpticalInset(surface: Locator, target: Locator) {
  const [surfaceBounds, targetBounds] = await Promise.all([
    surface.boundingBox(),
    target.boundingBox(),
  ])
  return (
    surfaceBounds!.y +
    surfaceBounds!.height -
    targetBounds!.y -
    targetBounds!.height
  )
}

async function verticalCenterOffset(container: Locator, target: Locator) {
  const [containerBounds, targetBounds] = await Promise.all([
    container.boundingBox(),
    target.boundingBox(),
  ])
  return Math.abs(
    containerBounds!.y +
      containerBounds!.height / 2 -
      targetBounds!.y -
      targetBounds!.height / 2
  )
}

async function expandedTargetsFitSurface(surface: Locator) {
  return surface.evaluate((node) => {
    const surfaceBounds = node.getBoundingClientRect()
    const range = node
      .querySelector('[data-testid="historical-range-scrollport"]')!
      .getBoundingClientRect()
    const action = node
      .querySelector('button[data-action-treatment="utility"]')!
      .getBoundingClientRect()
    return (
      range.top >= surfaceBounds.top &&
      range.bottom <= surfaceBounds.bottom &&
      action.top - 12 >= surfaceBounds.top &&
      action.bottom + 12 <= surfaceBounds.bottom
    )
  })
}

async function focusFitsScrollport(scrollport: Locator, item: Locator) {
  const [scrollportBounds, itemBounds] = await Promise.all([
    scrollport.boundingBox(),
    item.boundingBox(),
  ])
  return (
    itemBounds!.x - 4 >= scrollportBounds!.x &&
    itemBounds!.x + itemBounds!.width + 4 <=
      scrollportBounds!.x + scrollportBounds!.width &&
    itemBounds!.y - 4 >= scrollportBounds!.y &&
    itemBounds!.y + itemBounds!.height + 4 <=
      scrollportBounds!.y + scrollportBounds!.height
  )
}

async function visualActionsDoNotOverlap(scrollport: Locator, action: Locator) {
  const [scrollportBounds, actionBounds] = await Promise.all([
    scrollport.boundingBox(),
    action.boundingBox(),
  ])
  return scrollportBounds!.x + scrollportBounds!.width <= actionBounds!.x
}

async function expandedTargetsDoNotOverlap(
  scrollport: Locator,
  action: Locator
) {
  const [scrollportBounds, actionBounds] = await Promise.all([
    scrollport.boundingBox(),
    action.boundingBox(),
  ])
  const x =
    (scrollportBounds!.x + scrollportBounds!.width + actionBounds!.x) / 2
  const y = actionBounds!.y + actionBounds!.height / 2
  return scrollport.evaluate(
    (_, point) =>
      !document.elementFromPoint(point.x, point.y)?.closest('button'),
    { x, y }
  )
}

async function scrollToEndIfNeeded(scrollport: Locator) {
  return scrollport.evaluate((node) => {
    const overflow = Math.max(0, node.scrollWidth - node.clientWidth)
    node.scrollLeft = overflow
    return { overflow, scrollLeft: node.scrollLeft }
  })
}
