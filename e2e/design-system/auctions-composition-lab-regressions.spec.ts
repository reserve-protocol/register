import { test, expect } from '../fixtures/base'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

for (const theme of ['light', 'dark'])
  for (const width of [390, 1400])
    test(`auction composition ${theme} ${width}`, async ({
      page,
      txLog,
    }, info) => {
      const source = readReviewSource(process.cwd())
      const guard = watchReviewSource(process.cwd())
      try {
        await page.setViewportSize({ width, height: 900 })
        await page.addInitScript(
          (mode) => localStorage.setItem('theme-ui-color-mode', mode),
          theme
        )
        await page.goto(
          '/internal/design-system/components/table#auctions-records-review'
        )
        await page.evaluate(() => document.fonts.ready)
        const list = page.getByTestId('rebalance-browse-list')
        const rows = list.getByTestId('rebalance-list-record')
        const active = rows.first()
        const history = rows.nth(1)
        if (width === 1400) expect((await list.boundingBox())!.width).toBe(640)
        const select = async (id: string, option: string) => {
          await page.getByTestId(id).click()
          await page.getByTestId(option).click()
        }
        const state = (value: string) =>
          select('rebalance-preview-state', `rebalance-state-${value}`)
        const phase = (value: string) =>
          select('rebalance-preview-phase', `rebalance-phase-${value}`)
        const capture = async (name: string) => {
          await active.evaluate((el) => el.scrollIntoView({ block: 'center' }))
          await page.mouse.move(0, 0)
          await info.attach(name, {
            body: await page.screenshot({ animations: 'disabled' }),
            contentType: 'image/png',
          })
        }
        await expect(active.getByTestId('rebalance-access')).toHaveText(
          'Only the auction launcher can start auctions'
        )
        await expect(
          active.getByTestId('lifecycle-status-pill')
        ).toHaveAttribute('data-status-role', 'actionable')
        await expect(list.getByTestId('rebalance-evidence-rail')).toHaveCount(0)
        await expect(active.getByTestId('rebalance-timing-icon')).toHaveCount(0)
        await expect(history.getByTestId('rebalance-timing-icon')).toHaveCount(
          0
        )
        const sectionHeader = page
          .getByTestId('rebalance-history-section')
          .locator('header')
        await expect(sectionHeader).toHaveCSS(
          'background-color',
          await history.evaluate((el) => getComputedStyle(el).backgroundColor)
        )
        await expect(sectionHeader.locator('h4')).toHaveCSS('font-size', '14px')
        await expect(active.locator('h4')).toHaveCSS('font-size', '16px')
        await select('rebalance-auctions-run', 'rebalance-auctions-run-2')
        await expect(
          active.getByTestId('rebalance-auction-history')
        ).toContainText('2')
        const context = active.getByTestId('rebalance-operational-context')
        const details = active.getByTestId('rebalance-operational-summary')
        await expect(
          context.getByTestId('rebalance-auction-number')
        ).toHaveText('Auction 3')
        await expect(details.locator('dt')).toHaveText([
          'Permissionless in',
          'Expires in',
          'Auctions run',
        ])
        for (const label of await list.locator('dt').all())
          await expect(label).toHaveCSS('font-size', '14px')
        for (const value of await list
          .getByTestId('rebalance-metric-value')
          .all())
          await expect(value).toHaveCSS('font-size', '14px')
        for (const pair of await list.locator('dl > div').all()) {
          const type = await pair.evaluate((el) => {
            const label = getComputedStyle(el.querySelector('dt')!)
            const value = getComputedStyle(
              el.querySelector('[data-testid="rebalance-metric-value"]')!
            )
            return [
              label.fontSize,
              value.fontSize,
              label.lineHeight,
              value.lineHeight,
            ]
          })
          expect(type).toEqual(['14px', '14px', '20px', '20px'])
        }
        const heading = (await active
          .getByTestId('rebalance-record-header')
          .boundingBox())!
        const stateBand = (await active
          .getByTestId('rebalance-record-state')
          .boundingBox())!
        expect(stateBand.y).toBeGreaterThanOrEqual(heading.y)
        expect(stateBand.y + stateBand.height).toBeLessThanOrEqual(
          heading.y + heading.height
        )
        if (width === 1400) {
          expect(stateBand.y).toBe(heading.y)
          expect(stateBand.x + stateBand.width).toBe(heading.x + heading.width)
        }
        await capture('restricted-repeat')
        await page.getByTestId('rebalance-launcher-wallet').click()
        await expect(active.getByTestId('rebalance-access')).toHaveText(
          'Connected launcher wallet'
        )
        await expect(
          active.getByTestId('lifecycle-status-pill')
        ).toHaveAttribute('data-status-role', 'actionable')
        await capture('launcher')
        await state('price-unavailable')
        await expect(active.getByTestId('rebalance-prerequisite')).toHaveText(
          'Price unavailable — cannot launch'
        )
        await expect(active.getByTestId('lifecycle-status-pill')).toHaveCount(0)
        await expect(
          active.getByTestId('rebalance-prerequisite')
        ).toHaveAttribute('data-tone', 'warning')
        await capture('price-unavailable')
        const blockedHeight = (await active.boundingBox())!.height
        await state('loading')
        await expect(list.locator('a')).toHaveCount(0)
        expect((await active.boundingBox())!.height).toBe(blockedHeight)
        await state('price-unavailable')
        await phase('ongoing')
        await expect(active.getByTestId('rebalance-prerequisite')).toHaveCount(
          0
        )
        await expect(active.getByTestId('lifecycle-status-pill')).toHaveText(
          'Ongoing'
        )
        await expect(active.getByTestId('rebalance-access')).toHaveCount(0)
        await capture('ongoing')
        await phase('restricted')
        await expect(active.getByTestId('rebalance-prerequisite')).toBeVisible()
        await state('default')
        await phase('permissionless')
        await expect(active.getByTestId('rebalance-access')).toHaveText(
          'Permissionless'
        )
        await expect(context).toContainText('Auction 3')
        await expect(details.locator('dt')).toHaveText([
          'Expires in',
          'Auctions run',
        ])
        await capture('permissionless')
        await state('historical')
        await expect(rows).toHaveCount(3)
        await expect(list.locator('[data-active="true"]')).toHaveCount(0)
        await expect(page.getByTestId('rebalance-active-section')).toHaveCount(
          0
        )
        await capture('history-only')
        await state('loading')
        await expect(rows).toHaveCount(3)
        await expect(list.locator('a')).toHaveCount(0)
        await state('empty')
        await expect(rows).toHaveCount(0)
        await state('pressure')
        await phase('restricted')
        await page.getByTestId('rebalance-launcher-wallet').click()
        await expect(active.getByTestId('rebalance-access')).toHaveText(
          'Only the auction launcher can start auctions'
        )
        await expect(active.getByTestId('lifecycle-status-pill')).toHaveText(
          'Ready to start'
        )
        await expect(
          rows.last().getByTestId('rebalance-metric-value')
        ).toHaveText(['—', '—', '—'])
        await rows.last().scrollIntoViewIfNeeded()
        await page.mouse.move(0, 0)
        await info.attach('long-history-unavailable', {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
        if (width === 1400) {
          await phase('ongoing')
          const primary = active.getByTestId('rebalance-primary-timing')
          for (const viewport of [320, 543, 544, 672, 1400]) {
            await page.setViewportSize({ width: viewport, height: 900 })
            const primaryBounds = (await primary.boundingBox())!
            const detailBounds = (await details.boundingBox())!
            expect(detailBounds.y).toBeGreaterThanOrEqual(
              primaryBounds.y + primaryBounds.height
            )
            const historyValues = history.getByTestId('rebalance-metric-value')
            const left = (await historyValues.first().boundingBox())!
            const right = (await historyValues.last().boundingBox())!
            const bounds = (await list.boundingBox())!
            expect(right.y).toBeGreaterThanOrEqual(left.y)
            if (bounds.width < 512) expect(right.y).toBeGreaterThan(left.y)
            for (const pair of await list.locator('dl > div').all()) {
              const box = (await pair.boundingBox())!
              expect(box.x).toBeGreaterThanOrEqual(bounds.x + 24)
              expect(box.x + box.width).toBeLessThanOrEqual(
                bounds.x + bounds.width - 24
              )
            }
            const readyHeight = (await active.boundingBox())!.height
            await state('loading')
            expect((await active.boundingBox())!.height).toBe(readyHeight)
            await state('pressure')
            expect(
              await list.evaluate((el) => el.scrollWidth)
            ).toBeLessThanOrEqual(bounds.width)
            if (viewport === 320) await capture('ongoing-320')
          }
        }
        const fit = await list.evaluate((el) => ({
          width: el.clientWidth,
          scroll: el.scrollWidth,
        }))
        expect(fit.scroll).toBeLessThanOrEqual(fit.width)
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
