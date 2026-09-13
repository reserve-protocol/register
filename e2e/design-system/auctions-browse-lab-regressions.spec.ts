import { type Locator } from '@playwright/test'
import { test, expect } from '../fixtures/base'
import { REBALANCE_IDENTITIES } from '../../src/views/internal/design-system/auctions-browse/fixtures'
import {
  assertUnchangedSource,
  readReviewSource,
  watchReviewSource,
} from './review-source'

for (const theme of ['light', 'dark'])
  for (const width of [390, 1400])
    test(`auction browse states and links ${theme} ${width}`, async ({
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
        await expect(page.getByTestId('rebalance-preview-state')).toBeVisible()
        await page.evaluate(() => document.fonts.ready)
        const list = page.getByTestId('rebalance-browse-list')
        const records = list.getByTestId('rebalance-list-record')
        const active = records.first()
        const history = records.nth(1)
        const long = records.last()
        const capture = async (name: string, target: Locator = list) => {
          await target.evaluate((el) => el.scrollIntoView({ block: 'center' }))
          await page.mouse.move(0, 0)
          await info.attach(name, {
            body: await page.screenshot({ animations: 'disabled' }),
            contentType: 'image/png',
          })
        }
        const state = async (value: string) => {
          await page.getByTestId('rebalance-preview-state').click()
          await page.getByTestId(`rebalance-state-${value}`).click()
        }
        const phase = async (value: string) => {
          await page.getByTestId('rebalance-preview-phase').click()
          await page.getByTestId(`rebalance-phase-${value}`).click()
        }
        await expect(records).toHaveCount(4)
        for (const [index, identity] of REBALANCE_IDENTITIES.entries()) {
          const row = records.nth(index)
          await expect(row.locator('h4')).toHaveText(identity.title)
          await expect(row.locator('time')).toContainText(/\d{2}:\d{2} (am|pm)/)
          await expect(row.locator('time')).toHaveAttribute(
            'datetime',
            new Date(identity.creationTime * 1000).toISOString()
          )
          await expect(
            row.getByTestId('rebalance-record-link')
          ).toHaveAttribute(
            'href',
            new RegExp(`/auctions/rebalance/${identity.id}$`)
          )
          await expect(
            row.getByTestId('rebalance-proposer-link')
          ).toHaveAttribute(
            'href',
            `https://bscscan.com/address/${identity.proposer}`
          )
        }
        await expect(list.locator('a a')).toHaveCount(0)
        for (const row of await records.all()) {
          const by = await row
            .getByTestId('rebalance-proposer-group')
            .locator('span')
            .first()
            .boundingBox()
          const link = await row
            .getByTestId('rebalance-proposer-link')
            .boundingBox()
          expect(by!.y).toBe(link!.y)
        }
        await expect(list.locator('[aria-current]')).toHaveCount(0)
        await expect(list.locator('[data-status-icon="spinner"]')).toHaveCount(
          0
        )
        await expect(
          active.getByTestId('lifecycle-status-pill')
        ).toHaveAttribute('data-status-role', 'actionable')
        await expect(history.getByTestId('rebalance-metric-value')).toHaveText([
          '96.4%',
          '−1.51%',
          '$84,210 Traded',
        ])
        const fit = await list.evaluate((el) => ({
          width: el.clientWidth,
          scroll: el.scrollWidth,
        }))
        expect(fit.scroll).toBeLessThanOrEqual(fit.width)
        await capture('default', active)
        const loadedHeights = await records.evaluateAll((rows) =>
          rows.map((row) => row.getBoundingClientRect().height)
        )
        await state('loading')
        await expect(list.locator('a')).toHaveCount(0)
        await expect(list.getByTestId('v1-skeleton').first()).toBeVisible()
        expect(
          await records.evaluateAll((rows) =>
            rows.map((row) => row.getBoundingClientRect().height)
          )
        ).toEqual(loadedHeights)
        await capture('list-loading', active)
        await state('metrics-loading')
        await expect(history).toHaveAttribute('aria-busy', 'true')
        await expect(active).toHaveAttribute('aria-busy', 'false')
        await expect(history.getByTestId('rebalance-record-link')).toBeVisible()
        expect(
          await records.evaluateAll((rows) =>
            rows.map((row) => row.getBoundingClientRect().height)
          )
        ).toEqual(loadedHeights)
        await state('unavailable')
        await expect(history).toHaveAttribute('aria-busy', 'false')
        await expect(list.getByTestId('v1-skeleton')).toHaveCount(0)
        await expect(history.getByTestId('rebalance-metric-value')).toHaveText([
          '—',
          '—',
          '—',
        ])
        await capture('unavailable', history)
        await state('default')
        await expect(history.getByTestId('rebalance-metric-value')).toHaveText([
          '96.4%',
          '−1.51%',
          '$84,210 Traded',
        ])
        await phase('ongoing')
        await expect(
          active.getByTestId('lifecycle-status-pill')
        ).toHaveAttribute('data-status-role', 'active')
        await expect(
          active.getByTestId('rebalance-metric-value').first()
        ).toHaveText('5 min')
        await expect(list.locator('[data-status-icon="spinner"]')).toHaveCount(
          0
        )
        await capture('ongoing', active)
        await phase('permissionless')
        await expect(
          active.getByTestId('lifecycle-status-pill')
        ).toHaveAttribute('data-status-role', 'actionable')
        await expect(
          active.getByTestId('rebalance-operational-summary')
        ).toHaveCount(1)
        await expect(active.getByTestId('rebalance-access')).toHaveText(
          'Permissionless'
        )
        await state('zero')
        await expect(history.getByTestId('lifecycle-status-pill')).toHaveText(
          'Expired'
        )
        await expect(history.getByTestId('rebalance-metric-value')).toHaveText([
          '—',
          '0%',
          '$0 Traded',
        ])
        await capture('zero', history)
        await state('empty')
        await expect(records).toHaveCount(0)
        await expect(list.getByTestId('rebalance-empty')).toHaveCount(2)
        await expect(list.locator('a')).toHaveCount(0)
        await state('pressure')
        await expect(page.getByTestId('rebalance-preview-phase')).toContainText(
          'Permissionless'
        )
        await phase('restricted')
        await page.getByTestId('rebalance-constrain').click()
        await expect(page.getByTestId('rebalance-constrain')).toBeChecked()
        expect((await list.boundingBox())!.width).toBeLessThanOrEqual(390)
        await expect(long.getByTestId('rebalance-metric-value')).toHaveText([
          '—',
          '—',
          '—',
        ])
        const titleBox = (await long.locator('h4').boundingBox())!
        const pillBox = (await long
          .getByTestId('lifecycle-status-pill')
          .boundingBox())!
        expect(titleBox.height).toBeGreaterThanOrEqual(width === 390 ? 48 : 24)
        expect(pillBox.y).toBeGreaterThanOrEqual(titleBox.y + titleBox.height)
        await capture('phone-long-unavailable', long)
        const link = long.getByTestId('rebalance-record-link')
        await page.keyboard.press('Tab')
        await link.focus()
        await expect(link).toBeFocused()
        expect(
          await long.evaluate((el) => getComputedStyle(el).boxShadow)
        ).toContain('2px')
        await page.keyboard.press('Tab')
        await expect(long.getByTestId('rebalance-proposer-link')).toBeFocused()
        const popupPromise = page.waitForEvent('popup')
        await page.keyboard.press('Enter')
        const popup = await popupPromise
        await expect(popup).toHaveURL(
          `https://bscscan.com/address/${REBALANCE_IDENTITIES[3].proposer}`
        )
        await popup.close()
        await expect(page).toHaveURL(
          /components\/table#auctions-records-review$/
        )
        await expect(page.getByTestId('rebalance-selected-detail')).toHaveCount(
          0
        )
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

test('auction browse container boundaries and reduced motion', async ({
  page,
  txLog,
}, info) => {
  const source = readReviewSource(process.cwd())
  const guard = watchReviewSource(process.cwd())
  try {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(
      '/internal/design-system/components/table#auctions-records-review'
    )
    const list = page.getByTestId('rebalance-browse-list')
    for (const width of [320, 375, 511, 543, 544, 1279, 1280, 1400]) {
      await page.setViewportSize({ width, height: 900 })
      const geometry = await list.evaluate((el) => {
        const header = el.querySelector(
          '[data-testid="rebalance-record-header"]'
        )!
        const title = header.querySelector('h4')!.getBoundingClientRect()
        const pill = el
          .querySelector('[data-testid="lifecycle-status-pill"]')!
          .getBoundingClientRect()
        return {
          width: el.clientWidth,
          scroll: el.scrollWidth,
          title: {
            x: title.x,
            y: title.y,
            bottom: title.bottom,
            right: title.right,
            center: title.y + title.height / 2,
          },
          pill: { x: pill.x, y: pill.y, center: pill.y + pill.height / 2 },
        }
      })
      expect(geometry.scroll).toBeLessThanOrEqual(geometry.width)
      if (geometry.pill.y >= geometry.title.bottom) {
        expect(geometry.pill.y - geometry.title.bottom).toBe(8)
        expect(geometry.pill.x).toBe(geometry.title.x)
      } else {
        expect(geometry.pill.x).toBeGreaterThanOrEqual(
          geometry.title.right + 16
        )
        expect(geometry.pill.center).toBe(geometry.title.center)
      }
      await expect(page.getByTestId('rebalance-selected-detail')).toBeVisible({
        visible: width >= 1280,
      })
    }
    await page.getByTestId('rebalance-preview-state').click()
    await page.getByTestId('rebalance-state-loading').click()
    await expect(list.getByTestId('v1-skeleton').first()).toHaveCSS(
      'animation-name',
      'none'
    )
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
