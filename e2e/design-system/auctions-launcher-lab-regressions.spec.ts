import { test, expect } from '../fixtures/base'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

for (const theme of ['light', 'dark'])
  for (const width of [390, 1400])
    test(`auction launcher wallet preview ${theme} ${width}`, async ({
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
        const toggle = page.getByTestId('rebalance-launcher-wallet')
        const list = page.getByTestId('rebalance-browse-list')
        const active = list.getByTestId('rebalance-list-record').first()
        const pill = active.getByTestId('lifecycle-status-pill')
        const history = list.getByTestId('rebalance-list-record').nth(1)
        const before = await history.innerText()
        await expect(toggle).not.toBeChecked()
        await expect(toggle).toHaveAccessibleName('Connected launcher wallet')
        await expect(pill).toHaveAttribute('data-status-role', 'actionable')
        await toggle.focus()
        await page.keyboard.press('Space')
        await expect(toggle).toBeChecked()
        await expect(toggle).toBeFocused()
        await expect(pill).toHaveAttribute('data-status-role', 'actionable')
        await expect(pill).toHaveText('Ready to start')
        await expect(active.getByTestId('rebalance-auction-number')).toHaveText(
          'Auction 1'
        )
        await expect(active.getByTestId('rebalance-metric-value')).toHaveText([
          '18h',
          '1d 18h',
        ])
        await expect(history).toHaveText(before, { useInnerText: true })
        await expect(active.locator('button')).toHaveCount(0)
        await expect(
          active.getByTestId('rebalance-record-link')
        ).toHaveAttribute('href', /\/auctions\/rebalance\/\d+$/)
        await expect(page.getByTestId('rebalance-fixture-note')).toContainText(
          'does not connect or check a real wallet'
        )
        await active.evaluate((el) => el.scrollIntoView({ block: 'center' }))
        await page.mouse.move(0, 0)
        await info.attach('restricted-launcher', {
          body: await page.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        })
        const state = async (value: string) => {
          await page.getByTestId('rebalance-preview-state').click()
          await page.getByTestId(`rebalance-state-${value}`).click()
        }
        await state('loading')
        await expect(list.locator('a')).toHaveCount(0)
        await expect(toggle).toBeChecked()
        await state('empty')
        await expect(list.getByTestId('rebalance-list-record')).toHaveCount(0)
        await state('unavailable')
        await expect(pill).toHaveAttribute('data-status-role', 'actionable')
        await expect(history.getByTestId('rebalance-metric-value')).toHaveText([
          '—',
          '—',
          '—',
        ])
        await page.getByTestId('rebalance-constrain').click()
        await expect(toggle).toBeChecked()
        expect((await list.boundingBox())!.width).toBeLessThanOrEqual(390)
        await toggle.click()
        await expect(pill).toHaveAttribute('data-status-role', 'actionable')
        for (const [phase, role] of [
          ['permissionless', 'actionable'],
          ['ongoing', 'active'],
        ]) {
          await page.getByTestId('rebalance-preview-phase').click()
          await page.getByTestId(`rebalance-phase-${phase}`).click()
          await expect(pill).toHaveAttribute('data-status-role', role)
          await toggle.click()
          await expect(pill).toHaveAttribute('data-status-role', role)
          await toggle.click()
        }
        await page.getByTestId('rebalance-preview-phase').click()
        await page.getByTestId('rebalance-phase-restricted').click()
        await expect(pill).toHaveAttribute('data-status-role', 'actionable')
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
