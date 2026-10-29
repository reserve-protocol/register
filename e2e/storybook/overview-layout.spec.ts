import { expect, test } from '@playwright/test'

const proposalUrl = (args: string, theme = 'light') =>
  `/iframe.html?id=explorations-screen-layouts-index-dtf-overview--playground&viewMode=story&globals=theme:${theme}&args=${args}`

test('overview proposal controls change the adjacent diagram in Docs', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=explorations-screen-layouts-index-dtf-overview--docs&viewMode=docs'
  )
  const viewportControl = page.getByRole('combobox', {
    name: 'viewport',
    exact: true,
  })
  await expect(viewportControl).toBeVisible()
  const controls = (await page.getByRole('table').boundingBox())!
  const preview = (await page
    .getByTestId('overview-layout-review-frame')
    .boundingBox())!
  expect(controls.y + controls.height).toBeLessThanOrEqual(preview.y)
  await viewportControl.selectOption('1280')
  await expect(page.getByTestId('overview-layout-support')).toHaveCount(0)
  await expect(
    page.getByTestId('overview-layout-bottom-controls')
  ).toBeVisible()
  await viewportControl.selectOption('390')
  await expect(page.getByTestId('overview-layout-navigation')).toHaveCount(0)
  await expect(
    page.getByText('Expanded desktop navigation', { exact: true })
  ).toHaveCount(0)
})

test('overview proposal protects primary width and keeps structural seams consistent', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto(proposalUrl('viewport:1440'))
  const primary = page.getByTestId('overview-layout-primary')
  const support = page.getByTestId('overview-layout-support')
  await expect(support).toBeVisible()
  const originalPrimary = (await primary.boundingBox())!
  const supportBounds = (await support.boundingBox())!
  expect(originalPrimary.width).toBe(836)
  expect(supportBounds.width).toBe(480)
  expect(supportBounds.x - originalPrimary.x - originalPrimary.width).toBe(2)

  const performance = primary.getByRole('region', {
    name: 'Performance',
    exact: true,
  })
  const holdings = primary.getByRole('region', {
    name: 'Holdings',
    exact: true,
  })
  const performanceBounds = (await performance.boundingBox())!
  const holdingsBounds = (await holdings.boundingBox())!
  expect(
    holdingsBounds.y - performanceBounds.y - performanceBounds.height
  ).toBe(2)
  await page.screenshot({
    path: 'test-results/overview-layout-desktop.png',
    fullPage: true,
  })

  await page.goto(proposalUrl('viewport:1440;expandedNavigation:true'))
  await expect(
    page.getByTestId('overview-layout-expanded-navigation')
  ).toBeVisible()
  expect(
    (await page
      .getByTestId('overview-layout-expanded-navigation')
      .boundingBox())!.width
  ).toBe(256)
  expect((await primary.boundingBox())!.width).toBe(originalPrimary.width)

  await page.goto(proposalUrl('viewport:1372'))
  await expect(support).toBeVisible()
  expect((await primary.boundingBox())!.width).toBe(768)
  await page.goto(proposalUrl('viewport:1371'))
  await expect(support).toHaveCount(0)
  expect((await primary.boundingBox())!.width).toBeGreaterThan(768)
  await expect(
    page.getByTestId('overview-layout-bottom-controls')
  ).toBeVisible()

  await page.goto(proposalUrl('viewport:1280;gutter:0;supportWidth:432'))
  await expect(support).toBeVisible()
  expect((await support.boundingBox())!.width).toBe(432)
  expect((await primary.boundingBox())!.width).toBe(772)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(proposalUrl('viewport:390;about:text;cover:false', 'dark'))
  await expect(support).toHaveCount(0)
  await expect(page.getByTestId('overview-layout-navigation')).toHaveCount(0)
  await expect(
    page.getByRole('region', { name: 'Cover', exact: true })
  ).toHaveCount(0)
  const phoneHoldings = (await holdings.boundingBox())!
  const about = primary.getByRole('region', {
    name: 'About this DTF',
    exact: true,
  })
  expect((await about.boundingBox())!.y).toBeGreaterThan(phoneHoldings.y)
  const noPageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth
  )
  expect(noPageOverflow).toBe(true)
  await page.screenshot({
    path: 'test-results/overview-layout-phone.png',
    fullPage: true,
  })

  await page.goto(proposalUrl('viewport:390;about:video'))
  await expect(about).toBeVisible()
  expect((await about.boundingBox())!.y).toBeLessThan(
    (await holdings.boundingBox())!.y
  )
  const phoneRegionOrder = await primary
    .getByRole('heading', { level: 3 })
    .allTextContents()
  expect(phoneRegionOrder.slice(0, 6)).toEqual([
    'Performance',
    'About this DTF',
    'Holdings',
    'Ask Reserve AI',
    'About Reserve',
    'Fees and statistics',
  ])
  const phoneFrame = page.getByTestId('overview-layout-review-frame')
  expect(
    await phoneFrame.evaluate((frame) => frame.scrollWidth <= frame.clientWidth)
  ).toBe(true)
})
