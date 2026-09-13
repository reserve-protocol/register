import {
  test,
  expect,
  currentSelect,
  currentCapture,
  realTarget,
} from './current-rebalance-helpers'

for (const theme of ['light', 'dark'])
  for (const width of [390, 1400]) {
    test(`current lifecycle review matrix ${theme} ${width}`, async ({
      page,
      txLog,
    }, info) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(
        (mode) => localStorage.setItem('theme-ui-color-mode', mode),
        theme
      )
      await page.goto(
        '/internal/design-system/components/table?current=ready#auctions-browse-review'
      )
      await page.evaluate(() => document.fonts.ready)
      const current = page.getByTestId('current-rebalance-workspace')
      for (const scene of [
        'ready',
        'permissionless',
        'hybrid',
        'live',
        'repeat',
        'liquidity',
        'liquidity-closed',
        'complete',
        'expired',
        'expired-complete',
      ]) {
        if (scene !== 'ready') await currentSelect(page, 'scene', scene)
        await expect(current).toHaveCount(1)
        expect(
          await current.evaluate((el) => el.scrollWidth - el.clientWidth)
        ).toBeLessThanOrEqual(1)
        await currentCapture(
          page,
          current,
          info,
          `${theme}-${width}-${scene}-top`
        )
        const operation = current.getByTestId('current-operation')
        if (await operation.count()) {
          await currentCapture(
            page,
            operation,
            info,
            `${theme}-${width}-${scene}-operation`
          )
          for (const button of await operation
            .locator('button:visible:enabled')
            .all())
            await realTarget(button)
        }
        if (scene === 'ready') {
          await currentSelect(page, 'viewer', 'visitor')
          await currentCapture(
            page,
            current.getByTestId('current-operation'),
            info,
            `${theme}-${width}-visitor`
          )
          await currentSelect(page, 'viewer', 'launcher')
        }
        if (scene === 'live') {
          await current.getByTestId('current-bid-1').click()
          await currentCapture(
            page,
            current.getByTestId('current-bid-detail'),
            info,
            `${theme}-${width}-bid-detail`
          )
        }
      }
      await currentCapture(
        page,
        page.getByTestId('historical-rebalances-table'),
        info,
        `${theme}-${width}-history-context`
      )
      expect(txLog).toHaveLength(0)
    })
  }

test('actual workspace breakpoint changes layout, not operation identity', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=live#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  await current.getByTestId('current-bid-1').click()
  for (const viewport of [879, 880, 881, 320, 1400]) {
    await page.setViewportSize({ width: viewport, height: 900 })
    await expect(current).toHaveCount(1)
    await expect(current.getByTestId('current-bid-detail')).toContainText(
      '500 ETH'
    )
    const geometry = await current.evaluate((el) => ({
      width: el.getBoundingClientRect().width,
      columns: getComputedStyle(
        el.querySelector('[data-testid="current-working-grid"]')!
      ).gridTemplateColumns.split(' ').length,
      overflow: el.scrollWidth - el.clientWidth,
    }))
    expect(geometry.columns).toBe(geometry.width >= 832 ? 2 : 1)
    expect(geometry.overflow).toBeLessThanOrEqual(1)
  }
})

test('unmatched and loading records never create a launchable placeholder', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=unknown-proposal#auctions-browse-review'
  )
  await expect(page.getByTestId('current-rebalance-workspace')).toHaveCount(0)
  await expect(page.getByTestId('current-rebalance-review')).toContainText(
    'no proposal matches'
  )
  await currentSelect(page, 'scene', 'loading')
  await expect(page.getByTestId('current-list-loading')).toBeVisible()
  await expect(page.getByTestId('current-launch')).toHaveCount(0)
  await currentSelect(page, 'scene', 'ready')
  await expect(page.getByTestId('current-launch')).toBeEnabled()
})
