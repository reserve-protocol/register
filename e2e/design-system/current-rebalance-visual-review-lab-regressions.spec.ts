import {
  test,
  expect,
  currentSelect,
  currentCapture,
} from './current-rebalance-helpers'

test('review: event timing belongs to the auction heading', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto(
    '/internal/design-system/components/table?current=repeat#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  await expect(current.getByTestId('current-launch')).toBeVisible()
  await expect(
    current
      .getByTestId('current-operation')
      .getByTestId('current-permissionless-time')
  ).toHaveCount(0)
  await expect(
    current
      .getByTestId('current-auction-status')
      .getByTestId('current-permissionless-time')
  ).toBeVisible()
  const trigger = current.getByTestId('current-liquidity-toggle')
  const before = await trigger.evaluate(
    (el) =>
      el.getBoundingClientRect().top -
      el.closest('[data-testid="current-auction"]')!.getBoundingClientRect().top
  )
  await currentSelect(page, 'viewer', 'member')
  await expect(current.getByTestId('current-launch')).toBeDisabled()
  const after = await trigger.evaluate(
    (el) =>
      el.getBoundingClientRect().top -
      el.closest('[data-testid="current-auction"]')!.getBoundingClientRect().top
  )
  expect(Math.abs(after - before)).toBeLessThanOrEqual(1)
})

test('review: bid details belong to the selected row', async ({ page }) => {
  await page.goto(
    '/internal/design-system/components/table?current=live#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  const first = current.getByTestId('current-bid-1')
  await first.click()
  const detail = current.getByTestId('current-bid-detail')
  await expect(detail).toBeVisible()
  await expect
    .poll(async () => {
      const bounds = await detail.boundingBox()
      const second = await current.getByTestId('current-bid-2').boundingBox()
      return bounds!.y + bounds!.height - second!.y
    })
    .toBeLessThanOrEqual(0)
  await expect(first).toHaveAttribute('data-state', 'open')
  await current.getByTestId('current-bid-2').click()
  await expect(first).toHaveAttribute('aria-expanded', 'false')
  await expect(detail).toContainText('250 XRP')
  await page.setViewportSize({ width: 320, height: 844 })
  await expect(detail).toContainText('250 XRP')
})

test('review: long liquidity inspection closes at its end with focus return', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(
    '/internal/design-system/components/table?current=liquidity#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  const trigger = current.getByTestId('current-liquidity-toggle')
  await trigger.click()
  const close = current.getByTestId('current-liquidity-close')
  await expect(close).toBeVisible()
  await current.getByTestId('current-liquidity').evaluate(async (el) => {
    await Promise.all(
      el.getAnimations({ subtree: true }).map((a) => a.finished)
    )
  })
  await currentCapture(page, close, info, 'review-light-390-assets-close')
  await expect(close).toBeInViewport()
  await close.click()
  await expect(current.getByTestId('current-liquidity')).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(trigger).toBeInViewport()
  await currentCapture(page, trigger, info, 'review-light-390-assets-return')
})

test('review: invalid weight fields explain their error without erasing inputs', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=hybrid#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  await current.getByTestId('current-edit').click()
  const input = current.getByTestId('current-units-0')
  await input.fill('abc')
  const error = current.getByTestId('current-units-error-0')
  await expect(error).toBeVisible()
  await expect(input).toHaveAttribute(
    'aria-describedby',
    new RegExp((await error.getAttribute('id'))!)
  )
  await expect(current.getByTestId('current-units-1')).toHaveValue('0.018')
  await input.fill('0.0375')
  await expect(error).toHaveCount(0)
})

test('review: outcome is one summary and handoff leaves a current empty state', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=complete#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  const result = current.getByTestId('current-result')
  await expect(result).toBeVisible()
  await expect(result.getByTestId('current-result-heading')).toBeVisible()
  await expect(result).not.toContainText('Rebalance so far')
  await expect(result.getByTestId('current-completed-auctions')).toHaveCount(1)
  await expect(current.getByTestId('current-expiry')).toBeVisible()
  await current.getByText('Lab simulation controls', { exact: true }).click()
  await current.getByTestId('current-history-handoff').click()
  await expect(current).toHaveCount(0)
  await expect(page.getByTestId('current-empty')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Historical Rebalances', exact: true })
  ).toBeFocused()
  await currentSelect(page, 'scene', 'ready')
  await currentSelect(page, 'scene', 'complete')
  await expect(current.getByTestId('current-result-heading')).toBeVisible()
})

for (const theme of ['light', 'dark']) {
  for (const width of [1400, 900, 390, 320]) {
    test(`review: grouped results and status ${theme} ${width}`, async ({
      page,
      txLog,
    }, info) => {
      await page.setViewportSize({ width, height: 844 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(
        '/internal/design-system/components/table?current=repeat#auctions-browse-review'
      )
      const current = page.getByTestId('current-rebalance-workspace')
      const progress = current.getByTestId('current-execution-fact')
      await expect(current.getByTestId('current-progress-rail')).toHaveCount(0)
      await expect(progress.locator('dd')).toHaveText('62.8%')
      await expect(progress.locator('dt')).toHaveCSS('font-size', '14px')
      await expect(progress.locator('dd')).toHaveCSS(
        'font-size',
        width >= 1100 ? '16px' : '14px'
      )
      if (width === 900) {
        const tops = await current
          .getByTestId('current-progress')
          .locator('dt')
          .evaluateAll((labels) =>
            labels.slice(0, 2).map((label) => label.getBoundingClientRect().top)
          )
        expect(Math.abs(tops[0] - tops[1])).toBeLessThanOrEqual(1)
      }
      expect(
        await current.evaluate((el) => el.scrollWidth - el.clientWidth)
      ).toBeLessThanOrEqual(1)
      await currentCapture(
        page,
        current.getByTestId('current-progress'),
        info,
        `review-${theme}-${width}-repeat`
      )
      await currentSelect(page, 'scene', 'live')
      await current.getByTestId('current-bid-1').click()
      await currentCapture(page, current, info, `review-${theme}-${width}-live`)
      if (width <= 390)
        await currentCapture(
          page,
          current.getByTestId('current-bid-1'),
          info,
          `review-${theme}-${width}-bid-expanded`
        )
      await currentSelect(page, 'scene', 'expired')
      await expect(current.getByTestId('current-result-heading')).toBeVisible()
      await expect(current.getByTestId('current-progress-rail')).toHaveCount(0)
      await currentCapture(
        page,
        current,
        info,
        `review-${theme}-${width}-expired`
      )
      expect(txLog).toHaveLength(0)
    })
  }
}

for (const theme of ['light', 'dark']) {
  for (const width of [900, 320]) {
    test(`review: pressured inspection and expiry ${theme} ${width}`, async ({
      page,
      txLog,
    }, info) => {
      await page.setViewportSize({ width, height: 844 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(
        '/internal/design-system/components/table?current=hybrid#auctions-browse-review'
      )
      const current = page.getByTestId('current-rebalance-workspace')
      await current.getByTestId('current-edit').click()
      await current.getByTestId('current-units-0').fill('abc')
      await currentCapture(
        page,
        current.getByTestId('current-weight-editor'),
        info,
        `pressure-${theme}-${width}-validation`
      )
      await current
        .getByText('Max Auction Size per Token', { exact: true })
        .click()
      const limit = current.getByTestId('current-limit-0')
      await limit.fill('-1')
      await expect(current.getByTestId('current-limit-error-0')).toBeVisible()
      await expect(limit).toHaveAttribute(
        'aria-describedby',
        (await current.getByTestId('current-limit-error-0').getAttribute('id'))!
      )
      await current.getByTestId('current-weights-discard').click()
      await currentSelect(page, 'scene', 'liquidity')
      await currentCapture(
        page,
        current,
        info,
        `pressure-${theme}-${width}-warning`
      )
      await current.getByTestId('current-liquidity-toggle').click()
      await current.getByTestId('current-liquidity').evaluate(async (el) => {
        await Promise.all(
          el.getAnimations({ subtree: true }).map((a) => a.finished)
        )
      })
      await currentCapture(
        page,
        current.getByTestId('current-liquidity'),
        info,
        `pressure-${theme}-${width}-assets`
      )
      await currentCapture(
        page,
        current.getByTestId('current-liquidity-close'),
        info,
        `pressure-${theme}-${width}-assets-close`
      )
      await expect(
        current.getByTestId('current-liquidity-close')
      ).toBeInViewport()
      await current.getByTestId('current-liquidity-close').click()
      await currentSelect(page, 'scene', 'ready')
      await currentSelect(page, 'outcome', 'indexing')
      await current.getByTestId('current-launch').click()
      await expect(current).toHaveAttribute('data-operation', 'indexing')
      await current
        .getByText('Lab simulation controls', { exact: true })
        .click()
      await current.getByTestId('current-expire').click()
      await currentSelect(page, 'data', 'error')
      await expect(current.getByTestId('current-result-heading')).toHaveText(
        'Unavailable'
      )
      await expect(current.getByTestId('current-launch')).toBeDisabled()
      await expect(
        current.getByTestId('current-history-handoff')
      ).toBeDisabled()
      await expect(current.getByTestId('current-result')).not.toContainText(
        '$0'
      )
      await currentCapture(
        page,
        current,
        info,
        `pressure-${theme}-${width}-expired-indexing`
      )
      expect(
        await current.evaluate((el) => el.scrollWidth - el.clientWidth)
      ).toBeLessThanOrEqual(1)
      expect(txLog).toHaveLength(0)
    })
  }
}
