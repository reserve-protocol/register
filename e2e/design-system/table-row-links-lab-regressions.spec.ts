import { type Locator } from '@playwright/test'
import { test, expect } from '../fixtures/base'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

for (const theme of ['light', 'dark'])
  for (const width of [390, 1400]) {
    test(`table row links ${theme} ${width}`, async ({ page, txLog }, info) => {
      const source = readReviewSource(process.cwd())
      const guard = watchReviewSource(process.cwd())
      try {
        await page.setViewportSize({ width, height: 900 })
        await page.addInitScript(
          (mode) => localStorage.setItem('theme-ui-color-mode', mode),
          theme
        )
        await page.goto('/internal/design-system/components/table')
        await expect(page.getByTestId('discover-composition')).toBeVisible()
        await page.evaluate(() => document.fonts.ready)
        const capture = async (name: string) => {
          await info.attach(name, {
            body: await page.screenshot({ animations: 'disabled' }),
            contentType: 'image/png',
          })
        }
        const reveal = async (row: Locator) => {
          await row.evaluate((el) => {
            el.style.scrollMarginTop = '160px'
            el.scrollIntoView({ block: 'start' })
          })
          await page.mouse.move(0, 0)
        }
        const neutralIdentity = async (row: Locator, name: string) => {
          const link = row.locator('a[data-table-focus]:visible').first()
          await reveal(row)
          const text = link.locator(
            '[data-slot="entity-identity-name"], [data-slot="entity-identity-supporting"]'
          )
          const colors = await text.evaluateAll((nodes) =>
            nodes.map((el) => getComputedStyle(el).color)
          )
          const background = await row.evaluate(
            (el) => getComputedStyle(el).backgroundColor
          )
          await link.hover()
          await expect.soft(link).toHaveCSS('text-decoration-line', 'none')
          expect(
            await text.evaluateAll((nodes) =>
              nodes.map((el) => getComputedStyle(el).color)
            )
          ).toEqual(colors)
          if (width === 1400)
            await expect(row).not.toHaveCSS('background-color', background)
          await capture(`${name}-hover`)
          await page.mouse.move(0, 0)
          await page.keyboard.press('Tab')
          await link.focus()
          await expect(link).toBeFocused()
          expect(
            await link.evaluate((el) => el.matches(':focus-visible'))
          ).toBe(true)
          expect(
            await link.evaluate((el) => getComputedStyle(el).boxShadow)
          ).toContain('2px')
          await expect(link).toHaveAttribute('href', /.+/)
          await capture(`${name}-focus`)
        }

        const discover = page.getByTestId('discover-composition')
        if (width === 1400) {
          await neutralIdentity(
            discover.locator('tbody tr').first(),
            'discover'
          )
        } else {
          const card = discover.getByTestId('discover-card').first()
          await card.hover()
          await expect(card).toHaveCSS('text-decoration-line', 'none')
          const title = card.locator('h3')
          const color = await title.evaluate((el) => getComputedStyle(el).color)
          await page.mouse.move(0, 0)
          await expect(title).toHaveCSS('color', color)
          await card.focus()
          expect(
            await card.evaluate((el) => getComputedStyle(el).boxShadow)
          ).toContain('2px')
          await capture('discover-card-focus')
        }
        const positions = page.getByTestId('table-family-positions')
        for (const family of ['index', 'yield']) {
          await page
            .getByTestId(
              family === 'index' ? 'table-family-index' : 'table-state-yield'
            )
            .click()
          await neutralIdentity(positions.locator('tbody tr').first(), family)
          const browse = positions.locator(
            'a[data-link-treatment="standalone"]'
          )
          await browse.hover()
          await expect(browse).toHaveCSS('text-decoration-line', 'underline')
        }

        const sourceLink = page
          .getByTestId('table-family-withdrawals')
          .locator('a[data-table-focus]:visible')
          .first()
        await sourceLink.hover()
        await expect(sourceLink).toHaveCSS('text-decoration-line', 'underline')
        await expect(sourceLink).toHaveAttribute('target', '_blank')

        const holdings = page.getByTestId('holdings-composition')
        await holdings
          .getByRole('tab', { name: 'Collateral', exact: true })
          .click()
        const explorer = holdings.locator('a[data-table-focus]:visible').first()
        await explorer.hover()
        await expect(explorer).toHaveCSS('text-decoration-line', 'underline')
        await expect(
          explorer.locator('[data-slot="holding-external-icon"]')
        ).toHaveCSS('opacity', '1')
        const bridge = holdings
          .locator('button[data-table-focus^="bridge-"]:visible')
          .first()
        await expect(bridge).toHaveCSS('text-decoration-line', 'underline')

        await page.goto(
          '/internal/design-system/components/table#auctions-records-review'
        )
        for (const [kind, row] of [
          ['governance', page.getByTestId('rich-record').first()],
          ['rebalance', page.getByTestId('rebalance-list-record').nth(1)],
        ] as const) {
          await reveal(row)
          const title = row.locator('h4')
          const color = await title.evaluate((el) => getComputedStyle(el).color)
          const background = await row.evaluate(
            (el) => getComputedStyle(el).backgroundColor
          )
          await title.hover()
          await expect.soft(title).toHaveCSS('color', color)
          await expect.soft(row).not.toHaveCSS('background-color', background)
          await capture(`${kind}-hover`)
          await page.mouse.move(0, 0)
          await page.keyboard.press('Tab')
          const rowLink =
            kind === 'rebalance'
              ? row.getByTestId('rebalance-record-link')
              : row.getByTestId('proposal-record-link')
          await rowLink.focus()
          expect(
            await row.evaluate((el) => getComputedStyle(el).boxShadow)
          ).toContain('2px')
          await expect(rowLink).toHaveAttribute('href', /.+/)
        }
        await expect(
          page.getByTestId('rebalance-browse-list').locator('[aria-current]')
        ).toHaveCount(0)
        expect(txLog).toHaveLength(0)
      } finally {
        guard.close()
        assertUnchangedSource(source, readReviewSource(process.cwd()), [
          ...guard.changes,
        ])
        await info.attach('public-source-digest', {
          body: Buffer.from(source.digest),
          contentType: 'text/plain',
        })
      }
    })
  }
