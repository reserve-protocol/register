import {
  test,
  expect,
  currentSelect,
  currentCapture,
  realTarget,
} from './current-rebalance-helpers'
import { readFileSync } from 'node:fs'
const snapshot = JSON.parse(
  readFileSync(
    'src/views/internal/design-system/auctions-current/snapshot.json',
    'utf8'
  )
) as Record<string, { tokens: { symbol: string; address: string }[] }>

for (const width of [320, 1400])
  test(`eight-token hybrid editor preserves a real draft at ${width}`, async ({
    page,
    txLog,
  }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(
      (theme) => {
        localStorage.setItem('theme-ui-color-mode', theme)
      },
      width === 320 ? 'dark' : 'light'
    )
    await page.goto(
      '/internal/design-system/components/table?current=hybrid#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    await current.getByTestId('current-edit').click()
    const input = current.getByTestId('current-units-1')
    await expect(
      current
        .getByTestId('current-weight-editor')
        .locator('input[inputmode="decimal"]')
    ).toHaveCount(8)
    await realTarget(input)
    await input.fill('0.0375')
    await expect(current.getByTestId('current-weights-save')).toBeEnabled()
    await currentCapture(
      page,
      current.getByTestId('current-weight-editor'),
      info,
      `weights-${width}-top`
    )
    const limitsToggle = current.getByTestId('current-limits-toggle')
    await expect(limitsToggle).toHaveAttribute('aria-expanded', 'false')
    await realTarget(limitsToggle)
    await currentCapture(
      page,
      current.getByTestId('current-limits-disclosure'),
      info,
      `weights-${width}-limits-closed`
    )
    await limitsToggle.focus()
    await limitsToggle.press('Enter')
    await expect(limitsToggle).toHaveAttribute('aria-expanded', 'true')
    await current.getByTestId('current-limit-1').fill('725000.25')
    await currentCapture(
      page,
      current.getByTestId('current-limits-disclosure'),
      info,
      `weights-${width}-limits-open`
    )
    await currentCapture(
      page,
      current.getByTestId('current-limit-6'),
      info,
      `weights-${width}-limits`
    )
    expect(
      await current.evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
    await page.setViewportSize({
      width: width === 320 ? 1400 : 320,
      height: 900,
    })
    await expect(input).toHaveValue('0.0375')
    await currentSelect(page, 'scene', 'ready')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('current-guard-stay').click()
    await expect(input).toHaveValue('0.0375')
    await current.getByTestId('current-weights-save').click()
    await expect(current.getByTestId('current-launch')).toBeEnabled()
    await current.getByTestId('current-edit').click()
    await expect(input).toHaveValue('0.0375')
    await current.getByTestId('current-limits-toggle').click()
    await expect(current.getByTestId('current-limit-1')).toHaveValue(
      '725000.25'
    )
    await input.fill('0.04')
    await current.getByTestId('current-weights-discard').click()
    await current.getByTestId('current-edit').click()
    await expect(input).toHaveValue('0.0375')
    await current.getByTestId('current-weights-discard').click()
    await currentSelect(page, 'outcome', 'reject')
    await current.getByTestId('current-launch').click()
    await expect(current).toHaveAttribute('data-operation', 'rejected')
    await current.getByTestId('current-edit').click()
    await expect(input).toHaveValue('0.0375')
    await current.getByTestId('current-weights-discard').click()
    expect(txLog).toHaveLength(0)
  })

test('CSV validation is atomic and the template preserves all eight identities', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=hybrid#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  await current.getByTestId('current-edit').click()
  const csv = [
    'symbol,address,value',
    ...snapshot['base/lcap'].tokens.map(
      (token) => `${token.symbol},${token.address},0.0375`
    ),
  ].join('\n')
  const file = current.getByTestId('current-csv-input')
  await file.setInputFiles({
    name: 'invalid.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv + '\n' + csv.split('\n')[1]),
  })
  await expect(current.getByRole('alert')).toContainText(
    'Failed to process CSV'
  )
  await expect(current.getByTestId('current-units-1')).toHaveValue('0.018')
  await file.setInputFiles({
    name: 'basket.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv),
  })
  await expect(current.getByTestId('current-units-1')).toHaveValue('0.0375')
  await expect(current.getByRole('alert')).toHaveCount(0)
  const download = page.waitForEvent('download')
  await current
    .getByRole('button', { name: 'CSV Template', exact: true })
    .click()
  expect((await download).suggestedFilename()).toBe('LCAP-weights.csv')
  await current.getByTestId('current-weights-save').click()
})

test('two current records have independent drafts and operations, and route selection survives reload', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=multiple#auctions-browse-review'
  )
  const cmc = page.locator(
    '[data-testid="current-rebalance-workspace"][data-record="CMC20"]'
  )
  const lcap = page.locator(
    '[data-testid="current-rebalance-workspace"][data-record="LCAP"]'
  )
  await lcap.getByTestId('current-edit').click()
  await lcap.getByTestId('current-units-1').fill('0.0375')
  await cmc.getByTestId('current-launch').click()
  await expect(cmc).toHaveAttribute('data-stage', 'live')
  await expect(lcap.getByTestId('current-units-1')).toHaveValue('0.0375')
  await expect(lcap.getByTestId('rebalance-proposer-link')).toHaveAttribute(
    'href',
    /basescan\.org/
  )
  await lcap.getByTestId('current-weights-save').click()
  await page.reload()
  await expect(page.getByTestId('current-rebalance-workspace')).toHaveCount(2)
  await expect(lcap.getByTestId('current-edit')).toBeEnabled()
  await expect(lcap.getByTestId('current-launch')).toBeDisabled()
  await currentSelect(page, 'scene', 'ready')
  await page.goBack()
  await expect(page.getByTestId('current-rebalance-workspace')).toHaveCount(2)
})

test('confirming a guarded browser Back resets the draft and the mounted workspace', async ({
  page,
}) => {
  await page.goto(
    '/internal/design-system/components/table?current=ready#auctions-browse-review'
  )
  await currentSelect(page, 'scene', 'hybrid')
  const current = page.getByTestId('current-rebalance-workspace')
  await current.getByTestId('current-edit').click()
  await current.getByTestId('current-units-1').fill('0.0375')
  await page.goBack()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByTestId('current-guard-leave').click()
  await expect(current).toHaveAttribute('data-record', 'CMC20')
  await expect(current.getByTestId('current-weight-editor')).toHaveCount(0)
  await expect(page).toHaveURL(/current=ready/)
})
