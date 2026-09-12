import { test, expect } from '../fixtures/base'
import { expectHoldingRecordLayout } from './holdings-record-layout'
import {
  expectHoldingsToolbar,
  expectHoldingLinkAffordance,
  expectIdentitySkeleton,
} from './holdings-affordances'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

let source: ReturnType<typeof readReviewSource>
let guard: ReturnType<typeof watchReviewSource>
test.beforeEach(() => {
  source = readReviewSource(process.cwd())
  guard = watchReviewSource(process.cwd())
})
test.afterEach(async ({ page }, info) => {
  expect(page.isClosed()).toBe(false)
  guard.close()
  assertUnchangedSource(source, readReviewSource(process.cwd()), [
    ...guard.changes,
  ])
  await info.attach('public-source-digest', {
    body: Buffer.from(source.digest),
    contentType: 'text/plain',
  })
})

for (const theme of ['light', 'dark'])
  for (const width of [320, 375, 1400]) {
    test(`holdings family ${theme} ${width}`, async ({ page, txLog }, info) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.route(
        'https://storage-logos.reserve.org/logos/nasdaq--big.svg',
        (route) => route.fulfill({ status: 404, body: '' })
      )
      await page.goto(
        '/internal/design-system/components/table#holdings-family-review'
      )
      const review = page.getByTestId('holdings-review')
      const composition = review.getByTestId('holdings-composition')
      const table = composition.locator('table')
      const bodyRows = table.locator('tbody tr')
      const visibleRecords = table.locator(
        '[data-testid^="holding-record-"]:visible'
      )
      const select = async (name: string, option: string) => {
        await review.getByRole('combobox', { name, exact: true }).click()
        await page.getByRole('option', { name: option, exact: true }).click()
      }
      const capture = async (name: string) => {
        if ((await composition.boundingBox())!.width >= 768) {
          const bottomInset = await composition.evaluate((root) => {
            const cells = [
              ...root.querySelectorAll('tbody tr:last-child td'),
            ].filter((cell) => cell.getClientRects().length)
            const contentBottom = Math.max(
              ...cells.flatMap((cell) =>
                [...cell.children].map(
                  (child) => child.getBoundingClientRect().bottom
                )
              )
            )
            return root.getBoundingClientRect().bottom - contentBottom
          })
          expect(bottomInset).toBeCloseTo(24, 0)
        }
        await composition.evaluate((el) => {
          el.style.scrollMarginTop = '120px'
          el.scrollIntoView({ block: 'start' })
        })
        await info.attach(name, {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
        if (
          width === 1400 &&
          [
            'stock-exposure',
            'stock-collateral',
            'overview-exposure',
            'overview-collateral',
            'overview-loading',
          ].includes(name)
        ) {
          await composition.evaluate((el) =>
            el.scrollIntoView({ block: 'end' })
          )
          await info.attach(`${name}-bottom`, {
            body: await page.screenshot({ animations: 'disabled' }),
            contentType: 'image/png',
          })
        }
      }
      const noOverflow = async () => {
        const overflows = await composition.evaluate((root) =>
          [
            ...root.querySelectorAll(
              'th, td, [data-slot="entity-identity-name"], [data-testid^="holding-record-"]'
            ),
          ]
            .filter(
              (el) =>
                el.getClientRects().length &&
                el.scrollWidth > el.clientWidth + 1
            )
            .map((el) => ({
              tag: el.tagName,
              text: el.textContent?.slice(0, 80),
              client: el.clientWidth,
              scroll: el.scrollWidth,
            }))
        )
        expect(overflows).toEqual([])
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth)
        ).toBeLessThanOrEqual(width)
      }
      await expect(table).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      if (width === 1400) {
        await expect(
          table.locator('thead th').first().getByRole('tablist')
        ).toBeVisible()
      }
      const tabs = composition.getByRole('tablist')
      const exposureTab = composition.getByRole('tab', {
        name: 'Exposure',
        exact: true,
      })
      const collateralTab = composition.getByRole('tab', {
        name: 'Collateral',
        exact: true,
      })
      await expect(tabs).toHaveCount(1)
      await expect(tabs).toHaveCSS('height', width < 768 ? '44px' : '32px')
      await expectHoldingsToolbar(composition, width < 768 ? width - 32 : 1300)
      await expect(exposureTab).toHaveCSS('font-size', '14px')
      await expect(exposureTab).toHaveCSS('font-weight', '500')
      const tabSemantics = await composition.evaluate((root) => {
        const triggers = [...root.querySelectorAll('[role="tab"]')]
        return {
          ids: triggers.map((trigger) => trigger.id),
          controlsExist: triggers.every(
            (trigger) =>
              document
                .getElementById(trigger.getAttribute('aria-controls') ?? '')
                ?.getAttribute('role') === 'tabpanel'
          ),
        }
      })
      expect(new Set(tabSemantics.ids).size).toBe(tabSemantics.ids.length)
      expect(tabSemantics.controlsExist).toBe(true)
      if (width === 1400) {
        const geometry = await table.evaluate((element) => {
          const tabs = element
            .querySelector('[role="tablist"]')!
            .getBoundingClientRect()
          const weight = element
            .querySelector('thead th:nth-child(2) button')!
            .getBoundingClientRect()
          return {
            tabsCenter: tabs.y + tabs.height / 2,
            labelCenter: weight.y + weight.height / 2,
          }
        })
        expect(
          Math.abs(geometry.tabsCenter - geometry.labelCenter)
        ).toBeLessThanOrEqual(1)
        await info.attach('header-geometry', {
          body: Buffer.from(JSON.stringify(geometry)),
          contentType: 'application/json',
        })
      }
      await exposureTab.focus()
      await page.keyboard.press('ArrowRight')
      await expect(collateralTab).toBeFocused()
      await expect(collateralTab).toHaveAttribute('aria-selected', 'true')
      await expect(bodyRows.first()).toContainText('BTCB Token')
      await page.keyboard.press('ArrowLeft')
      await expect(exposureTab).toBeFocused()
      await expect(exposureTab).toHaveAttribute('aria-selected', 'true')
      const metric = table
        .getByTestId('canonical-metric-value')
        .filter({ visible: true })
        .first()
      await expect(metric).toHaveCSS('font-size', '16px')
      await expect(metric).toHaveCSS('font-weight', width < 768 ? '500' : '300')
      const firstCell = bodyRows.first().locator('td:visible').first()
      await expect(firstCell).toHaveCSS(
        'padding-top',
        width < 768 ? '24px' : '12px'
      )
      await expect(firstCell).toHaveCSS(
        'padding-bottom',
        width < 768 ? '24px' : '12px'
      )
      await expect(bodyRows).toHaveCount(width < 768 ? 10 : 18)
      if (width < 768)
        await expectHoldingRecordLayout(visibleRecords, width - 32)
      await capture('exposure')
      await noOverflow()
      if (width < 768) {
        const firstTen = await visibleRecords
          .locator('[data-slot="entity-identity-name"]')
          .allTextContents()
        await review.getByRole('button', { name: 'View all 18 assets' }).click()
        await expect(visibleRecords).toHaveCount(18)
        expect(
          (
            await visibleRecords
              .locator('[data-slot="entity-identity-name"]')
              .allTextContents()
          ).slice(0, 10)
        ).toEqual(firstTen)
        await review.getByRole('button', { name: 'View less' }).click()
        await expect(visibleRecords).toHaveCount(10)
        await review.getByTestId('table-sort-menu').click()
        await page.getByTestId('table-sort-field-change').click()
        await expect(
          review.getByTestId('table-sort-menu')
        ).toHaveAccessibleName('Sort by: Price Change (7d)')
        await expectHoldingsToolbar(composition, width - 32)
        await review.getByTestId('table-sort-menu').click()
        await expect(
          page.getByTestId('table-sort-field-change')
        ).toHaveAttribute('aria-checked', 'true')
        await capture('sort-open')
        await page.keyboard.press('Escape')
        await expect(review.getByTestId('table-sort-menu')).toBeFocused()
      } else {
        const change = table.getByTestId('sort-change')
        const weight = table.getByTestId('sort-weight')
        const names = table.locator(
          'tbody tr td:first-child [data-slot="entity-identity-name"]'
        )
        await change.click()
        await expect(change.locator('..')).toHaveAttribute(
          'aria-sort',
          'descending'
        )
        expect((await names.allTextContents()).slice(0, 3)).toEqual([
          'Zcash',
          'XRP',
          'Hyperliquid',
        ])
        await capture('price-change-descending')
        await change.click()
        await expect(change.locator('..')).toHaveAttribute(
          'aria-sort',
          'ascending'
        )
        expect((await names.allTextContents()).slice(0, 3)).toEqual([
          'TRON',
          'Litecoin',
          'BNB',
        ])
        await weight.click()
        await expect(weight.locator('..')).toHaveAttribute(
          'aria-sort',
          'descending'
        )
        expect((await names.allTextContents()).slice(0, 3)).toEqual([
          'Bitcoin',
          'Ethereum',
          'BNB',
        ])
        await table.getByRole('button', { name: 'Weight', exact: true }).click()
        await expect(bodyRows.first()).not.toContainText('Bitcoin')
      }
      await composition
        .getByRole('tab', { name: 'Collateral', exact: true })
        .click()
      await expect(bodyRows.first()).toContainText('BTCB Token')
      await capture('collateral')
      if (width < 768)
        await expectHoldingRecordLayout(visibleRecords, width - 32)
      await noOverflow()
      await expectHoldingLinkAffordance(page, bodyRows.first(), width === 1400)
      await capture('link-focus')
      const bridge = bodyRows
        .first()
        .getByRole('button', { name: 'Bridged', exact: true })
        .filter({ visible: true })
      await bridge.focus()
      await page.keyboard.press('Enter')
      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByRole('dialog')).toContainText(
        'Native asset (reference)'
      )
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).toBeHidden()
      await expect(bridge).toBeFocused()
      await select('Holdings preview state', 'Zero / unavailable')
      await expect(bodyRows.first()).toContainText('$0.00')
      await expect(bodyRows.nth(1)).toContainText('—')
      await select('Holdings preview state', 'Newly added asset')
      const help = bodyRows
        .first()
        .getByRole('button', { name: 'Price Change (7d)', exact: true })
        .filter({ visible: true })
      await help.focus()
      await expect(page.getByRole('tooltip')).toContainText(
        'This asset was added to the basket during this 7 day period'
      )
      await page.keyboard.press('Escape')
      await capture('new-asset')
      await select('Holdings preview state', 'Loading performance')
      await expect(bodyRows.first()).toContainText('70.43%')
      await expect(bodyRows.first()).not.toContainText('+22.43%')
      await capture('performance-loading')
      await select('Holdings preview state', 'Loading basket')
      if (width === 1400) await expectIdentitySkeleton(bodyRows.first())
      await capture('basket-loading')
      await select('Holdings preview state', 'Long content')
      await expect(
        bodyRows.filter({ hasText: 'Applied Optoelectronics (Ondo Tokenized)' })
      ).toHaveCount(1)
      await noOverflow()
      await capture('long-content')
      if (width < 768)
        await expectHoldingRecordLayout(visibleRecords, width - 32)
      await select('Holdings preview state', 'Default')
      await select('Basket fixture', 'PHOTON · Stocks')
      await expect(bodyRows).toHaveCount(9)
      await expect(bodyRows.first()).toContainText('NASDAQ: $LITE')
      await noOverflow()
      await capture('stock-exposure')
      await composition
        .getByRole('tab', { name: 'Collateral', exact: true })
        .click()
      await noOverflow()
      await capture('stock-collateral')
      if (width === 1400) {
        await select('Basket fixture', 'CMC20 · Crypto')
        await composition
          .getByRole('tab', { name: 'Collateral', exact: true })
          .click()
        const laterBridge = bodyRows
          .filter({ hasText: 'Cardano Token' })
          .getByRole('button', { name: 'Bridged', exact: true })
          .filter({ visible: true })
        await laterBridge.focus()
        await page.keyboard.press('Enter')
        await expect(page.getByRole('dialog')).toBeVisible()
        await composition.evaluate(
          (el) => ((el as HTMLElement).style.width = '576px')
        )
        await expect(visibleRecords).toHaveCount(10)
        await page.keyboard.press('Escape')
        await expect(page.getByRole('dialog')).toBeHidden()
        await expect(review.getByTestId('table-sort-menu')).toBeFocused()
        await composition.evaluate((el) =>
          (el as HTMLElement).style.removeProperty('width')
        )
        await select('Holdings preview state', 'Newly added asset')
        await help.focus()
        await composition.evaluate(
          (el) => ((el as HTMLElement).style.width = '576px')
        )
        await expect(help).toBeFocused()
        await page.keyboard.press('Escape')
        await composition.evaluate((el) =>
          (el as HTMLElement).style.removeProperty('width')
        )
        await expect(help).toBeFocused()
        await page.keyboard.press('Escape')
        const laterLink = table
          .getByRole('link', { name: /^Cardano Token/ })
          .filter({ visible: true })
        await laterLink.focus()
        await composition.evaluate(
          (el) => ((el as HTMLElement).style.width = '576px')
        )
        await expect(visibleRecords).toHaveCount(18)
        await expect(laterLink).toBeFocused()
        await composition.evaluate((el) =>
          (el as HTMLElement).style.removeProperty('width')
        )
        await select('Holdings preview state', 'Default')
        await select('Basket fixture', 'PHOTON · Stocks')
        await composition
          .getByRole('tab', { name: 'Collateral', exact: true })
          .click()
        for (const available of [511, 512, 767, 768]) {
          await collateralTab.focus()
          await composition.evaluate(
            (el, value) => ((el as HTMLElement).style.width = `${value}px`),
            available
          )
          await expect(visibleRecords).toHaveCount(available < 768 ? 9 : 0)
          await expect(tabs).toHaveCount(1)
          await expect(collateralTab).toBeFocused()
          if (available < 768)
            await expectHoldingRecordLayout(visibleRecords, available)
          await expectHoldingsToolbar(composition, available)
          await noOverflow()
          await capture(`boundary-${available}`)
          if (available === 768) {
            await table.getByTestId('sort-change').click()
            await noOverflow()
            await select('Holdings preview state', 'Loading basket')
            await noOverflow()
            await capture('boundary-768-loading')
            await select('Holdings preview state', 'Default')
            await table.getByTestId('sort-weight').click()
          }
        }
        await composition.evaluate((el) =>
          (el as HTMLElement).style.removeProperty('width')
        )
        await select('Holdings preview width', 'Mobile · 390px')
        await expect(visibleRecords).toHaveCount(9)
        await noOverflow()
        await capture('constrained')
        await expect(composition).toHaveCSS('width', '390px')
        await expectHoldingRecordLayout(visibleRecords, 390)
        await table
          .getByTestId('holding-record-MTSIon')
          .scrollIntoViewIfNeeded()
        await info.attach('constrained-macom', {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
        await select('Holdings preview state', 'Long content')
        await noOverflow()
        await expectHoldingRecordLayout(visibleRecords, 390)
        await capture('constrained-long-content')
        await select('Holdings preview width', 'DTF overview · 836px')
        await expect(composition).toHaveCSS('width', '836px')
        await expect(visibleRecords).toHaveCount(0)
        await expect(collateralTab).toHaveAttribute('aria-selected', 'true')
        await expect(
          review.getByRole('combobox', { name: 'Holdings preview state' })
        ).toContainText('Long content')
        await noOverflow()
        await capture('overview-collateral-long')
        await select('Holdings preview state', 'Default')
        const appliedName = bodyRows
          .filter({ hasText: 'AAOIon' })
          .locator('[data-slot="entity-identity-name"]:visible')
        await info.attach('overview-column-budget', {
          body: Buffer.from(
            JSON.stringify(
              await table.locator('thead th:visible').evaluateAll((cells) =>
                cells.map((cell) => ({
                  text: cell.textContent,
                  width: cell.getBoundingClientRect().width,
                }))
              )
            )
          ),
          contentType: 'application/json',
        })
        await expect(appliedName).toHaveCSS('height', '24px')
        const lumentumName = table
          .locator('tbody tr')
          .filter({ hasText: 'LITEon' })
          .locator('[data-slot="entity-identity-name"]:visible')
        await expect(lumentumName).toHaveCSS('height', '24px')
        const macomName = table
          .locator('tbody tr')
          .filter({ hasText: 'MTSIon' })
          .locator('[data-slot="entity-identity-name"]:visible')
        await macomName.scrollIntoViewIfNeeded()
        await expect(macomName).toHaveCSS('line-height', '20px')
        await expect(macomName).toHaveCSS('height', '40px')
        expect(
          await macomName.evaluate(
            (element) => element.getBoundingClientRect().height
          )
        ).toBeGreaterThan(24)
        const nameSpace = await macomName.evaluate((name) => {
          const cell = name.closest('td')!
          const style = getComputedStyle(cell)
          return {
            right: name.getBoundingClientRect().right,
            availableRight:
              cell.getBoundingClientRect().right -
              parseFloat(style.paddingRight),
          }
        })
        expect(nameSpace.right).toBeCloseTo(nameSpace.availableRight, 0)
        await capture('overview-collateral')
        await exposureTab.click()
        await noOverflow()
        await capture('overview-exposure')
        await select('Holdings preview state', 'Long content')
        await noOverflow()
        await capture('overview-exposure-long')
        await select('Holdings preview state', 'Loading basket')
        await expect(composition).toHaveCSS('width', '836px')
        await capture('overview-loading')
        await select('Holdings preview state', 'Long content')
        await table.getByTestId('sort-change').click()
        await expect(table.getByTestId('sort-change')).toHaveAttribute(
          'aria-description',
          'descending'
        )
        await select('Holdings preview width', 'Full width')
        await expect(composition).not.toHaveCSS('width', '836px')
        await expect(table.getByTestId('sort-change')).toHaveAttribute(
          'aria-description',
          'descending'
        )
        await select('Holdings preview width', 'DTF overview · 836px')
        await expect(composition).toHaveCSS('width', '836px')
        await expect(table.getByTestId('sort-change')).toHaveAttribute(
          'aria-description',
          'descending'
        )
        await page.setViewportSize({ width: 390, height: 900 })
        await expect(visibleRecords).toHaveCount(9)
        await noOverflow()
        await capture('overview-on-phone')
      }
      await select('Holdings preview state', 'Empty')
      await expect(composition.getByRole('table')).toHaveCount(0)
      await expect(tabs).toHaveCount(1)
      await expect(tabs).toHaveCSS('height', '44px')
      await exposureTab.click()
      await expect(exposureTab).toHaveAttribute('aria-selected', 'true')
      expect(txLog).toHaveLength(0)
    })
  }

test.describe('touch pointer', () => {
  test.use({ hasTouch: true })
  test('holdings touch pointer 1400', async ({ page }, info) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.route(
      'https://storage-logos.reserve.org/logos/nasdaq--big.svg',
      (route) => route.fulfill({ status: 404, body: '' })
    )
    await page.goto(
      '/internal/design-system/components/table#holdings-family-review'
    )
    const composition = page.getByTestId('holdings-composition')
    await composition
      .getByRole('tab', { name: 'Collateral', exact: true })
      .click()
    expect(await page.evaluate(() => matchMedia('(hover: none)').matches)).toBe(
      true
    )
    const icon = composition
      .locator('tbody tr')
      .first()
      .locator('[data-slot="holding-external-icon"]:visible')
    await expect(icon).toHaveCSS('opacity', '1')
    await icon.scrollIntoViewIfNeeded()
    await info.attach('touch-arrow', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
  })
})
