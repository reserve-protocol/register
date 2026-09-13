import { test, expect } from '../fixtures/base'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

for (const theme of ['light', 'dark'])
  for (const width of [390, 1400])
    test(`auction repeated runs ${theme} ${width}`, async ({
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
        const active = list.getByTestId('rebalance-list-record').first()
        const history = page.getByTestId('rebalance-history-section')
        const historyBefore = await history.innerText()
        const pill = active.getByTestId('lifecycle-status-pill')
        const values = active.getByTestId('rebalance-metric-value')
        const count = page.getByTestId('rebalance-auctions-run')
        const select = async (id: string, option: string) => {
          await page.getByTestId(id).click()
          await page.getByTestId(option).click()
        }
        const state = (value: string) =>
          select('rebalance-preview-state', `rebalance-state-${value}`)
        const phase = (value: string) =>
          select('rebalance-preview-phase', `rebalance-phase-${value}`)
        await expect(count).toHaveAccessibleName('Auctions run')
        await expect(count).toHaveText('0')
        await count.focus()
        await page.keyboard.press('Enter')
        await expect(page.getByTestId('rebalance-auctions-run-0')).toBeFocused()
        await page.keyboard.press('End')
        await expect(page.getByTestId('rebalance-auctions-run-2')).toBeFocused()
        await page.keyboard.press('Enter')
        await expect(count).toHaveText('2')
        await expect(count).toBeFocused()
        await expect(pill).toHaveText('Ready to start')
        await expect(active.getByTestId('rebalance-auction-number')).toHaveText(
          'Auction 3'
        )
        await expect(values).toHaveText(['18h', '1d 18h', '2'])
        await expect(active).toContainText('Auctions run')
        await expect(pill).toHaveAttribute('data-status-role', 'actionable')
        await expect(history).toHaveText(historyBefore, { useInnerText: true })
        await page.getByTestId('rebalance-launcher-wallet').click()
        await expect(pill).toHaveAttribute('data-status-role', 'actionable')
        await expect(values).toHaveText(['18h', '1d 18h', '2'])
        await active.evaluate((el) => el.scrollIntoView({ block: 'center' }))
        await page.mouse.move(0, 0)
        await info.attach('two-run-next-ready', {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
        const height = (await active.boundingBox())!.height
        await state('loading')
        await expect(list.locator('a')).toHaveCount(0)
        expect((await active.boundingBox())!.height).toBe(height)
        await state('empty')
        await expect(list.getByTestId('rebalance-list-record')).toHaveCount(0)
        await state('unavailable')
        await expect(pill).toHaveText('Ready to start')
        await expect(active.getByTestId('rebalance-auction-number')).toHaveText(
          'Auction 3'
        )
        await expect(values).toHaveText(['18h', '1d 18h', '2'])
        await expect(history.getByTestId('rebalance-metric-value')).toHaveText(
          Array(9).fill('—')
        )
        await state('default')
        await expect(history).toHaveText(historyBefore, { useInnerText: true })
        await phase('permissionless')
        await expect(pill).toHaveText('Ready to start')
        await expect(values).toHaveText(['23h 59 min', '2'])
        await phase('ongoing')
        await expect(pill).toHaveText('Ongoing')
        await expect(active.getByTestId('rebalance-auction-number')).toHaveText(
          'Auction 3'
        )
        await expect(pill).toHaveAttribute('data-status-role', 'active')
        await expect(values).toHaveText(['5 min', '23h 59 min', '2'])
        await page.getByTestId('rebalance-constrain').click()
        await expect(count).toHaveText('2')
        const fit = await list.evaluate((el) => ({
          width: el.clientWidth,
          scroll: el.scrollWidth,
        }))
        expect(fit.scroll).toBeLessThanOrEqual(fit.width)
        await select('rebalance-auctions-run', 'rebalance-auctions-run-1')
        await expect(pill).toHaveText('Ongoing')
        await expect(active.getByTestId('rebalance-auction-number')).toHaveText(
          'Auction 2'
        )
        await expect(values.last()).toHaveText('1')
        await select('rebalance-auctions-run', 'rebalance-auctions-run-0')
        await expect(pill).toHaveText('Ongoing')
        await expect(active.getByTestId('rebalance-auction-number')).toHaveText(
          'Auction 1'
        )
        await expect(values).toHaveCount(2)
        await phase('restricted')
        await expect(pill).toHaveText('Ready to start')
        await expect(values).toHaveText(['18h', '1d 18h'])
        await expect(active.locator('button')).toHaveCount(0)
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
