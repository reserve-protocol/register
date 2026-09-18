import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'

const FOUNDATION_IDS = [
  'color',
  'typography',
  'spacing',
  'radius',
  'layout',
  'elevation',
  'motion',
  'iconography',
  'accessibility',
] as const

const VIEWPORTS = [
  { name: 'phone-320', width: 320, height: 720 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'desktop-1400', width: 1400, height: 900 },
] as const

const evidencePhase = process.env.FOUNDATION_EVIDENCE_PHASE || 'working'
const evidenceDirectory = resolve(
  'test-results/design-system/foundations-documentation',
  evidencePhase
)

test.beforeAll(async () => {
  await mkdir(evidenceDirectory, { recursive: true })
})

test('renders a continuous result-first reference across the review matrix', async ({
  page,
}) => {
  for (const theme of ['light', 'dark'] as const) {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport)
      await page.goto('/internal/design-system/foundations')
      await page.evaluate((selectedTheme) => {
        localStorage.setItem('theme-ui-color-mode', selectedTheme)
      }, theme)
      await page.reload()

      const sections = page.getByTestId('foundation-reference-section')
      await expect(sections).toHaveCount(FOUNDATION_IDS.length)
      await expect(page.getByTestId('foundation-visual-overview')).toHaveCount(
        0
      )
      await expect(page.getByTestId('color-semantic-reference')).toBeVisible()
      await expect(page.getByTestId('typography-review-contexts')).toHaveCount(
        0
      )
      await expect(page.getByTestId('color-contrast-review')).toHaveCount(0)
      await expect(
        page.getByTestId('foundation-secondary-details').first()
      ).not.toHaveAttribute('open')
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true)

      if (viewport.width === 1400) {
        const displaySample = page.getByText('Build a durable portfolio')
        await displaySample.scrollIntoViewIfNeeded()
        expect((await displaySample.boundingBox())?.width).toBeGreaterThan(480)
      }

      await page.screenshot({
        path: resolve(
          evidenceDirectory,
          `foundations-${theme}-${viewport.name}.png`
        ),
      })

      if (viewport.width === 390 || viewport.width === 1400) {
        for (const foundationId of ['color', 'layout', 'elevation'] as const) {
          await page.locator(`#${foundationId}`).scrollIntoViewIfNeeded()
          await page.screenshot({
            path: resolve(
              evidenceDirectory,
              `${foundationId}-${theme}-${viewport.name}.png`
            ),
          })
        }
      }
    }
  }
})

test('preserves anchors, keyboard navigation, and direct detail routes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/foundations')

  const layoutLink = page
    .getByTestId('documentation-sidebar')
    .locator('a[href="/internal/design-system/foundations#layout"]')
  await layoutLink.focus()
  await expect(layoutLink).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/internal\/design-system\/foundations#layout$/)
  await expect(page.locator('#layout')).toBeInViewport()

  for (const foundationId of FOUNDATION_IDS) {
    await page.goto(`/internal/design-system/foundations/${foundationId}`)
    await expect(
      page.getByTestId(`foundation-detail-${foundationId}`)
    ).toBeVisible()
    await page.reload()
    await expect(
      page.getByTestId(`foundation-detail-${foundationId}`)
    ).toBeVisible()
  }
})
