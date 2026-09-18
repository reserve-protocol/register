import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test, type Page } from '@playwright/test'

import {
  COMPONENT_GROUPS,
  COMPONENT_ITEMS,
} from '../../src/views/internal/design-system/component-catalog'

const VIEWPORTS = [
  { name: 'phone-320', width: 320, height: 720 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'desktop-1400', width: 1400, height: 900 },
] as const

const evidencePhase = process.env.COMPONENT_EVIDENCE_PHASE || 'working'
const evidenceDirectory = resolve(
  'docs/plans/design-system-documentation-components-accelerated/evidence',
  evidencePhase
)
const pilotPhase = process.env.SPECIMEN_PILOT_PHASE
const pilotEvidenceDirectory = resolve(
  'docs/plans/design-system-documentation-complete-pass/evidence/pilot'
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
  if (pilotPhase) await mkdir(pilotEvidenceDirectory, { recursive: true })
})

test('captures the Select and no-control pilot surfaces', async ({ page }) => {
  test.skip(!pilotPhase, 'Pilot capture requires SPECIMEN_PILOT_PHASE')

  for (const specimen of ['select', 'metric'] as const) {
    for (const capture of [
      { name: 'desktop-light', width: 1400, height: 900, theme: 'light' },
      { name: 'phone-dark', width: 390, height: 844, theme: 'dark' },
    ] as const) {
      await page.setViewportSize(capture)
      await page.goto(`/internal/design-system/components#${specimen}`)
      await page.evaluate((theme) => {
        localStorage.setItem('theme-ui-color-mode', theme)
      }, capture.theme)
      await page.reload()
      await expect(page.locator(`#${specimen}`)).toBeInViewport()

      await page.locator(`#${specimen}`).screenshot({
        path: resolve(
          pilotEvidenceDirectory,
          `${pilotPhase}-${specimen}-${capture.name}.png`
        ),
      })
    }
  }

  if (pilotPhase === 'final-render') {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/internal/design-system/components#select')

    const selectSection = page.locator('#select')
    const controls = selectSection.locator('[data-specimen-control-bar]')
    const host = selectSection.locator('[data-host-context]')
    const specimen = selectSection.locator('[data-specimen-boundary]')

    await expect(controls.locator('[data-specimen-control-slot]')).toHaveCount(
      3
    )
    await expect(
      controls.locator('[data-specimen-control-slot="size"]')
    ).toContainText('Size')
    await expect(host.locator('[data-specimen-boundary]')).toHaveCount(1)
    await expect(specimen.locator('[data-size="default"]')).toBeEnabled()

    const initialScrollY = await page.evaluate(() => window.scrollY)
    await selectSection.getByRole('radio', { name: 'Compact' }).click()
    await selectSection.getByRole('radio', { name: 'Unavailable' }).click()

    await expect(page).toHaveURL(/select\.family=compact/)
    await expect(page).toHaveURL(/select\.state=disabled/)
    await expect(page).toHaveURL(/#select$/)
    await expect(specimen.locator('[data-size="compact"]')).toBeDisabled()
    await expect(
      controls.locator('[data-specimen-control-slot="link"]')
    ).toHaveCount(0)
    expect(
      Math.abs((await page.evaluate(() => window.scrollY)) - initialScrollY)
    ).toBeLessThanOrEqual(1)

    await selectSection.getByRole('button', { name: 'Reset Select' }).click()
    await expect(page).toHaveURL(
      /\/internal\/design-system\/components#select$/
    )

    const metricSection = page.locator('#metric')
    await metricSection.scrollIntoViewIfNeeded()
    await expect(
      metricSection.locator('[data-specimen-control-bar]')
    ).toHaveCount(0)
    await expect(
      metricSection.locator(
        '[data-specimen-boundary] [data-testid="canonical-metric"]'
      )
    ).toHaveCount(2)
  }
})

test('keeps a direct component anchor through reload and continuous-reference scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components#select')
  await expect(page).toHaveURL(/\/internal\/design-system\/components#select$/)
  await expect(page.locator('#select')).toBeInViewport()

  await page.reload()
  await expect(page).toHaveURL(/\/internal\/design-system\/components#select$/)
  await expect(page.locator('#select')).toBeInViewport()

  const selectSection = page.locator('#select')
  await expect(selectSection.getByText('Placeholder')).toBeVisible()
  await expect(selectSection.getByText('Compact utility')).toBeVisible()
  await expect(selectSection.getByText('Unavailable')).toBeVisible()
  await expect(page).toHaveURL(/#select$/)

  const scroller = page.locator('#app-container')
  await scroller.evaluate((node) => {
    node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    const target = document.getElementById('multi-select-filter')
    if (!target) throw new Error('Missing multi-select filter section')
    node.scrollTo({ top: target.offsetTop })
  })
  await expect(page).toHaveURL(/#multi-select-filter$/)
})

test('keeps formerly unstable component anchors through repeated direct loads and reloads', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })

  for (const anchor of ['tabs', 'select', 'badge', 'accordion'] as const) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await page.goto(`/internal/design-system/components#${anchor}`)
      await settleDocumentationLayout(page)
      await expect(page).toHaveURL(
        new RegExp(`/internal/design-system/components#${anchor}$`)
      )
      await expect(page.locator(`#${anchor}`)).toBeInViewport()

      await page.reload()
      await settleDocumentationLayout(page)
      await expect(page).toHaveURL(
        new RegExp(`/internal/design-system/components#${anchor}$`)
      )
      await expect(page.locator(`#${anchor}`)).toBeInViewport()
    }
  }
})

test('routes complex component results directly to their documentation destination', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })

  for (const destination of [
    {
      componentId: 'chart',
      route: '/internal/design-system/patterns#charts',
      targetId: 'charts',
    },
    {
      componentId: 'table',
      route: '/internal/design-system/patterns#tables',
      targetId: 'tables',
    },
    {
      componentId: 'global-navigation',
      route: '/internal/design-system/patterns#navigation-global',
      targetId: 'navigation-global',
    },
    {
      componentId: 'product-navigation',
      route: '/internal/design-system/patterns#navigation-product',
      targetId: 'navigation-product',
    },
    {
      componentId: 'transaction-action',
      route: '/internal/design-system/patterns#transactions',
      targetId: 'transactions',
    },
  ] as const) {
    await page.goto(
      `/internal/design-system/components#${destination.componentId}`
    )
    const link = page.getByTestId(
      `component-overview-${destination.componentId}`
    )
    await expect(link).toHaveAttribute('href', destination.route)
    await link.click()
    await settleDocumentationLayout(page)
    await expect(page).toHaveURL(new RegExp(`${destination.route}$`))
    await expect(page.locator(`#${destination.targetId}`)).toBeInViewport()
  }
})

test('renders the complete continuous component reference across the review matrix', async ({
  page,
}) => {
  for (const theme of ['light', 'dark'] as const) {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport)
      await page.goto('/internal/design-system/components')
      await page.evaluate((selectedTheme) => {
        localStorage.setItem('theme-ui-color-mode', selectedTheme)
      }, theme)
      await page.reload()

      await expect(page.getByTestId('component-reference-section')).toHaveCount(
        COMPONENT_ITEMS.length
      )
      await expect(page.getByTestId('component-group-section')).toHaveCount(
        COMPONENT_GROUPS.length
      )
      await expect(page.getByTestId('component-overview-output')).toHaveCount(
        29
      )
      await expect(page.getByTestId('component-specimen-set')).toHaveCount(29)
      await expect(page.locator('#input')).toContainText('Focus visible')
      await expect(page.locator('#search')).toContainText('No results')
      await expect(page.locator('#search')).toContainText('No matching tokens')
      await expect(page.locator('#checkbox')).toContainText('Focus visible')
      await expect(page.locator('#switch')).toContainText('Focus visible')
      await expect(
        page.locator(
          '[data-testid="component-reference-section"] > div > header [data-documentation-status]'
        )
      ).toHaveCount(45)
      await expect(page.getByTestId('component-isolation-slot')).toHaveCount(0)
      await expect(page.getByTestId('component-pattern-slot')).toHaveCount(4)
      await expect(
        page.locator('#copy-value [data-copyable-value-treatment="default"]')
      ).toHaveCount(1)
      await expect(
        page.locator('#copy-value [data-copyable-value-treatment="inline"]')
      ).toHaveCount(2)
      for (const id of [
        'table',
        'chart',
        'global-navigation',
        'product-navigation',
      ]) {
        await expect(
          page.locator(`#${id}`).getByTestId('component-pattern-slot')
        ).toHaveCount(1)
      }
      await expect(
        page
          .locator('#transaction-action')
          .getByTestId('component-exploring-treatment')
      ).toHaveCount(1)
      await expect(page.locator('#combobox')).toContainText(
        'No generic component is planned for the current system'
      )
      await expect(page.getByTestId('component-card-reference')).toHaveCount(1)
      await expect(
        page.getByTestId('component-exploring-treatment')
      ).toHaveCount(6)
      await expect(
        page.getByTestId('component-undefined-treatment')
      ).toHaveCount(5)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true)

      await page.screenshot({
        path: resolve(
          evidenceDirectory,
          `components-${theme}-${viewport.name}.png`
        ),
        fullPage: true,
      })

      if (viewport.width === 390 || viewport.width === 1400) {
        for (const group of COMPONENT_GROUPS) {
          await page.locator(`#${group.id}`).scrollIntoViewIfNeeded()
          await page.screenshot({
            path: resolve(
              evidenceDirectory,
              `${group.id}-${theme}-${viewport.name}.png`
            ),
          })
        }
      }
    }
  }
})

test('preserves anchors, detail routes, and representative owner interactions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components')

  const canonicalOverview = page.getByTestId('canonical-component-overview')
  await expect(canonicalOverview).not.toContainText('Code ·')
  await expect(canonicalOverview).not.toContainText('Production ·')
  const buttonReference = page.locator('#button')
  await expect(buttonReference.locator('[data-tone]')).toHaveCount(15)
  for (const size of ['micro', 'compact', 'default']) {
    await expect(
      buttonReference.locator(`[data-size="${size}"]`).first()
    ).toBeVisible()
  }
  await expect(buttonReference.locator('[aria-busy="true"]')).toBeVisible()
  await expect(buttonReference.locator('button:disabled')).toHaveCount(2)

  for (const group of COMPONENT_GROUPS) {
    const groupLink = page
      .getByRole('navigation', { name: 'Design system documentation' })
      .locator(`a[href="/internal/design-system/components#${group.id}"]`)
    await groupLink.focus()
    await expect(groupLink).toBeFocused()
    await groupLink.press('Enter')
    await expect(page).toHaveURL(
      new RegExp(`/internal/design-system/components#${group.id}$`)
    )
    await expect(page.locator(`#${group.id}`)).toBeInViewport()
    await page.reload()
    await expect(page).toHaveURL(
      new RegExp(`/internal/design-system/components#${group.id}$`)
    )
    await expect(page.locator(`#${group.id}`)).toBeInViewport()
  }

  const checkbox = page.getByLabel('Include archived')
  await checkbox.scrollIntoViewIfNeeded()
  await checkbox.focus()
  await expect(checkbox).toBeFocused()
  await checkbox.press('Space')
  await expect(checkbox).not.toBeChecked()

  const activeSegment = page.getByTestId(
    'segmented-control-text-only-compact-active'
  )
  await activeSegment.scrollIntoViewIfNeeded()
  await activeSegment.focus()
  await expect(activeSegment).toBeFocused()
  await activeSegment.press('Space')
  await expect(activeSegment).toHaveAttribute('data-state', 'on')

  const accordion = page.getByRole('button', { name: 'What is staking?' })
  await accordion.scrollIntoViewIfNeeded()
  await accordion.focus()
  await expect(accordion).toBeFocused()
  await expect(accordion).toHaveAttribute('aria-expanded', 'true')
  await accordion.click()
  await expect(accordion).toHaveAttribute('aria-expanded', 'false')
  await accordion.click()
  await expect(accordion).toHaveAttribute('aria-expanded', 'true')

  for (const componentId of ['button', 'dialog', 'chart'] as const) {
    await page.goto(`/internal/design-system/components/${componentId}`)
    await expect(
      page.getByTestId(`component-detail-${componentId}`)
    ).toBeVisible()
    await page.reload()
    await expect(
      page.getByTestId(`component-detail-${componentId}`)
    ).toBeVisible()
  }
})
