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
    await expect(page.getByTestId('current-review-spotlight')).toHaveCount(0)
    await expect(
      page.getByTestId('foundation-visual-overview').locator('a')
    ).toHaveCount(9)

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
    await colorDetail.getByTestId('foundation-secondary-details').click()
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
    await expect(colorDetail.getByText('110 uses')).toBeVisible()
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
    const canonicalOverview = page.getByTestId('canonical-component-overview')
    await expect(canonicalOverview.locator('article')).toHaveCount(7)
    await expect(
      canonicalOverview.getByTestId('canonical-button').first()
    ).toBeVisible()
    await expect(
      canonicalOverview.getByTestId('canonical-checkbox').first()
    ).toBeVisible()
    await expect(
      canonicalOverview.getByTestId('canonical-dialog-surface')
    ).toBeVisible()
    await expect(
      canonicalOverview.getByTestId('canonical-entity-identity')
    ).toBeVisible()
    await expect(
      canonicalOverview.getByTestId('canonical-metric').first()
    ).toBeVisible()
    await expect(
      canonicalOverview.getByTestId('canonical-empty-state')
    ).toBeVisible()
    await expect(
      componentCatalog.getByTestId('information-row-state-sheet')
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
    const headlineMetric = page
      .locator('[data-testid="canonical-metric"][data-role="headline"]')
      .first()
    const headlineType = await headlineMetric
      .locator(':scope > span')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const style = getComputedStyle(node)
          return { fontSize: style.fontSize, fontWeight: style.fontWeight }
        })
      )
    expect(headlineType).toEqual([
      { fontSize: '16px', fontWeight: '300' },
      { fontSize: '16px', fontWeight: '500' },
    ])
    await expect(page.getByTestId('component-output-missing')).toHaveCount(0)
    await page.goto('/internal/design-system/components/table')
    await expect(page.getByTestId('information-row-state-sheet')).toBeVisible()
    await expect(page.getByTestId('canonical-index-data-slice')).toBeVisible()
    await expect(page.getByTestId('canonical-entity-identity')).toHaveCount(3)
    await expect(
      page
        .getByTestId('canonical-index-data-slice')
        .getByTestId('canonical-metric-value')
    ).toHaveCount(9)
    await expect(page.getByTestId('component-output-missing')).toHaveCount(0)
    await page.goto('/internal/design-system/components/empty-state')
    await expect(page.getByTestId('empty-state-state-sheet')).toBeVisible()
    await expect(page.getByTestId('canonical-empty-state')).toHaveCount(2)
    await expect(page.getByTestId('component-output-missing')).toHaveCount(0)
    await page.goto('/internal/design-system/components')
    await componentCatalog
      .locator('a[href="/internal/design-system/components/chart"]')
      .click()
    await expect(page.getByTestId('component-detail-chart')).toBeVisible()

    await page.getByTestId('design-system-nav-components').click()
    await componentCatalog
      .locator('a[href="/internal/design-system/components/chart"]')
      .scrollIntoViewIfNeeded()
    await componentCatalog
      .locator('a[href="/internal/design-system/components/tabs"]')
      .click()

    await expect(page.getByTestId('component-detail-tabs')).toBeVisible()
    await expect(page.getByTestId('component-output-missing')).toBeVisible()

    await page.goto('/internal/design-system/components/button')
    const focusButton = page.getByTestId('design-system-focus-button')
    await focusButton.focus()
    await expect(focusButton).toBeFocused()

    await page.getByTestId('design-system-nav-status').click()
    await expect(page.getByTestId('project-status-page')).toBeVisible()
    await expect(
      page.getByTestId('project-status-page').getByText('Current review')
    ).toBeVisible()
    const currentReview = page
      .getByTestId('project-status-page')
      .locator('section[aria-labelledby="current-review-heading"]')
    await expect(currentReview.locator('a')).toHaveCount(0)
    await expect(
      currentReview.getByText('No human design judgment is waiting.', {
        exact: false,
      })
    ).toBeVisible()
    await expect(
      currentReview.getByText('Canonical identity in the Index overview', {
        exact: true,
      })
    ).toHaveCount(0)

    await page.goto('/internal/design-system/studies')
    const studies = page.getByTestId('layout-studies-page')
    await expect(studies.locator('#spacing-rhythm-study')).toHaveCount(0)
    await expect(studies.locator('#elevation-study')).toHaveCount(0)
    await expect(studies.locator('#iconography-study')).toHaveCount(0)
    await expect(studies.locator('#motion-study')).toHaveCount(0)
    await expect(studies.locator('#actions-candidate-study')).toHaveCount(0)
    await expect(studies.locator('#control-geometry-study')).toHaveCount(0)
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
    const passiveIcon = page.getByTestId('eligibility-passive-icon')
    await expect(passiveIcon).toHaveCSS('border-top-width', '0px')
    await expect(passiveIcon).toHaveCSS('width', '32px')
    await expect(passiveIcon.locator('svg')).toHaveCSS('width', '20px')
    await expect(
      page
        .getByTestId('canonical-dialog-content')
        .getByText('Before continuing, please confirm the following.', {
          exact: true,
        })
    ).toHaveCSS('margin-top', '4px')
    await expect(
      page
        .getByTestId('canonical-dialog-content')
        .getByTestId('canonical-checkbox')
    ).toHaveCount(3)
    await expect(
      page
        .getByTestId('canonical-dialog-content')
        .getByTestId('canonical-icon-button')
    ).toHaveCount(2)
    await page
      .getByTestId('canonical-dialog-content')
      .getByRole('button', { name: 'Show restricted jurisdictions' })
      .click()
    const jurisdictionViewport = page.getByTestId(
      'jurisdiction-scroll-viewport'
    )
    await expect(jurisdictionViewport).toBeVisible()
    await expect(page.getByTestId('jurisdiction-scroll-fade')).toBeVisible()
    await jurisdictionViewport.evaluate((node) => {
      node.scrollTop = node.scrollHeight
      node.dispatchEvent(new Event('scroll'))
    })
    await expect(page.getByTestId('jurisdiction-scroll-fade')).toHaveCount(0)
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

  test('routes through the adaptive dialog presentation', async ({ page }) => {
    await page.goto('/internal/design-system/components/dialog')
    await page.getByRole('button', { name: 'Open eligibility dialog' }).click()

    const dialog = page.getByTestId('canonical-dialog-content')
    await dialog.evaluate((node) =>
      Promise.all(node.getAnimations().map((animation) => animation.finished))
    )
    const viewport = page.viewportSize()
    const box = await dialog.boundingBox()
    expect(viewport).not.toBeNull()
    expect(box).not.toBeNull()
    if (!viewport || !box) return

    if (viewport.width < 640) {
      expect(Math.round(box.x)).toBe(0)
      expect(Math.round(box.width)).toBe(viewport.width)
      expect(Math.round(box.y + box.height)).toBe(viewport.height)
      return
    }

    expect(Math.round(box.width)).toBe(432)
    expect(Math.abs(box.y + box.height / 2 - viewport.height / 2)).toBeLessThan(
      2
    )
  })

  test('renders the source-grounded rich record review', async ({ page }) => {
    await page.goto('/internal/design-system/components/table')

    const review = page.getByTestId('rich-record-review')
    await expect(review).toBeVisible()
    await expect(
      review.locator(
        '[data-testid="rich-record"][data-record-kind="governance"]'
      )
    ).toHaveCount(11)
    await expect(
      review.getByText('Update Wrapped TONCOIN Basket Component', {
        exact: true,
      })
    ).toBeVisible()
    await expect(
      review.getByText('Voting ends in 6h', { exact: true })
    ).toHaveCount(0)
    await expect(
      review
        .getByTestId('lifecycle-status-pill')
        .filter({ hasText: 'Voting active' })
    ).toHaveCount(2)
    await expect(
      review
        .locator('[data-proposal-state="active"]')
        .getByTestId('lifecycle-status-pill')
        .first()
    ).toHaveAttribute('data-status-role', 'active')
    await expect(
      review
        .locator('[data-proposal-state="active"]')
        .locator('[data-status-icon="vote"]')
    ).toHaveCount(1)
    await expect(
      review
        .locator('[data-proposal-state="optimistic-active"]')
        .locator('[data-status-icon="shield-alert"]')
    ).toHaveCount(1)
    await expect(
      review
        .locator('[data-proposal-state="contested-active"]')
        .locator('[data-status-icon="vote"]')
    ).toHaveCount(1)
    await expect(
      review
        .getByTestId('lifecycle-status-pill')
        .filter({ hasText: 'Ends in 6h' })
    ).toBeVisible()
    await expect(
      review
        .getByTestId('lifecycle-status-pill')
        .filter({ hasText: 'Ends in 6h' })
    ).toHaveAttribute('data-status-role', 'waiting')
    await expect(
      review.getByText(
        '[Reproposal] Extension of onchain voting and execution process of Basket Governance',
        { exact: true }
      )
    ).toBeVisible()
    await expect(
      review.locator('[data-proposal-kind="optimistic"]')
    ).toHaveCount(2)
    await expect(
      review.locator('[data-proposal-qualifier="fast"]')
    ).toHaveCount(2)
    await expect(
      review.locator('[data-proposal-qualifier="contested"]')
    ).toHaveCount(1)
    const challengeEvidence = review
      .locator('[data-decision-evidence="challenge"]')
      .first()
    await expect(challengeEvidence).toContainText('Challenge32% of threshold')
    await expect(challengeEvidence.locator('svg')).toHaveCount(0)
    await expect(
      challengeEvidence.getByTestId('proposal-evidence-value')
    ).toHaveCSS('column-gap', '4px')
    await expect(
      review.locator('[data-proposal-state="quorum-not-reached"]')
    ).toContainText('Quorum74% of required')
    await expect(
      review
        .locator('[data-proposal-state="quorum-not-reached"]')
        .locator('[data-vote-emphasized="true"]')
    ).toHaveCount(0)
    await expect(
      review.locator('[data-proposal-state="defeated"]')
    ).toContainText('Voted down')
    await expect(
      review.locator('[data-proposal-state="standard-succeeded"]')
    ).toContainText('PassedReady to queue')
    await expect(
      review.locator('[data-proposal-state="queued"]')
    ).toContainText('PassedPending executionReady in 8h')
    await expect(
      review.locator('[data-proposal-state="optimistic-succeeded"]')
    ).toContainText('PassedReady to execute')
    await expect(
      review.locator('[data-progress-emphasis="quiet"]')
    ).toHaveCount(4)
    await expect(
      review.locator('[data-proposal-progress-tone="historical"]')
    ).toHaveCount(4)
    await expect(review.getByTestId('proposal-evidence-divider')).toHaveCount(7)
    await expect(
      review.locator('[data-decision-evidence="standard"]').first()
    ).toHaveCSS('column-gap', '16px')
    await expect(
      review.getByTestId('proposal-vote-distribution').first()
    ).toHaveCSS('column-gap', '8px')
    await expect(review.getByTestId('proposal-vote-value').first()).toHaveCSS(
      'column-gap',
      '4px'
    )
    await expect(
      review.locator('[data-proposal-qualifier="fast"] svg').first()
    ).toHaveCSS('width', '14px')
    await expect(
      review.locator('[data-proposal-qualifier="contested"] svg')
    ).toHaveCSS('width', '14px')
    await expect(
      review.locator('[data-proposal-qualifier="fast"]').first()
    ).toHaveCSS('font-weight', '500')
    await expect(
      review.locator('[data-proposal-qualifier="contested"]')
    ).toHaveCSS('font-weight', '500')
    await expect(
      review.locator('[data-proposal-qualifier="fast"]').first()
    ).toHaveCSS('column-gap', '4px')
    const rebalanceBrowseList = review.getByTestId('rebalance-browse-list')
    await expect(rebalanceBrowseList).toBeVisible()
    const ongoingRebalanceHeader = rebalanceBrowseList
      .getByTestId('rebalance-list-record')
      .nth(1)
      .getByTestId('rebalance-record-header')
    const ongoingTitleBox = await ongoingRebalanceHeader
      .locator('h4')
      .boundingBox()
    const ongoingStatusBox = await ongoingRebalanceHeader
      .getByTestId('lifecycle-status-pill')
      .boundingBox()
    expect(ongoingTitleBox).not.toBeNull()
    expect(ongoingStatusBox).not.toBeNull()
    if (ongoingTitleBox && ongoingStatusBox) {
      if (page.viewportSize()?.width === 390) {
        expect(ongoingStatusBox.y).toBeGreaterThanOrEqual(
          ongoingTitleBox.y + ongoingTitleBox.height
        )
        expect(ongoingStatusBox.x).toBe(ongoingTitleBox.x)
      } else {
        expect(ongoingStatusBox.y).toBeLessThan(
          ongoingTitleBox.y + ongoingTitleBox.height
        )
      }
    }
    await expect(
      rebalanceBrowseList.getByText('August 2026 Rebalance', { exact: true })
    ).toBeVisible()
    await expect(review.getByTestId('rebalance-list-record')).toHaveCount(4)
    await expect(
      rebalanceBrowseList.getByText('September 2026 Rebalance', { exact: true })
    ).toBeVisible()
    await expect(
      rebalanceBrowseList.getByText('Swap Wrapped TONCOIN Basket Component', {
        exact: true,
      })
    ).toBeVisible()
    await expect(
      rebalanceBrowseList.getByText('Auction 1 · Ready to start', {
        exact: true,
      })
    ).toBeVisible()
    await expect(
      rebalanceBrowseList.getByText('Auction 2 · Ongoing', {
        exact: true,
      })
    ).toBeVisible()
    await expect(
      rebalanceBrowseList.getByText('Current auction ends in', { exact: true })
    ).toBeVisible()
    await expect(
      rebalanceBrowseList.getByText('Value traded this auction', {
        exact: true,
      })
    ).toHaveCount(0)
    await expect(
      rebalanceBrowseList.getByText('Bids this auction', { exact: true })
    ).toHaveCount(0)
    await expect(
      rebalanceBrowseList.getByText('Execution progress', { exact: true })
    ).toHaveCount(0)
    await expect(
      rebalanceBrowseList.getByText('Next auction target', { exact: true })
    ).toHaveCount(0)
    await expect(
      rebalanceBrowseList.getByText('Auction 2 of 5', { exact: true })
    ).toHaveCount(0)
    await expect(
      rebalanceBrowseList.getByTestId('rebalance-execution-progress')
    ).toHaveCount(0)
    await expect(
      rebalanceBrowseList.getByTestId('lifecycle-status-pill')
    ).toHaveCount(4)
    await expect(
      rebalanceBrowseList.getByTestId('lifecycle-status-pill').nth(0)
    ).toHaveAttribute('data-status-role', 'actionable')
    await expect(
      rebalanceBrowseList.getByTestId('lifecycle-status-pill').nth(1)
    ).toHaveAttribute('data-status-role', 'processing')
    await expect(
      rebalanceBrowseList.getByTestId('lifecycle-status-pill').nth(2)
    ).toHaveAttribute('data-status-role', 'closed')
    await expect(
      rebalanceBrowseList.getByTestId('lifecycle-status-pill').nth(3)
    ).toHaveAttribute('data-status-role', 'closed')
    await expect(
      rebalanceBrowseList.locator('[data-status-icon="spinner"]')
    ).toHaveCount(1)
    await expect(rebalanceBrowseList.locator('[data-timing-icon]')).toHaveCount(
      0
    )
    const evidenceRegions = rebalanceBrowseList.getByTestId(
      'rebalance-evidence-region'
    )
    await expect(evidenceRegions).toHaveCount(4)
    await expect(evidenceRegions.first()).toHaveCSS('margin-left', '4px')
    await expect(evidenceRegions.first()).toHaveCSS('padding-left', '16px')
    const evidenceRails = rebalanceBrowseList.getByTestId(
      'rebalance-evidence-rail'
    )
    await expect(evidenceRails).toHaveCount(4)
    await expect(evidenceRails.first()).toHaveCSS('top', '8px')
    await expect(evidenceRails.first()).toHaveCSS('bottom', '8px')
    await expect(evidenceRails.first()).toHaveCSS('width', '1px')
    await expect(
      rebalanceBrowseList.getByTestId('rebalance-outcome-summary')
    ).toHaveCount(2)
    await expect(
      rebalanceBrowseList.getByTestId('canonical-metric')
    ).toHaveCount(10)
    const rebalanceMetricValues = rebalanceBrowseList.getByTestId(
      'rebalance-metric-value'
    )
    await expect(rebalanceMetricValues).toHaveCount(10)
    for (const metricValue of await rebalanceMetricValues.all()) {
      await expect(metricValue).toHaveCSS('font-weight', '500')
    }
    const rebalanceMetadata = rebalanceBrowseList
      .getByTestId('rebalance-metadata')
      .first()
    await expect(rebalanceMetadata).toContainText(
      'ProposedFri Aug 14, 11:20 amby0xb209…5015'
    )
    await expect(rebalanceMetadata).toHaveCSS('justify-content', 'normal')
    const selectedRebalance = review.getByTestId('rebalance-selected-detail')
    await expect(selectedRebalance).toBeVisible()
    await expect(
      selectedRebalance.getByText('September 2026 Rebalance', { exact: true })
    ).toBeVisible()
    await expect(
      selectedRebalance.getByRole('button', { name: 'Start auction 1' })
    ).toBeVisible()
    const selectedBrowseRow = rebalanceBrowseList.locator(
      '[data-selected="true"]'
    )
    const recessedBrowseRow = rebalanceBrowseList
      .locator('[data-selected="false"]')
      .first()
    const contentSurface = await selectedRebalance.evaluate(
      (element) => getComputedStyle(element).backgroundColor
    )
    await expect(selectedBrowseRow).toHaveCSS(
      'background-color',
      contentSurface
    )
    expect(
      await recessedBrowseRow.evaluate(
        (element) => getComputedStyle(element).backgroundColor
      )
    ).not.toBe(contentSurface)
    await recessedBrowseRow.hover()
    await expect(recessedBrowseRow).toHaveCSS(
      'background-color',
      contentSurface
    )
    const selectedListActionable = rebalanceBrowseList
      .locator('[data-selected="true"]')
      .getByTestId('lifecycle-status-pill')
    const detailActionable = selectedRebalance.getByTestId(
      'lifecycle-status-pill'
    )
    const selectedActionableBackground = await selectedListActionable.evaluate(
      (element) => getComputedStyle(element).backgroundColor
    )
    await expect(detailActionable).toHaveCSS(
      'background-color',
      selectedActionableBackground
    )
    expect(
      await selectedListActionable.evaluate((element) => {
        const color = getComputedStyle(element).backgroundColor
        const canvas = document.createElement('canvas')
        canvas.width = 1
        canvas.height = 1
        const context = canvas.getContext('2d')
        if (!context) return false

        const paintOver = (underlay: string) => {
          context.fillStyle = underlay
          context.fillRect(0, 0, 1, 1)
          context.fillStyle = color
          context.fillRect(0, 0, 1, 1)
          return Array.from(context.getImageData(0, 0, 1, 1).data).join(',')
        }

        return paintOver('#000') === paintOver('#fff')
      })
    ).toBe(true)
    await expect(review.getByTestId('canonical-metric')).toHaveCount(12)
    await expect(
      review
        .locator('[data-testid="rich-record"][data-record-kind="governance"]')
        .first()
        .locator('svg')
        .first()
    ).toHaveCSS('height', '4px')
    const firstGovernanceRecord = review
      .locator('[data-testid="rich-record"][data-record-kind="governance"]')
      .first()
    for (const side of ['top', 'right', 'bottom', 'left']) {
      await expect(firstGovernanceRecord).toHaveCSS(`padding-${side}`, '24px')
    }
    await expect(
      firstGovernanceRecord.locator(':scope > div').nth(1)
    ).toHaveCSS('margin-top', '16px')
    await expect(
      firstGovernanceRecord.locator(':scope > div').last()
    ).toHaveCSS('margin-top', '16px')
    await expect(
      review.getByText('Governance proposal records', { exact: true })
    ).toBeVisible()
    await expect(
      review.getByText('Auction rebalance browse list', { exact: true })
    ).toBeVisible()
    await expect(review.getByText('Review now', { exact: true })).toHaveCount(2)
    await expect(
      review.getByText('Leave for later', { exact: true })
    ).toHaveCount(2)
  })

  test('shows the shared lifecycle status roles without generalizing every badge job', async ({
    page,
  }) => {
    await page.goto('/internal/design-system/components/badge')

    const sheet = page.getByTestId('lifecycle-status-state-sheet')
    const matrix = sheet.getByTestId('lifecycle-status-role-matrix')
    await expect(sheet).toBeVisible()
    await expect(page.getByTestId('component-output-missing')).toHaveCount(0)

    for (const role of [
      'waiting',
      'active',
      'actionable',
      'processing',
      'success',
      'unsuccessful',
      'closed',
    ]) {
      await expect(matrix.locator(`[data-status-role="${role}"]`)).toHaveCount(
        1
      )
    }

    for (const [role, icon] of [
      ['active', 'active-dot'],
      ['waiting', 'clock'],
      ['actionable', 'arrow-right'],
      ['processing', 'spinner'],
      ['success', 'check'],
      ['unsuccessful', 'x'],
    ]) {
      await expect(
        matrix.locator(
          `[data-status-role="${role}"] [data-status-icon="${icon}"]`
        )
      ).toHaveCount(1)
    }

    await expect(
      matrix.locator('[data-status-role="closed"] [data-status-icon]')
    ).toHaveCount(0)

    await expect(
      matrix.locator('[data-status-role="processing"] svg')
    ).toHaveClass(/animate-spin/)
    const semanticIndicators = sheet.getByTestId(
      'lifecycle-status-semantic-indicators'
    )
    await expect(
      semanticIndicators.locator('[data-status-icon="vote"]')
    ).toHaveCount(1)
    await expect(
      semanticIndicators.locator('[data-status-icon="shield-alert"]')
    ).toHaveCount(1)
    await expect(
      sheet.getByTestId('lifecycle-status-supporting-pair')
    ).toContainText('Voting activeEnds in 6h')
  })

  test('keeps the dialog close action inside the header content axis', async ({
    page,
  }) => {
    await page.goto('/internal/design-system/components/dialog')
    await page.getByRole('button', { name: 'Open eligibility dialog' }).click()

    const dialog = page.getByTestId('canonical-dialog-content')
    await dialog.evaluate((node) =>
      Promise.all(node.getAnimations().map((animation) => animation.finished))
    )
    const dialogBox = await dialog.boundingBox()
    const closeButton = page.getByRole('button', { name: 'Close dialog' })
    const closeButtonBox = await closeButton.boundingBox()
    const closeGlyphBox = await closeButton.locator('svg').boundingBox()
    expect(dialogBox).not.toBeNull()
    expect(closeButtonBox).not.toBeNull()
    expect(closeGlyphBox).not.toBeNull()
    if (!dialogBox || !closeButtonBox || !closeGlyphBox) return

    expect(
      Math.round(
        dialogBox.x + dialogBox.width - closeButtonBox.x - closeButtonBox.width
      )
    ).toBe(24)
    expect(Math.round(closeButtonBox.y - dialogBox.y)).toBe(24)
    expect(closeButtonBox.width).toBe(32)
    expect(closeButtonBox.height).toBe(32)

    expect(
      Math.abs(
        closeGlyphBox.x +
          closeGlyphBox.width / 2 -
          (closeButtonBox.x + closeButtonBox.width / 2)
      )
    ).toBeLessThanOrEqual(1)
    expect(
      Math.abs(
        closeGlyphBox.y +
          closeGlyphBox.height / 2 -
          (closeButtonBox.y + closeButtonBox.height / 2)
      )
    ).toBeLessThanOrEqual(1)
  })

  test('separates checkbox alignment geometry from its visible mark', async ({
    page,
  }) => {
    await page.goto('/internal/design-system/components/checkbox')

    const checkbox = page.getByTestId('canonical-checkbox').first()
    await expect(checkbox).toHaveCSS('width', '28px')
    await expect(checkbox).toHaveCSS('height', '28px')
    await expect(checkbox.getByTestId('canonical-checkbox-mark')).toHaveCSS(
      'width',
      '20px'
    )
    await expect(checkbox.getByTestId('canonical-checkbox-mark')).toHaveCSS(
      'height',
      '20px'
    )

    await checkbox.focus()
    await expect(checkbox.getByTestId('canonical-checkbox-mark')).not.toHaveCSS(
      'box-shadow',
      'none'
    )

    const interactiveCheckbox = page.getByLabel('Interactive checkbox')
    await interactiveCheckbox.click()
    await expect(interactiveCheckbox).toHaveAttribute('aria-checked', 'true')
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
