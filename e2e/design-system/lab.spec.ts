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
    id: 'foundation-detail-radius',
    path: '/internal/design-system/foundations/radius',
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
  test('prepares the comprehensive typography foundation review', async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme-ui-color-mode', 'light')
    })
    await page.goto('/internal/design-system/foundations/typography')

    await expect(page.getByTestId('typography-baseline')).toBeVisible()
    await expect(page.getByTestId('typography-review-boundary')).toBeVisible()
    await expect(page.getByTestId('typography-review-role-map')).toBeVisible()
    await expect(
      page.getByTestId('typography-review-weight-strategy')
    ).toBeVisible()
    await expect(page.getByTestId('typography-review-contexts')).toBeVisible()
    await expect(
      page.getByTestId('typography-review-stress-tests')
    ).toBeVisible()
    await expect(
      page.getByTestId('typography-recommended-refinements')
    ).toBeVisible()

    const responsiveDisplay = page.getByTestId('typography-responsive-display')
    await expect(responsiveDisplay).toHaveCSS(
      'font-size',
      testInfo.project.name === 'design-system-mobile' ? '40px' : '48px'
    )

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)

    await page.goto('/internal/design-system/status')
    const currentReview = page
      .getByTestId('project-status-page')
      .locator('section[aria-labelledby="current-review-heading"]')
    await expect(currentReview.locator('a')).toHaveCount(0)
  })

  test('records the cross-theme color contrast baseline', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme-ui-color-mode', 'light')
    })
    await page.goto(
      '/internal/design-system/foundations/color#color-contrast-review'
    )

    const review = page.getByTestId('color-contrast-review')
    await expect(review).toBeVisible()
    await expect(review.getByText('Current baseline').first()).toBeVisible()
    await expect(review.getByTestId('color-feedback-comparison')).toBeVisible()
    await expect(review.getByTestId('color-action-comparison')).toBeVisible()
    await expect(
      review.getByTestId('color-supporting-comparison')
    ).toBeVisible()
    await expect(review.getByTestId('color-heavier-alternatives')).toBeVisible()

    const previousSuccess = review
      .getByTestId('color-feedback-comparison')
      .locator('[data-status-role="success"]')
      .first()
    const baselineSuccess = review
      .getByTestId('color-feedback-comparison')
      .locator('[data-status-role="success"]')
      .nth(1)
    expect(
      await previousSuccess.evaluate((node) => getComputedStyle(node).color)
    ).not.toBe(
      await baselineSuccess.evaluate((node) => getComputedStyle(node).color)
    )

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  })

  test('records the radius working baseline from accepted owners', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme-ui-color-mode', 'light')
    })
    await page.goto('/internal/design-system/foundations/radius')

    const review = page.getByTestId('radius-closure-review')
    await expect(review).toBeVisible()
    await expect(
      review.getByText('Radius working baseline', { exact: true })
    ).toBeVisible()
    await expect(
      review.getByText('Current baseline', { exact: true })
    ).toBeVisible()
    await expect(review.getByTestId('radius-established-rules')).toBeVisible()
    await expect(review.getByTestId('radius-review-boundary')).toBeVisible()

    const canonicalButton = review.getByTestId('canonical-button').first()
    const canonicalInput = review.getByTestId('canonical-text-input')
    const canonicalTextarea = review.getByTestId('canonical-textarea')
    await expect(canonicalButton).toHaveCSS('border-radius', '9999px')
    await expect(canonicalInput).toHaveCSS('border-radius', '9999px')
    await expect(canonicalTextarea).toHaveCSS('border-radius', '8px')
    await expect(review.getByTestId('radius-recommended-structure')).toHaveCSS(
      'border-top-right-radius',
      '0px'
    )
    await expect(review.getByTestId('radius-deferred-reveal')).toHaveCSS(
      'border-top-right-radius',
      '16px'
    )

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  })

  test('prepares Link review and keeps Accordion provisional', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme-ui-color-mode', 'light')
    })

    await page.goto('/internal/design-system/components/link')
    const linkSheet = page.getByTestId('link-state-sheet')
    await expect(linkSheet).toBeVisible()
    await expect(
      page.getByTestId('component-review-readiness')
    ).toHaveAttribute('data-review-readiness', 'ready')
    await expect(
      linkSheet.getByTestId('design-system-link-inline')
    ).not.toHaveAttribute('target')
    await expect(
      linkSheet.getByTestId('design-system-link-long-external')
    ).toHaveAttribute('target', '_blank')
    await expect(
      linkSheet.getByTestId('design-system-link-button-route')
    ).toHaveAttribute('href', '/internal/design-system/screens')

    await page.goto('/internal/design-system/components/accordion')
    const accordionSheet = page.getByTestId('accordion-state-sheet')
    await expect(accordionSheet).toBeVisible()
    await expect(
      page.getByTestId('component-review-readiness')
    ).toHaveAttribute('data-review-readiness', 'provisional')

    const firstTrigger = accordionSheet.getByTestId(
      'design-system-accordion-staking-trigger'
    )
    const secondTrigger = accordionSheet.getByTestId(
      'design-system-accordion-unstaking-trigger'
    )
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true')
    await secondTrigger.focus()
    await page.keyboard.press('Enter')
    await expect(secondTrigger).toHaveAttribute('aria-expanded', 'true')
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('routes through adaptive drawer shell', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme-ui-color-mode', 'light')
    })
    await page.goto('/internal/design-system/components/drawer')

    await expect(page.getByTestId('drawer-state-sheet')).toBeVisible()
    const trigger = page.getByRole('button', { name: 'Open task drawer' })
    await trigger.click()

    const drawer = page.getByTestId('canonical-drawer-content')
    await expect(drawer).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Close drawer' })
    ).toBeFocused()
    await page.waitForTimeout(300)

    const drawerBox = await drawer.boundingBox()
    const viewport = page.viewportSize()
    expect(drawerBox).not.toBeNull()
    expect(viewport).not.toBeNull()
    if (!drawerBox || !viewport) return

    if (viewport.width < 640) {
      expect(Math.round(drawerBox.x)).toBe(0)
      expect(Math.round(drawerBox.width)).toBe(viewport.width)
      expect(Math.round(drawerBox.y + drawerBox.height)).toBe(viewport.height)
    } else {
      expect(Math.round(drawerBox.width)).toBe(512)
      expect(Math.round(drawerBox.x + drawerBox.width)).toBe(viewport.width)
      expect(Math.round(drawerBox.y)).toBe(0)
      expect(Math.round(drawerBox.height)).toBe(viewport.height)
    }

    await page.getByRole('button', { name: 'Close drawer' }).click()
    await expect(trigger).toBeFocused()
  })

  test('positions mobile utilities below the header at matched control heights', async ({
    page,
  }) => {
    await page.goto(
      '/internal/design-system/components/product-navigation#navigation-review'
    )

    const navigationSheet = page.getByTestId('navigation-systems-state-sheet')
    const connectedHeader = navigationSheet.getByTestId(
      'mobile-header-connected-state'
    )
    const connectedHeaderBox = await connectedHeader.boundingBox()
    expect(connectedHeaderBox).not.toBeNull()
    if (!connectedHeaderBox) return
    if (connectedHeaderBox.width >= 386) {
      await expect(
        connectedHeader.getByTestId('mobile-brand-wordmark')
      ).toBeVisible()
      await expect(
        connectedHeader.getByTestId('mobile-brand-mark')
      ).toBeHidden()
    } else {
      await expect(
        connectedHeader.getByTestId('mobile-brand-wordmark')
      ).toBeHidden()
      await expect(
        connectedHeader.getByTestId('mobile-brand-mark')
      ).toBeVisible()
    }
    const narrowHeader = navigationSheet.getByTestId(
      'mobile-header-narrow-state'
    )
    await expect(narrowHeader.getByTestId('mobile-brand-wordmark')).toBeHidden()
    await expect(narrowHeader.getByTestId('mobile-brand-mark')).toBeVisible()
    const compactHeader = navigationSheet.getByTestId(
      'mobile-header-compact-brand-state'
    )
    await expect(
      compactHeader.getByTestId('mobile-brand-wordmark')
    ).toBeHidden()
    await expect(compactHeader.getByTestId('mobile-brand-mark')).toBeVisible()

    const mobileGlobal = navigationSheet
      .getByTestId('mobile-global-navigation-specimen')
      .getByRole('article')
      .filter({ hasText: 'Default · disconnected' })
    await mobileGlobal
      .getByRole('button', { name: 'Search, theme, and language', exact: true })
      .click()
    const globalMobileHeaderBox = await mobileGlobal
      .locator('header')
      .first()
      .boundingBox()
    expect(globalMobileHeaderBox).not.toBeNull()
    if (!globalMobileHeaderBox) return
    expect(Math.round(globalMobileHeaderBox.height)).toBe(56)
    const utilityPanel = page.getByRole('region', {
      name: 'Application utilities',
    })
    await expect(utilityPanel).toBeVisible()
    const utilityPanelBox = await utilityPanel.boundingBox()
    const utilitySearchBox = await utilityPanel
      .getByRole('button', { name: 'Search DTFs' })
      .boundingBox()
    const utilityThemeBox = await utilityPanel
      .getByRole('group', { name: 'Theme' })
      .boundingBox()
    const utilityLanguageBox = await utilityPanel
      .getByRole('button', { name: 'Language, English' })
      .boundingBox()
    expect(utilityPanelBox).not.toBeNull()
    expect(utilitySearchBox).not.toBeNull()
    expect(utilityThemeBox).not.toBeNull()
    expect(utilityLanguageBox).not.toBeNull()
    if (
      !utilityPanelBox ||
      !utilitySearchBox ||
      !utilityThemeBox ||
      !utilityLanguageBox
    )
      return
    expect(Math.round(utilitySearchBox.height)).toBe(44)
    expect(Math.round(utilityThemeBox.height)).toBe(44)
    expect(Math.round(utilityLanguageBox.height)).toBe(44)
    expect(Math.round(utilityPanelBox.y)).toBe(
      Math.round(globalMobileHeaderBox.y + globalMobileHeaderBox.height)
    )
    expect(Math.round(utilityPanelBox.x)).toBe(
      Math.round(globalMobileHeaderBox.x)
    )
    expect(Math.round(utilityPanelBox.width)).toBe(
      Math.round(globalMobileHeaderBox.width)
    )

    await utilityPanel
      .getByRole('button', { name: 'Language, English' })
      .click()
    const languageOptions = utilityPanel.getByRole('group', {
      name: 'Language options',
    })
    await expect(languageOptions).toBeVisible()
    const expandedUtilityPanelBox = await utilityPanel.boundingBox()
    expect(expandedUtilityPanelBox).not.toBeNull()
    if (!expandedUtilityPanelBox) return
    expect(expandedUtilityPanelBox.height).toBeGreaterThan(
      utilityPanelBox.height
    )
    expect(Math.round(expandedUtilityPanelBox.x)).toBe(
      Math.round(utilityPanelBox.x)
    )
    expect(Math.round(expandedUtilityPanelBox.width)).toBe(
      Math.round(utilityPanelBox.width)
    )
    await languageOptions.getByText('Español', { exact: true }).click()
    await expect(languageOptions).not.toBeVisible()
    await expect(
      utilityPanel.getByRole('button', { name: 'Language, Spanish' })
    ).toHaveAttribute('aria-expanded', 'false')
  })

  test('routes through coordinated navigation systems', async ({
    page,
  }, testInfo) => {
    await page.goto(
      '/internal/design-system/components/product-navigation#navigation-review'
    )

    const sheet = page.getByTestId('navigation-systems-state-sheet')
    const desktop = sheet.getByTestId('coordinated-navigation-desktop')
    await expect(sheet).toBeVisible()
    await expect(desktop.getByTestId('global-navigation')).toBeVisible()

    const overflowTrigger = desktop.getByTestId(
      'global-navigation-overflow-trigger'
    )
    await overflowTrigger.click()
    await expect(overflowTrigger).toHaveAttribute('aria-expanded', 'true')
    const overflow = page.getByTestId('global-navigation-overflow')
    await expect(overflow).toBeVisible()
    await expect(
      overflow.locator('[data-navigation-id="docs"]')
    ).toHaveAttribute('target', '_blank')
    await page.keyboard.press('Escape')
    await expect(overflowTrigger).toHaveAttribute('aria-expanded', 'false')

    if (testInfo.project.name === 'design-system-desktop') {
      const rail = desktop.getByTestId('product-navigation')
      const collapsedProductTrigger = desktop.getByRole('button', {
        name: 'Switch DTF, current CMC20',
      })
      await expect(collapsedProductTrigger).toHaveClass(/ring-1/)
      await expect(
        collapsedProductTrigger.getByTestId('collapsed-product-identity-logo')
      ).toBeVisible()
      await expect(
        collapsedProductTrigger.getByTestId('canonical-chain-badged-logo')
      ).toHaveCount(0)
      await expect(
        collapsedProductTrigger.locator('[data-slot="product-switcher-cue"]')
      ).toHaveCount(0)
      await rail.hover()
      await expect(rail).toHaveAttribute('data-expanded', 'true')
      await expect(
        desktop
          .getByRole('button', { name: 'Switch DTF, current CMC20' })
          .getByTestId('canonical-chain-badged-logo')
      ).toBeVisible()
      await expect(
        desktop.getByRole('button', { name: 'Switch DTF, current CMC20' })
      ).toHaveClass(/ring-1/)
      await expect(
        rail.locator('[data-navigation-id="overview"]')
      ).toHaveAttribute('aria-current', 'page')

      await desktop
        .getByRole('button', { name: 'Switch DTF, current CMC20' })
        .click()
      const dtfViewport = rail.locator(
        '[data-slot="product-navigation-rail-items"]'
      )
      const railDivider = rail.locator(
        '[data-slot="product-navigation-divider"]'
      )
      const overflowFade = rail.locator(
        '[data-slot="product-navigation-overflow-fade"]'
      )
      await expect(dtfViewport.getByRole('link')).toHaveCount(15)
      await expect(
        dtfViewport.getByRole('link', { name: 'CMC20' })
      ).toHaveCount(0)
      expect(
        await dtfViewport.evaluate(
          (element) => element.scrollHeight > element.clientHeight
        )
      ).toBe(true)
      const railBox = await rail.boundingBox()
      const dividerBox = await railDivider.boundingBox()
      const viewportBox = await dtfViewport.boundingBox()
      const fadeBox = await overflowFade.boundingBox()
      expect(railBox).not.toBeNull()
      expect(dividerBox).not.toBeNull()
      expect(viewportBox).not.toBeNull()
      expect(fadeBox).not.toBeNull()
      if (!railBox || !dividerBox || !viewportBox || !fadeBox) return
      expect(Math.round(viewportBox.y)).toBe(
        Math.round(dividerBox.y + dividerBox.height)
      )
      expect(Math.round(viewportBox.y + viewportBox.height)).toBe(
        Math.round(railBox.y + railBox.height)
      )
      expect(Math.round(fadeBox.y + fadeBox.height)).toBe(
        Math.round(railBox.y + railBox.height)
      )
      await dtfViewport.evaluate((element) => {
        element.scrollTop = element.scrollHeight
      })
      expect(await dtfViewport.evaluate((element) => element.scrollTop)).toBe(
        await dtfViewport.evaluate(
          (element) => element.scrollHeight - element.clientHeight
        )
      )
      const finalRowBox = await dtfViewport
        .getByRole('link', { name: 'ZINDEX' })
        .boundingBox()
      expect(finalRowBox).not.toBeNull()
      if (!finalRowBox) return
      expect(
        Math.round(finalRowBox.y + finalRowBox.height)
      ).toBeLessThanOrEqual(Math.round(fadeBox.y))
      await desktop.getByText('Index details', { exact: true }).hover()
      await expect(rail).not.toHaveAttribute('data-expanded', 'true')
      await expect(
        desktop.getByRole('navigation', {
          name: 'CMC20 on BNB Chain navigation',
        })
      ).toBeVisible()
      await expect(
        rail.locator('[data-navigation-id="overview"]')
      ).toHaveAttribute('aria-current', 'page')
      await rail.hover()
      await desktop
        .getByRole('button', { name: 'Switch DTF, current CMC20' })
        .click()
      await dtfViewport.getByRole('link', { name: 'LCAP' }).click()
      await expect(
        rail.locator('[data-navigation-id="overview"]')
      ).toHaveAttribute('aria-current', 'page')
    }

    const mobileGlobal = sheet.getByTestId('mobile-global-navigation-specimen')
    await mobileGlobal
      .getByRole('button', { name: 'Open global navigation', exact: true })
      .click()
    await expect(
      mobileGlobal.getByRole('navigation', {
        name: 'Global mobile navigation',
      })
    ).toBeVisible()
    await mobileGlobal
      .getByRole('button', { name: 'Close global navigation' })
      .click()

    const mobileProduct = sheet.getByTestId(
      'mobile-product-navigation-specimen'
    )
    const mobilePageTrigger = mobileProduct.getByRole('button', {
      name: 'Open CMC20 page navigation',
    })
    await expect(
      mobilePageTrigger.locator('[data-slot="product-navigation-indicator"]')
    ).toHaveCount(0)
    await mobileProduct
      .getByRole('button', { name: 'Switch DTF, current CMC20' })
      .click()
    const switcherDrawer = mobileProduct.getByRole('dialog', {
      name: 'Switch DTF',
    })
    await expect(
      switcherDrawer.getByRole('navigation', { name: 'Switch DTF' })
    ).toBeVisible()
    await expect(
      mobileProduct.getByRole('link', { name: 'CMC20' })
    ).toHaveCount(0)
    await expect
      .poll(async () => {
        const [containerBox, drawerBox] = await Promise.all([
          mobileProduct.boundingBox(),
          switcherDrawer.boundingBox(),
        ])
        if (!containerBox || !drawerBox) return null
        return (
          Math.round(drawerBox.y + drawerBox.height) -
          Math.round(containerBox.y + containerBox.height)
        )
      })
      .toBe(0)
    const mobileProductBox = await mobileProduct.boundingBox()
    const switcherDrawerBox = await switcherDrawer.boundingBox()
    expect(mobileProductBox).not.toBeNull()
    expect(switcherDrawerBox).not.toBeNull()
    if (!mobileProductBox || !switcherDrawerBox) return
    expect(Math.round(switcherDrawerBox.width)).toBe(
      Math.round(mobileProductBox.width)
    )
    expect(Math.round(switcherDrawerBox.y + switcherDrawerBox.height)).toBe(
      Math.round(mobileProductBox.y + mobileProductBox.height)
    )
    await switcherDrawer
      .getByRole('button', { name: 'Close Switch DTF' })
      .click()
    await expect(switcherDrawer).toBeHidden()
    const mobileIdentityBox = await mobileProduct
      .getByRole('button', { name: 'Switch DTF, current CMC20' })
      .boundingBox()
    const mobilePageClusterBox = await mobileProduct
      .getByRole('button', { name: 'Open CMC20 page navigation' })
      .locator('..')
      .boundingBox()
    await mobileProduct
      .getByRole('button', { name: 'Open CMC20 page navigation' })
      .click()
    const pagesDrawer = mobileProduct.getByRole('dialog', {
      name: 'CMC20 pages',
    })
    const constrainedProductMenu = pagesDrawer.getByRole('navigation', {
      name: 'CMC20 page navigation',
    })
    await expect(
      constrainedProductMenu.locator('[data-navigation-id="auctions"]')
    ).not.toHaveAttribute('aria-disabled')
    await expect(
      constrainedProductMenu.locator(
        '[data-navigation-id="governance"] [data-slot="product-navigation-indicator"]'
      )
    ).toBeVisible()
    await expect
      .poll(async () => {
        const [containerBox, drawerBox] = await Promise.all([
          mobileProduct.boundingBox(),
          pagesDrawer.boundingBox(),
        ])
        if (!containerBox || !drawerBox) return null
        return (
          Math.round(drawerBox.y + drawerBox.height) -
          Math.round(containerBox.y + containerBox.height)
        )
      })
      .toBe(0)
    const drawerCloseButtonBox = await pagesDrawer
      .getByRole('button', { name: 'Close CMC20 pages' })
      .boundingBox()
    const drawerChevronSlotBox = await constrainedProductMenu
      .locator(
        '[data-navigation-id="governance"] [data-slot="product-navigation-trailing-slot"]'
      )
      .boundingBox()
    const drawerRowBox = await constrainedProductMenu
      .locator('[data-navigation-id="governance"]')
      .boundingBox()
    expect(drawerCloseButtonBox).not.toBeNull()
    expect(drawerChevronSlotBox).not.toBeNull()
    expect(drawerRowBox).not.toBeNull()
    if (!drawerCloseButtonBox || !drawerChevronSlotBox || !drawerRowBox) return
    expect(
      Math.round(drawerCloseButtonBox.x + drawerCloseButtonBox.width)
    ).toBe(Math.round(drawerChevronSlotBox.x + drawerChevronSlotBox.width))
    expect(Math.round(drawerRowBox.height)).toBe(48)
    const pagesDrawerAxisBox = await pagesDrawer.boundingBox()
    expect(pagesDrawerAxisBox).not.toBeNull()
    if (!pagesDrawerAxisBox) return
    expect(Math.round(drawerRowBox.x - pagesDrawerAxisBox.x)).toBe(8)
    const mobilePagePanelBox = await pagesDrawer.boundingBox()
    expect(mobileIdentityBox).not.toBeNull()
    expect(mobilePageClusterBox).not.toBeNull()
    expect(mobilePagePanelBox).not.toBeNull()
    if (!mobileIdentityBox || !mobilePageClusterBox || !mobilePagePanelBox)
      return
    expect(Math.round(mobileIdentityBox.height)).toBe(48)
    expect(Math.round(mobileIdentityBox.width)).toBe(82)
    expect(Math.round(mobilePageClusterBox.height)).toBe(48)
    expect(Math.round(mobileIdentityBox.y)).toBe(
      Math.round(mobilePageClusterBox.y)
    )
    expect(Math.round(mobilePagePanelBox.width)).toBe(
      Math.round(mobileProductBox.width)
    )
    expect(Math.round(mobilePagePanelBox.y + mobilePagePanelBox.height)).toBe(
      Math.round(mobileProductBox.y + mobileProductBox.height)
    )
    expect(mobilePagePanelBox.height).toBeLessThan(switcherDrawerBox.height)

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth ===
          document.documentElement.clientWidth
      )
    ).toBe(true)
  })

  test('routes through expected and available capability states', async ({
    page,
  }) => {
    test.slow()

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
    await expect(page.getByTestId('current-review-spotlight')).toHaveCount(1)
    await expect(
      page.getByTestId('foundation-visual-overview').locator('a')
    ).toHaveCount(9)

    await page.getByTestId('design-system-nav-screens').click()
    await expect(
      page.getByTestId('screens-overview').locator('a[href="/internal/deploy"]')
    ).toBeVisible()

    await page.goto('/internal/design-system/foundations/typography')
    const typographyDirection = page.getByTestId(
      'foundation-direction-typography'
    )
    await expect(typographyDirection).toBeVisible()
    await expect(
      typographyDirection.locator('[data-design-authority="current-baseline"]')
    ).toBeVisible()

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
      colorDetail.getByText(/could fall below normal-text contrast/)
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
    await expect(
      canonicalOverview.locator('article[data-testid^="component-overview-"]')
    ).toHaveCount(33)
    const overviewOutputs = canonicalOverview.getByTestId(
      'component-overview-output'
    )
    await expect(overviewOutputs).toHaveCount(33)
    await expect
      .poll(() =>
        overviewOutputs.evaluateAll((outputs) =>
          outputs.every((output) => output.childElementCount > 0)
        )
      )
      .toBe(true)
    await expect(
      canonicalOverview.getByTestId('component-overview-authority')
    ).toHaveCount(33)
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth ===
            document.documentElement.clientWidth
        )
      )
      .toBe(true)
    await expect(
      canonicalOverview.getByTestId('canonical-button').first()
    ).toBeVisible()
    await expect(
      canonicalOverview.getByTestId('canonical-checkbox').first()
    ).toBeVisible()
    const dialogSurfaces = canonicalOverview.getByTestId(
      'canonical-dialog-surface'
    )
    await expect(dialogSurfaces).toHaveCount(3)
    await expect(dialogSurfaces.first()).toHaveAttribute(
      'data-width',
      'compact'
    )
    await expect(dialogSurfaces.nth(1)).toHaveAttribute(
      'data-width',
      'standard'
    )
    await expect(
      canonicalOverview.getByTestId('canonical-entity-identity').first()
    ).toBeVisible()
    await expect(
      canonicalOverview.getByTestId('canonical-metric').first()
    ).toBeVisible()
    const emptyStates = canonicalOverview.getByTestId('canonical-empty-state')
    await expect(emptyStates).toHaveCount(3)
    await expect(emptyStates.first()).toBeVisible()
    await expect(
      canonicalOverview.getByTestId('action-group-state-sheet')
    ).toBeVisible()
    await expect(
      canonicalOverview.getByTestId('canonical-action-group')
    ).toHaveCount(5)
    await expect(
      componentCatalog.getByTestId('information-row-state-sheet')
    ).toBeVisible()
    await expect(
      componentCatalog.getByTestId('component-group-navigation')
    ).toBeVisible()
    await expect(
      componentCatalog.getByTestId('component-overview-tabs')
    ).toBeVisible()
    await expect(
      componentCatalog.getByTestId('navigation-systems-state-sheet')
    ).toHaveCount(2)
    await expect(
      componentCatalog.locator('[data-testid^="component-unrendered-"]')
    ).toHaveCount(12)
    await expect(
      canonicalOverview.getByTestId('link-state-sheet')
    ).toBeVisible()
    await expect(
      canonicalOverview.getByTestId('accordion-state-sheet')
    ).toBeVisible()
    await expect(
      componentCatalog.getByText(
        'This rendered catalog item is missing its overview specimen.',
        { exact: true }
      )
    ).toHaveCount(0)
    await page.goto('/internal/design-system/components/input')
    await expect(page.getByTestId('field-state-sheet')).toBeVisible()
    await expect(page.getByTestId('contained-form-row-review')).toBeVisible()
    await expect(page.locator('#complex-field-group-review')).toBeVisible()
    const fieldSheet = page.getByTestId('field-state-sheet')
    const fieldInputs = fieldSheet.getByTestId('canonical-text-input')
    await expect(fieldInputs).toHaveCount(6)
    await expect(fieldInputs.first()).toHaveCSS('height', '44px')
    const tokenName = fieldSheet.getByLabel('Token Name')
    await tokenName.focus()
    await expect(fieldInputs.first()).not.toHaveCSS('box-shadow', 'none')
    await expect(fieldSheet.getByLabel('Wallet address')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
    await expect(fieldSheet.getByLabel('Wallet address')).toHaveAttribute(
      'aria-errormessage',
      'field-wallet-error'
    )
    await expect(fieldSheet.getByLabel('Governor')).toHaveAttribute(
      'readonly',
      ''
    )
    await expect(fieldSheet.getByLabel('Email')).toBeDisabled()
    await expect(
      page.getByTestId('component-review-readiness')
    ).toHaveAttribute('data-review-readiness', 'ready')
    await expect(page.getByTestId('component-output-missing')).toHaveCount(0)
    await page.goto('/internal/design-system/components/radio-group')
    await expect(
      page.getByTestId('single-choice-group-state-sheet')
    ).toBeVisible()
    await expect(page.getByTestId('canonical-single-choice-group')).toHaveCount(
      2
    )
    const singleChoiceGeometry = await page
      .getByTestId('canonical-single-choice-group')
      .first()
      .evaluate((group) => {
        const selected = group.querySelector('input:checked + span')
        const inactive = group.querySelector(
          'input:not(:checked):not(:disabled) + span'
        )
        const groupStyle = getComputedStyle(group)
        const selectedStyle = selected ? getComputedStyle(selected) : null
        const inactiveStyle = inactive ? getComputedStyle(inactive) : null
        return {
          groupHeight: groupStyle.height,
          groupBackground: groupStyle.backgroundColor,
          groupGap: groupStyle.columnGap,
          groupPadding: groupStyle.padding,
          selectedHeight: selectedStyle?.height,
          selectedPaddingInline: selectedStyle?.paddingInline,
          selectedShadow: selectedStyle?.boxShadow,
          inactivePaddingInline: inactiveStyle?.paddingInline,
        }
      })
    expect(singleChoiceGeometry).toEqual({
      groupHeight: '44px',
      groupBackground: 'rgb(242, 240, 238)',
      groupGap: '2px',
      groupPadding: '2px',
      selectedHeight: '40px',
      selectedPaddingInline: '20px',
      selectedShadow:
        'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px',
      inactivePaddingInline: '20px',
    })
    const singleChoiceWidths = await page
      .getByTestId('canonical-single-choice-group')
      .evaluateAll((groups) =>
        groups.map((group) => {
          const parent = group.parentElement
          const parentStyle = parent ? getComputedStyle(parent) : null
          const availableWidth = parent
            ? parent.clientWidth -
              Number(parentStyle?.paddingLeft.replace('px', '') ?? '0') -
              Number(parentStyle?.paddingRight.replace('px', '') ?? '0')
            : 0
          const itemWidths = Array.from(group.querySelectorAll('label')).map(
            (item) => item.getBoundingClientRect().width
          )

          return {
            availableWidth,
            groupWidth: group.getBoundingClientRect().width,
            itemWidths,
          }
        })
      )
    expect(singleChoiceWidths[0].groupWidth).toBeLessThanOrEqual(
      singleChoiceWidths[0].availableWidth
    )
    expect(singleChoiceWidths[1].groupWidth).toBeCloseTo(
      singleChoiceWidths[1].availableWidth,
      0
    )
    expect(
      Math.max(...singleChoiceWidths[1].itemWidths) -
        Math.min(...singleChoiceWidths[1].itemWidths)
    ).toBeLessThan(1)
    const disabledChoiceOpacity = await page
      .getByRole('radio', { name: '25%' })
      .evaluate((input) =>
        input.nextElementSibling
          ? getComputedStyle(input.nextElementSibling).opacity
          : null
      )
    expect(disabledChoiceOpacity).toBe('0.5')
    await expect(page.getByTestId('component-output-missing')).toHaveCount(0)
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
    await expect(page.getByTestId('canonical-empty-state')).toHaveCount(3)
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
    await componentCatalog.getByRole('link', { name: 'Inspect Tabs' }).click()

    await expect(page.getByTestId('component-detail-tabs')).toBeVisible()
    await expect(page.getByTestId('tabs-state-sheet')).toBeVisible()
    const tabsSheet = page.getByTestId('tabs-state-sheet')
    const intrinsicContainedTabs = tabsSheet.locator(
      '[data-contained-tabs-layout="intrinsic"]'
    )
    const fullContainedTabs = tabsSheet.locator(
      '[data-contained-tabs-layout="full"]'
    )
    await expect(intrinsicContainedTabs).toHaveCount(2)
    await expect(fullContainedTabs).toHaveCount(1)
    const fullTabsWidths = await fullContainedTabs.evaluateAll((tracks) =>
      tracks.map((track) => {
        const parent = track.parentElement
        const itemWidths = Array.from(track.children).map(
          (item) => item.getBoundingClientRect().width
        )

        return {
          parentWidth: parent?.getBoundingClientRect().width ?? 0,
          trackWidth: track.getBoundingClientRect().width,
          itemWidths,
        }
      })
    )
    for (const tabsWidths of fullTabsWidths) {
      expect(tabsWidths.trackWidth).toBeCloseTo(tabsWidths.parentWidth, 0)
      expect(tabsWidths.itemWidths.every((width) => width > 0)).toBe(true)
    }
    await expect(page.getByTestId('component-output-missing')).toHaveCount(0)

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
    await expect(
      currentReview.locator(
        'a[href="/internal/design-system/components/product-navigation"]'
      )
    ).toHaveCount(1)
    await expect(currentReview.locator('a')).toHaveCount(1)

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
    test.slow()

    const expectDelivery = async (
      component: string,
      implementation: 'specimen' | 'reusable-recipe' | 'canonical-candidate',
      designAuthority: 'exploratory' | 'current-baseline'
    ) => {
      await page.goto(`/internal/design-system/components/${component}`)
      const delivery = page.getByTestId('component-delivery-status')
      await expect(delivery).toHaveAttribute(
        'data-implementation-status',
        implementation
      )
      await expect(delivery).toHaveAttribute('data-adoption-status', 'none')
      await expect(page.locator('[data-design-authority]')).toHaveAttribute(
        'data-design-authority',
        designAuthority
      )
    }

    await expectDelivery(
      'entity-identity',
      'canonical-candidate',
      'current-baseline'
    )
    await expect(
      page.getByTestId('component-review-readiness')
    ).toHaveAttribute('data-review-readiness', 'ready')
    await expectDelivery('metric', 'canonical-candidate', 'current-baseline')
    await expectDelivery('input', 'canonical-candidate', 'current-baseline')
    await expect(
      page.getByTestId('component-review-readiness')
    ).toHaveAttribute('data-review-readiness', 'ready')
    await expectDelivery(
      'radio-group',
      'canonical-candidate',
      'current-baseline'
    )
    await expect(
      page.getByTestId('component-review-readiness')
    ).toHaveAttribute('data-review-readiness', 'ready')
    await expectDelivery('table', 'specimen', 'exploratory')
    await expect(
      page.getByTestId('component-review-readiness')
    ).toHaveAttribute('data-review-readiness', 'provisional')
    await expectDelivery('dialog', 'canonical-candidate', 'current-baseline')
    await expectDelivery('empty-state', 'canonical-candidate', 'exploratory')
    await expect(page.getByTestId('canonical-button')).toHaveCount(2)
    await expect(page.getByTestId('canonical-button').first()).toHaveCSS(
      'height',
      '44px'
    )

    await expectDelivery('button', 'canonical-candidate', 'current-baseline')
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

    await expectDelivery('checkbox', 'canonical-candidate', 'current-baseline')
    await expect(page.getByTestId('checkbox-state-sheet')).toBeVisible()
    await expect(page.getByTestId('canonical-checkbox')).toHaveCount(6)

    await expectDelivery(
      'icon-button',
      'canonical-candidate',
      'current-baseline'
    )
    await expect(page.getByTestId('icon-button-state-sheet')).toBeVisible()
    await expect(page.getByTestId('canonical-icon-button')).toHaveCount(6)

    await expectDelivery('dialog', 'canonical-candidate', 'current-baseline')
    await expect(page.getByTestId('dialog-state-sheet')).toBeVisible()
    await page.getByRole('button', { name: 'Open eligibility dialog' }).click()
    await expect(page.getByTestId('canonical-dialog-content')).toBeVisible()
    const dialogContent = page.getByTestId('canonical-dialog-content')
    const passiveIcon = dialogContent.getByTestId('eligibility-passive-icon')
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
    const jurisdictionViewport = dialogContent.getByTestId(
      'jurisdiction-scroll-viewport'
    )
    await expect(jurisdictionViewport).toBeVisible()
    await expect(
      dialogContent.getByTestId('jurisdiction-scroll-fade')
    ).toBeVisible()
    await jurisdictionViewport.evaluate((node) => {
      node.scrollTop = node.scrollHeight
      node.dispatchEvent(new Event('scroll'))
    })
    await expect(
      dialogContent.getByTestId('jurisdiction-scroll-fade')
    ).toHaveCount(0)
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

    await expectDelivery('tabs', 'canonical-candidate', 'current-baseline')
    await expect(page.getByTestId('tabs-state-sheet')).toBeVisible()
    await expect(page.getByTestId('component-output-missing')).toHaveCount(0)
    await expect(page.getByLabel('compact intrinsic basket view')).toHaveCSS(
      'height',
      '32px'
    )
    await expect(page.getByLabel('compact intrinsic basket view')).toHaveCSS(
      'column-gap',
      '2px'
    )
    await expect(page.getByLabel('default intrinsic basket view')).toHaveCSS(
      'height',
      '44px'
    )
    await expect(page.getByLabel('default intrinsic basket view')).toHaveCSS(
      'column-gap',
      '2px'
    )
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
    await expect(
      sheet.getByText('Canonical V1 candidate', { exact: true })
    ).toBeVisible()
    await expect(
      sheet.getByText('Provisional component', { exact: true })
    ).toHaveCount(0)

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

  test('preserves the Home feature card while reviewing only foundation corrections', async ({
    page,
  }) => {
    await page.goto('/internal/design-system/components/card')

    const review = page.getByTestId('card-content-region-review')
    const homeSource = page.getByTestId('home-feature-card-source')
    const discoverSource = page.getByTestId('discover-feature-card-source')
    const card = homeSource.locator(':scope > a')

    await expect(review).toBeVisible()
    await expect(page.getByTestId('component-output-missing')).toHaveCount(0)
    await expect(
      review.getByText('Home feature card foundation alignment', {
        exact: true,
      })
    ).toBeVisible()
    await expect(
      review.getByText('Primary evidence · Home featured card', { exact: true })
    ).toBeVisible()
    await expect(
      review.getByText('Supporting evidence · Discover compact adaptation', {
        exact: true,
      })
    ).toBeVisible()
    await expect(homeSource.locator('.h-52')).toHaveCount(2)
    await expect(homeSource).toHaveAttribute('data-source-point-count', '188')
    const launchMarker = homeSource.getByTestId('feature-card-launch-marker')
    const launchLine = homeSource.getByTestId('feature-card-launch-line')
    await expect(launchMarker).toBeVisible()
    await launchMarker.hover()
    await expect(homeSource.getByTestId('feature-card-launch-label')).toHaveCSS(
      'opacity',
      '1'
    )
    if ((page.viewportSize()?.width ?? 0) >= 1024) {
      await expect(launchLine).toHaveCSS('background-image', 'none')
    } else {
      await expect(launchLine).not.toHaveCSS('background-image', 'none')
    }
    await expect(discoverSource.locator('.h-52')).toHaveCount(0)
    await expect(card).toHaveCSS('border-radius', '0px')
    await expect(card).toHaveCSS('gap', '8px')
    await expect(card).toHaveCSS('padding-top', '8px')
    await expect(card).toHaveCSS('padding-right', '8px')
    await expect(card).toHaveCSS('padding-bottom', '8px')
    await expect(card).toHaveCSS('padding-left', '8px')
    await expect(card.locator(':scope > div').first()).toHaveCSS(
      'border-radius',
      '8px'
    )
    const contentHeader = card
      .locator(':scope > div')
      .first()
      .locator(':scope > div')
      .first()
    const logo = contentHeader
      .locator(':scope > div')
      .first()
      .locator(':scope > div')
      .first()
    const title = contentHeader
      .locator('[data-feature-card-title-slot]')
      .locator('h3')
    const marketRow = contentHeader.locator('[data-feature-card-market-row]')
    const discoverCard = discoverSource.locator(':scope > div > a')
    const discoverContentHeader = discoverCard
      .locator(':scope > div')
      .first()
      .locator(':scope > div')
      .first()
    const discoverTopRow = discoverContentHeader.locator(':scope > div').first()
    const discoverTitle = discoverContentHeader
      .locator('[data-feature-card-title-slot]')
      .locator('h3')
    const discoverMarketRow = discoverContentHeader.locator(
      '[data-feature-card-market-row]'
    )
    const homeSupportingRow = homeSource.locator(
      '[data-feature-card-supporting-row]'
    )
    const discoverSupportingRow = discoverSource.locator(
      '[data-feature-card-supporting-row]'
    )
    await expect(contentHeader).toHaveCSS('gap', '16px')
    await expect(contentHeader).toHaveCSS('padding-top', '24px')
    const logoBox = await logo.boundingBox()
    const titleBox = await title.boundingBox()
    const marketRowBox = await marketRow.boundingBox()
    expect(logoBox).not.toBeNull()
    expect(titleBox).not.toBeNull()
    expect(marketRowBox).not.toBeNull()
    expect(Math.round(titleBox!.y - (logoBox!.y + logoBox!.height))).toBe(16)
    expect(Math.round(marketRowBox!.y - (titleBox!.y + titleBox!.height))).toBe(
      8
    )
    const discoverTopRowBox = await discoverTopRow.boundingBox()
    const discoverTitleBox = await discoverTitle.boundingBox()
    const discoverMarketRowBox = await discoverMarketRow.boundingBox()
    expect(discoverTopRowBox).not.toBeNull()
    expect(discoverTitleBox).not.toBeNull()
    expect(discoverMarketRowBox).not.toBeNull()
    expect(
      Math.round(
        discoverTitleBox!.y - (discoverTopRowBox!.y + discoverTopRowBox!.height)
      )
    ).toBe(16)
    expect(
      Math.round(
        discoverMarketRowBox!.y -
          (discoverTitleBox!.y + discoverTitleBox!.height)
      )
    ).toBe(8)
    await expect(homeSupportingRow).toHaveCSS('padding-left', '24px')
    await expect(homeSupportingRow).toHaveCSS('padding-right', '24px')
    await expect(discoverSupportingRow).toHaveCSS('padding-left', '24px')
    await expect(discoverSupportingRow).toHaveCSS('padding-right', '24px')
    await expect(contentHeader).toHaveCSS('padding-right', '24px')
    await expect(contentHeader).toHaveCSS('padding-bottom', '24px')
    await expect(contentHeader).toHaveCSS('padding-left', '24px')
    await expect(review.getByText('Review only this delta')).toBeVisible()
    await expect(review.getByText('Preservation contract')).toBeVisible()
    await expect(review.getByText('What acceptance records')).toBeVisible()
    await expect(review.getByText('Already resolved')).toBeVisible()
    await expect(review.getByText('Leave for later')).toBeVisible()
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

  test('keeps mounted transaction geometry stable across lifecycle changes', async ({
    page,
  }) => {
    await page.goto(
      '/internal/design-system/components/transaction-action#transaction-truth-spectrum'
    )

    const composition = page.getByTestId('transaction-composition-rfq')
    const shell = composition.getByTestId('zapper-shell')
    const amountPair = composition.getByTestId('transaction-amount-pair')
    const details = composition.getByTestId('zapper-quote-details')
    const measure = async (locator: typeof shell) => {
      const box = await locator.boundingBox()
      expect(box).not.toBeNull()
      return box!
    }

    await composition
      .getByTestId('transaction-composition-rfq-state-group-0-option-2')
      .click()
    const reviewShell = await measure(shell)
    const reviewAmountPair = await measure(amountPair)
    const reviewDetails = await measure(details)

    await composition
      .getByTestId('transaction-composition-rfq-state-group-0-option-1')
      .click()
    await expect(
      composition.getByTestId('zapper-quote-animation')
    ).toBeVisible()
    const searchShell = await measure(shell)
    const searchAmountPair = await measure(amountPair)
    const searchDetails = await measure(details)

    expect(
      Math.abs(searchShell.height - reviewShell.height)
    ).toBeLessThanOrEqual(1)
    expect(Math.abs(searchShell.x - reviewShell.x)).toBeLessThanOrEqual(1)
    expect(
      Math.abs(searchAmountPair.height - reviewAmountPair.height)
    ).toBeLessThanOrEqual(1)
    expect(
      Math.abs(searchDetails.height - reviewDetails.height)
    ).toBeLessThanOrEqual(1)

    await composition
      .getByTestId('transaction-composition-rfq-state-group-0-option-7')
      .click()
    const outcomeShell = await measure(shell)
    expect(outcomeShell.height).toBeGreaterThanOrEqual(reviewShell.height - 1)

    await composition
      .getByTestId('transaction-composition-rfq-state-group-2-option-0')
      .click()
    const attachedOutcome = await measure(
      composition.getByTestId('zapper-outcome-composition')
    )
    expect(attachedOutcome.height).toBeGreaterThanOrEqual(
      reviewShell.height - 1
    )
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  })

  test('keeps transaction task hierarchy readable at the narrow phone boundary', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.goto(
      '/internal/design-system/components/transaction-action#transaction-truth-spectrum'
    )

    const fitsOwnWidth = async (locator: ReturnType<typeof page.locator>) => {
      expect(
        await locator.evaluate(
          (element) => element.scrollWidth <= element.clientWidth + 1
        )
      ).toBe(true)
    }
    const expectBottomAttachedFullWidth = async (
      composition: ReturnType<typeof page.locator>
    ) => {
      const layerBox = await composition
        .getByTestId('transaction-contained-modal-layer')
        .boundingBox()
      const surfaceBox = await composition
        .getByTestId('canonical-dialog-surface')
        .boundingBox()
      expect(layerBox).not.toBeNull()
      expect(surfaceBox).not.toBeNull()
      expect(Math.abs(surfaceBox!.x - layerBox!.x)).toBeLessThanOrEqual(1)
      expect(Math.abs(surfaceBox!.width - layerBox!.width)).toBeLessThanOrEqual(
        1
      )
      expect(
        Math.abs(
          surfaceBox!.y + surfaceBox!.height - (layerBox!.y + layerBox!.height)
        )
      ).toBeLessThanOrEqual(1)
    }

    const rfq = page.getByTestId('transaction-composition-rfq')
    await rfq.getByRole('radio', { name: 'Review', exact: true }).click()
    const rfqStage = rfq.getByTestId('transaction-composition-rfq-stage')
    const rfqShell = rfq.getByTestId('zapper-shell')
    const rfqStageBox = await rfqStage.boundingBox()
    const rfqShellBox = await rfqShell.boundingBox()
    expect(rfqStageBox).not.toBeNull()
    expect(rfqShellBox).not.toBeNull()
    expect(Math.abs(rfqShellBox!.x - rfqStageBox!.x)).toBeLessThanOrEqual(1)
    expect(
      Math.abs(rfqShellBox!.width - rfqStageBox!.width)
    ).toBeLessThanOrEqual(1)
    expect(
      Math.abs(
        rfqShellBox!.y +
          rfqShellBox!.height -
          (rfqStageBox!.y + rfqStageBox!.height)
      )
    ).toBeLessThanOrEqual(1)
    await fitsOwnWidth(rfq.getByRole('textbox', { name: 'You use amount' }))
    await fitsOwnWidth(rfq.getByText('≈990.00', { exact: true }))
    await fitsOwnWidth(
      rfq.getByTestId('transaction-amount-asset-identity').last()
    )

    await rfq
      .getByRole('radio', { name: 'Route selection', exact: true })
      .click()
    const quoteMetaRow = rfq.getByTestId('zapper-selectable-quote-meta-row')
    const quoteMeta = rfq.getByTestId('zapper-selectable-quote-meta')
    const narrowQuoteMetaBox = await quoteMeta.boundingBox()
    const slippageMetaBox = await rfq
      .getByTestId('zapper-slippage-meta')
      .boundingBox()
    const routeMetaBox = await rfq
      .getByTestId('zapper-selectable-route-meta')
      .boundingBox()
    await expect(quoteMetaRow).toHaveCSS('flex-direction', 'column')
    expect(slippageMetaBox).not.toBeNull()
    expect(routeMetaBox).not.toBeNull()
    expect(narrowQuoteMetaBox).not.toBeNull()
    expect(slippageMetaBox!.y - narrowQuoteMetaBox!.y).toBe(12)
    expect(Math.abs(slippageMetaBox!.x - routeMetaBox!.x)).toBeLessThanOrEqual(
      1
    )
    expect(
      Math.abs(slippageMetaBox!.width - routeMetaBox!.width)
    ).toBeLessThanOrEqual(1)
    expect(routeMetaBox!.y).toBeGreaterThanOrEqual(
      slippageMetaBox!.y + slippageMetaBox!.height - 1
    )

    const routeOutput = rfq
      .getByText('Projected proceeds')
      .locator('xpath=ancestor::*[@data-testid="transaction-amount-object"]')
    const routeSupportingValue = routeOutput
      .getByTestId('transaction-amount-supporting-row')
      .locator(':scope > span')
      .first()
    const routeSupportingBalance = routeOutput
      .getByTestId('transaction-amount-supporting-row')
      .locator(':scope > span')
      .nth(1)
    const routeSupportingValueBox = await routeSupportingValue.boundingBox()
    const routeSupportingBalanceBox = await routeSupportingBalance.boundingBox()
    expect(routeSupportingValueBox).not.toBeNull()
    expect(routeSupportingBalanceBox).not.toBeNull()
    expect(
      Math.abs(routeSupportingValueBox!.y - routeSupportingBalanceBox!.y)
    ).toBeLessThanOrEqual(1)
    await expect(routeSupportingBalance).toContainText('After fees')

    await rfq
      .getByRole('radio', { name: 'Capacity advisory', exact: true })
      .click()
    await fitsOwnWidth(rfq.getByText('≈247,500.00', { exact: true }))
    await rfq
      .getByRole('radio', { name: 'Route selection', exact: true })
      .click()

    await page.setViewportSize({ width: 390, height: 900 })
    const amountObjects = rfq.getByTestId('transaction-amount-object')
    const inputAmountBox = await amountObjects.first().boundingBox()
    const outputAmount = amountObjects.nth(1)
    const outputAmountBox = await outputAmount.boundingBox()
    const directionBox = await rfq
      .getByRole('button', { name: 'Swap input and output assets' })
      .boundingBox()
    const outputPrimaryRowBox = await outputAmount
      .getByTestId('transaction-amount-primary-row')
      .boundingBox()
    const outputValueBox = await outputAmount
      .getByTestId('transaction-amount-supporting-row')
      .locator(':scope > span')
      .first()
      .boundingBox()
    expect(inputAmountBox).not.toBeNull()
    expect(outputAmountBox).not.toBeNull()
    expect(directionBox).not.toBeNull()
    expect(outputPrimaryRowBox).not.toBeNull()
    expect(outputValueBox).not.toBeNull()
    const amountSeam =
      (inputAmountBox!.y + inputAmountBox!.height + outputAmountBox!.y) / 2
    expect(
      Math.abs(directionBox!.y + directionBox!.height / 2 - amountSeam)
    ).toBeLessThanOrEqual(1)
    expect(
      outputValueBox!.y - (outputPrimaryRowBox!.y + outputPrimaryRowBox!.height)
    ).toBeLessThanOrEqual(5)
    await page.setViewportSize({ width: 464, height: 900 })
    const responsiveStack = rfq.getByTestId('zapper-review-stack')
    await expect(responsiveStack).toHaveCSS('container-type', 'inline-size')
    const responsiveStackBox = await responsiveStack.boundingBox()
    expect(responsiveStackBox).not.toBeNull()
    expect(responsiveStackBox!.width).toBeGreaterThanOrEqual(408)
    await expect(quoteMetaRow).toHaveCSS('flex-direction', 'row')
    await fitsOwnWidth(quoteMetaRow)
    const wideSlippageMetaBox = await rfq
      .getByTestId('zapper-slippage-meta')
      .boundingBox()
    const wideQuoteMetaBox = await quoteMeta.boundingBox()
    const wideRouteMetaBox = await rfq
      .getByTestId('zapper-selectable-route-meta')
      .boundingBox()
    expect(wideSlippageMetaBox).not.toBeNull()
    expect(wideRouteMetaBox).not.toBeNull()
    expect(wideQuoteMetaBox).not.toBeNull()
    expect(wideSlippageMetaBox!.y - wideQuoteMetaBox!.y).toBe(8)
    expect(
      Math.abs(wideSlippageMetaBox!.y - wideRouteMetaBox!.y)
    ).toBeLessThanOrEqual(1)
    await page.setViewportSize({ width: 640, height: 900 })
    await expect(rfqStage).toHaveCSS('align-items', 'center')
    await page.setViewportSize({ width: 320, height: 900 })

    await rfq.getByRole('radio', { name: 'RFQ outcome', exact: true }).click()
    const outcomeUnit = rfq.getByTestId('transaction-amount-unit')
    await expect(outcomeUnit).toHaveText('CMC20')
    await fitsOwnWidth(outcomeUnit.locator('..'))

    const voteLock = page.getByTestId('transaction-composition-vote-lock')
    await voteLock
      .getByRole('radio', { name: 'Delegate ready', exact: true })
      .click()
    await fitsOwnWidth(
      voteLock.getByRole('group', { name: 'Vote-lock task mode' })
    )
    await expectBottomAttachedFullWidth(voteLock)

    const stake = page.getByTestId('transaction-composition-stake')
    await stake
      .getByRole('radio', { name: 'Delegate ready', exact: true })
      .click()
    await fitsOwnWidth(stake.getByRole('group', { name: 'Staking task mode' }))
    await expectBottomAttachedFullWidth(stake)

    const staged = page.getByTestId('transaction-composition-staged')
    await staged
      .getByRole('radio', { name: 'Orders filling', exact: true })
      .click()
    await fitsOwnWidth(
      staged
        .getByTestId('automated-mint-collateral-stage')
        .getByText('1 order open · expires in 1m 42s', {
          exact: true,
        })
    )
    await fitsOwnWidth(
      staged.getByText('Estimated output · ≈$9,982.00 · Upcoming', {
        exact: true,
      })
    )
    await expect(staged.getByTestId('staged-order-row')).toHaveCount(0)
    await expect(
      staged.getByRole('button', { name: 'View orders' })
    ).toBeVisible()
    await staged.getByRole('button', { name: 'View orders' }).click()
    await expect(staged.getByTestId('staged-orders-header')).toHaveCSS(
      'flex-direction',
      'column'
    )
    await fitsOwnWidth(staged.getByTestId('staged-orders-header'))
    await expect(
      staged.getByText('1 order open · expires in 1m 42s')
    ).toHaveCount(1)
    await fitsOwnWidth(staged.getByTestId('staged-order-direction').first())

    await page.setViewportSize({ width: 1023, height: 900 })
    const constrainedWorkspace = await staged
      .getByTestId('automated-mint-workspace-sections')
      .boundingBox()
    expect(constrainedWorkspace).not.toBeNull()
    expect(constrainedWorkspace!.width).toBeLessThanOrEqual(640)

    await page.setViewportSize({ width: 1024, height: 900 })
    const taskColumn = await staged
      .getByTestId('automated-mint-task')
      .boundingBox()
    const ordersColumn = await staged
      .getByTestId('automated-mint-orders')
      .boundingBox()
    expect(taskColumn).not.toBeNull()
    expect(ordersColumn).not.toBeNull()
    expect(Math.abs(taskColumn!.y - ordersColumn!.y)).toBeLessThanOrEqual(1)
    expect(ordersColumn!.x).toBeGreaterThan(taskColumn!.x)
  })

  test('keeps every reviewed transaction state inside the narrow phone viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.goto(
      '/internal/design-system/components/transaction-action#transaction-truth-spectrum'
    )

    for (const family of ['rfq', 'staged', 'stake', 'vote-lock']) {
      const composition = page.getByTestId(`transaction-composition-${family}`)
      const options = composition.locator(
        `[data-testid^="transaction-composition-${family}-state-group-"][data-testid*="-option-"]`
      )
      const stage = composition.getByTestId(
        `transaction-composition-${family}-stage`
      )

      for (let index = 0; index < (await options.count()); index += 1) {
        await options.nth(index).click()
        expect(
          await stage.evaluate(
            (element) => element.scrollWidth - element.clientWidth
          )
        ).toBeLessThanOrEqual(1)
      }
    }
  })

  test('keeps the global assistant launcher out of design-system reviews', async ({
    page,
  }) => {
    await page.goto(
      '/internal/design-system/components/transaction-action#transaction-truth-spectrum'
    )
    await expect(page.getByTestId('transaction-composition-rfq')).toBeVisible()
    await expect(page.getByTestId('reserve-chat-launcher')).toHaveCount(0)
  })

  test('keeps the automated mint workspace truthful at desktop and constrained widths', async ({
    page,
  }) => {
    if (test.info().project.name === 'design-system-mobile') {
      await page.setViewportSize({ width: 390, height: 844 })
    }
    await page.goto(
      '/internal/design-system/components/transaction-action#transaction-truth-spectrum'
    )

    const composition = page.getByTestId('transaction-composition-staged')
    const chooseState = (group: number, option: number) =>
      composition.getByTestId(
        `transaction-composition-staged-state-group-${group}-option-${option}`
      )

    await chooseState(0, 0).click()
    await expect(
      composition.getByText('Most users should use Swap')
    ).toBeVisible()
    await expect(
      composition
        .getByTestId('automated-mint-introduction-content')
        .getByRole('link', { name: 'Mint directly with basket assets' })
    ).toBeVisible()
    const narrowStage = composition.getByTestId('automated-mint-narrow-stage')
    const compositionStage = composition.getByTestId(
      'transaction-composition-staged-stage'
    )
    const introductionActions = composition
      .getByTestId('automated-mint-introduction-content')
      .getByTestId('canonical-action-group')
    const introductionStageBox = await narrowStage.boundingBox()
    const compositionStageBox = await compositionStage.boundingBox()
    const introductionActionsBox = await introductionActions.boundingBox()
    const introductionProcess = composition
      .getByTestId('automated-mint-introduction-content')
      .getByText('You fund')
      .locator('..')
    const introductionProcessBox = await introductionProcess.boundingBox()
    const continueButtonBox = await composition
      .getByRole('button', { name: 'Continue' })
      .boundingBox()
    expect(introductionStageBox).not.toBeNull()
    expect(compositionStageBox).not.toBeNull()
    expect(introductionActionsBox).not.toBeNull()
    expect(introductionProcessBox).not.toBeNull()
    expect(continueButtonBox).not.toBeNull()
    expect(
      Math.abs(introductionActionsBox!.x - introductionStageBox!.x - 8)
    ).toBeLessThanOrEqual(1)
    expect(
      Math.abs(
        introductionStageBox!.x +
          introductionStageBox!.width -
          introductionActionsBox!.x -
          introductionActionsBox!.width -
          8
      )
    ).toBeLessThanOrEqual(1)
    expect(
      Math.abs(
        introductionStageBox!.y +
          introductionStageBox!.height -
          introductionActionsBox!.y -
          introductionActionsBox!.height -
          8
      )
    ).toBeLessThanOrEqual(1)
    expect(
      continueButtonBox!.y -
        introductionProcessBox!.y -
        introductionProcessBox!.height
    ).toBeGreaterThanOrEqual(20)
    expect(
      await introductionProcess.evaluate(
        (element) => element.scrollWidth - element.clientWidth
      )
    ).toBeLessThanOrEqual(0)
    if (test.info().project.name === 'design-system-mobile') {
      expect(
        Math.abs(introductionStageBox!.x - compositionStageBox!.x)
      ).toBeLessThanOrEqual(1)
      expect(
        Math.abs(introductionStageBox!.width - compositionStageBox!.width)
      ).toBeLessThanOrEqual(1)
      expect(introductionStageBox!.height).toBeGreaterThanOrEqual(
        page.viewportSize()!.height - 56
      )
    }
    await composition.getByRole('button', { name: 'Continue' }).click()
    await expect(composition.getByText('Smart Account Required')).toBeVisible()
    await expect(
      composition.getByRole('button', { name: 'Connect Wallet' })
    ).toBeVisible()
    const walletActions = composition
      .getByTestId('automated-mint-wallet-requirement-content')
      .getByTestId('canonical-action-group')
    const walletStageBox = await narrowStage.boundingBox()
    const walletSurfaceBox = await composition
      .getByTestId('automated-mint-wallet-requirement')
      .boundingBox()
    const walletActionsBox = await walletActions.boundingBox()
    expect(walletStageBox).not.toBeNull()
    expect(walletSurfaceBox).not.toBeNull()
    expect(walletActionsBox).not.toBeNull()
    expect(
      Math.abs(walletActionsBox!.x - walletStageBox!.x - 8)
    ).toBeLessThanOrEqual(1)
    expect(
      Math.abs(
        walletStageBox!.x +
          walletStageBox!.width -
          walletActionsBox!.x -
          walletActionsBox!.width -
          8
      )
    ).toBeLessThanOrEqual(1)
    expect(
      Math.abs(walletStageBox!.height - introductionStageBox!.height)
    ).toBeLessThanOrEqual(1)
    if (test.info().project.name === 'design-system-mobile') {
      expect(
        Math.abs(walletSurfaceBox!.x - compositionStageBox!.x)
      ).toBeLessThanOrEqual(1)
      expect(
        Math.abs(walletSurfaceBox!.width - compositionStageBox!.width)
      ).toBeLessThanOrEqual(1)
    }
    await chooseState(0, 2).click()
    await expect(
      composition
        .getByTestId('automated-mint-wallet-requirement')
        .getByText('Incompatible wallet')
    ).toBeVisible()
    const incompatibleStageBox = await narrowStage.boundingBox()
    expect(incompatibleStageBox).not.toBeNull()
    expect(
      Math.abs(incompatibleStageBox!.height - introductionStageBox!.height)
    ).toBeLessThanOrEqual(1)
    await chooseState(0, 3).click()
    await expect(
      composition.getByTestId('automated-configure-step-content')
    ).toHaveCount(3)
    const configureSurface = composition.getByTestId(
      'automated-mint-configure-surface'
    )
    const configureSurfaceBox = await configureSurface.boundingBox()
    expect(configureSurfaceBox).not.toBeNull()
    if (test.info().project.name === 'design-system-mobile') {
      expect(
        Math.abs(configureSurfaceBox!.x - compositionStageBox!.x)
      ).toBeLessThanOrEqual(1)
      expect(
        Math.abs(configureSurfaceBox!.width - compositionStageBox!.width)
      ).toBeLessThanOrEqual(1)
      expect(
        Math.abs(configureSurfaceBox!.height - introductionStageBox!.height)
      ).toBeLessThanOrEqual(1)
    }
    await expect(
      configureSurface
        .getByTestId('automated-mint-configure-active')
        .getByRole('link', { name: 'Switch to manual minting' })
    ).toBeVisible()
    await expect(
      configureSurface.getByRole('radio', { name: 'Mint', exact: true })
    ).toBeChecked()
    await expect(
      configureSurface.getByRole('radio', { name: 'Redeem', exact: true })
    ).toBeEnabled()
    await expect(
      composition.getByTestId('automated-mint-configure-frame')
    ).toHaveClass(/ring-2/)
    const upcomingSteps = composition.getByTestId(
      'automated-mint-configure-upcoming'
    )
    const upcomingStepsBox = await upcomingSteps.boundingBox()
    const firstUpcomingStepBox = await upcomingSteps
      .getByTestId('automated-configure-step-content')
      .first()
      .boundingBox()
    expect(upcomingStepsBox).not.toBeNull()
    expect(firstUpcomingStepBox).not.toBeNull()
    expect(firstUpcomingStepBox!.y - upcomingStepsBox!.y).toBe(24)
    await expect(
      composition
        .getByTestId('automated-mint-configure-frame')
        .getByText('1', { exact: true })
    ).toHaveCount(0)
    await expect(
      composition.getByTestId('automated-mint-workspace')
    ).toHaveCount(0)

    const amountInput = composition.locator('input[inputmode="decimal"]')
    await amountInput.fill('15,000')
    await expect(
      composition.getByTestId('automated-mint-balance-error')
    ).toHaveText('Exceeds available balance')
    await expect(
      composition.getByTestId('automated-mint-get-quote')
    ).toBeEnabled()
    await composition.getByTestId('automated-mint-get-quote').click()
    await chooseState(1, 3).click()
    await expect(composition.getByTestId('automated-mint-start')).toBeDisabled()

    await chooseState(0, 3).click()
    await amountInput.fill('5,000.25')
    await composition.getByTestId('automated-mint-get-quote').click()
    await expect(
      composition.getByTestId('automated-mint-workspace')
    ).toBeVisible()

    await chooseState(1, 3).click()
    await chooseState(2, 2).click()
    await expect(
      composition.getByTestId('automated-mint-applied-collateral')
    ).toHaveCount(0)

    await chooseState(1, 4).click()
    await expect(
      composition.getByRole('region', { name: 'Automated mint task' })
    ).toBeVisible()
    if (test.info().project.name !== 'design-system-desktop') {
      await expect(composition.getByTestId('staged-order-row')).toHaveCount(0)
      await composition.getByRole('button', { name: 'View orders' }).click()
    }
    await expect(
      composition.getByTestId('automated-mint-existing-collateral-assets')
    ).toBeVisible()
    await expect(
      composition.getByTestId('automated-mint-applied-collateral')
    ).toHaveCount(0)
    await expect(
      composition.getByText('Basket tokens in your wallet')
    ).toHaveCount(0)
    await expect(composition.getByTestId('staged-order-row')).toHaveCount(5)
    await expect(
      composition.getByText('Quote ready', { exact: true })
    ).toHaveCount(0)
    await expect(composition.getByText('CoW Protocol order')).toHaveCount(0)
    expect(
      await composition
        .getByTestId('automated-mint-orders-scroll')
        .evaluate((element) => element.scrollTop)
    ).toBe(0)

    await composition.getByTestId('automated-mint-start').click()
    await expect(
      composition.getByTestId('automated-mint-existing-collateral-assets')
    ).toBeVisible()
    await expect(composition.locator('[data-order-asset="WBTC"]')).toBeVisible()
    await expect(
      composition.getByTestId('automated-mint-applied-collateral')
    ).toHaveCount(0)

    const taskBox = await composition
      .getByTestId('automated-mint-task')
      .boundingBox()
    const ordersBox = await composition
      .getByTestId('automated-mint-orders')
      .boundingBox()
    const workspaceBox = await composition
      .getByTestId('automated-mint-workspace')
      .boundingBox()
    const stageBox = await composition
      .getByTestId('transaction-composition-staged-stage')
      .boundingBox()
    expect(taskBox).not.toBeNull()
    expect(ordersBox).not.toBeNull()
    expect(workspaceBox).not.toBeNull()
    expect(stageBox).not.toBeNull()

    if (test.info().project.name === 'design-system-desktop') {
      expect(Math.abs(taskBox!.y - ordersBox!.y)).toBeLessThanOrEqual(1)
      expect(ordersBox!.x).toBeGreaterThan(taskBox!.x)
      expect(Math.abs(taskBox!.height - ordersBox!.height)).toBeLessThanOrEqual(
        1
      )
      expect(workspaceBox!.height).toBe(736)
      expect(workspaceBox!.width).toBe(1200)
      expect(
        Math.abs(
          workspaceBox!.x +
            workspaceBox!.width / 2 -
            (stageBox!.x + stageBox!.width / 2)
        )
      ).toBeLessThanOrEqual(1)
      const taskOverflow = await composition
        .getByTestId('automated-mint-task')
        .evaluate((element) => element.scrollHeight - element.clientHeight)
      expect(taskOverflow).toBeLessThanOrEqual(0)
      await expect(composition.getByTestId('automated-mint-task')).toHaveCSS(
        'box-shadow',
        'none'
      )
      await expect(
        composition.getByTestId('automated-mint-orders-scroll')
      ).toHaveCSS('overflow-y', 'auto')
    } else {
      expect(ordersBox!.y).toBeGreaterThanOrEqual(taskBox!.y + taskBox!.height)
      expect(Math.abs(ordersBox!.x - taskBox!.x)).toBeLessThanOrEqual(1)
    }

    await chooseState(2, 2).click()
    await expect(
      composition.locator('[data-order-status="Filled"]')
    ).toHaveCount(4)
    await expect(
      composition.locator('[data-order-status="Expired"]')
    ).toHaveCount(1)
    await expect(composition.getByTestId('staged-order-metadata')).toHaveCount(
      5
    )
    await expect(
      composition.getByTestId('staged-order-metadata').first()
    ).toContainText('Filled')
    await expect(
      composition.getByTestId('staged-order-metadata').first()
    ).toContainText('View order')
    await expect(
      composition.getByTestId('automated-mint-existing-collateral-assets')
    ).toBeVisible()

    await composition.getByTestId('automated-mint-retry-failed').click()
    await expect(
      composition.getByTestId('automated-mint-existing-collateral-assets')
    ).toBeVisible()
    await expect(composition.locator('[data-order-asset="WBTC"]')).toBeVisible()

    await chooseState(2, 3).click()
    await expect(composition.getByTestId('automated-mint-outcome')).toHaveCount(
      0
    )

    await chooseState(3, 0).click()
    await expect(
      composition.getByTestId('automated-mint-outcome')
    ).toBeVisible()
    if (test.info().project.name === 'design-system-desktop') {
      const outcomeWorkspaceBox = await composition
        .getByTestId('automated-mint-workspace')
        .boundingBox()
      expect(outcomeWorkspaceBox?.height).toBe(workspaceBox!.height)
      const outcomeOverflow = await composition
        .getByTestId('automated-mint-outcome')
        .evaluate((element) => element.scrollHeight - element.clientHeight)
      expect(outcomeOverflow).toBeLessThanOrEqual(0)
    }
    await expect(
      composition.getByTestId('automated-mint-final-transaction')
    ).toHaveCount(0)
    await expect(
      composition.getByTestId('automated-mint-view-transaction')
    ).toHaveAttribute(
      'href',
      'https://basescan.org/tx/0x4b9956225163659ad723853515456526280c1e9cc5b842c3df1b9c7443bb01ae'
    )
    await expect(
      composition.locator('a[href^="https://explorer.cow.fi/orders/0x"]')
    ).toHaveCount(5)
    for (const href of await composition
      .locator('a[href^="https://explorer.cow.fi/orders/0x"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
      expect(href).toMatch(
        /^https:\/\/explorer\.cow\.fi\/orders\/0x[0-9a-f]{112}$/
      )
    }

    await expect(
      composition.getByTestId('automated-mint-view-dtf')
    ).toHaveAttribute(
      'href',
      '/base/index-dtf/0xa0a8481fc246cd12f75227abb96220ff5360fad3/overview'
    )
    if (test.info().project.name === 'design-system-desktop') {
      const workspaceStates: Array<[number, number]> = [
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [3, 0],
      ]

      for (const [group, option] of workspaceStates) {
        await chooseState(group, option).click()
        const workspace = composition.getByTestId('automated-mint-workspace')
        await expect(workspace).toHaveCSS('height', '736px')
        const leftColumn = composition.locator(
          '[data-testid="automated-mint-task"], [data-testid="automated-mint-outcome"]'
        )
        const overflow = await leftColumn.evaluate(
          (element) => element.scrollHeight - element.clientHeight
        )
        expect(overflow).toBeLessThanOrEqual(0)
      }
    }
    await expect(composition.getByTestId('automated-mint-new')).toHaveCount(0)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  })

  test('keeps automated redeem on the shared issuance structure', async ({
    page,
  }) => {
    await page.goto(
      '/internal/design-system/components/transaction-action#transaction-composition-staged'
    )

    const composition = page.getByTestId('transaction-composition-staged')
    const chooseState = (group: number, option: number) =>
      composition.getByTestId(
        `transaction-composition-staged-state-group-${group}-option-${option}`
      )

    await chooseState(0, 3).click()
    await composition.getByTestId('automated-issuance-operation-redeem').click()
    await composition
      .getByTestId('automated-issuance-configure-amount')
      .locator('input')
      .fill('100')
    await composition.getByTestId('automated-mint-get-quote').click()
    await chooseState(1, 4).click()

    await expect(
      composition.getByTestId('automated-mint-task')
    ).toHaveAttribute('aria-label', 'Automated redeem task')
    if (test.info().project.name !== 'design-system-desktop') {
      await composition.getByTestId('automated-issuance-orders-toggle').click()
    }
    await expect(composition.getByTestId('staged-order-row')).toHaveCount(5)
    await expect(
      composition.getByTestId('staged-order-sell').first()
    ).toContainText('WBTC')
    await expect(
      composition.getByTestId('staged-order-buy').first()
    ).toContainText('USDC')

    await composition.getByTestId('automated-mint-start').click()
    await expect(
      composition.getByTestId('automated-mint-collateral-action-region')
    ).toContainText('Confirm redeem in wallet')

    await chooseState(2, 2).click()
    await expect(
      composition.locator('[data-order-status="Filled"]')
    ).toHaveCount(4)
    await expect(
      composition.locator('[data-order-status="Expired"]')
    ).toHaveCount(1)

    await chooseState(3, 1).click()
    await expect(
      composition.getByTestId('automated-mint-outcome')
    ).toBeVisible()
    await expect(composition.getByTestId('transaction-amount-unit')).toHaveText(
      'USDC'
    )
    await expect(
      composition.getByTestId('automated-mint-final-transaction')
    ).toHaveCount(0)
    await expect(
      composition.getByTestId('automated-mint-view-transaction')
    ).toHaveAttribute(
      'href',
      'https://basescan.org/tx/0x7195cb5535dd308cf1c32decb8f787974ff52d9c8a13f70d2e80dad366a4ef2d'
    )
    await expect(
      composition.getByTestId('automated-mint-mint-action-region')
    ).toHaveCount(0)

    await chooseState(1, 5).click()
    await expect(
      composition.getByTestId('automated-mint-input-amount')
    ).toContainText('Existing collateral')
    await expect(composition.getByTestId('staged-order-row')).toHaveCount(2)
  })

  test('keeps mounted Vote Lock relationships aligned across action and submitted states', async ({
    page,
  }) => {
    await page.goto(
      '/internal/design-system/components/transaction-action#transaction-truth-spectrum'
    )

    const composition = page.getByTestId('transaction-composition-vote-lock')
    const chooseLockState = (index: number) =>
      composition.getByTestId(
        `transaction-composition-vote-lock-state-group-0-option-${index}`
      )
    const chooseDelegationState = (index: number) =>
      composition.getByTestId(
        `transaction-composition-vote-lock-state-group-2-option-${index}`
      )
    const acknowledgementGap = async (actionRegionTestId: string) => {
      const control = await composition
        .getByTestId('vote-lock-acknowledgement')
        .getByTestId('canonical-checkbox')
        .boundingBox()
      const action = await composition
        .getByTestId(actionRegionTestId)
        .getByTestId('canonical-button')
        .boundingBox()
      expect(control).not.toBeNull()
      expect(action).not.toBeNull()
      return action!.y - (control!.y + control!.height)
    }

    await chooseLockState(0).click()
    expect(await acknowledgementGap('vote-lock-action-footer')).toBeCloseTo(
      16,
      0
    )

    await chooseLockState(3).click()
    expect(
      await acknowledgementGap('vote-lock-process-button-region')
    ).toBeCloseTo(16, 0)

    await chooseLockState(2).click()
    await expect(
      composition.getByTestId('vote-lock-acknowledgement')
    ).toHaveCount(0)

    await chooseLockState(4).click()
    await expect(
      composition.getByTestId('transaction-amount-pair')
    ).toHaveAttribute('data-task-boundary', 'leading')

    for (const stateIndex of [7, 8]) {
      await chooseDelegationState(stateIndex).click()
      const padding = await composition
        .getByTestId('canonical-inline-message')
        .evaluate((element) => {
          const style = getComputedStyle(element)
          return {
            bottom: style.paddingBottom,
            left: style.paddingLeft,
            right: style.paddingRight,
            top: style.paddingTop,
          }
        })
      expect(padding).toEqual({
        bottom: '12px',
        left: '16px',
        right: '16px',
        top: '12px',
      })
    }

    await chooseLockState(7).click()
    const surfaceOrigin = await composition
      .getByTestId('vote-lock-outcome-surface')
      .evaluate((element) => {
        const [, y] = getComputedStyle(element).transformOrigin.split(' ')
        return {
          height: (element as HTMLElement).offsetHeight,
          y: Number.parseFloat(y ?? ''),
        }
      })
    expect(surfaceOrigin.y).toBeCloseTo(surfaceOrigin.height, 0)
  })

  test('keeps mounted Stake relationships aligned across task and outcome states', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(
      '/internal/design-system/components/transaction-action#transaction-truth-spectrum'
    )

    const composition = page.getByTestId('transaction-composition-stake')
    const chooseStakeState = (index: number) =>
      composition.getByTestId(
        `transaction-composition-stake-state-group-0-option-${index}`
      )
    const chooseUnstakeState = (index: number) =>
      composition.getByTestId(
        `transaction-composition-stake-state-group-1-option-${index}`
      )
    const chooseDelegateState = (index: number) =>
      composition.getByTestId(
        `transaction-composition-stake-state-group-2-option-${index}`
      )
    const surface = composition.getByTestId('canonical-dialog-surface')
    const measure = async (locator: typeof surface) => {
      const box = await locator.boundingBox()
      expect(box).not.toBeNull()
      return box!
    }
    const acknowledgementGap = async () => {
      const control = await composition
        .getByTestId('stake-delay-acknowledgement')
        .locator('[role="checkbox"]')
        .boundingBox()
      const action = await surface
        .getByTestId('stake-action-button')
        .boundingBox()
      expect(control).not.toBeNull()
      expect(action).not.toBeNull()
      return action!.y - (control!.y + control!.height)
    }

    await chooseStakeState(0).click()
    const taskSurface = await measure(surface)
    const headerBox = await measure(
      composition.getByTestId('stake-task-header-row')
    )
    const amountLabel = await measure(
      composition.getByTestId('stake-input-amount').locator('p').first()
    )
    const factLabel = await measure(
      composition.getByTestId('stake-task-facts-region').locator('dt').first()
    )
    const actionButton = await measure(
      surface.getByTestId('stake-action-button')
    )

    expect(Math.round(headerBox.x - taskSurface.x)).toBe(16)
    expect(Math.round(amountLabel.x - taskSurface.x)).toBe(24)
    expect(Math.round(factLabel.x - taskSurface.x)).toBe(24)
    expect(Math.round(actionButton.x - taskSurface.x)).toBe(8)
    expect(await acknowledgementGap()).toBeCloseTo(16, 0)

    await chooseStakeState(2).click()
    await expect(
      composition.getByTestId('stake-delay-acknowledgement')
    ).toHaveCount(0)
    await expect(
      composition.getByTestId('stake-process-content-frame')
    ).toHaveClass(/p-2/)

    await chooseStakeState(3).click()
    expect(await acknowledgementGap()).toBeCloseTo(16, 0)
    await chooseStakeState(6).click()
    const stakeProcessingHeight = (await measure(surface)).height

    await chooseStakeState(7).click()
    expect((await measure(surface)).height).toBeGreaterThanOrEqual(
      stakeProcessingHeight - 1
    )

    await chooseUnstakeState(0).click()
    const unstakeTaskHeight = (await measure(surface)).height
    await chooseUnstakeState(4).click()
    expect((await measure(surface)).height).toBeGreaterThanOrEqual(
      unstakeTaskHeight - 1
    )

    await chooseDelegateState(0).click()
    const delegateTaskHeight = (await measure(surface)).height
    const votingPower = await measure(
      composition.getByTestId('stake-delegation-voting-power')
    )
    const changeDelegate = await measure(
      surface.getByRole('button', { name: 'Change delegate' })
    )
    expect(changeDelegate.y - (votingPower.y + votingPower.height)).toBeCloseTo(
      16,
      0
    )
    await expect(
      surface.getByRole('button', { name: 'Change delegate' })
    ).toHaveAttribute('data-tone', 'secondary')

    await chooseDelegateState(1).click()
    await expect(
      surface.getByRole('textbox', { name: 'Voting delegate' })
    ).toBeVisible()
    await expect(
      surface.getByRole('button', { name: 'Update delegate' })
    ).toBeVisible()

    await chooseDelegateState(9).click()
    await expect(
      composition.getByTestId('stake-delegation-outcome')
    ).toBeVisible()
    expect((await measure(surface)).height).toBeGreaterThanOrEqual(
      delegateTaskHeight - 1
    )

    const stateOptions = composition.locator(
      '[data-testid^="transaction-composition-stake-state-group-"][data-testid*="-option-"]'
    )
    for (let index = 0; index < (await stateOptions.count()); index += 1) {
      await stateOptions.nth(index).click()
      await expect(surface).toHaveCount(1)
      expect(
        await surface.evaluate(
          (element) => element.scrollWidth <= element.clientWidth + 1
        )
      ).toBe(true)
    }
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
