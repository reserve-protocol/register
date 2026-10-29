import { expect, test } from '@playwright/test'

const pilot =
  '/iframe.html?id=explorations-screen-pilots-index-dtf-overview--pilot&viewMode=story'

test('pilot drawers close across the desktop breakpoint and focus visible navigation', async ({
  page,
}) => {
  for (const screen of ['index-dtf-overview', 'participate-and-earn']) {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(
      `/iframe.html?id=explorations-screen-pilots-${screen}--pilot&viewMode=story`
    )
    await page
      .getByRole('button', { name: 'Open global navigation', exact: true })
      .click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.setViewportSize({ width: 1440, height: 844 })
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(
      page.getByRole('banner').getByRole('link', {
        name:
          screen === 'index-dtf-overview'
            ? 'Discover DTFs'
            : 'Participate & Earn',
        exact: true,
      })
    ).toBeFocused()
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByRole('dialog')).toBeHidden()
  }
  for (const name of [
    'Switch DTF, current PHOTON',
    'Open PHOTON page navigation',
  ]) {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(pilot)
    await page.getByRole('button', { name, exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.setViewportSize({ width: 1440, height: 844 })
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(
      page.getByRole('button', {
        name: 'Switch DTF, current PHOTON',
        exact: true,
      })
    ).toBeFocused()
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByRole('dialog')).toBeHidden()
  }
})

test('pilot desktop overflow closes when mobile navigation replaces its trigger', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 844 })
  await page.goto(pilot)
  await page.getByRole('button', { name: 'More', exact: true }).click()
  await expect(page.getByRole('menu')).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('menu')).toBeHidden()
  await expect(
    page.getByRole('button', { name: 'Open global navigation', exact: true })
  ).toBeFocused()
})

for (const [language, full, short] of [
  ['en', 'Buy / Sell', 'Trade'],
  ['es', 'Comprar / Vender', 'Operar'],
  ['ko', '매수 / 매도', '거래'],
  ['zh', '买入 / 卖出', '交易'],
]) {
  test(`native mobile product controls fit ${language} labels and recover on resize`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(
      `/iframe.html?id=patterns-navigation--mobile-product-44&viewMode=story&args=language:${language}`
    )
    for (const width of [390, 360, 350, 336, 320, 350, 390]) {
      await page.setViewportSize({ width, height: 844 })
      const actions = page.getByTestId('mobile-product-actions')
      const primary = actions.locator('button[data-tone="primary"]')
      await expect(primary).toHaveText(
        new RegExp(
          `^(?:${full.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|${short})$`
        )
      )
      await page.evaluate(() => document.fonts.ready)
      await expect
        .poll(async () => {
          const root = await page.locator('[data-action-layout]').boundingBox()
          const group = await actions.boundingBox()
          const identity = await page
            .getByRole('button', { name: /^Switch DTF, current/ })
            .boundingBox()
          return (
            !!root &&
            !!group &&
            !!identity &&
            group.x - identity.x - identity.width >= 8 &&
            group.x + group.width <= root.x + root.width + 0.01
          )
        })
        .toBe(true)
      for (const button of await actions.getByRole('button').all()) {
        await expect(button).toHaveCSS('height', '44px')
        await expect(button).toHaveCSS('font-size', '14px')
        expect((await button.boundingBox())!.height).toBe(44)
      }
      if (width === 320)
        await expect(
          actions.getByRole('button', { name: 'Ask Reserve AI', exact: true })
        ).toBeHidden()
    }
    if (language === 'en')
      await expect(
        page.getByRole('button', { name: full, exact: true })
      ).toBeVisible()
    await page.getByRole('button', { name: /^Switch DTF, current/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Switch DTF', exact: true })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(
      page.getByRole('button', { name: /^Switch DTF, current/ })
    ).toBeFocused()
  })
}

test('pilot adapts the reviewed mobile product action cluster without wrapping', async ({
  page,
}) => {
  const switcherGeometry = (node: HTMLElement) => {
    const bounds = node.getBoundingClientRect()
    const mark = node.querySelector('img')!.getBoundingClientRect()
    const cue = node
      .querySelector('[data-slot="product-switcher-cue"]')!
      .getBoundingClientRect()
    const style = getComputedStyle(node)
    return {
      width: bounds.width,
      height: bounds.height,
      markWidth: mark.width,
      markHeight: mark.height,
      cueWidth: cue.width,
      cueHeight: cue.height,
      gap: cue.left - mark.right,
      padding: [
        style.paddingTop,
        style.paddingRight,
        style.paddingBottom,
        style.paddingLeft,
      ],
    }
  }
  const pilotGeometries = []
  for (const width of [320, 335, 336, 359, 360, 390, 768, 1023]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto(pilot)
    const actions = page.getByTestId('mobile-product-actions')
    await expect(
      actions.getByRole('button', {
        name: width < 360 ? 'Trade' : 'Buy / Sell',
        exact: true,
      })
    ).toBeVisible()
    const chat = actions.getByRole('button', {
      name: 'Ask Reserve AI',
      exact: true,
    })
    if (width < 336) {
      await expect(chat).toBeHidden()
    } else {
      await expect(chat).toBeVisible()
    }
    await expect(
      actions.getByRole('button', {
        name: 'Open PHOTON page navigation',
        exact: true,
      })
    ).toBeVisible()
    for (const button of await actions.getByRole('button').all()) {
      const bounds = (await button.boundingBox())!
      await expect(button).toHaveCSS('height', '44px')
      await expect(button).toHaveCSS('font-size', '14px')
      expect(bounds.height).toBe(44)
      expect(bounds.width).toBeGreaterThanOrEqual(bounds.height - 0.01)
    }
    const switcher = page.getByRole('button', {
      name: 'Switch DTF, current PHOTON',
      exact: true,
    })
    const identity = (await switcher.boundingBox())!
    pilotGeometries.push(await switcher.evaluate(switcherGeometry))
    const cluster = (await actions.boundingBox())!
    expect(cluster.height).toBe(60)
    expect(cluster.height).toBeCloseTo(identity.height, 3)
    expect(cluster.y).toBeCloseTo(identity.y, 3)
    expect(cluster.x - identity.x - identity.width).toBeGreaterThanOrEqual(8)
    expect(cluster.x + cluster.width).toBeLessThanOrEqual(width - 8)
    expect(
      await actions.evaluate((node) => {
        const style = getComputedStyle(node)
        return [
          style.paddingTop,
          style.paddingRight,
          style.paddingBottom,
          style.paddingLeft,
        ]
      })
    ).toEqual(['8px', '8px', '8px', '8px'])
  }
  await page.setViewportSize({ width: 1024, height: 844 })
  await expect(page.getByTestId('mobile-product-actions')).toBeHidden()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(
    '/iframe.html?id=patterns-navigation--mobile-product&viewMode=story'
  )
  const reviewed = page.getByTestId('mobile-product-actions')
  await expect(
    reviewed.getByRole('button', { name: 'Buy / Sell', exact: true })
  ).toBeVisible()
  await expect(
    reviewed.getByRole('button', { name: 'Ask Reserve AI', exact: true })
  ).toBeVisible()
  expect(
    (await reviewed
      .getByRole('button', { name: 'Buy / Sell', exact: true })
      .boundingBox())!.height
  ).toBe(32)
  expect(
    (await page
      .getByRole('button', { name: /^Switch DTF, current/ })
      .boundingBox())!.height
  ).toBe(48)
  const referenceGeometry = await page
    .getByRole('button', {
      name: /^Switch DTF, current/,
    })
    .evaluate(switcherGeometry)
  for (const geometry of pilotGeometries) {
    expect(geometry.height).toBe(referenceGeometry.height + 12)
    expect(geometry.width).toBe(referenceGeometry.width + 24)
    for (const key of [
      'markWidth',
      'markHeight',
      'cueWidth',
      'cueHeight',
    ] as const) {
      expect(geometry[key]).toBe(44)
    }
    expect(geometry.gap).toBe(referenceGeometry.gap)
    expect(geometry.padding).toEqual(['8px', '8px', '8px', '8px'])
  }
})

test('mobile headers keep the full wordmark when the Connect controls leave enough space', async ({
  page,
}) => {
  for (const screen of ['index-dtf-overview', 'participate-and-earn']) {
    for (const width of [320, 375, 394, 430]) {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(
        `/iframe.html?id=explorations-screen-pilots-${screen}--pilot&viewMode=story`
      )
      const header = page.getByRole('banner')
      const logo = header.getByTestId(
        width === 320 ? 'mobile-brand-mark' : 'mobile-brand-wordmark'
      )
      await expect(logo).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      const brand = (await logo.boundingBox())!
      const action = (await header.getByRole('button').first().boundingBox())!
      expect(action.x - brand.x - brand.width).toBeGreaterThanOrEqual(16)
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(
    '/iframe.html?id=patterns-navigation--mobile-global&viewMode=story'
  )
  await expect(
    page
      .getByTestId('mobile-header-connected-state')
      .getByTestId('mobile-brand-wordmark')
  ).toBeVisible()
  for (const id of [
    'mobile-header-narrow-state',
    'mobile-header-compact-brand-state',
  ]) {
    const header = page.getByTestId(id)
    await expect(header.getByTestId('mobile-brand-mark')).toBeVisible()
    const brand = (await header
      .getByRole('link', { name: 'Reserve home' })
      .boundingBox())!
    const action = (await header.getByRole('button').first().boundingBox())!
    expect(brand.x + brand.width).toBeLessThanOrEqual(action.x)
  }
})

test('overview phone header switches to the content surface on scroll; tablet stays content', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(`${pilot}&globals=theme:${theme}`)
      const frame = page.locator('[data-slot="screen-pilot-header-surface"]')
      await expect(frame).toBeVisible()
      const content = await page
        .getByTestId('overview-pilot-viewport')
        .evaluate((node) => getComputedStyle(node).backgroundColor)
      const substrate = await page
        .getByTestId('overview-pilot-backing')
        .evaluate((node) => getComputedStyle(node).backgroundColor)
      const seam = page.getByTestId('overview-pilot-header-seam')
      if (width === 768) {
        for (const top of [0, 500]) {
          await page.evaluate((value) => window.scrollTo(0, value), top)
          await expect(frame).toHaveCSS('background-color', content)
          await expect(seam).toHaveCSS('background-color', substrate)
        }
        continue
      }
      await expect(frame).toHaveCSS('background-color', substrate)
      await expect(seam).toHaveCSS('background-color', content)
      for (const top of [1, 500]) {
        await page.evaluate((value) => window.scrollTo(0, value), top)
        await expect(frame).toHaveCSS('background-color', content)
        await expect(seam).toHaveCSS('background-color', substrate)
        expect((await page.getByRole('banner').boundingBox())!.y).toBe(0)
      }
      const menu = page.getByRole('button', {
        name: 'Open global navigation',
        exact: true,
      })
      await menu.click()
      await page.keyboard.press('Escape')
      await expect(menu).toBeFocused()
      await expect(frame).toHaveCSS('background-color', content)
      if (width === 390) {
        await page.screenshot({
          path: `test-results/overview-pilot-scrolled-header-${theme}.png`,
          animations: 'disabled',
        })
      }
      await page.setViewportSize({ width: 1024, height: 844 })
      await expect(frame).toHaveCSS('background-color', content)
      await page.setViewportSize({ width, height: 844 })
      await expect(frame).toHaveCSS('background-color', content)
      await page.evaluate(() => window.scrollTo(0, 0))
      await expect(frame).toHaveCSS('background-color', substrate)
      await expect(seam).toHaveCSS('background-color', content)
    }
  }
})

test('pilot mobile headers use equal 20px insets around the controls', async ({
  page,
}) => {
  for (const screen of ['index-dtf-overview', 'participate-and-earn']) {
    for (const width of [320, 375, 390, 430, 640, 768, 1023]) {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(
        `/iframe.html?id=explorations-screen-pilots-${screen}--pilot&viewMode=story`
      )
      const banner = page.getByRole('banner')
      const menu = page.getByRole('button', {
        name: 'Open global navigation',
        exact: true,
      })
      await expect(menu).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      const frame = (await banner.boundingBox())!
      const brand = (await banner
        .locator('[data-mobile-header-brand]:visible')
        .boundingBox())!
      const action = (await menu.boundingBox())!
      expect(frame.height).toBe(72)
      expect(brand.x - frame.x).toBe(20)
      expect(frame.x + frame.width - action.x - action.width).toBe(20)
      expect(action.y - frame.y).toBe(20)
      expect(frame.y + frame.height - action.y - action.height).toBe(20)
      const firstAction = (await banner
        .getByRole('button')
        .first()
        .boundingBox())!
      expect(brand.x + brand.width).toBeLessThanOrEqual(firstAction.x)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
    }
  }
})

test('pilot content uses matching mobile insets in both axes', async ({
  page,
}) => {
  const expectPadding = async (
    region: ReturnType<typeof page.locator>,
    inset: string
  ) => {
    for (const edge of ['top', 'right', 'bottom', 'left']) {
      await expect(region).toHaveCSS(`padding-${edge}`, inset)
    }
  }
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 })
    const inset = width < 1024 ? '20px' : '24px'
    await page.goto(pilot)
    const chart = page.getByTestId('chart-overview-source')
    const headingRegion = chart.locator(':scope > div').first()
    for (const edge of ['top', 'right', 'left']) {
      await expect(headingRegion).toHaveCSS(`padding-${edge}`, inset)
    }
    await expectPadding(page.getByTestId('chart-source-footer'), inset)
    const holdings = page.getByTestId('overview-pilot-holdings')
    await expect(
      holdings.locator('[data-slot="table-family-container"]')
    ).toHaveCSS('padding-top', inset)
    if (width < 1024) {
      await expectPadding(
        holdings
          .getByTestId(/^holding-record-/)
          .first()
          .locator('..'),
        inset
      )
    }
    for (const family of ['index', 'yield', 'defi']) {
      await page.goto(
        `/iframe.html?id=explorations-screen-pilots-participate-and-earn--pilot&viewMode=story&args=family:${family}`
      )
      await expectPadding(page.getByTestId('earn-pilot-filters'), inset)
      const category = page.getByTestId('earn-pilot-category-navigation')
      await expect(category).toHaveCSS('padding-left', inset)
      await expect(category).toHaveCSS(
        'padding-top',
        width < 1024 ? '20px' : '96px'
      )
      const introduction = page
        .getByRole('heading', { level: 1 })
        .locator('../..')
      await expect(introduction).toHaveCSS('padding-left', inset)
      await expect(introduction).toHaveCSS(
        'padding-bottom',
        width < 1024 ? '20px' : '96px'
      )
      const table = page.locator('[data-slot="table-family-container"]')
      await expect(table).toHaveCSS('padding-top', inset)
      const record =
        family === 'defi'
          ? page.locator('[data-slot="defi-record"]').first()
          : page.getByTestId(/^earn-record-/).first()
      await expectPadding(record.locator('..'), inset)
      const facts = record
        .locator(
          family === 'defi'
            ? '[data-slot="defi-metrics"] > div'
            : '[data-slot="earn-opportunity-facts"]'
        )
        .first()
      await expect(facts).toHaveCSS('column-gap', '24px')
    }
  }
})

test('pilot uses the reviewed product switcher without changing its PHOTON screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(pilot)
  const identity = page.getByRole('button', {
    name: 'Switch DTF, current PHOTON',
    exact: true,
  })
  await expect(identity).toBeVisible()
  await identity.focus()
  await expect(page.getByTestId('product-navigation')).toHaveCSS(
    'width',
    '256px'
  )
  await expect(
    identity.locator('[data-slot="product-switcher-chevron"]')
  ).toBeVisible()
  await expect(identity.getByTestId('canonical-chain-badge')).toBeVisible()
  await identity.click()
  await expect(identity).toHaveAttribute('aria-expanded', 'true')
  const switcher = page.getByRole('navigation', {
    name: 'Switch DTF',
    exact: true,
  })
  await expect(switcher).toBeVisible()
  await expect(
    switcher.locator('[data-navigation-id="cmc20"]')
  ).toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByTestId('chart-source-title')).toHaveText(
    'Reserve AI Photonics DTF'
  )
  await identity.click()
  await expect(identity).toHaveAttribute('aria-expanded', 'false')
  await expect(
    page.getByRole('navigation', { name: 'PHOTON navigation', exact: true })
  ).toBeVisible()
  await page.screenshot({
    path: 'test-results/overview-pilot-reviewed-navigation.png',
  })
  await page.goto('/iframe.html?id=patterns-navigation--desktop&viewMode=story')
  await page
    .getByRole('button', { name: 'Switch DTF, current CMC20', exact: true })
    .click()
  await page
    .getByRole('navigation', { name: 'Switch DTF', exact: true })
    .getByRole('link', { name: /^PHOTON/ })
    .click()
  await expect(
    page.getByRole('button', {
      name: 'Switch DTF, current PHOTON',
      exact: true,
    })
  ).toHaveAttribute('aria-expanded', 'false')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(pilot)
  await expect(
    page.getByTestId('overview-pilot-desktop-navigation')
  ).toBeHidden()
  await expect(
    page.getByRole('button', {
      name: 'Open PHOTON page navigation',
      exact: true,
    })
  ).toBeVisible()
  const phoneIdentity = page.getByRole('button', {
    name: 'Switch DTF, current PHOTON',
    exact: true,
  })
  await phoneIdentity.click()
  const phoneSwitcher = page.getByRole('dialog', {
    name: 'Switch DTF',
    exact: true,
  })
  await expect(phoneSwitcher).toBeVisible()
  await expect(
    phoneSwitcher.locator('[data-navigation-id="cmc20"]')
  ).toHaveAttribute('aria-disabled', 'true')
  await page.screenshot({
    path: 'test-results/overview-pilot-phone-switcher.png',
  })
  await phoneSwitcher
    .getByRole('button', { name: 'Close Switch DTF', exact: true })
    .click()
  await expect(phoneSwitcher).toBeHidden()
  await expect(phoneIdentity).toBeFocused()
})

test('overview pilot composes reviewed content at the proposed breakpoints', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(pilot)
  await expect(page.getByTestId('overview-pilot-backing')).toBeVisible()
  await expect(page.getByTestId('overview-pilot-shell')).toHaveCSS(
    'border-left-width',
    '1px'
  )
  await expect(page.getByTestId('overview-pilot-shell')).toHaveCSS(
    'border-right-width',
    '1px'
  )
  const primary = page.getByTestId('overview-pilot-primary')
  const support = page.getByTestId('overview-pilot-support')
  await expect(primary).toBeVisible()
  expect((await primary.boundingBox())!.width).toBe(836)
  expect((await support.boundingBox())!.width).toBe(480)
  const zapper = page.getByTestId('zapper-shell')
  await expect(zapper).toBeVisible()
  const supportBounds = (await support.boundingBox())!
  const zapperBounds = (await zapper.boundingBox())!
  expect(zapperBounds.width).toBe(480)
  expect(zapperBounds.x).toBe(supportBounds.x)
  expect(zapperBounds.y).toBe(supportBounds.y)
  expect(zapperBounds.y).toBe((await primary.boundingBox())!.y)
  expect(zapperBounds.x - (await primary.boundingBox())!.x - 836).toBe(1)
  expect(
    await zapper.evaluate((node) =>
      (getComputedStyle(node).boxShadow.match(/-?[\d.]+px/g) ?? []).every(
        (length) => parseFloat(length) === 0
      )
    )
  ).toBe(true)
  await expect(page.getByRole('button', { name: 'Close Zapper' })).toHaveCount(
    0
  )
  const headerSeam = page.getByTestId('overview-pilot-header-seam')
  for (const width of [1600, 1440, 1024, 1023, 768, 640, 639, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await expect(headerSeam).toBeVisible()
    const banner = page.getByRole('banner')
    await expect.poll(async () => (await banner.boundingBox())!.height).toBe(72)
    await expect
      .poll(async () => (await banner.boundingBox())!.width)
      .toBe(Math.min(1400, width - (width >= 640 ? 48 : 0)) - 2)
    const seamBounds = (await headerSeam.boundingBox())!
    expect(seamBounds.x).toBe(0)
    expect(seamBounds.width).toBe(width)
    expect(seamBounds.height).toBe(1)
    const headerBounds = (await banner.boundingBox())!
    expect(seamBounds.y).toBe(headerBounds.y + headerBounds.height)
    const edgeStyles = await banner.evaluate((node) => ({
      border: getComputedStyle(node).borderBottomWidth,
      decoration: getComputedStyle(node, '::after').content,
    }))
    expect(edgeStyles).toEqual({ border: '0px', decoration: 'none' })
    const shellBounds = (await page
      .getByTestId('overview-pilot-shell')
      .boundingBox())!
    expect(headerBounds.x).toBe(shellBounds.x + 1)
    expect(headerBounds.width).toBe(shellBounds.width - 2)
    expect(shellBounds.y).toBe(seamBounds.y + seamBounds.height)
    const shellEdges = await page
      .getByTestId('overview-pilot-shell')
      .evaluate((node) => {
        const style = getComputedStyle(node)
        return {
          left: style.borderLeftWidth,
          right: style.borderRightWidth,
          color: style.borderRightColor,
        }
      })
    expect(shellEdges).toEqual({
      left: '1px',
      right: '1px',
      color: 'rgba(0, 0, 0, 0)',
    })
    const backing = page.getByTestId('overview-pilot-backing')
    const backingBounds = (await backing.boundingBox())!
    expect(backingBounds.x).toBe(shellBounds.x)
    expect(backingBounds.width).toBe(shellBounds.width)
    expect(backingBounds.y).toBe(seamBounds.y + seamBounds.height)
    expect(backingBounds.y + backingBounds.height).toBe(1000)
    expect(
      await backing.evaluate((node) => getComputedStyle(node).backgroundColor)
    ).toBe(
      await (
        width >= 640
          ? headerSeam
          : page.locator('[data-slot="screen-pilot-header-surface"]')
      ).evaluate((node) => getComputedStyle(node).backgroundColor)
    )
    if (width < 640) {
      await expect(headerSeam).toHaveCSS(
        'background-color',
        await page
          .getByTestId('overview-pilot-viewport')
          .evaluate((node) => getComputedStyle(node).backgroundColor)
      )
    }
    if (width >= 1372) {
      const rightEdge = (await support.boundingBox())!
      expect(rightEdge.x + rightEdge.width).toBe(
        shellBounds.x + shellBounds.width - 1
      )
    }
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      )
      .toBe(true)
    if (width === 1023)
      await page.screenshot({
        path: 'test-results/overview-pilot-narrow-header.png',
      })
  }
  const chart = page.getByTestId('chart-overview-source')
  await expect(chart).toBeVisible()
  await expect(
    page.getByRole('table', { name: 'Exposure holdings' })
  ).toBeVisible()
  const chartBounds = (await chart.boundingBox())!
  const holdingsBounds = (await page
    .getByTestId('overview-pilot-holdings')
    .boundingBox())!
  expect(holdingsBounds.y - chartBounds.y - chartBounds.height).toBe(1)
  await page.getByRole('tab', { name: 'Collateral', exact: true }).click()
  await expect(
    page.getByRole('table', { name: 'Collateral holdings' })
  ).toBeVisible()
  await page
    .getByRole('navigation', { name: 'PHOTON navigation', exact: true })
    .hover()
  await expect(page.getByTestId('product-navigation')).toHaveAttribute(
    'data-expanded',
    'true'
  )
  await expect(page.getByTestId('product-navigation')).not.toHaveCSS(
    'box-shadow',
    'none'
  )
  await expect(page.getByTestId('product-navigation')).toHaveCSS(
    'width',
    '256px'
  )
  await page.screenshot({
    path: 'test-results/overview-pilot-expanded-navigation.png',
  })
  expect((await primary.boundingBox())!.width).toBe(836)
  await page.mouse.move(1400, 500)
  await expect(page.getByTestId('product-navigation')).toHaveCSS(
    'box-shadow',
    'none'
  )
  await page.screenshot({
    path: 'test-results/overview-pilot-desktop.png',
    fullPage: true,
  })

  await page.evaluate(() => window.scrollTo(0, 250))
  expect(
    (await page.getByTestId('overview-pilot-backing').boundingBox())!.y
  ).toBe(73)
  const pinnedBanner = (await page.getByRole('banner').boundingBox())!
  expect(pinnedBanner.y).toBe(0)
  const pinnedSeam = (await headerSeam.boundingBox())!
  expect(pinnedSeam.y).toBe(pinnedBanner.height)
  expect(
    (await page.getByTestId('product-navigation').boundingBox())!.y
  ).toBeGreaterThanOrEqual(pinnedSeam.y + pinnedSeam.height)
  await page.getByRole('button', { name: 'More', exact: true }).click()
  await expect(page.getByTestId('global-navigation-overflow')).toBeVisible()
  expect((await page.getByTestId('global-navigation').boundingBox())!.y).toBe(0)
  expect(
    (await page.getByTestId('product-navigation').boundingBox())!.y
  ).toBeGreaterThanOrEqual(pinnedSeam.y + pinnedSeam.height)
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('global-navigation-overflow')).toBeHidden()
  expect((await page.getByRole('banner').boundingBox())!.y).toBe(0)
  await page.screenshot({
    path: 'test-results/overview-pilot-sticky-header.png',
  })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.setViewportSize({ width: 1372, height: 1000 })
  expect((await primary.boundingBox())!.width).toBe(768)
  await page.getByRole('button', { name: 'Open Zapper settings' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Zapper settings' })
  ).toBeVisible()
  await page.setViewportSize({ width: 1371, height: 1000 })
  await expect(support).toBeHidden()
  await expect(
    page.getByRole('dialog', { name: 'Zapper settings' })
  ).toHaveCount(0)
  await expect(zapper).toHaveCount(0)
  await page.setViewportSize({ width: 1280, height: 1000 })
  expect((await primary.boundingBox())!.width).toBe(1157)
  await page.screenshot({
    path: 'test-results/overview-pilot-intermediate.png',
    fullPage: true,
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${pilot}&globals=theme:dark`)
  await expect(primary).toBeVisible()
  await expect(
    page.getByTestId('overview-pilot-desktop-navigation')
  ).toBeHidden()
  await expect(support).toBeHidden()
  expect((await primary.boundingBox())!.width).toBe(388)
  expect((await headerSeam.boundingBox())!.width).toBe(390)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.evaluate(() => window.scrollTo(0, 250))
  expect((await page.getByRole('banner').boundingBox())!.y).toBe(0)
  const globalTrigger = page.getByLabel('Open global navigation', {
    exact: true,
  })
  await expect(globalTrigger).toHaveAttribute('aria-expanded', 'false')
  await globalTrigger.click()
  await expect(
    page.getByRole('dialog', { name: 'Global navigation', exact: true })
  ).toBeVisible()
  await expect(globalTrigger).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(globalTrigger).toHaveAttribute('aria-expanded', 'false')
  await expect(globalTrigger).toBeFocused()
  const pagesTrigger = page.getByLabel('Open PHOTON page navigation', {
    exact: true,
  })
  await expect(pagesTrigger).toHaveAttribute('aria-expanded', 'false')
  await pagesTrigger.click()
  await expect(pagesTrigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('dialog', { name: 'PHOTON pages' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(pagesTrigger).toBeFocused()
  await expect(pagesTrigger).toHaveAttribute('aria-expanded', 'false')
  await page.screenshot({
    path: 'test-results/overview-pilot-phone.png',
    fullPage: true,
  })
})

test('overview pilot Docs controls stay above a desktop preview at narrow documentation widths', async ({
  page,
}) => {
  await page.setViewportSize({ width: 960, height: 900 })
  await page.goto(
    '/iframe.html?id=explorations-screen-pilots-index-dtf-overview--docs&viewMode=docs'
  )
  const frame = page.getByTestId('overview-pilot-review-frame')
  await expect(frame).toBeVisible()
  await expect(page.getByTestId('overview-pilot-backing-frame')).toHaveCSS(
    'position',
    'absolute'
  )
  await expect
    .poll(
      async () =>
        (await page.getByTestId('overview-pilot-primary').boundingBox())!.width
    )
    .toBe(836)
  const controls = (await page.getByRole('table').first().boundingBox())!
  expect(controls.y + controls.height).toBeLessThanOrEqual(
    (await frame.boundingBox())!.y
  )
  await page.getByRole('radio', { name: 'candles', exact: true }).check()
  await expect(page.getByTestId('chart-candlestick-source')).toBeVisible()
  await page.getByRole('radio', { name: 'collateral', exact: true }).check()
  await expect(
    page.getByRole('table', { name: 'Collateral holdings' })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.screenshot({
    path: 'test-results/overview-pilot-docs.png',
    fullPage: true,
  })
  const typographySelectors = [
    '[data-testid="overview-pilot-viewport"]',
    '[data-testid="chart-source-title"]',
    '[data-testid="chart-source-value"]',
    '[aria-label="Global navigation"] a[aria-current="page"]',
  ]
  await page.evaluate(() => document.fonts.ready)
  const embeddedTypography = await Promise.all(
    typographySelectors.map((selector) =>
      page.locator(selector).evaluate((node) => {
        const style = getComputedStyle(node)
        return {
          family: style.fontFamily,
          weight: style.fontWeight,
          size: style.fontSize,
          lineHeight: style.lineHeight,
        }
      })
    )
  )
  const fullscreenLink = page.getByRole('link', { name: /^Open full screen/ })
  await expect(fullscreenLink).toBeVisible()
  const opened = page.waitForEvent('popup')
  await fullscreenLink.click()
  const screen = await opened
  await expect(screen.getByTestId('chart-candlestick-source')).toBeVisible()
  await expect(
    screen.getByRole('table', { name: 'Collateral holdings' })
  ).toBeVisible()
  await expect(screen.getByTestId('overview-pilot-review-frame')).toHaveCount(0)
  await screen.evaluate(() => document.fonts.ready)
  const standaloneTypography = await Promise.all(
    typographySelectors.map((selector) =>
      screen.locator(selector).evaluate((node) => {
        const style = getComputedStyle(node)
        return {
          family: style.fontFamily,
          weight: style.fontWeight,
          size: style.fontSize,
          lineHeight: style.lineHeight,
        }
      })
    )
  )
  expect(standaloneTypography[0].family).toContain('TWK Lausanne')
  expect(embeddedTypography).toEqual(standaloneTypography)
  expect(
    (await screen.getByTestId('overview-pilot-viewport').boundingBox())!.width
  ).toBe(screen.viewportSize()!.width)
  await screen.screenshot({
    path: 'test-results/overview-pilot-fullscreen.png',
    fullPage: true,
  })
  await screen.close()
})

test('overview pilot chart inspection and fixture states stay isolated in both themes', async ({
  page,
  baseURL,
}) => {
  const external: string[] = []
  const errors: string[] = []
  await page.addInitScript(() => {
    Reflect.set(window, '__pilotWalletCalls', [])
    Reflect.set(window, 'ethereum', {
      request: ({ method }: { method: string }) => {
        Reflect.get(window, '__pilotWalletCalls').push(method)
        return Promise.resolve(null)
      },
      on: () => undefined,
      removeListener: () => undefined,
    })
  })
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== new URL(baseURL!).origin)
      external.push(request.url())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  for (const theme of ['light', 'dark']) {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(`${pilot}&globals=theme:${theme}`)
    const chart = page.getByTestId('chart-overview-source')
    await expect(chart).toBeVisible()
    const plot = page.getByTestId('chart-source-plot')
    await plot.getByRole('application').focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByTestId('chart-source-time')).toBeVisible()
    await page.mouse.move(1400, 100)
    await page.getByRole('tab', { name: 'Collateral', exact: true }).click()
    await expect(
      page.getByRole('table', { name: 'Collateral holdings' })
    ).toBeVisible()
    const operation = page.getByRole('group', { name: 'Zapper operation' })
    await operation.getByRole('radio', { name: 'Sell', exact: true }).click()
    await expect(
      operation.getByRole('radio', { name: 'Sell', exact: true })
    ).toBeChecked()
    await operation.getByRole('radio', { name: 'Buy', exact: true }).click()
    await page.getByRole('button', { name: 'Select input asset' }).click()
    await expect(
      page.getByRole('group', { name: 'Zapper input assets' })
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('transaction-asset-picker-list')).toHaveCount(
      0
    )
    expect(
      await page.evaluate(() => Reflect.get(window, '__pilotWalletCalls'))
    ).toEqual([])
    await page.screenshot({
      path: `test-results/overview-pilot-${theme}.png`,
      fullPage: true,
    })
    await page
      .getByRole('navigation', { name: 'PHOTON navigation', exact: true })
      .hover()
    await expect(page.getByTestId('product-navigation')).not.toHaveCSS(
      'box-shadow',
      'none'
    )
    await expect(page.getByTestId('product-navigation')).toHaveCSS(
      'width',
      '256px'
    )
    await page.screenshot({
      path: `test-results/overview-pilot-expanded-navigation-${theme}.png`,
    })
    await page.mouse.move(1400, 500)
    await expect(
      page.getByRole('button', { name: 'Close Zapper' })
    ).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: 'Open Zapper', exact: true })
    ).toHaveCount(0)
    await page.goto(`${pilot}&globals=theme:${theme}&args=chartType:candles`)
    await expect(page.getByTestId('chart-candlestick-source')).toBeVisible()
  }
  expect(errors).toEqual([])
  expect(external).toEqual([])
})

test('zapper modal keeps its capped shadowed shell and dismissal in both themes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const theme of ['light', 'dark']) {
    await page.goto(
      `/iframe.html?id=patterns-transactions-in-progress-zapper-and-rfq--quote-review&viewMode=story&globals=theme:${theme}`
    )
    const shell = page.getByTestId('zapper-shell')
    await expect(shell).toBeVisible()
    expect((await shell.boundingBox())!.width).toBe(448)
    expect(
      await shell.evaluate((node) => getComputedStyle(node).boxShadow)
    ).not.toBe('none')
    await expect(
      page.getByRole('group', { name: 'Zapper operation' })
    ).toBeVisible()
    await page.screenshot({
      path: `test-results/overview-zapper-modal-${theme}.png`,
    })
    await page.getByRole('button', { name: 'Close Zapper' }).click()
    await expect(shell).toHaveCount(0)
    await page.getByRole('button', { name: 'Open Zapper', exact: true }).click()
    await expect(shell).toBeVisible()
  }
})
