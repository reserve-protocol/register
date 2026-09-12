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

test('Earn candidate exposes source-backed opportunities', async ({ page }) => {
  await page.goto('/internal/design-system/components/table#earn-family-review')
  const review = page.getByTestId('earn-review')
  await expect(review).toBeVisible()
  await expect(review.getByRole('table')).toContainText('vlRSR')
})

for (const theme of ['light', 'dark'])
  for (const width of [320, 390, 1400]) {
    test(`Earn candidate states ${theme} ${width}`, async ({ page }, info) => {
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
      const rows = composition.locator('tbody tr')
      const choose = async (name: string, option: string) => {
        await review.getByRole('combobox', { name, exact: true }).click()
        await page.getByRole('option', { name: option, exact: true }).click()
      }
      const inspect = async (name: string, family = 'index', wallet = true) => {
        await composition.evaluate((element) => {
          element.style.scrollMarginTop = '120px'
          element.scrollIntoView({ block: 'start' })
        })
        const overflow = await composition.evaluate((root) =>
          [
            ...root.querySelectorAll(
              'td, [data-slot="earn-pair"], [data-slot="entity-identity-name"], [data-slot="earn-wallet-position"], [data-slot="earn-wallet-values"]'
            ),
          ]
            .filter(
              (element) =>
                element.getClientRects().length &&
                element.scrollWidth > element.clientWidth + 1
            )
            .map((element) => ({
              text: element.textContent,
              client: element.clientWidth,
              scroll: element.scrollWidth,
            }))
        )
        expect(overflow).toEqual([])
        if (
          width === 1400 &&
          (name === 'index-wallet' || name === 'yield-wallet')
        ) {
          const zero = composition
            .getByText('$0.00', { exact: true })
            .filter({ visible: true })
          await expect(zero).toHaveCSS('font-size', '16px')
          await expect(zero).toHaveCSS('font-weight', '300')
          const colors = await zero.evaluate((element) => ({
            zero: getComputedStyle(element).color,
            supporting: getComputedStyle(
              element.parentElement!.lastElementChild!
            ).color,
            primary: getComputedStyle(
              element
                .closest('tbody')!
                .querySelector('[data-testid="canonical-metric-value"]')!
            ).color,
          }))
          expect(colors.zero).toBe(colors.supporting)
          expect(colors.zero).not.toBe(colors.primary)
        }
        if (width < 1024) {
          for (const record of await composition
            .locator('[data-testid^="earn-record-"]:visible')
            .all()) {
            const facts = record.locator('[data-slot="earn-opportunity-facts"]')
            await expect(facts.locator(':scope > div').first()).toContainText(
              'Governs'
            )
            await expect(facts.locator(':scope > div').last()).toContainText(
              'TVL'
            )
            const rate = record.locator('[data-slot="earn-rate-fact"]')
            expect(
              await rate.evaluate((element) => {
                const label = element.firstElementChild!.getBoundingClientRect()
                const value = element.lastElementChild!.getBoundingClientRect()
                return value.top - label.bottom
              })
            ).toBe(4)
          }
          if (
            name === 'index-wallet' ||
            name === 'yield-wallet' ||
            name.endsWith('-sparse')
          ) {
            const positions = composition.locator(
              '[data-slot="earn-wallet-position"]:visible'
            )
            await expect(positions).toHaveCount(
              name.endsWith('-sparse') || family === 'yield' ? 1 : 3
            )
            for (const position of await positions.all()) {
              await expect(position).toHaveCSS('height', '20px')
              await expect(position).toHaveCSS('font-size', '14px')
              await expect(position).toHaveCSS('font-weight', '300')
              for (const value of await position.locator('span').all()) {
                await expect(value).toHaveCSS('font-size', '14px')
                await expect(value).toHaveCSS('font-weight', '300')
              }
              const label = position.locator('[data-slot="earn-wallet-label"]')
              const values = position.locator(
                '[data-slot="earn-wallet-values"]'
              )
              const labelBounds = (await label.boundingBox())!
              const valuesBounds = (await values.boundingBox())!
              expect(
                valuesBounds.x - labelBounds.x - labelBounds.width
              ).toBeCloseTo(8, 0)
              expect(
                Math.abs(valuesBounds.y - labelBounds.y)
              ).toBeLessThanOrEqual(1)
              await expect(position).toContainText('·')
            }
            await expect(
              composition
                .getByText('$0.00', { exact: true })
                .filter({ visible: true })
            ).toHaveCount(0)
          }
        }
        if (width === 1400) {
          await expect(composition.locator('th:visible')).toHaveText([
            'Gov. Token',
            'Governs',
            'TVL',
            ...(wallet
              ? [family === 'index' ? 'Your lock' : 'Your stake']
              : []),
            'Avg. 30d%',
          ])
          expect(
            await rows
              .first()
              .locator('td:visible')
              .evaluateAll((cells) =>
                cells.map((cell) => getComputedStyle(cell).textAlign)
              )
          ).toEqual(
            wallet
              ? ['left', 'left', 'right', 'right', 'right']
              : ['left', 'left', 'right', 'right']
          )
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth)
        ).toBeLessThanOrEqual(width)
        await info.attach(name, {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
      }
      await expect(rows).toHaveCount(4)
      await page.evaluate(() => document.fonts.ready)
      await expect(rows.first()).toContainText('vlRSR')
      await inspect('index-default', 'index', false)
      const mainGeometry = () =>
        composition
          .locator('[data-testid^="earn-record-"]:visible')
          .evaluateAll((records) =>
            records.map((record) => {
              const row = record.getBoundingClientRect()
              const facts = record
                .querySelector('[data-slot="earn-opportunity-facts"]')!
                .getBoundingClientRect()
              return {
                x: facts.x - row.x,
                y: facts.y - row.y,
                width: facts.width,
                height: facts.height,
              }
            })
          )
      const beforeWallet = await mainGeometry()
      await review
        .getByRole('switch', { name: 'Wallet position', exact: true })
        .click()
      await expect(composition).toContainText('18,517.50 RSR')
      expect(await mainGeometry()).toEqual(beforeWallet)
      await inspect('index-wallet')
      await choose('Earn preview state', 'Sparse wallet positions')
      await inspect('index-sparse')
      await choose('Earn preview state', 'Long content')
      await inspect('index-long')
      if (width === 1400) {
        await composition.evaluate((element) => {
          element.style.width = '1024px'
        })
        await inspect('index-long-1024')
        await composition.evaluate((element) =>
          element.style.removeProperty('width')
        )
      }
      await choose('Earn preview state', 'Loading wallet position')
      await expect(composition).not.toContainText('18,517.50 RSR')
      await expect(composition).toContainText('$156,879')
      await inspect('wallet-loading')
      await choose('Earn preview state', 'Zero / unavailable')
      await expect(composition).toContainText('0.00%')
      await expect(composition).toContainText('—')
      await expect(composition).toContainText('18,517.50 RSR')
      await inspect('zero-unavailable')
      await choose('Earn preview state', 'Loading opportunities')
      await expect(
        composition.getByRole('button', { name: /vlRSR/ })
      ).toHaveCount(0)
      await inspect('loading')
      await choose('Earn preview state', 'Empty')
      await expect(composition.getByRole('status')).toContainText(
        'No opportunities'
      )
      await choose('Earn opportunity family', 'Yield DTF Staking')
      await expect(
        review.getByRole('combobox', { name: 'Earn preview state' })
      ).toContainText('Empty')
      await choose('Earn preview state', 'Default')
      await expect(rows).toHaveCount(2)
      await expect(composition).toContainText('eusdRSR')
      await inspect('yield-wallet', 'yield')
      await choose('Earn preview state', 'Sparse wallet positions')
      await inspect('yield-sparse', 'yield')
      await choose('Earn preview state', 'Long content')
      if (width === 1400)
        await composition.evaluate((element) => {
          element.style.width = '1024px'
        })
      await inspect('yield-long', 'yield')
      if (width === 1400)
        await composition.evaluate((element) =>
          element.style.removeProperty('width')
        )
      await choose('Earn preview state', 'Default')
      await review
        .getByRole('switch', { name: 'Wallet position', exact: true })
        .click()
      await inspect('yield-default', 'yield', false)
    })
  }

for (const theme of ['light', 'dark'])
  for (const width of [390, 1400])
    test(`Earn candidate interactions ${theme} ${width}`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(
        '/internal/design-system/components/table#earn-family-review'
      )
      const composition = page.getByTestId('earn-composition')
      const trigger = composition
        .getByTestId('earn-governs-shared-rsr')
        .filter({ visible: true })
      await trigger.focus()
      await page.keyboard.press('Enter')
      const popup = page.getByTestId('earn-governed-assets')
      await expect(popup).toBeVisible()
      await expect(popup.getByRole('link')).toHaveCount(4)
      await expect(popup.getByRole('link').first()).toBeFocused()
      await info.attach('governed-open', {
        body: await page.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      })
      await page.keyboard.press('Escape')
      await expect(trigger).toBeFocused()
      await trigger.hover()
      await expect(popup).toBeVisible()
      await page.mouse.move(0, 0)
      await expect(popup).toBeHidden()
      const identity = composition
        .getByTestId('earn-open-lcap')
        .filter({ visible: true })
      await identity.focus()
      await page.keyboard.press('Enter')
      const dialog = page.getByRole('dialog')
      await expect(dialog).toContainText('Non-executing lab preview')
      await expect(dialog.getByRole('button')).toHaveCount(1)
      await page.keyboard.press('Escape')
      await expect(identity).toBeFocused()
      await composition
        .getByRole('button', {
          name: 'How is this rate calculated?',
          exact: true,
        })
        .first()
        .click()
      const help = page.getByRole('button', {
        name: 'How is the estimated APY or APR calculated?',
      })
      await expect(help).toBeFocused()
      await expect(help).toHaveAttribute('aria-expanded', 'true')
      await expect(
        page
          .getByRole('region')
          .filter({ hasText: 'approximately the last 30 days' })
      ).toBeVisible()
      await expect(page.getByRole('dialog')).toHaveCount(0)
    })

for (const theme of ['light', 'dark'])
  test(`Earn candidate projection and sorting ${theme}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto(
      '/internal/design-system/components/table#earn-family-review'
    )
    const review = page.getByTestId('earn-review')
    const composition = review.getByTestId('earn-composition')
    const rows = composition.locator('tbody tr')
    const choose = async (option: string) => {
      await review.getByRole('combobox', { name: 'Earn preview state' }).click()
      await page.getByRole('option', { name: option, exact: true }).click()
    }
    await composition.getByTestId('sort-tvl').click()
    await expect(rows.first()).toContainText('vlSQUILL-OPEN')
    await choose('Empty')
    await choose('Default')
    await expect(composition.getByTestId('sort-tvl')).toHaveAttribute(
      'aria-description',
      'ascending'
    )
    await expect(rows.first()).toContainText('vlSQUILL-OPEN')
    const root = composition.locator('[data-slot="table-family-container"]')
    const resize = async (width: number) => {
      await composition.evaluate((element, width) => {
        element.style.width = `${width}px`
      }, width)
      await expect
        .poll(() =>
          root.evaluate((element) => element.getBoundingClientRect().width)
        )
        .toBe(width)
    }
    const identity = composition
      .getByTestId('earn-open-lcap')
      .filter({ visible: true })
    await identity.focus()
    await resize(1023)
    await expect(identity).toBeFocused()
    await expect(
      composition.locator('[data-testid^="earn-record-"]:visible')
    ).toHaveCount(4)
    await resize(1024)
    await expect(identity).toBeFocused()
    await expect(
      composition.locator('[data-testid^="earn-record-"]:visible')
    ).toHaveCount(0)
    await composition.getByTestId('sort-tvl').focus()
    await resize(390)
    const sort = composition.getByTestId('table-sort-menu')
    await expect(sort).toBeFocused()
    await expect(sort).toHaveAttribute('aria-description', 'ascending')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('table-sort-options')).toBeVisible()
    await resize(1024)
    await expect(page.getByTestId('table-sort-options')).toBeHidden()
    await expect(composition.getByTestId('sort-tvl')).toBeFocused()
    const disclosure = composition
      .getByTestId('earn-governs-shared-rsr')
      .filter({ visible: true })
    await disclosure.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('earn-governed-assets')).toBeVisible()
    await resize(390)
    await expect(page.getByTestId('earn-governed-assets')).toBeHidden()
    await expect(disclosure).toBeFocused()
    await identity.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
    await resize(1024)
    await page.keyboard.press('Escape')
    await expect(identity).toBeFocused()
    await expect(rows.first()).toContainText('vlSQUILL-OPEN')
    await composition.evaluate((element) =>
      element.style.removeProperty('width')
    )
    await review
      .getByRole('switch', { name: 'Constrained Earn column' })
      .click()
    await expect
      .poll(() =>
        root.evaluate((element) => element.getBoundingClientRect().width)
      )
      .toBe(390)
    await composition.scrollIntoViewIfNeeded()
    await info.attach('constrained-column', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
  })
