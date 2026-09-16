import path from 'node:path'
import { expect, test } from './current-rebalance-helpers'

const evidence = path.resolve(
  'docs/plans/design-system-next-charts/optical-refinement/evidence'
)

test('next families coexist with the existing chart review', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('theme-ui-color-mode', 'dark')
  )
  await page.goto(
    '/internal/design-system/components/chart#chart-next-families-review'
  )
  const review = page.getByTestId('next-chart-families-review')
  await expect(review).toBeVisible()
  await expect(review.getByTestId('yield-price-pilot')).toBeVisible()
  await expect(review.getByTestId('next-portfolio-history')).toBeVisible()
  await expect(review.locator('.recharts-yAxis text')).not.toHaveCount(0)
  await expect(review.locator('.latest-point-marker circle')).toHaveCount(5)
  await expect(page.getByTestId('chart-type-line')).toBeVisible()
  await page.getByTestId('chart-type-candles').click()
  await expect(page.getByTestId('chart-type-candles')).toHaveAttribute(
    'aria-checked',
    'true'
  )
  await expect(review).toBeVisible()
  const controls = page.getByRole('group', {
    name: 'Preview viewport',
    exact: true,
  })
  await expect(controls).toBeVisible()
  await expect(controls.getByRole('radio')).toHaveCount(4)
  await controls.getByRole('radio', { name: '390px' }).click()
  const frame = page.getByTestId('next-families-mobile-preview-390')
  await expect(frame).toBeVisible()
  expect((await frame.boundingBox())!.width).toBe(390)
  await expect(review).toHaveCount(0)
  await expect(
    page
      .frameLocator('[data-testid="next-families-mobile-preview-390"]')
      .getByTestId('next-chart-families-review')
  ).toBeVisible()
  await expect(
    page
      .frameLocator('[data-testid="next-families-mobile-preview-390"]')
      .locator('html')
  ).toHaveClass(/dark/)
  await frame.screenshot({
    path: path.join(evidence, 'main-route-next-families-dark-390.png'),
    animations: 'disabled',
  })
  await controls.evaluate((node) => node.scrollIntoView({ block: 'center' }))
  await page.screenshot({
    path: path.join(evidence, 'main-route-controls-dark-390.png'),
    animations: 'disabled',
  })
  await controls.getByRole('radio', { name: '320px' }).click()
  await expect(frame).toHaveCount(0)
  const narrowFrame = page.getByTestId('next-families-mobile-preview-320')
  await expect(narrowFrame).toBeVisible()
  expect((await narrowFrame.boundingBox())!.width).toBe(320)
  await expect(
    page
      .frameLocator('[data-testid="next-families-mobile-preview-320"]')
      .locator('iframe')
  ).toHaveCount(0)
  await narrowFrame.screenshot({
    path: path.join(evidence, 'main-route-next-families-dark-320.png'),
    animations: 'disabled',
  })
  await controls.evaluate((node) => node.scrollIntoView({ block: 'center' }))
  await page.screenshot({
    path: path.join(evidence, 'main-route-controls-dark-320.png'),
    animations: 'disabled',
  })
  await controls.getByRole('radio', { name: 'Narrow', exact: true }).click()
  await expect(page.getByTestId('next-families-preview-narrow')).toBeVisible()
  await expect(review).toBeVisible()
  await expect(narrowFrame).toHaveCount(0)
  await controls.getByRole('radio', { name: 'Normal', exact: true }).click()
  await expect(page.getByTestId('next-families-preview-normal')).toBeVisible()
  await expect(
    page.locator(
      '[data-testid="chart-overview-source"], [data-testid="chart-candlestick-source"]'
    )
  ).toHaveCount(1)
  await expect(page.getByTestId('chart-type-candles')).toHaveAttribute(
    'aria-checked',
    'true'
  )
  await controls.evaluate((node) => node.scrollIntoView({ block: 'center' }))
  await page.screenshot({
    path: path.join(evidence, 'main-route-next-families-dark.png'),
    animations: 'disabled',
  })
})
