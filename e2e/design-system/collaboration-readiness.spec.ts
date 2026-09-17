import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const evidenceDirectory = resolve(
  'docs/plans/design-system-documentation-collaboration-readiness/evidence/final'
)

test.beforeAll(async () => {
  await mkdir(evidenceDirectory, { recursive: true })
})

const search = async (page: Page, query: string) => {
  const input = page.getByRole('combobox', { name: 'Search design system' })
  await input.fill(query)
  return page.getByRole('option').first()
}

const expectMobileAnchorContext = async (page: Page, path: string) => {
  await page.goto(path)
  await expect(page.locator(path.slice(path.indexOf('#')))).toBeVisible()
  await expect
    .poll(async () => {
      const header = await page
        .locator('[data-documentation-mobile-header]')
        .boundingBox()
      const target = await page
        .locator(path.slice(path.indexOf('#')))
        .boundingBox()
      return header && target ? target.y - (header.y + header.height) : -1
    })
    .toBeGreaterThanOrEqual(12)
  await page.reload()
  await expect
    .poll(async () => {
      const header = await page
        .locator('[data-documentation-mobile-header]')
        .boundingBox()
      const target = await page
        .locator(path.slice(path.indexOf('#')))
        .boundingBox()
      return header && target ? target.y - (header.y + header.height) : -1
    })
    .toBeGreaterThanOrEqual(12)
}

test('routes sidebar and exact search results to canonical overview anchors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system')

  await expect(
    page
      .getByTestId('documentation-sidebar')
      .locator('a[href="/internal/design-system/foundations#color"]')
  ).toHaveCount(1)

  let result = await search(page, 'Select')
  await expect(result).toContainText('Select')
  await result.click()
  await expect(page).toHaveURL(/\/internal\/design-system\/components#select$/)
  await expect(page.locator('#select')).toBeInViewport()
  await page.locator('#app-container').evaluate((element) => {
    element.scrollTo({ top: element.scrollHeight })
  })
  await expect(page.locator('#select')).not.toBeInViewport()
  result = await search(page, 'Select')
  await result.click()
  await expect(page.locator('#select')).toBeInViewport()

  await page.goto('/internal/design-system')
  result = await search(page, 'Chart')
  await result.click()
  await expect(page).toHaveURL(/\/internal\/design-system\/patterns#charts$/)
  await expect(page.locator('#charts')).toBeInViewport()

  await page.goto('/internal/design-system')
  result = await search(page, 'Table')
  await result.click()
  await expect(page).toHaveURL(/\/internal\/design-system\/patterns#tables$/)

  await page.goto('/internal/design-system')
  result = await search(page, 'Form')
  await result.click()
  await expect(page).toHaveURL(/\/internal\/design-system\/patterns#forms$/)

  await page.goto('/internal/design-system')
  result = await search(page, 'Navigation')
  await result.click()
  await expect(page).toHaveURL(
    /\/internal\/design-system\/patterns#navigation$/
  )

  await page.evaluate(() => {
    localStorage.setItem('register.locale', JSON.stringify('es'))
  })
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await page.locator('#design-system-search-desktop').fill('Tabla')
  await page.getByRole('option').first().click()
  await expect(page).toHaveURL(/\/internal\/design-system\/patterns#tables$/)
})

test('keeps anchored context visible and puts component results first on phones', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await expectMobileAnchorContext(
    page,
    '/internal/design-system/components#actions'
  )
  await expectMobileAnchorContext(
    page,
    '/internal/design-system/components#feedback'
  )
  await expectMobileAnchorContext(
    page,
    '/internal/design-system/patterns#charts'
  )

  await page.goto('/internal/design-system/components#button')
  const button = page.locator('#button')
  const specimen = button.getByTestId('component-overview-output')
  const metadata = button.getByTestId('component-overview-metadata')
  const details = button.getByTestId('component-overview-button')
  await expect(specimen).toBeVisible()
  expect((await specimen.boundingBox())!.y).toBeLessThan(
    (await metadata.boundingBox())!.y
  )
  expect((await specimen.boundingBox())!.y).toBeLessThan(
    (await details.boundingBox())!.y
  )

  await page.screenshot({
    path: resolve(evidenceDirectory, 'components-button-mobile.png'),
  })
  await page.evaluate(() => {
    localStorage.setItem('theme-ui-color-mode', 'dark')
  })
  await page.reload()
  await page.screenshot({
    path: resolve(evidenceDirectory, 'components-button-dark-mobile.png'),
  })
  await page.goto('/internal/design-system/patterns#charts')
  await page.screenshot({
    path: resolve(evidenceDirectory, 'patterns-charts-dark-mobile.png'),
  })
})

test('describes standalone Workbench, Studies, and Records truthfully', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/workbench')
  await expect(page.getByText('Open review surface')).toHaveCount(0)
  await expect(page.getByText('Open catalog summary')).toHaveCount(5)
  await expect(
    page.getByText('Integrated review surface unavailable here')
  ).toHaveCount(4)
  await page.screenshot({
    path: resolve(evidenceDirectory, 'workbench-desktop.png'),
  })
  await page.locator('#tools a[href="/internal/design-system/screens"]').click()
  await expect(page).toHaveURL(/\/internal\/design-system\/screens$/)
  await expect(
    page.getByText(
      /Product-context routes are available only in the integrated lab/
    )
  ).not.toHaveCount(0)
  await expect(
    page.getByTestId('screens-overview').locator('section a')
  ).toHaveCount(0)

  await page.goto('/internal/design-system/studies')
  await expect(page.getByTestId('studies-mixed-status-warning')).toContainText(
    'mixes active studies with retained or superseded material'
  )
  await expect(
    page.getByRole('link', { name: 'Return to canonical Foundations guidance' })
  ).toHaveAttribute('href', '/internal/design-system/foundations')
  await page.screenshot({
    path: resolve(evidenceDirectory, 'studies-desktop.png'),
  })

  await page.goto('/internal/design-system/records')
  await expect(page.getByTestId('internal-records-overview')).toContainText(
    'catalog and summary projection'
  )
  await page.screenshot({
    path: resolve(evidenceDirectory, 'records-desktop.png'),
  })
  await page.evaluate(() => {
    localStorage.setItem('theme-ui-color-mode', 'dark')
  })
  await page.reload()
  await page.screenshot({
    path: resolve(evidenceDirectory, 'records-dark-desktop.png'),
  })
})

test('returns supporting detail pages to their canonical overview result', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/internal/design-system/components/icon-button')
  const returnToComponent = page.getByRole('link', {
    name: 'All components',
  })
  await expect(returnToComponent).toHaveAttribute(
    'href',
    '/internal/design-system/components#icon-button'
  )
  await returnToComponent.scrollIntoViewIfNeeded()
  await page.screenshot({
    path: resolve(evidenceDirectory, 'icon-button-detail-mobile.png'),
  })
  await returnToComponent.click()
  await expect(page.locator('#icon-button')).toBeInViewport()

  await page.goto('/internal/design-system/foundations/color')
  await expect(
    page.getByTestId('foundation-supporting-detail-warning')
  ).toContainText('retained comparisons, studies, and historical evidence')
  await expect(page.getByTestId('foundation-canonical-return')).toHaveAttribute(
    'href',
    '/internal/design-system/foundations#color'
  )
})
