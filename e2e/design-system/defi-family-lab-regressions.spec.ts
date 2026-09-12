import { test, expect } from '../fixtures/base'
import {
  readReviewSource,
  assertUnchangedSource,
  watchReviewSource,
} from './review-source'

let source: ReturnType<typeof readReviewSource>
let guard: ReturnType<typeof watchReviewSource>
test.beforeEach(() => {
  source = readReviewSource(process.cwd())
  guard = watchReviewSource(process.cwd())
})
test.afterEach(async ({ txLog }, info) => {
  guard.close()
  expect(txLog).toHaveLength(0)
  assertUnchangedSource(source, readReviewSource(process.cwd()), [
    ...guard.changes,
  ])
  await info.attach('public-source-digest', {
    body: Buffer.from(source.digest),
    contentType: 'text/plain',
  })
})

for (const theme of ['light', 'dark'])
  for (const width of [320, 390, 1400]) {
    test(`DeFi rows ${theme} ${width}`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(
        '/internal/design-system/components/table#earn-family-review'
      )
      const review = page.getByTestId('earn-review')
      const composition = review.getByTestId('earn-composition')
      const choose = async (label: string, option: string) => {
        await review.getByRole('combobox', { name: label, exact: true }).click()
        await page.getByRole('option', { name: option, exact: true }).click()
      }
      await choose('Earn opportunity family', 'DeFi Yield')
      await expect(
        review.getByRole('switch', { name: 'Wallet position' })
      ).toHaveCount(0)
      const rows = composition.locator('tbody tr')
      await expect(rows).toHaveCount(5)
      const triplePool = rows.filter({ hasText: 'ETH+-eUSD-RSR' })
      const tripleArtwork = triplePool.locator(
        '[data-slot="defi-identity"]:visible [data-slot="logo-stack-artwork"]'
      )
      await expect(tripleArtwork).toHaveCount(3)
      for (const [index, symbol] of ['ETH+', 'eUSD', 'RSR'].entries()) {
        await expect(tripleArtwork.nth(index).locator('img')).toHaveAttribute(
          'alt',
          symbol
        )
        await expect(tripleArtwork.nth(index).locator('img')).toHaveAttribute(
          'src',
          `/svgs/${symbol.toLowerCase()}.svg`
        )
        await expect(tripleArtwork.nth(index)).toHaveCSS('height', '32px')
      }
      await expect(rows.first()).toContainText('Beefy')
      for (const [name, symbols] of [
        ['RSR-WETH', ['RSR', 'WETH']],
        ['ETH+ETH-f', ['ETH+', 'WETH']],
        ['ETH+-WETH', ['ETH+', 'WETH']],
      ] as const) {
        const artwork = rows
          .filter({ hasText: name })
          .locator(
            '[data-slot="defi-identity"]:visible [data-slot="logo-stack-artwork"] img'
          )
        await expect(artwork).toHaveCount(2)
        for (const [index, symbol] of symbols.entries()) {
          await expect(artwork.nth(index)).toHaveAttribute('alt', symbol)
          await expect(artwork.nth(index)).toHaveAttribute(
            'src',
            `/svgs/${symbol.toLowerCase()}.svg`
          )
        }
      }
      if (width === 1400)
        await expect(composition.locator('th:visible')).toHaveText([
          'Pool',
          'Platform',
          'APY',
          'TVL',
          'View pool',
        ])
      else {
        await expect(composition.locator('thead')).toBeHidden()
        await expect(
          rows.first().locator('[data-slot="defi-record"]')
        ).toBeVisible()
        await expect(rows.first()).toContainText('Rewards 9.0%')
        await expect(rows.first()).toContainText('$875,000')
      }
      const inspect = async (name: string) => {
        await composition.evaluate((element) => {
          element.style.scrollMarginTop = '120px'
          element.scrollIntoView({ block: 'start' })
        })
        await page.evaluate(() => document.fonts.ready)
        if (width < 1024) {
          await expect(
            composition.locator(
              '[data-slot="defi-record"] [data-table-focus="help-apy"]'
            )
          ).toHaveCount(0)
          await expect(
            composition.locator('[data-table-focus="help-apy"] button:visible')
          ).toHaveCount(1)
          const targets = await composition.evaluate((root) => {
            const help = root
              .querySelector(
                '[data-slot="defi-toolbar"] [data-table-focus="help-apy"] button'
              )!
              .getBoundingClientRect()
            const sortElement = root.querySelector(
              '[data-testid="table-sort-menu"]'
            )!
            const sort = sortElement.getBoundingClientRect()
            const extension = getComputedStyle(sortElement, '::before')
            return {
              sortHeight:
                sort.height -
                parseFloat(extension.top) -
                parseFloat(extension.bottom),
              overlap:
                Math.min(help.right + 12, sort.right + 4) >
                  Math.max(help.left - 12, sort.left - 4) &&
                Math.min(help.bottom + 12, sort.bottom + 12) >
                  Math.max(help.top - 12, sort.top - 12),
            }
          })
          expect(targets.sortHeight).toBeGreaterThanOrEqual(44)
          expect(targets.overlap).toBe(false)
        }
        expect(
          await composition.evaluate((root) =>
            [...root.querySelectorAll('td,th,[data-slot="defi-identity"]')]
              .filter(
                (e) =>
                  e.getClientRects().length && e.scrollWidth > e.clientWidth + 1
              )
              .map((e) => e.textContent)
          )
        ).toEqual([])
        if (width < 1024) {
          for (const header of await composition
            .locator('[data-slot="defi-record-header"]')
            .all()) {
            const bounds = (await header.boundingBox())!
            const action = header.locator('a[data-table-focus^="pool-"]')
            if (await action.count()) {
              const rect = (await action.boundingBox())!
              const identity = (await header
                .locator('[data-slot="defi-identity"]')
                .boundingBox())!
              expect(rect.y).toBe(bounds.y)
              expect(rect.x + rect.width).toBe(bounds.x + bounds.width)
              expect(rect.x - 6).toBeGreaterThan(identity.x + identity.width)
            }
          }
        }
        expect(
          await composition.evaluate((root) =>
            [...root.querySelectorAll('[data-slot="defi-fact"]')]
              .filter((e) => e.getClientRects().length)
              .flatMap((fact) =>
                [
                  ...fact.querySelectorAll(
                    '[data-slot="defi-fact-label"],[data-testid="canonical-metric-value"]'
                  ),
                ]
                  .filter((child) => {
                    const bounds = fact.getBoundingClientRect()
                    const rect = child.getBoundingClientRect()
                    return (
                      rect.left < bounds.left - 1 ||
                      rect.right > bounds.right + 1 ||
                      child.scrollWidth > child.clientWidth + 1
                    )
                  })
                  .map((child) => child.textContent)
              )
          )
        ).toEqual([])
        await info.attach(name, {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
      }
      await inspect('default')
      const tripleNameX = (await triplePool
        .locator(
          '[data-slot="defi-identity"]:visible [data-slot="entity-identity-name"]'
        )
        .boundingBox())!.x
      const defaultHeight = (await rows.first().boundingBox())!.height
      if (width < 1024) expect(defaultHeight).toBeLessThanOrEqual(240)
      const first = rows.first()
      const pool = first.locator('a[data-table-focus^="pool-"]:visible')
      const analytics = first.locator('a[data-table-focus^="llama-"]:visible')
      await expect(analytics).toHaveAccessibleName(
        /12\.5%.*View analytics on DefiLlama.*opens in a new tab/
      )
      await expect(analytics).toHaveCSS('column-gap', '4px')
      await analytics.hover()
      await expect(analytics).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await expect(analytics).toHaveCSS('text-decoration-line', 'underline')
      await page.mouse.move(0, 0)
      expect((await analytics.boundingBox())!.height).toBe(24)
      expect((await analytics.boundingBox())!.width).toBeGreaterThanOrEqual(44)
      expect(
        await analytics.evaluate((element) => {
          const bounds = element.getBoundingClientRect()
          const hit = document.elementFromPoint(
            bounds.x + bounds.width / 2,
            bounds.bottom + 10
          )
          return hit === element || element.contains(hit)
        })
      ).toBe(true)
      expect(
        await analytics.evaluate((element) => {
          const extension = getComputedStyle(element, '::after')
          return (
            element.getBoundingClientRect().height -
            parseFloat(extension.top) -
            parseFloat(extension.bottom)
          )
        })
      ).toBeGreaterThanOrEqual(44)
      const breakdown = first.locator(
        '[data-slot="defi-yield-breakdown"]:visible'
      )
      const rateBounds = (await analytics.boundingBox())!
      const breakdownBounds = (await breakdown.boundingBox())!
      expect(
        Math.abs(
          breakdownBounds.y -
            rateBounds.y -
            rateBounds.height -
            (width === 1400 ? 0 : 4)
        )
      ).toBeLessThanOrEqual(1)
      await expect(breakdown).toHaveCSS('height', '20px')
      expect(
        Math.abs(
          width === 1400
            ? rateBounds.x +
                rateBounds.width -
                breakdownBounds.x -
                breakdownBounds.width
            : rateBounds.x - breakdownBounds.x
        )
      ).toBeLessThanOrEqual(1)
      if (width === 1400) {
        const platform = first.locator('[data-slot="defi-platform"]:visible')
        await expect(platform).toHaveCSS('column-gap', '8px')
        const platformLogo = platform.locator(
          '[data-slot="defi-platform-logo"]'
        )
        await expect(platformLogo).toHaveCSS('width', '20px')
        await expect(platformLogo).toHaveCSS('height', '20px')
        await expect(platform.getByTestId('canonical-chain-badge')).toHaveCount(
          0
        )
        await expect(
          platform.locator('[data-slot="entity-identity-supporting"]')
        ).toHaveCount(0)
        await expect(platform).toHaveCSS('height', '24px')
        const platformName = platform.locator(
          '[data-slot="entity-identity-name"] > span'
        )
        await expect(platformName).toHaveCSS('font-size', '16px')
        await expect(platformName).toHaveCSS('font-weight', '300')
        const platformBounds = (await platform.boundingBox())!
        const logoBounds = (await platformLogo.boundingBox())!
        expect(
          Math.abs(
            platformBounds.y +
              platformBounds.height / 2 -
              logoBounds.y -
              logoBounds.height / 2
          )
        ).toBeLessThanOrEqual(1)
      } else {
        const platformLogo = first.locator(
          '[data-slot="defi-record"] [data-slot="defi-platform-logo"]'
        )
        await expect(platformLogo).toHaveCSS('width', '12px')
        await expect(platformLogo).toHaveCSS('height', '12px')
        const platformMetadata = first.locator(
          '[data-slot="defi-pool-platform"]:visible'
        )
        await expect(platformMetadata).toContainText('Beefy')
        await expect(platformMetadata).toHaveCSS('font-size', '14px')
        for (const fact of await first
          .locator('[data-slot="defi-fact"]:visible')
          .all()) {
          const label = (await fact
            .locator('[data-slot="defi-fact-label"]')
            .boundingBox())!
          const value = (await fact
            .getByTestId('canonical-metric-value')
            .boundingBox())!
          expect(value.y - label.y - label.height).toBe(4)
        }
      }
      await expect(
        first.locator('[data-slot="defi-identity"] a:visible')
      ).toHaveCount(0)
      await expect(pool).toHaveText(width === 1400 ? 'View pool' : '')
      if (width < 1024) {
        await expect(pool).toHaveAccessibleName(
          'Open pool on Beefy (opens in a new tab)'
        )
        await expect(pool).toHaveCSS('width', '32px')
        expect(
          await pool.evaluate((element) => {
            const rect = element.getBoundingClientRect()
            const extension = getComputedStyle(element, '::after')
            const hit = document.elementFromPoint(
              rect.x - 4,
              rect.y + rect.height / 2
            )
            return {
              width:
                rect.width -
                parseFloat(extension.left) -
                parseFloat(extension.right),
              hit: hit === element || element.contains(hit),
            }
          })
        ).toEqual({ width: 44, hit: true })
      }
      await expect(pool).toHaveCSS('height', '32px')
      expect(
        await pool.evaluate(
          (element) =>
            element.getBoundingClientRect().height -
            parseFloat(getComputedStyle(element, '::after').top) -
            parseFloat(getComputedStyle(element, '::after').bottom)
        )
      ).toBeGreaterThanOrEqual(44)
      const identity = first.locator('[data-slot="defi-identity"]:visible')
      if (width < 1024)
        expect(
          Math.abs(
            breakdownBounds.width -
              (await first.locator('[data-slot="defi-record"]').boundingBox())!
                .width
          )
        ).toBeLessThanOrEqual(1)
      await expect(identity).toHaveCSS('column-gap', '12px')
      const chainLine = identity.locator('[data-slot="defi-pool-chain"]')
      const chainLogo = chainLine.locator('svg')
      await expect(chainLine).toHaveText('Base')
      await expect(chainLine).toHaveCSS('height', '20px')
      await expect(chainLogo).toHaveCSS('width', '12px')
      await expect(chainLogo).toHaveCSS('height', '12px')
      const nameBounds = (await identity
        .locator('[data-slot="entity-identity-name"]')
        .boundingBox())!
      expect(Math.abs(nameBounds.x - tripleNameX)).toBeLessThanOrEqual(1)
      expect(nameBounds.x - (await identity.boundingBox())!.x).toBe(64)
      const chainBounds = (await chainLine.boundingBox())!
      expect(Math.abs(nameBounds.x - chainBounds.x)).toBeLessThanOrEqual(1)
      expect(
        Math.abs(chainBounds.y - nameBounds.y - nameBounds.height)
      ).toBeLessThanOrEqual(1)
      for (const artwork of await identity
        .locator('[data-slot="logo-stack-artwork"]')
        .all()) {
        await expect(artwork).toHaveCSS('width', '32px')
        await expect(artwork).toHaveCSS('height', '32px')
      }
      await expect(pool).toHaveAttribute(
        'href',
        'https://app.beefy.finance/vault/aero-cow-usdc-eusd-vault'
      )
      await expect(analytics).toHaveAttribute(
        'href',
        'https://defillama.com/yields/pool/5b3335ea-44e3-4ddf-ba30-51006e075561'
      )
      await page.context().route('https://app.beefy.finance/**', (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: '<title>External destination test</title>',
        })
      )
      await page
        .context()
        .route('https://defillama.com/yields/pool/**', (route) =>
          route.fulfill({
            contentType: 'text/html',
            body: '<title>External destination test</title>',
          })
        )
      for (const link of [pool, analytics]) {
        await link.focus()
        if (link === analytics || width < 1024) {
          await expect(page.getByRole('tooltip')).toContainText(
            link === analytics
              ? 'View analytics on DefiLlama'
              : 'Open pool on Beefy'
          )
          await page.keyboard.press('Escape')
          await expect(page.getByRole('tooltip')).toBeHidden()
        }
        const popup = page.waitForEvent('popup')
        await page.keyboard.press('Enter')
        const destination = await popup
        await destination.waitForLoadState('domcontentloaded')
        expect(destination.url()).toBe(await link.getAttribute('href'))
        await destination.close()
      }
      const help = composition
        .locator('[data-table-focus="help-apy"] button:visible')
        .first()
      const label =
        width === 1400
          ? composition.getByTestId('sort-apy')
          : composition.locator('[data-slot="defi-toolbar-apy-label"]')
      const labelBounds = (await label.boundingBox())!
      const helpBounds = (await help.boundingBox())!
      expect(
        Math.abs(
          labelBounds.y +
            labelBounds.height / 2 -
            helpBounds.y -
            helpBounds.height / 2
        )
      ).toBeLessThanOrEqual(1)
      await help.focus()
      await expect(page.getByRole('tooltip')).toContainText(
        'APY = Base APY + Reward APY'
      )
      await expect(page.getByRole('tooltip')).toContainText(
        'Annualised percentage yield from incentives'
      )
      await page.keyboard.press('Escape')
      await expect(page.getByRole('tooltip')).toBeHidden()
      await composition.getByTestId('table-sort-menu').click()
      for (const field of [
        'symbol',
        'projectName',
        'chain',
        'apy',
        'apyBase',
        'apyReward',
        'tvlUsd',
      ])
        await expect(
          page.getByTestId(`table-sort-field-${field}`)
        ).toBeVisible()
      await page.getByTestId('table-sort-field-apyReward').click()
      await expect(page.getByTestId('table-sort-options')).toBeHidden()
      await expect(composition.getByTestId('table-sort-menu')).toHaveAttribute(
        'aria-expanded',
        'false'
      )
      await expect(rows.first()).toContainText('Beefy')
      const reward = rows
        .first()
        .locator('[data-apy-field="apyReward"]:visible')
      const base = rows.first().locator('[data-apy-field="apyBase"]:visible')
      await expect(reward).toHaveClass(/text-foreground/)
      await expect(base).not.toHaveClass(/text-foreground/)
      await expect(reward).toHaveCSS('font-size', '14px')
      await expect(reward).toHaveCSS('font-weight', '300')
      await inspect('reward-sort')
      if (width === 1400) await composition.getByTestId('sort-tvlUsd').click()
      else {
        await composition.getByTestId('table-sort-menu').click()
        await page.getByTestId('table-sort-field-tvlUsd').click()
      }
      await expect(rows.first()).toContainText('Uniswap')
      const readyHeights = await rows.evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().height)
      )
      await expect(
        rows.first().locator('[data-apy-field="apyReward"]:visible')
      ).not.toHaveClass(/text-foreground/)
      for (const condition of [
        'Long content',
        'Zero / unavailable',
        'Loading opportunities',
        'Empty',
      ]) {
        await choose('Earn preview state', condition)
        await inspect(condition)
        if (condition === 'Loading opportunities') {
          if (width === 1400)
            await expect(
              rows.first().locator('[data-slot="defi-platform"]:visible')
            ).toHaveCSS('column-gap', '8px')
          await expect(composition.getByRole('link')).toHaveCount(0)
          expect(
            await rows.evaluateAll((elements) =>
              elements.map((element) => element.getBoundingClientRect().height)
            )
          ).toEqual(readyHeights)
          const triplePlaceholder = rows
            .nth(2)
            .locator('td:visible')
            .first()
            .getByTestId('v1-skeleton')
            .nth(1)
          expect(
            Math.abs((await triplePlaceholder.boundingBox())!.x - tripleNameX)
          ).toBeLessThanOrEqual(1)
          const poolNamePlaceholder = rows
            .first()
            .locator('td:visible')
            .first()
            .getByTestId('v1-skeleton')
            .nth(1)
          expect(
            Math.abs(
              (await poolNamePlaceholder.boundingBox())!.x - nameBounds.x
            )
          ).toBeLessThanOrEqual(1)
          if (width < 1024) {
            const fact = rows.first().locator('[data-slot="defi-fact"]').nth(1)
            expect(
              await fact.evaluate((element) => {
                const placeholder = element.querySelector(
                  '[data-testid="v1-skeleton"]'
                )!
                return Math.abs(
                  element.getBoundingClientRect().right -
                    placeholder.getBoundingClientRect().right
                )
              })
            ).toBeLessThanOrEqual(1)
          }
        }
        if (condition === 'Empty')
          await expect(composition.getByRole('status')).toHaveText(
            'No yield opportunities found'
          )
      }
      await choose('Earn preview state', 'Default')
      await expect(rows.first()).toContainText('Uniswap')
    })
  }

test('DeFi reflows and transfers link focus at its container boundary', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1600, height: 900 })
  await page.goto('/internal/design-system/components/table#earn-family-review')
  const review = page.getByTestId('earn-review')
  await review
    .getByRole('combobox', { name: 'Earn opportunity family' })
    .click()
  await page.getByRole('option', { name: 'DeFi Yield', exact: true }).click()
  const composition = review.getByTestId('earn-composition')
  const link = composition
    .locator('tbody tr')
    .first()
    .locator('a[data-table-focus^="pool-"]:visible')
    .first()
  await link.focus()
  const key = await link.getAttribute('data-table-focus')
  for (const width of [1023, 1024, 1279, 1280]) {
    await composition.evaluate(
      (element, value) => (element.style.width = `${value}px`),
      width
    )
    await expect(composition.locator('thead')).toBeVisible({
      visible: width >= 1024,
    })
    await expect(
      composition.locator(`a[data-table-focus="${key}"]:visible`)
    ).toBeFocused()
    expect(
      await composition.evaluate((root) =>
        [...root.querySelectorAll('th,td')]
          .filter(
            (element) =>
              element.getClientRects().length &&
              element.scrollWidth > element.clientWidth + 1
          )
          .map((element) => element.textContent)
      )
    ).toEqual([])
    await info.attach(`boundary-${width}`, {
      body: await composition.screenshot(),
      contentType: 'image/png',
    })
  }
  for (const selector of [
    '[data-table-focus="help-apy"] button:visible',
    'a[data-table-focus^="llama-"]:visible',
  ]) {
    await composition.locator(selector).first().focus()
    for (const width of [1023, 1024]) {
      await composition.evaluate(
        (element, value) => (element.style.width = `${value}px`),
        width
      )
      await expect(composition.locator(selector).first()).toBeFocused()
    }
  }
})
