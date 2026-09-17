import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const PATTERNS = [
  'charts',
  'tables',
  'forms',
  'navigation',
  'transactions',
] as const

const VIEWPORTS = [
  { name: 'phone-320', width: 320, height: 720 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'desktop-1400', width: 1400, height: 900 },
] as const

const evidencePhase = process.env.PATTERN_EVIDENCE_PHASE || 'working'
const evidenceDirectory = resolve(
  'docs/plans/design-system-documentation-patterns-accelerated/evidence',
  evidencePhase
)

const settleDocumentationLayout = async (page: Page) => {
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise<void>((resolveFrame) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolveFrame()))
    })
  })
}

test.beforeAll(async () => {
  await mkdir(evidenceDirectory, { recursive: true })
})

test('renders the continuous Patterns reference across the review matrix', async ({
  page,
}) => {
  for (const theme of ['light', 'dark'] as const) {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport)
      await page.goto('/internal/design-system/patterns')
      await page.evaluate((selectedTheme) => {
        localStorage.setItem('theme-ui-color-mode', selectedTheme)
      }, theme)
      await page.reload()

      await expect(page.getByTestId('pattern-reference-section')).toHaveCount(
        PATTERNS.length
      )
      await expect(page.getByTestId('pattern-rich-reference')).toHaveCount(3)
      await expect(page.getByTestId('pattern-specimen-canvas')).toHaveCount(1)
      await expect(
        page.getByTestId('documentation-pattern-charts')
      ).toHaveCount(1)
      await expect(
        page.getByTestId('documentation-pattern-tables')
      ).toHaveCount(1)
      await expect(
        page.getByTestId('navigation-pattern-documentation')
      ).toHaveCount(1)
      await expect(
        page.getByTestId('chart-overview-documentation')
      ).toBeVisible()
      await expect(page.getByTestId('current-rebalances-table')).toBeVisible()
      await expect(page.getByTestId('navigation-global-desktop')).toBeVisible()
      await expect(page.getByTestId('pattern-no-specimen')).toHaveCount(1)
      await expect(page.getByTestId('preset-or-custom-field')).toBeVisible()
      await expect(page.locator('#transactions')).toContainText('Exploring')
      await expect(page.locator('#transactions')).toContainText('Paused')
      await expect(page.getByTestId('transaction-system-review')).toHaveCount(0)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true)

      await page.screenshot({
        path: resolve(
          evidenceDirectory,
          `patterns-${theme}-${viewport.name}.png`
        ),
      })

      if (viewport.width === 390 || viewport.width === 1400) {
        for (const pattern of PATTERNS) {
          await page.locator(`#${pattern}`).scrollIntoViewIfNeeded()
          await page.screenshot({
            path: resolve(
              evidenceDirectory,
              `${pattern}-${theme}-${viewport.name}.png`
            ),
          })
        }
      }
    }
  }
})

test('preserves anchors, aliases, and exact Workbench and Records depth', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/patterns')

  for (const pattern of PATTERNS) {
    const link = page
      .getByRole('navigation', { name: 'Pattern families' })
      .getByRole('link', { name: patternName(pattern), exact: true })
    await link.focus()
    await expect(link).toBeFocused()
    await link.press('Enter')
    await expect(page).toHaveURL(
      new RegExp(`/internal/design-system/patterns#${pattern}$`)
    )
    await expect(page.locator(`#${pattern}`)).toBeInViewport()
    await page.reload()
    await expect(page.locator(`#${pattern}`)).toBeInViewport()
  }

  for (const pattern of PATTERNS) {
    await page.goto(`/internal/design-system/workbench#pattern-${pattern}`)
    await expect(page.locator(`#pattern-${pattern}`)).toBeInViewport()
    await page.reload()
    await expect(page.locator(`#pattern-${pattern}`)).toBeInViewport()

    await page.goto(`/internal/design-system/records#pattern-${pattern}`)
    await expect(page.locator(`#pattern-${pattern}`)).toBeInViewport()
    await page.reload()
    await expect(page.locator(`#pattern-${pattern}`)).toBeInViewport()
  }

  const aliases = [
    ['charts', 'chart'],
    ['tables', 'table'],
    ['forms', 'input'],
    ['navigation', 'product-navigation'],
    ['transactions', 'transaction-action'],
  ] as const
  for (const [alias, component] of aliases) {
    await page.goto(`/internal/design-system/patterns/${alias}`)
    await expect(page).toHaveURL(
      new RegExp(`/internal/design-system/components/${component}$`)
    )
    await expect(
      page.getByTestId(`component-detail-${component}`)
    ).toBeVisible()
  }
})

test('keeps formerly unstable pattern anchors through repeated direct loads and reloads', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })

  for (const anchor of [
    'navigation-product',
    'forms',
    'tables-portfolio',
  ] as const) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await page.goto(`/internal/design-system/patterns#${anchor}`)
      await settleDocumentationLayout(page)
      await expect(page).toHaveURL(
        new RegExp(`/internal/design-system/patterns#${anchor}$`)
      )
      await expect(page.locator(`#${anchor}`)).toBeInViewport()

      await page.reload()
      await settleDocumentationLayout(page)
      await expect(page).toHaveURL(
        new RegExp(`/internal/design-system/patterns#${anchor}$`)
      )
      await expect(page.locator(`#${anchor}`)).toBeInViewport()
    }
  }
})

const patternName = (pattern: (typeof PATTERNS)[number]) =>
  ({
    charts: 'Charts',
    tables: 'Tables and records',
    forms: 'Forms',
    navigation: 'Navigation systems',
    transactions: 'Transactions',
  })[pattern]
