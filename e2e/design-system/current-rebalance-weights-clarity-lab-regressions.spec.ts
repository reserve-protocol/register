import {
  test,
  expect,
  currentCapture,
  currentSelect,
  realTarget,
} from './current-rebalance-helpers'

for (const [width, theme] of [
  [1400, 'light'],
  [900, 'light'],
  [390, 'dark'],
  [320, 'light'],
] as const) {
  test(`current holdings and target remain distinct at ${width} ${theme}`, async ({
    page,
    txLog,
  }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript((value) => {
      localStorage.setItem('theme-ui-color-mode', value)
    }, theme)
    await page.goto(
      '/internal/design-system/components/table?current=hybrid#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    const terms = current.getByTestId('current-operation').locator('dl')
    await expect(terms.locator('dt')).toHaveText([
      'Estimated trade value',
      'Execution target',
      'Duration',
    ])
    await expect(terms.locator('dd')).toHaveText(['—', '—', '15 minutes'])
    await expect(
      current.getByTestId('current-weight-estimates-note')
    ).toHaveText('Available after confirming target weights')
    await expect(current.getByTestId('current-launch')).toBeDisabled()
    await currentCapture(page, current, info, `clarity-${width}-required`)
    await current.getByTestId('current-edit').click()
    const input = current.getByTestId('current-units-1')
    const actual = current.getByTestId('current-basket-units-1')
    const reference = current.getByTestId('current-target-reference-1')
    await expect(actual).toContainText('0.012')
    await expect(actual).toContainText('Current units')
    await expect(input.locator('..')).toContainText('New units')
    await expect(reference).toContainText('0.018')
    await expect(input).toHaveValue('0.018')
    await expect(current.getByTestId('current-weights-save')).toBeEnabled()
    await realTarget(input)
    await input.fill('0.0375')
    await expect(actual).toContainText('0.012')
    await expect(reference).toContainText('0.018')
    await currentCapture(
      page,
      current.getByTestId('current-weight-editor'),
      info,
      `clarity-${width}-editor`
    )
    expect(
      await current.evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
    await currentCapture(
      page,
      current.getByTestId('current-weights-save-boundary'),
      info,
      `clarity-${width}-save-boundary`
    )
    await current.getByTestId('current-weights-save').click()
    await expect(current.getByTestId('current-launch')).toBeEnabled()
    await expect(terms.locator('dt')).toHaveText([
      'Estimated trade value',
      'Execution target',
      'Duration',
    ])
    await expect(terms.locator('dd')).toHaveText([
      '$626,416.81',
      '100%',
      '15 minutes',
    ])
    await expect(
      current.getByTestId('current-weight-estimates-note')
    ).toHaveCount(0)
    await expect(current.getByTestId('current-saved-weight-1')).toContainText(
      '0.0375'
    )
    await currentCapture(page, current, info, `clarity-${width}-saved`)
    await current.getByTestId('current-edit').click()
    await expect(input).toHaveValue('0.0375')
    await expect(actual).toContainText('0.012')
    await expect(reference).toContainText('0.018')
    await input.fill('0.08')
    await current.getByTestId('current-weights-discard').click()
    await expect(current.getByTestId('current-saved-weight-1')).toContainText(
      '0.0375'
    )
    await page.reload()
    await expect(current.getByTestId('current-launch')).toBeDisabled()
    await expect(terms.locator('dd')).toHaveText(['—', '—', '15 minutes'])
    await current.getByTestId('current-edit').click()
    await expect(input).toHaveValue('0.018')
    await expect(actual).toContainText('0.012')
    await current.getByTestId('current-weights-save').click()
    await expect(current.getByTestId('current-launch')).toBeEnabled()
    expect(txLog).toHaveLength(0)
  })
}

test('unconfirmed weights are not mistaken for estimates loading', async ({
  page,
  txLog,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=hybrid#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  const terms = current.getByTestId('current-operation').locator('dl')
  for (const data of ['pending', 'price-error', 'ready']) {
    await currentSelect(page, 'data', data)
    await expect(terms.locator('dd')).toHaveText(['—', '—', '15 minutes'])
    await expect(terms.getByTestId('v1-skeleton')).toHaveCount(0)
    await expect(current.getByTestId('current-launch')).toBeDisabled()
  }
  await current.getByTestId('current-edit').click()
  await current.getByTestId('current-weights-save').click()
  await currentSelect(page, 'data', 'price-error')
  await expect(terms.locator('dd')).toHaveText(['—', '—', '15 minutes'])
  await expect(
    current.getByTestId('current-weight-estimates-note')
  ).toHaveCount(0)
  await expect(current.getByTestId('current-launch')).toBeDisabled()
  expect(txLog).toHaveLength(0)
})

for (const [locale, heading] of [
  ['es', 'Confirma los pesos objetivo'],
  ['ko', '목표 비중 확인'],
  ['zh', '确认目标权重'],
] as const) {
  test(`weight comparison copy fits at 320 in ${locale}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.addInitScript((value) => {
      localStorage.setItem('register.locale', JSON.stringify(value))
    }, locale)
    await page.goto(
      '/internal/design-system/components/table?current=hybrid#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    await expect(current.getByTestId('current-edit')).toHaveText(heading)
    await currentCapture(page, current, info, `clarity-320-${locale}-required`)
    await current.getByTestId('current-edit').click()
    await expect(current.getByTestId('current-units-1')).toHaveValue('0.018')
    await realTarget(current.getByTestId('current-units-1'))
    expect(
      await current.evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
    await currentCapture(
      page,
      current.getByTestId('current-weight-editor'),
      info,
      `clarity-320-${locale}`
    )
  })
}
