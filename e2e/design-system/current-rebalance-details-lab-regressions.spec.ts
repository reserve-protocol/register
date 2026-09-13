import {
  test,
  expect,
  currentSelect,
  currentCapture,
  realTarget,
} from './current-rebalance-helpers'

test('liquidity levels, error reasons and Ondo session facts are reachable by keyboard and touch', async ({
  page,
  txLog,
}, info) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto(
    '/internal/design-system/components/table?current=liquidity#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  await expect(current.getByTestId('current-messages')).toContainText('NVDAon')
  await expect(current.getByTestId('current-messages')).toContainText('XRP')
  await current.getByTestId('current-liquidity-toggle').click()
  const failed = current.getByTestId('current-liquidity-ETH')
  await realTarget(failed)
  await failed.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toContainText('Zapper timeout')
  await expect(page.getByRole('dialog')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(failed).toBeFocused()
  await current.getByTestId('current-leg-retry').click()
  await expect(failed).toHaveText('High liquidity')
  await current.getByTestId('current-liquidity-NVDAon').click()
  const detail = page.getByRole('dialog')
  await expect(detail).toContainText('Regular open')
  await expect(detail).toContainText('Max trade')
  await expect(detail).toContainText('sequential trades')
  await expect(detail).toContainText('Earnings')
  await currentCapture(page, detail, info, 'liquidity-390-ondo-detail')
  await page.keyboard.press('Escape')
  await currentSelect(page, 'scene', 'liquidity-closed')
  await current.getByTestId('current-liquidity-toggle').click()
  await current.getByTestId('current-liquidity-NVDAon').click()
  await expect(detail).toContainText('Next open')
  await expect(detail).toContainText('Trading halted')
  await currentCapture(page, detail, info, 'liquidity-390-ondo-closed')
  await page.keyboard.press('Escape')
  await currentSelect(page, 'scene', 'hybrid')
  await current.getByTestId('current-edit').click()
  await current.getByTestId('current-weights-save').click()
  await current.getByTestId('current-liquidity-toggle').click()
  await current.getByTestId('current-liquidity-uDOGE').click()
  await expect(detail).toContainText('WETH')
  await expect(detail).not.toContainText('WBNB')
  await page.keyboard.press('Escape')
  expect(txLog).toHaveLength(0)
})

test('expiry retains one ended auction, dollar impact, explanations and the same history result', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto(
    '/internal/design-system/components/table?current=live#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  await current.getByText('Lab simulation controls', { exact: true }).click()
  await current.getByTestId('current-expire').click()
  await expect(current.getByTestId('current-completed-auctions')).toHaveText(
    '1'
  )
  const impact = await current
    .getByTestId('current-result-impact-usd')
    .innerText()
  expect(impact).toBe('−$3,713.80')
  const help = current.getByRole('button', { name: 'About Rebalance accuracy' })
  await help.focus()
  await expect(page.getByRole('tooltip')).toContainText('proposed basket')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('tooltip')).toHaveCount(0)
  await expect(help).toBeFocused()
  await current.getByRole('button', { name: 'About NAV Change' }).focus()
  await expect(page.getByRole('tooltip')).toContainText(
    'value of the DTF basket'
  )
  await page.keyboard.press('Escape')
  await expect(page.getByRole('tooltip')).toHaveCount(0)
  await currentCapture(page, current, info, 'expired-390-result-details')
  await current.getByTestId('current-history-handoff').click()
  const first = page
    .getByTestId('historical-rebalances-table')
    .locator('tbody tr')
    .first()
  await expect(
    first.locator('[data-testid="history-priceImpactUsd"]:visible')
  ).toHaveText(impact)
  await expect(
    first.locator('[data-testid="history-auctions"]:visible')
  ).toContainText('1 Auction run')
})
