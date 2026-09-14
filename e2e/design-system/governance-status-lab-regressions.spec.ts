import { test, expect, currentCapture } from './current-rebalance-helpers'
import { expectHelpToStayOpen } from './help-tooltip-assertions'

for (const theme of ['light', 'dark']) {
  test(`governance status hierarchy ${theme}`, async ({
    page,
    txLog,
  }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto('/internal/design-system/components/table')
    const rows = page.locator('[data-record-kind="governance"]')
    const queued = rows.filter({
      has: page.getByText('Waiting period', { exact: true }),
    })
    await expect(queued).toHaveCount(1)
    await expect(queued.getByTestId('lifecycle-status-pill')).toHaveCount(1)
    await expect(queued.getByTestId('proposal-outcome')).toHaveText('Passed')
    await expect(queued.getByTestId('proposal-countdown')).toHaveText(
      'Execution available in 8h'
    )
    const ready = page.locator('[data-proposal-state="queued-ready"]')
    await expect(ready.getByTestId('lifecycle-status-pill')).toHaveText(
      'Ready to execute'
    )
    await expect(ready.getByTestId('proposal-countdown')).toHaveCount(0)
    await expect(ready).not.toContainText('Executed')
    await expect(page.locator('[data-proposal-state="expired"]')).toContainText(
      'Proposal expired'
    )
    await expect(
      page.locator(
        '[data-progress-emphasis="quiet"] [data-proposal-progress-tone]'
      )
    ).toHaveCount(0)
    for (const width of [320, 390, 528, 1400]) {
      await page.setViewportSize({ width, height: 900 })
      for (const state of [
        'active',
        'optimistic-active',
        'queued',
        'queued-ready',
        'expired',
      ]) {
        const row = page.locator(`[data-proposal-state="${state}"]`)
        await currentCapture(
          page,
          row,
          info,
          `governance-status-${theme}-${width}-${state}`
        )
        expect(
          await row.evaluate((el) => el.scrollWidth - el.clientWidth)
        ).toBeLessThanOrEqual(1)
        if (state === 'active' || state === 'optimistic-active') {
          const time = row.getByTestId('proposal-countdown')
          await expect(time).toHaveCSS(
            'color',
            await row.locator('h4').evaluate((el) => getComputedStyle(el).color)
          )
          await expect(time.locator('strong')).toHaveCSS('font-weight', '500')
          await expect(
            time.locator('[data-testid="lifecycle-status-pill"]')
          ).toHaveCount(0)
        }
      }
    }
    expect(txLog).toHaveLength(0)
  })
}

test.describe('governance helper interaction', () => {
  test.use({ hasTouch: true })
  for (const width of [320, 390]) {
    test(`governance help stays independent ${width}`, async ({
      page,
      context,
      txLog,
    }, info) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/internal/design-system/components/table')
      const queued = page.locator('[data-proposal-state="queued"]')
      const helper = queued.getByTestId('proposal-help').getByRole('button')
      await helper.tap()
      await expectHelpToStayOpen(page)
      await expect(page.getByRole('tooltip')).toContainText(
        'it does not happen automatically'
      )
      await info.attach(`governance-help-${width}`, {
        body: await page.screenshot(),
        contentType: 'image/png',
      })
      await helper.tap()
      await expect(page.getByRole('tooltip')).toHaveCount(0)
      await helper.tap()
      await expectHelpToStayOpen(page)
      await queued.getByTestId('proposal-record-link').tap()
      await expect(page.getByRole('tooltip')).toHaveCount(0)
      expect(context.pages()).toHaveLength(1)
      const touchOpened = page.waitForEvent('popup')
      await queued.getByTestId('proposal-record-link').tap()
      const touchPopup = await touchOpened
      await expect(touchPopup).toHaveURL(/\/bsc\/index-dtf\/cmc20\/governance$/)
      await touchPopup.close()
      await currentCapture(page, queued, info, `governance-keyboard-${width}`)
      await queued.getByTestId('proposal-record-link').focus()
      await page.keyboard.press('Tab')
      await expect(helper).toBeFocused()
      await expectHelpToStayOpen(page)
      await page.keyboard.press('Escape')
      await expect(helper).toBeFocused()
      await queued.getByTestId('proposal-record-link').focus()
      const opened = page.waitForEvent('popup')
      await page.keyboard.press('Enter')
      const popup = await opened
      await expect(popup).toHaveURL(/\/bsc\/index-dtf\/cmc20\/governance$/)
      await popup.close()
      expect(txLog).toHaveLength(0)
    })
  }
})

test('governance loading empty and recovery', async ({ page, txLog }, info) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/internal/design-system/components/table')
  const choose = async (state: string) => {
    await page.getByTestId('governance-preview-state').click()
    await page.getByTestId(`governance-preview-${state}`).click()
  }
  const rows = page.locator('[data-record-kind="governance"]')
  await expect(rows).toHaveCount(13)
  const content = await rows.allTextContents()
  const readyBox = await rows.first().boundingBox()
  const titleBox = await rows.first().locator('h4').boundingBox()
  await currentCapture(page, rows.first(), info, 'governance-loading-ready')
  await choose('loading')
  const loading = page.getByTestId('governance-loading')
  await expect(loading).toHaveAttribute('aria-busy', 'true')
  await expect(loading.locator('a,button')).toHaveCount(0)
  await expect(rows).toHaveCount(0)
  const loadingBox = await loading.boundingBox()
  const skeletonBox = await loading
    .locator(':scope > div > div')
    .first()
    .boundingBox()
  expect(Math.abs(loadingBox!.width - readyBox!.width)).toBeLessThanOrEqual(1)
  expect(Math.abs(skeletonBox!.x - titleBox!.x)).toBeLessThanOrEqual(1)
  expect(
    await loading.evaluate((el) => el.scrollWidth - el.clientWidth)
  ).toBeLessThanOrEqual(1)
  await currentCapture(page, loading, info, 'governance-loading-skeletons')
  const fill = await loading
    .locator(':scope > div')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor)
  await loading.hover()
  await expect(loading.locator(':scope > div').first()).toHaveCSS(
    'background-color',
    fill
  )
  await choose('empty')
  await expect(page.getByTestId('governance-empty')).toHaveText(
    'No proposals found'
  )
  await expect(page.getByTestId('governance-loading')).toHaveCount(0)
  await choose('default')
  await expect(rows).toHaveCount(13)
  expect(await rows.allTextContents()).toEqual(content)
  expect(txLog).toHaveLength(0)
})

for (const [locale, waiting] of [
  ['es', 'Período de espera'],
  ['ko', '대기 기간'],
  ['zh', '等待期'],
]) {
  test(`governance translated waiting ${locale}`, async ({ page }, info) => {
    await page.addInitScript(
      (value) => localStorage.setItem('register.locale', JSON.stringify(value)),
      locale
    )
    await page.setViewportSize({ width: 320, height: 900 })
    await page.goto('/internal/design-system/components/table')
    const queued = page.locator('[data-proposal-state="queued"]')
    await expect(queued.getByTestId('lifecycle-status-pill')).toHaveText(
      waiting
    )
    for (const state of ['active', 'queued']) {
      const row = page.locator(`[data-proposal-state="${state}"]`)
      await currentCapture(page, row, info, `governance-${locale}-${state}`)
      expect(
        await row.evaluate((el) => el.scrollWidth - el.clientWidth)
      ).toBeLessThanOrEqual(1)
      await expect(
        row.getByTestId('proposal-countdown').locator('strong')
      ).toHaveText(state === 'active' ? '6h' : '8h')
    }
  })
}
