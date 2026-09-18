import { expect, test } from '../fixtures/base'

test.describe('design-system documentation shell', () => {
  test('separates documentation chrome and keeps the component reference continuous', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/internal/design-system/components')

    await expect(page.getByTestId('documentation-sidebar')).toBeVisible()
    await expect(
      page.getByTestId('documentation-mobile-navigation')
    ).toBeHidden()
    await expect(page.getByTestId('canonical-component-overview')).toBeVisible()
    await expect(page.getByTestId('component-overview-output')).toHaveCount(29)
    await expect(page.getByTestId('component-isolation-slot')).toHaveCount(0)
    await expect(
      page.getByRole('navigation', { name: 'Component families' })
    ).toHaveCount(0)
    const buttonSection = page.locator('#button')
    await expect(
      buttonSection.getByRole('heading', { name: 'Button' })
    ).toBeVisible()
    await expect(
      buttonSection.getByRole('link', { name: 'Open details' })
    ).toHaveAttribute('href', '/internal/design-system/components/button')
    await expect(buttonSection.getByText('Accepted')).toBeVisible()
    await expect(page.locator('#app-container')).toBeVisible()
    expect(
      await page
        .locator('#app-container')
        .evaluate(
          (node) =>
            Array.from(node.parentElement?.children ?? []).filter(
              (child) => child !== node
            ).length
        )
    ).toBe(0)

    const isStandalone = await page
      .locator('[data-runtime="standalone"]')
      .isVisible()
    await page.goto('/')
    if (isStandalone) {
      await expect(page).toHaveURL(/\/internal\/design-system$/)
      await expect(page.locator('[data-runtime="standalone"]')).toBeVisible()
      return
    }
    await expect
      .poll(() =>
        page
          .locator('#app-container')
          .evaluate(
            (node) =>
              Array.from(node.parentElement?.children ?? []).filter(
                (child) => child !== node
              ).length
          )
      )
      .toBeGreaterThan(0)
  })

  test('uses the complete hierarchy for mobile navigation and empty search feedback', async ({
    page,
  }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 })
      await page.goto('/internal/design-system/components#tabs')

      await page.getByTestId('documentation-mobile-navigation').click()
      const dialog = page.getByRole('dialog', {
        name: 'Design system navigation',
      })
      const navigation = dialog.getByRole('navigation', {
        name: 'Design system documentation',
      })
      await expect(
        navigation.locator('a[href="/internal/design-system/components#tabs"]')
      ).toHaveAttribute('aria-current', 'location')
      await expect(
        navigation.locator(
          'a[href="/internal/design-system/patterns#transactions"]'
        )
      ).toContainText('Paused')
      await expect(
        page.getByTestId('documentation-mobile-section-control')
      ).toHaveCount(0)
      const mobileSearch = page.locator('#design-system-search-mobile')
      await mobileSearch.fill('__documentation_no_match__')
      await expect(
        page.locator('#design-system-search-mobile-results[role="status"]')
      ).toContainText('No results found.')
      await expect(page.getByRole('option')).toHaveCount(0)
      await page.reload()
    }
  })

  test('offers a functional desktop keyboard skip link', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/internal/design-system/components#tabs')
    const initialUrl = page.url()
    const skipLink = page.locator('a[href="#documentation-main-content"]')

    await skipLink.focus()
    await expect(skipLink).toBeVisible()
    await expect(skipLink).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(page.locator('#documentation-main-content')).toBeFocused()
    expect(page.url()).toBe(initialUrl)
  })

  test('keeps the full hierarchy mounted and reveals the active sidebar section', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/internal/design-system/components#tabs')

    const sidebar = page.getByTestId('documentation-sidebar')
    for (const destination of [
      'start',
      'foundations',
      'components',
      'patterns',
      'workbench',
      'records',
    ]) {
      await expect(
        sidebar.getByTestId(`design-system-nav-${destination}`)
      ).toBeAttached()
    }
    const navigation = sidebar.getByRole('navigation', {
      name: 'Design system documentation',
    })
    await expect(
      navigation.locator('a[href="/internal/design-system/foundations#color"]')
    ).toBeAttached()
    await expect(
      navigation.locator('a[href="/internal/design-system/components#button"]')
    ).toBeAttached()
    await expect(
      navigation.locator(
        'a[href="/internal/design-system/patterns#transactions"]'
      )
    ).toContainText('Paused')
    await expect(navigation.locator('button[aria-expanded]')).toHaveCount(0)
    await expect(
      page.getByTestId('documentation-table-of-contents')
    ).toHaveCount(0)

    const scroller = page.locator('#app-container')
    await scroller.evaluate((node) => {
      node.dispatchEvent(new WheelEvent('wheel', { bubbles: true }))
      const target = document.getElementById('copy-value')
      if (!target) throw new Error('Missing copy-value section')
      node.scrollTo({ top: target.offsetTop })
    })

    await expect(page).toHaveURL(
      /\/internal\/design-system\/components#copy-value$/
    )
    const activeLink = sidebar.locator(
      'a[href="/internal/design-system/components#copy-value"]'
    )
    await expect(activeLink).toHaveAttribute('aria-current', 'location')
    await expect
      .poll(async () => {
        const sidebarBox = await sidebar.boundingBox()
        const activeBox = await activeLink.boundingBox()
        return Boolean(
          sidebarBox &&
          activeBox &&
          activeBox.y >= sidebarBox.y &&
          activeBox.y + activeBox.height <= sidebarBox.y + sidebarBox.height
        )
      })
      .toBe(true)
    await expect(
      sidebar.getByTestId('design-system-nav-components')
    ).toHaveAttribute('data-active', 'true')
  })

  test('searches with the keyboard and restores direct routes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/internal/design-system')

    const search = page.getByRole('combobox', {
      name: 'Search design system',
    })
    await search.fill('transaction system')
    await expect(page.getByRole('option')).toHaveCount(3)
    await expect(
      page.getByTestId('documentation-search-group-canonical')
    ).toBeVisible()
    await expect(
      page.getByTestId('documentation-search-group-workbench')
    ).toBeVisible()
    await expect(
      page.getByTestId('documentation-search-group-legacy')
    ).toHaveCount(0)
    const searchResultIds = await page
      .getByRole('option')
      .evaluateAll((options) => options.map((option) => option.id))
    expect(new Set(searchResultIds).size).toBe(searchResultIds.length)

    await search.fill('button')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(
      /\/internal\/design-system\/components#button$/
    )
    await page.reload()
    await expect(page.locator('#button')).toBeInViewport()
  })

  test('searches approved destinations, headings, and canonical pattern aliases', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/internal/design-system')

    const search = page.getByRole('combobox', {
      name: 'Search design system',
    })
    const searchFor = async (query: string) => {
      await search.fill(query)
      return page.getByRole('listbox')
    }

    let results = await searchFor('immediate action or advances a task')
    const buttonByDescription = results
      .getByRole('option')
      .filter({ hasText: 'Button' })
    await expect(buttonByDescription).toContainText(
      'Component documentation and current status.'
    )
    await expect(buttonByDescription).not.toContainText(
      'Initiates an immediate action or advances a task.'
    )

    results = await searchFor('Patterns')
    await results.getByRole('option').filter({ hasText: 'Patterns' }).click()
    await expect(page).toHaveURL(/\/internal\/design-system\/patterns$/)
    const chartPattern = page.locator('[data-source-key="component:chart"]')
    await expect(
      chartPattern.getByText('Accepted', { exact: true })
    ).toBeVisible()
    await expect(
      chartPattern.getByTestId('documentation-pattern-charts')
    ).toBeVisible()
    await expect(
      chartPattern.getByTestId('documentation-chart-family')
    ).toHaveCount(5)
    await expect(
      chartPattern.getByRole('heading', { name: 'Overview' })
    ).toBeVisible()
    await expect(
      chartPattern.getByRole('heading', { name: 'Portfolio history' })
    ).toBeVisible()

    await page.goto('/internal/design-system')
    results = await searchFor('Review tools')
    await results
      .getByRole('option')
      .filter({ hasText: 'Review tools' })
      .click()
    await expect(page).toHaveURL(/\/internal\/design-system\/workbench#tools$/)
    await expect(page.locator('#tools')).toBeInViewport()

    const aliases = [
      ['Tables and records', 'tables'],
      ['Forms', 'forms'],
      ['Navigation systems', 'navigation'],
      ['Transactions', 'transactions'],
    ] as const
    for (const [label, pattern] of aliases) {
      await page.goto('/internal/design-system')
      results = await searchFor(label)
      await results.getByRole('option').filter({ hasText: label }).click()
      await expect(page).toHaveURL(
        new RegExp(`/internal/design-system/patterns#${pattern}$`)
      )
    }
  })

  test('keeps internal documentation in English when the product locale is translated', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    for (const locale of ['es', 'ko', 'zh']) {
      await page.goto('/internal/design-system')
      await page.evaluate((nextLocale) => {
        localStorage.setItem('register.locale', JSON.stringify(nextLocale))
      }, locale)
      await page.reload()
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await expect(
        page.getByTestId('documentation-sidebar-subtitle')
      ).toHaveText('Documentation and review')

      await page.goto('/internal/design-system/components')
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      const buttonSection = page.locator('#button')
      await expect(buttonSection).toContainText('Accepted')
      await expect(
        buttonSection.getByRole('link', { name: 'Open details' })
      ).toHaveAttribute('href', '/internal/design-system/components/button')
    }
  })

  test('uses the same hierarchy in the narrow navigation panel', async ({
    page,
  }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 780 })
      await page.goto('/internal/design-system/components')
      await expect(page.getByTestId('documentation-sidebar')).toBeHidden()
      const trigger = page.getByTestId('documentation-mobile-navigation')
      await expect(trigger).toBeVisible()
      await trigger.click()
      await expect(
        page.getByRole('dialog', { name: 'Design system navigation' })
      ).toBeVisible()
      const dialog = page.getByRole('dialog', {
        name: 'Design system navigation',
      })
      await expect
        .poll(async () => {
          const box = await dialog.boundingBox()
          return box ? Math.ceil(box.x + box.width) : Number.POSITIVE_INFINITY
        })
        .toBeLessThanOrEqual(width + 1)
      const panel = await dialog.boundingBox()
      expect(panel).not.toBeNull()
      expect(panel!.x).toBeGreaterThanOrEqual(0)
      expect(panel!.width).toBeGreaterThanOrEqual(Math.min(320, width - 16) - 1)
      expect(panel!.x + panel!.width).toBeLessThanOrEqual(width + 1)
      await page.getByRole('link', { name: 'Workbench', exact: true }).click()
      await expect(page).toHaveURL(
        /\/internal\/design-system\/workbench#current-review$/
      )
      await expect(
        page.getByText('Nothing is waiting for human review.')
      ).toBeVisible()
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true)
    }
  })

  test('keeps aliases and the app-container scroll reset contract', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 700 })
    await page.goto('/internal/design-system/components')
    await expect(page.getByTestId('documentation-sidebar')).toBeVisible()

    const sidebar = page.getByTestId('documentation-sidebar')
    const dataDisplayLink = sidebar.getByRole('link', {
      name: 'Data display',
      exact: true,
    })
    await dataDisplayLink.click()
    await expect(page).toHaveURL(
      /\/internal\/design-system\/components#data-display$/
    )
    await expect(dataDisplayLink).toHaveAttribute('aria-current', 'location')
    await expect(sidebar.locator('a[aria-current="location"]')).toHaveCount(1)
    await expect(page.locator('#data-display')).toBeInViewport()
    await page.reload()
    await expect(page.locator('#data-display')).toBeInViewport()

    const scroller = page.locator('#app-container')
    await scroller.evaluate((node) => node.scrollTo(0, 600))
    await expect
      .poll(() => scroller.evaluate((node) => node.scrollTop))
      .toBeGreaterThan(0)
    await page.getByRole('link', { name: 'Start', exact: true }).click()
    await expect(page).toHaveURL(/\/internal\/design-system$/)
    await expect.poll(() => scroller.evaluate((node) => node.scrollTop)).toBe(0)

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

  test('recovers unknown hashes into the observed documentation section', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/internal/design-system/components#unknown-section')

    const sidebar = page.getByTestId('documentation-sidebar')
    await expect(page).toHaveURL(
      /\/internal\/design-system\/components#actions$/
    )
    await expect(
      sidebar.locator('a[href="/internal/design-system/components#actions"]')
    ).toHaveAttribute('aria-current', 'location')
    await expect(
      page.getByTestId('documentation-table-of-contents')
    ).toHaveCount(0)
  })

  test('keeps the current component synchronized across scrolling and history', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 })

    await page.goto('/internal/design-system/components#button')

    const sidebar = page.getByTestId('documentation-sidebar')
    const scroller = page.locator('#app-container')
    const buttonLink = sidebar.locator(
      'a[href="/internal/design-system/components#button"]'
    )
    const iconButtonLink = sidebar.locator(
      'a[href="/internal/design-system/components#icon-button"]'
    )
    const actionsLink = sidebar.locator(
      'a[href="/internal/design-system/components#actions"]'
    )

    await expect(buttonLink).toHaveAttribute('aria-current', 'location')
    await expect(actionsLink).toHaveAttribute('data-active', 'true')
    await expect(
      sidebar.getByTestId('design-system-nav-components')
    ).toHaveAttribute('data-active', 'true')
    await expect(sidebar.locator('[aria-current]')).toHaveCount(1)
    await expect(
      page.getByTestId('documentation-table-of-contents')
    ).toHaveCount(0)

    await scroller.evaluate((node) => {
      node.dispatchEvent(new WheelEvent('wheel', { bubbles: true }))
      const target = document.getElementById('feedback')
      if (!target) throw new Error('Missing feedback section')
      node.scrollTo({ top: target.offsetTop })
    })
    await expect(page).toHaveURL(
      /\/internal\/design-system\/components#feedback$/
    )
    await expect(
      sidebar.locator('a[href="/internal/design-system/components#feedback"]')
    ).toHaveAttribute('aria-current', 'location')
    await expect(sidebar.locator('[aria-current]')).toHaveCount(1)
    await expect(
      sidebar.getByTestId('design-system-nav-components')
    ).toHaveAttribute('data-active', 'true')

    await sidebar
      .locator('a[href="/internal/design-system/components#fields"]')
      .click()
    await expect(page).toHaveURL(
      /\/internal\/design-system\/components#fields$/
    )
    await expect(page.locator('#fields')).toBeInViewport()

    await buttonLink.click()
    await expect(page).toHaveURL(
      /\/internal\/design-system\/components#button$/
    )
    await expect(page.locator('#button')).toBeInViewport()
    await iconButtonLink.click()
    await expect(page).toHaveURL(
      /\/internal\/design-system\/components#icon-button$/
    )
    await expect(page.locator('#icon-button')).toBeInViewport()

    await page.goBack()
    await expect(page).toHaveURL(
      /\/internal\/design-system\/components#button$/
    )
    await expect(page.locator('#button')).toBeInViewport()
    await page.goForward()
    await expect(page).toHaveURL(
      /\/internal\/design-system\/components#icon-button$/
    )
    await expect(page.locator('#icon-button')).toBeInViewport()

    await scroller.evaluate((node) => node.scrollBy({ top: 16 }))
    const beforeQueryChange = await scroller.evaluate((node) => node.scrollTop)
    await page.evaluate(() => {
      window.history.pushState(
        {},
        '',
        '/internal/design-system/components?density=compact#icon-button'
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await expect(page).toHaveURL(
      /\/internal\/design-system\/components\?density=compact#icon-button$/
    )
    await expect
      .poll(() => scroller.evaluate((node) => node.scrollTop))
      .toBe(beforeQueryChange)
  })

  test('synchronizes foundation and pattern sections while reading', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    const sidebar = page.getByTestId('documentation-sidebar')
    const scroller = page.locator('#app-container')

    await page.goto('/internal/design-system/foundations#color')
    await expect(page.locator('#typography')).toBeAttached()
    await scroller.evaluate((node) => {
      node.dispatchEvent(new WheelEvent('wheel', { bubbles: true }))
      const target = document.getElementById('typography')
      if (!target) throw new Error('Missing typography section')
      node.scrollTo({ top: target.offsetTop })
    })
    await expect(page).toHaveURL(
      /\/internal\/design-system\/foundations#typography$/
    )
    await expect(
      sidebar.locator(
        'a[href="/internal/design-system/foundations#typography"]'
      )
    ).toHaveAttribute('aria-current', 'location')
    await expect(sidebar.locator('[aria-current]')).toHaveCount(1)

    await page.goto('/internal/design-system/patterns#charts')
    await expect(page.locator('#tables')).toBeAttached()
    await scroller.evaluate((node) => {
      node.dispatchEvent(new WheelEvent('wheel', { bubbles: true }))
      const target = document.getElementById('tables')
      if (!target) throw new Error('Missing tables section')
      node.scrollTo({ top: target.offsetTop })
    })
    await expect(page).toHaveURL(/\/internal\/design-system\/patterns#tables$/)
    await expect(
      sidebar.locator('a[href="/internal/design-system/patterns#tables"]')
    ).toHaveAttribute('aria-current', 'location')
    await expect(sidebar.locator('[aria-current]')).toHaveCount(1)
    await expect(
      sidebar.getByTestId('design-system-nav-patterns')
    ).toHaveAttribute('data-active', 'true')
  })

  test('navigates exact sections from the complete hierarchy on phones', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/internal/design-system/components#unknown-section')

    await expect(page).toHaveURL(
      /\/internal\/design-system\/components#actions$/
    )
    await page.getByTestId('documentation-mobile-navigation').click()
    const dialog = page.getByRole('dialog', {
      name: 'Design system navigation',
    })
    const navigation = dialog.getByRole('navigation', {
      name: 'Design system documentation',
    })
    await expect(
      navigation.locator('a[href="/internal/design-system/components#actions"]')
    ).toHaveAttribute('aria-current', 'location')
    await navigation
      .locator('a[href="/internal/design-system/components#icon-button"]')
      .click()
    await expect(page).toHaveURL(
      /\/internal\/design-system\/components#icon-button$/
    )
    await expect(page.locator('#icon-button')).toBeInViewport()
    await page.getByTestId('documentation-mobile-navigation').click()
    await expect(
      page
        .getByRole('dialog', { name: 'Design system navigation' })
        .getByRole('navigation', { name: 'Design system documentation' })
        .locator('a[href="/internal/design-system/components#icon-button"]')
    ).toHaveAttribute('aria-current', 'location')
  })
})
