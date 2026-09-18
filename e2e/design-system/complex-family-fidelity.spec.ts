import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test, type Locator, type Page } from '@playwright/test'

const evidenceDirectory = resolve(
  'test-results/design-system/complex-family-fidelity'
)

const setTheme = async (page: Page, theme: 'light' | 'dark') => {
  await page.evaluate((nextTheme) => {
    localStorage.setItem('theme-ui-color-mode', nextTheme)
  }, theme)
  await page.reload()
}

const expectContained = async (child: Locator, parent: Locator) => {
  const [childBox, parentBox] = await Promise.all([
    child.boundingBox(),
    parent.boundingBox(),
  ])
  expect(childBox).not.toBeNull()
  expect(parentBox).not.toBeNull()
  expect(childBox!.x).toBeGreaterThanOrEqual(parentBox!.x - 1)
  expect(childBox!.y).toBeGreaterThanOrEqual(parentBox!.y - 1)
  expect(childBox!.x + childBox!.width).toBeLessThanOrEqual(
    parentBox!.x + parentBox!.width + 1
  )
  expect(childBox!.y + childBox!.height).toBeLessThanOrEqual(
    parentBox!.y + parentBox!.height + 1
  )
}

test.beforeAll(async () => {
  await mkdir(evidenceDirectory, { recursive: true })
})

test('keeps navigation controls truthful and contained', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto(
    '/internal/design-system/patterns?navigation-global-constrained.state=utilities#navigation-global'
  )

  const constrainedGlobal = page.getByTestId('navigation-global-constrained')
  const utilityPanel = constrainedGlobal.getByLabel('Application utilities')
  await expect(utilityPanel).toBeVisible()
  await expectContained(
    utilityPanel,
    constrainedGlobal.locator('[data-specimen-boundary]')
  )

  await page.goto('/internal/design-system/patterns#navigation-product')
  const desktopProduct = page.getByTestId('navigation-product-desktop')
  const neutralStructure = desktopProduct.getByLabel(
    'Neutral two-column product structure'
  )
  const structureBefore = await neutralStructure.boundingBox()
  const railShell = desktopProduct.getByTestId('product-navigation-rail-shell')
  const rail = desktopProduct.getByTestId('product-navigation')
  await expect(rail).not.toHaveAttribute('data-expanded')
  await railShell.hover()
  await expect(rail).toHaveAttribute('data-expanded', 'true')
  const structureAfter = await neutralStructure.boundingBox()
  expect(structureAfter?.x).toBe(structureBefore?.x)
  expect(structureAfter?.width).toBe(structureBefore?.width)

  await desktopProduct.getByRole('radio', { name: 'Switcher' }).click()
  await desktopProduct.getByRole('link', { name: /^PHOTON/ }).click()
  await expect(page).toHaveURL(
    /navigation-product-desktop\.identity=photon.*navigation-product-desktop\.state=expanded|navigation-product-desktop\.state=expanded.*navigation-product-desktop\.identity=photon/
  )
  await expect(
    desktopProduct.getByRole('navigation', { name: 'PHOTON navigation' })
  ).toBeVisible()

  await page.goto('/internal/design-system/patterns#navigation-product')
  const constrainedProduct = page.getByTestId('navigation-product-constrained')
  const switcherTrigger = constrainedProduct.getByRole('button', {
    name: /^Switch DTF, current/,
  })
  await switcherTrigger.click()
  const switcher = page.getByRole('dialog', { name: 'Switch DTF' })
  await expect(switcher.getByRole('link')).toHaveCount(15)
  await switcher.getByRole('link', { name: /^ZINDEX/ }).scrollIntoViewIfNeeded()
  await expect(switcher.getByRole('link', { name: /^ZINDEX/ })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(switcher).toBeHidden()
  await expect(switcherTrigger).toBeFocused()

  await switcherTrigger.click()
  await switcher.getByRole('button', { name: 'Close Switch DTF' }).click()
  await expect(switcher).toBeHidden()
  await expect(switcherTrigger).toBeFocused()

  await page.goto(
    '/internal/design-system/patterns?navigation-global-desktop.identity=connected#navigation-global'
  )
  const actionScrollHost = page.getByTestId('global-desktop-scroll-host')
  await expect
    .poll(() => actionScrollHost.evaluate((host) => host.scrollLeft))
    .toBeGreaterThan(0)
})

test('shows full-width tables and a natural-size Overview capture', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/patterns#tables-current-rebalances')

  const currentCanvas = page.getByTestId('table-current-rebalances-canvas')
  await expect(currentCanvas).toBeVisible()
  await expect(
    page
      .locator('#tables-current-rebalances')
      .getByRole('radio', { name: 'Full width' })
  ).toHaveAttribute('aria-checked', 'true')
  await expect
    .poll(() =>
      currentCanvas.evaluate((canvas) => canvas.getBoundingClientRect().width)
    )
    .toBeGreaterThan(900)

  await page.goto(
    '/internal/design-system/patterns?tables-current.state=all#tables-current-rebalances'
  )
  await expect(page.getByTestId('current-table-example')).toHaveCount(18)
  await expect(
    page.getByRole('heading', { name: 'Disconnected visitor' })
  ).toBeVisible()

  await page.goto('/internal/design-system/patterns#chart-overview')
  const overview = page.getByTestId('chart-overview-documentation')
  await expect(
    overview.getByTestId('chart-documentation-viewport-control')
  ).toHaveCount(0)
  await expect
    .poll(() =>
      overview
        .getByTestId('chart-overview-stage')
        .evaluate((stage) => stage.getBoundingClientRect().width)
    )
    .toBe(824)
  await expect(overview).toContainText(
    'Footer ranges and Line/Candles labels are part of the static capture'
  )
})

test('preserves transaction defaults, ordinary inputs, and fixture transitions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/patterns#transactions-automated')

  const automated = page.locator('#transactions-automated')
  const manual = page.locator('#transactions-manual')
  const zapper = page.locator('#transactions-zapper')
  await expect(
    automated.getByTestId('automated-mint-configure-surface')
  ).toBeVisible()
  await expect(zapper).toContainText('Review')
  await expect(manual.getByTestId('manual-issuance-preview-note')).toHaveCount(
    0
  )

  const automatedAmount = automated.getByRole('textbox', {
    name: 'You provide amount',
  })
  await automatedAmount.fill('250')
  const automatedReset = automated.getByRole('button', {
    name: 'Reset family',
  })
  await expect(automatedReset).toBeEnabled()
  await automated.getByTestId('automated-mint-get-quote').click()
  await expect(
    automated.getByTestId('automated-mint-input-amount')
  ).toContainText('250')
  await automatedReset.click()
  await expect(
    automated.getByRole('textbox', { name: 'You provide amount' })
  ).toHaveValue('')

  const manualAmount = manual.getByRole('textbox', {
    name: 'Shares to mint amount',
  })
  await manualAmount.fill('250')
  const manualFlow = manual.getByRole('navigation', {
    name: 'Manual issuance state sequence',
  })
  await manualFlow.getByRole('button', { name: 'Next' }).click()
  await manualFlow.getByRole('button', { name: 'Previous' }).click()
  await expect(
    manual.getByRole('textbox', { name: 'Shares to mint amount' })
  ).toHaveValue('250')
  const manualReset = manual.getByRole('button', { name: 'Reset family' })
  await expect(manualReset).toBeEnabled()
  await manualReset.click()
  await expect(
    manual.getByRole('textbox', { name: 'Shares to mint amount' })
  ).toHaveValue('100')

  await page.goto(
    '/internal/design-system/patterns?transactions-automated.operation=redeem&transactions-automated.step=configure&transactions-automated.state=initial-configuration#transactions-automated'
  )
  const redeemAutomated = page.locator('#transactions-automated')
  const redeemAutomatedReset = redeemAutomated.getByRole('button', {
    name: 'Reset family',
  })
  await expect(redeemAutomatedReset).toBeEnabled()
  await redeemAutomatedReset.click()
  await expect(
    redeemAutomated.getByTestId('automated-issuance-operation-mint')
  ).toHaveAttribute('aria-checked', 'true')

  await page.goto(
    '/internal/design-system/patterns?transactions-automated.operation=mint&transactions-automated.step=configure&transactions-automated.state=bsc-configuration#transactions-automated'
  )
  const bscAutomated = page.locator('#transactions-automated')
  await expect(
    bscAutomated.getByRole('textbox', { name: 'You provide amount' })
  ).toHaveValue('')
  await bscAutomated
    .getByRole('textbox', { name: 'You provide amount' })
    .fill('25')
  await bscAutomated.getByTestId('automated-mint-get-quote').click()
  await expect(
    bscAutomated.getByTestId('automated-mint-input-amount')
  ).toContainText('25')
})

test('keeps narrow transaction dialogs reachable inside their documentation canvas', async ({
  page,
}) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 720 })
    for (const { family, operation, step, state } of [
      {
        family: 'stake',
        operation: 'stake',
        step: 'stake',
        state: 'approval-signing',
      },
      {
        family: 'vote-lock',
        operation: 'delegate',
        step: 'delegation',
        state: 'normal-signing',
      },
    ]) {
      await page.goto(
        `/internal/design-system/patterns?transactions-${family}.operation=${operation}&transactions-${family}.step=${step}&transactions-${family}.state=${state}#transactions-${family}`
      )
      const section = page.locator(`#transactions-${family}`)
      const boundary = section.locator('[data-specimen-boundary]')
      const context = section
        .getByTestId('transaction-current-specimen')
        .locator(':scope > div')
      const dialog = section.getByRole('dialog')
      const [boundaryBox, contextBox, dialogBox, boundaryScrollWidth] =
        await Promise.all([
          boundary.boundingBox(),
          context.boundingBox(),
          dialog.boundingBox(),
          boundary.evaluate((element) => element.scrollWidth),
        ])

      expect(boundaryBox).not.toBeNull()
      expect(contextBox).not.toBeNull()
      expect(dialogBox).not.toBeNull()
      expect(dialogBox!.x).toBeGreaterThanOrEqual(boundaryBox!.x - 1)
      expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(
        boundaryBox!.x + boundaryScrollWidth + 1
      )
      expect(dialogBox!.y).toBeGreaterThanOrEqual(contextBox!.y - 1)
    }
  }
})

test('keeps responsive reference content inside local scrollers', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await page.goto('/internal/design-system/foundations#color')
  await expect(
    page.getByText(
      'Application backdrop behind navigation, content regions, and page-level tools.'
    )
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)

  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/internal/design-system/patterns#tables-current-rebalances')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  const tableControl = page
    .locator('#tables-current-rebalances')
    .getByTestId('table-viewport-control-scroll')
  await expect
    .poll(() =>
      tableControl.evaluate(
        (element) => element.scrollWidth > element.clientWidth
      )
    )
    .toBe(true)

  await page.goto('/internal/design-system/patterns#chart-overview')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  const chartScroll = page.getByTestId('chart-overview-scroll')
  await expect
    .poll(() =>
      chartScroll.evaluate(
        (element) => element.scrollWidth > element.clientWidth
      )
    )
    .toBe(true)
  await expect
    .poll(() =>
      page
        .getByTestId('chart-overview-stage')
        .evaluate((element) => element.getBoundingClientRect().width)
    )
    .toBe(824)
  await chartScroll.evaluate((element) => {
    element.scrollLeft = element.scrollWidth
  })
  await expect
    .poll(() => chartScroll.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0)
})

test('records the affected light and dark breakpoint matrix', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'design-system-desktop')
  test.setTimeout(240_000)
  const targets = [
    {
      name: 'navigation-utilities',
      path: '/internal/design-system/patterns?navigation-global-constrained.state=utilities#navigation-global',
      selector: '[data-testid="navigation-global-constrained"]',
    },
    {
      name: 'navigation-product-expanded',
      path: '/internal/design-system/patterns?navigation-product-desktop.state=expanded#navigation-product',
      selector: '[data-testid="navigation-product-desktop"]',
    },
    {
      name: 'navigation-product-switcher',
      path: '/internal/design-system/patterns?navigation-product-constrained.state=switcher#navigation-product',
      selector: '[data-testid="navigation-product-constrained"]',
    },
    {
      name: 'tables-desktop',
      path: '/internal/design-system/patterns#tables-current-rebalances',
      selector: '#tables-current-rebalances',
    },
    {
      name: 'tables-all',
      path: '/internal/design-system/patterns?tables-current.state=all#tables-current-rebalances',
      selector: '#tables-current-rebalances',
    },
    {
      name: 'tables-loading',
      path: '/internal/design-system/patterns?tables-current.state=loading#tables-current-rebalances',
      selector: '#tables-current-rebalances',
    },
    {
      name: 'tables-empty',
      path: '/internal/design-system/patterns?tables-current.state=empty#tables-current-rebalances',
      selector: '#tables-current-rebalances',
    },
    {
      name: 'chart-overview',
      path: '/internal/design-system/patterns#chart-overview',
      selector: '#chart-overview',
    },
    {
      name: 'transactions-automated',
      path: '/internal/design-system/patterns#transactions-automated',
      selector: '#transactions-automated',
    },
    {
      name: 'transactions-manual',
      path: '/internal/design-system/patterns#transactions-manual',
      selector: '#transactions-manual',
    },
  ] as const

  for (const theme of ['light', 'dark'] as const) {
    for (const viewport of [
      { name: 'desktop-1400', width: 1400, height: 900 },
      { name: 'phone-390', width: 390, height: 844 },
      { name: 'phone-320', width: 320, height: 720 },
    ] as const) {
      await page.setViewportSize(viewport)
      for (const target of targets) {
        await page.goto(target.path)
        await setTheme(page, theme)
        await page.locator(target.selector).scrollIntoViewIfNeeded()
        await page.screenshot({
          path: resolve(
            evidenceDirectory,
            `${target.name}-${theme}-${viewport.name}.png`
          ),
        })
      }
    }
  }
})
