import { expect, test } from '../fixtures/base'

const THEMES = ['light', 'dark'] as const
const SURFACES = [
  {
    id: 'foundations-overview',
    path: '/internal/design-system/foundations',
  },
  {
    id: 'foundation-detail-color',
    path: '/internal/design-system/foundations/color',
  },
  {
    id: 'foundation-detail-typography',
    path: '/internal/design-system/foundations/typography',
  },
  {
    id: 'components-overview',
    path: '/internal/design-system/components',
  },
  {
    id: 'component-detail-tabs',
    path: '/internal/design-system/components/tabs',
  },
  {
    id: 'component-detail-button',
    path: '/internal/design-system/components/button',
  },
  {
    id: 'screens-overview',
    path: '/internal/design-system/screens',
  },
  {
    id: 'project-status-page',
    path: '/internal/design-system/status',
  },
] as const

test.describe('design system lab', () => {
  test('routes through expected and available capability states', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme-ui-color-mode', 'light')
    })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/internal/design-system', {
      waitUntil: 'domcontentloaded',
    })
    await expect(page).toHaveURL(/\/internal\/design-system\/foundations$/)
    await expect(page.getByTestId('design-system-nav-screens')).toBeInViewport()
    await expect(page.getByTestId('design-system-nav-status')).toBeInViewport()

    await page.getByTestId('design-system-nav-screens').click()
    await expect(
      page.getByTestId('screens-overview').locator('a[href="/internal/deploy"]')
    ).toBeVisible()

    await page.goto('/internal/design-system/foundations/typography')
    await expect(
      page.getByTestId('foundation-candidate-typography')
    ).toBeVisible()
    await expect(page.getByText('Provisional', { exact: true })).toBeVisible()

    await page.goto('/internal/design-system/foundations/color')
    const colorDetail = page.getByTestId('foundation-detail-color')
    await expect(colorDetail.getByText('110 uses')).toBeVisible()
    await expect(colorDetail.getByText('Grouping surface')).toBeVisible()
    await expect(colorDetail.getByText('Performance positive')).toBeVisible()
    await expect(
      colorDetail.getByText('Current performance implementation')
    ).toBeVisible()
    await expect(
      colorDetail.getByText('Smaller V1 performance candidate')
    ).toBeVisible()
    await expect(
      colorDetail.getByText('--data-positive', { exact: true })
    ).toBeVisible()
    await expect(
      colorDetail.getByText(/do not yet pass normal-text contrast/)
    ).toBeVisible()

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
            document.documentElement.clientWidth &&
          document.body.scrollWidth <= document.body.clientWidth
      )
    ).toBe(true)

    const statusHeaders = colorDetail.getByRole('columnheader', {
      name: 'Status',
    })
    await expect(statusHeaders).toHaveCount(3)
    for (const statusHeader of await statusHeaders.all()) {
      await statusHeader.scrollIntoViewIfNeeded()
      await expect(statusHeader).toBeVisible()
    }

    await page.getByTestId('design-system-nav-components').click()
    const componentCatalog = page.getByTestId('components-overview')
    await expect(componentCatalog).toBeVisible()
    const productComponentBoard = page.getByTestId('product-component-board')
    await expect(productComponentBoard).toBeVisible()
    await expect(
      productComponentBoard.getByText('Information rows')
    ).toBeVisible()
    await expect(productComponentBoard.getByText('Metric roles')).toBeVisible()
    await expect(
      productComponentBoard.getByRole('heading', {
        name: 'Index navigation',
        level: 3,
      })
    ).toBeVisible()
    await expect(
      productComponentBoard.getByText('Identity marks')
    ).toBeVisible()
    await expect(
      productComponentBoard.getByTestId('canonical-entity-identity').first()
    ).toBeVisible()
    await expect(
      productComponentBoard.getByTestId('canonical-chain-badged-logo')
    ).toBeVisible()
    await expect(
      productComponentBoard.getByTestId('canonical-token-logo-stack')
    ).toBeVisible()
    await page.goto('/internal/design-system/components/entity-identity')
    await expect(page.getByTestId('entity-identity-state-sheet')).toBeVisible()
    const chainBadges = page.getByTestId('canonical-chain-badge')
    await expect(chainBadges.first()).toHaveCSS('width', '16px')
    await expect(chainBadges.first()).toHaveCSS('height', '16px')
    await expect(chainBadges.nth(1)).toHaveCSS('width', '14px')
    await expect(chainBadges.nth(1)).toHaveCSS('height', '14px')
    await expect(page.getByTestId('canonical-entity-identity')).toHaveCount(5)
    await expect(page.getByTestId('component-output-missing')).toHaveCount(0)
    await page.goto('/internal/design-system/components/metric')
    await expect(page.getByTestId('metric-state-sheet')).toBeVisible()
    await expect(page.getByTestId('canonical-metric')).toHaveCount(7)
    await expect(page.getByTestId('component-output-missing')).toHaveCount(0)
    await page.goto('/internal/design-system/components/table')
    await expect(page.getByTestId('information-row-state-sheet')).toBeVisible()
    await expect(page.getByTestId('canonical-index-data-slice')).toBeVisible()
    await expect(page.getByTestId('canonical-entity-identity')).toHaveCount(3)
    await expect(page.getByTestId('canonical-metric-value')).toHaveCount(9)
    await expect(page.getByTestId('component-output-missing')).toHaveCount(0)
    await page.goto('/internal/design-system/components/empty-state')
    await expect(page.getByTestId('empty-state-state-sheet')).toBeVisible()
    await expect(page.getByTestId('canonical-empty-state')).toHaveCount(2)
    await expect(page.getByTestId('component-output-missing')).toHaveCount(0)
    await page.goto('/internal/design-system/components')
    const coreComponentBoard = page.getByTestId('core-component-board')
    await expect(coreComponentBoard).toBeVisible()
    const coreControlScale =
      coreComponentBoard.getByTestId('core-control-scale')
    await expect(
      coreControlScale.getByText('Micro', { exact: true })
    ).toBeVisible()
    await expect(
      coreControlScale.getByText('Compact', { exact: true })
    ).toBeVisible()
    await expect(
      coreControlScale.getByText('Default', { exact: true })
    ).toBeVisible()
    await expect(
      coreComponentBoard.getByText('Selection', { exact: true })
    ).toBeVisible()
    await expect(
      coreComponentBoard.getByText('Selected + focus', { exact: true })
    ).toBeVisible()
    await expect(
      coreComponentBoard.getByText('Selected + disabled', { exact: true })
    ).toBeVisible()
    await expect(
      coreComponentBoard.getByText('Destructive + loading', { exact: true })
    ).toBeVisible()
    await expect(
      coreComponentBoard.getByText('Feedback', { exact: true })
    ).toBeVisible()
    await componentCatalog
      .locator('a[href="/internal/design-system/components/chart"]')
      .last()
      .click()
    await expect(page.getByTestId('component-detail-chart')).toBeVisible()

    await page.getByTestId('design-system-nav-components').click()
    await componentCatalog
      .locator('a[href="/internal/design-system/components/chart"]')
      .last()
      .scrollIntoViewIfNeeded()
    await componentCatalog
      .locator('a[href="/internal/design-system/components/tabs"]')
      .last()
      .click()

    await expect(page.getByTestId('component-detail-tabs')).toBeVisible()
    await expect(page.getByTestId('component-output-missing')).toBeVisible()

    await page.goto('/internal/design-system/components/button')
    const focusButton = page.getByTestId('design-system-focus-button')
    await focusButton.focus()
    await expect(focusButton).toBeFocused()

    await page.getByTestId('design-system-nav-status').click()
    await expect(page.getByTestId('project-status-page')).toBeVisible()

    await page.goto('/internal/design-system/studies')
    const layoutStudy = page.locator('#layout-foundation-study')
    await expect(layoutStudy).toBeVisible()
    const layoutArchitectureStudy = page.locator('#layout-architecture-study')
    await expect(layoutArchitectureStudy).toBeVisible()
    await expect(
      layoutArchitectureStudy.locator('[data-layout-audit-entry]')
    ).toHaveCount(8)
    await expect(
      layoutArchitectureStudy.getByText('Auctions · discard centered islands', {
        exact: true,
      })
    ).toBeVisible()
    await expect(
      layoutArchitectureStudy.getByText(
        'Progressive workflow · preserve earned expansion',
        { exact: true }
      )
    ).toBeVisible()
    const modalStudy = page.locator('#modal-geometry-study')
    await expect(modalStudy).toBeVisible()
    const modalFamilyStudy = page.locator('#modal-family-study')
    await expect(modalFamilyStudy).toBeVisible()
    await expect(
      modalFamilyStudy.locator('[data-modal-audit-entry]')
    ).toHaveCount(7)
    await expect(
      modalFamilyStudy.getByText(
        'Current implementation versus foundations applied',
        {
          exact: true,
        }
      )
    ).toBeVisible()
    await expect(
      modalFamilyStudy.locator('[data-real-modal-specimen]')
    ).toHaveCount(2)
    const eligibilityCandidate = modalFamilyStudy.locator(
      '[data-real-modal-specimen="eligibility-candidate"]'
    )
    const candidateGeometry = await eligibilityCandidate.evaluate((modal) => {
      const icon = modal.querySelector('span')
      const subtitle = [...modal.querySelectorAll('p')].find((element) =>
        element.textContent?.startsWith('Before continuing')
      )
      const firstCheckbox = modal.querySelector('#candidate-terms')
      const lastCheckbox = modal.querySelector('#candidate-tokenized-stocks')
      const confirm = [...modal.querySelectorAll('button')].find(
        (element) => element.textContent?.trim() === 'Confirm'
      )

      if (!icon || !subtitle || !firstCheckbox || !lastCheckbox || !confirm) {
        return null
      }

      const modalRect = modal.getBoundingClientRect()
      const iconRect = icon.getBoundingClientRect()
      const firstRowRect = firstCheckbox.parentElement?.getBoundingClientRect()
      const lastRowRect = lastCheckbox.parentElement?.getBoundingClientRect()

      return {
        iconLeft: Math.round(iconRect.left - modalRect.left),
        iconTop: Math.round(iconRect.top - modalRect.top),
        subtitleToRows: Math.round(
          (firstRowRect?.top ?? 0) - subtitle.getBoundingClientRect().bottom
        ),
        rowsToAction: Math.round(
          confirm.getBoundingClientRect().top - (lastRowRect?.bottom ?? 0)
        ),
      }
    })
    expect(candidateGeometry).toEqual({
      iconLeft: 24,
      iconTop: 24,
      subtitleToRows: 8,
      rowsToAction: 12,
    })

    const standardWidths = await modalStudy
      .locator('[data-modal-width-specimen="standard"]')
      .evaluateAll((elements) =>
        elements.map((element) =>
          Math.round(element.getBoundingClientRect().width)
        )
      )
    expect(new Set(standardWidths).size).toBe(1)
    expect(standardWidths[0]).toBeLessThanOrEqual(432)

    const compactWidth = await modalStudy
      .locator('[data-modal-width-specimen="compact"]')
      .evaluate((element) => Math.round(element.getBoundingClientRect().width))
    expect(compactWidth).toBeLessThanOrEqual(384)

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
            document.documentElement.clientWidth &&
          document.body.scrollWidth <= document.body.clientWidth
      )
    ).toBe(true)

    if (test.info().project.name === 'design-system-phone') {
      await expect(layoutStudy).toHaveScreenshot(
        'layout-foundation-study-phone.png',
        {
          animations: 'disabled',
          caret: 'hide',
          stylePath: 'e2e/design-system/capture.css',
        }
      )
      await expect(modalStudy).toHaveScreenshot(
        'modal-geometry-study-phone.png',
        {
          animations: 'disabled',
          caret: 'hide',
          stylePath: 'e2e/design-system/capture.css',
        }
      )
    }
  })

  test('distinguishes specimens, canonical candidates, and adoption', async ({
    page,
  }) => {
    const expectDelivery = async (
      component: string,
      implementation: 'specimen' | 'canonical-candidate'
    ) => {
      await page.goto(`/internal/design-system/components/${component}`)
      const delivery = page.getByTestId('component-delivery-status')
      await expect(delivery).toHaveAttribute(
        'data-implementation-status',
        implementation
      )
      await expect(delivery).toHaveAttribute('data-adoption-status', 'none')
    }

    await expectDelivery('entity-identity', 'canonical-candidate')
    await expect(
      page.getByTestId('component-review-readiness')
    ).toHaveAttribute('data-review-readiness', 'ready')
    await expectDelivery('metric', 'canonical-candidate')
    await expectDelivery('table', 'specimen')
    await expect(
      page.getByTestId('component-review-readiness')
    ).toHaveAttribute('data-review-readiness', 'provisional')
    await expectDelivery('dialog', 'canonical-candidate')
    await expectDelivery('empty-state', 'canonical-candidate')
    await expect(page.getByTestId('canonical-button')).toHaveCount(2)
    await expect(page.getByTestId('canonical-button').first()).toHaveCSS(
      'height',
      '44px'
    )

    await expectDelivery('button', 'canonical-candidate')
    await expect(
      page.getByTestId('canonical-button').filter({ hasText: 'Micro' }).first()
    ).toHaveCSS('height', '28px')
    await expect(
      page
        .getByTestId('canonical-button')
        .filter({ hasText: 'Compact' })
        .first()
    ).toHaveCSS('height', '32px')
    await expect(
      page
        .getByTestId('canonical-button')
        .filter({ hasText: 'Default' })
        .first()
    ).toHaveCSS('height', '44px')
    await expect(
      page
        .getByTestId('canonical-button')
        .filter({ hasText: 'Primary' })
        .first()
    ).toHaveCSS('box-shadow', 'none')
    const focusButton = page.getByTestId('design-system-focus-button')
    await focusButton.focus()
    await expect(focusButton).not.toHaveCSS('box-shadow', 'none')

    await expectDelivery('checkbox', 'canonical-candidate')
    await expect(page.getByTestId('checkbox-state-sheet')).toBeVisible()
    await expect(page.getByTestId('canonical-checkbox')).toHaveCount(6)

    await expectDelivery('icon-button', 'canonical-candidate')
    await expect(page.getByTestId('icon-button-state-sheet')).toBeVisible()
    await expect(page.getByTestId('canonical-icon-button')).toHaveCount(6)

    await expectDelivery('dialog', 'canonical-candidate')
    await expect(page.getByTestId('dialog-state-sheet')).toBeVisible()
    await page.getByRole('button', { name: 'Open eligibility dialog' }).click()
    await expect(page.getByTestId('canonical-dialog-content')).toBeVisible()
    await expect(
      page
        .getByTestId('canonical-dialog-content')
        .getByTestId('canonical-checkbox')
    ).toHaveCount(3)
    await expect(
      page
        .getByTestId('canonical-dialog-content')
        .getByTestId('canonical-icon-button')
    ).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('canonical-dialog-content')).toBeVisible()
    for (const checkbox of await page
      .getByTestId('canonical-dialog-content')
      .getByTestId('canonical-checkbox')
      .all()) {
      await checkbox.click()
    }
    await page
      .getByTestId('canonical-dialog-content')
      .getByRole('button', { name: 'Confirm', exact: true })
      .click()
    await expect(page.getByTestId('canonical-dialog-content')).toHaveCount(0)
  })

  for (const theme of THEMES) {
    test(`captures the ${theme} routed capability map`, async ({ page }) => {
      await page.addInitScript((mode) => {
        localStorage.setItem('theme-ui-color-mode', mode)
      }, theme)
      await page.emulateMedia({ reducedMotion: 'reduce' })

      for (const surface of SURFACES) {
        await page.goto(surface.path, { waitUntil: 'domcontentloaded' })
        const region = page.getByTestId(surface.id)
        await expect(region).toBeVisible()

        if (theme === 'dark') {
          await expect(page.locator('html')).toHaveClass(/dark/)
        } else {
          await expect(page.locator('html')).not.toHaveClass(/dark/)
        }

        await expect(region).toHaveScreenshot(`${surface.id}-${theme}.png`, {
          animations: 'disabled',
          caret: 'hide',
          maxDiffPixels: 20,
          stylePath: 'e2e/design-system/capture.css',
        })
      }
    })
  }
})
