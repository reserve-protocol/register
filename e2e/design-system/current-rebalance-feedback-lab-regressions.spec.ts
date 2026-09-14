import {
  test,
  expect,
  currentSelect,
  currentCapture,
} from './current-rebalance-helpers'
import { advanceTime, freezeTime } from '../helpers/clock'

for (const width of [1400, 320]) {
  test(`feedback: auction description belongs to its heading at ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(
      '/internal/design-system/components/table?current=remove#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    const description = current.getByTestId('current-auction-description')
    await expect(description).toHaveText('Remove ETH from the basket')
    const heading = await current
      .getByTestId('current-auction-heading')
      .boundingBox()
    const subtitle = await description.boundingBox()
    expect(subtitle!.y - heading!.y - heading!.height).toBe(8)
    await currentCapture(page, current, info, `feedback-${width}-description`)
  })

  test(`feedback: basket owns weight editing and launch stays blocked at ${width}`, async ({
    page,
    txLog,
  }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(
      '/internal/design-system/components/table?current=hybrid#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    const plan = current.getByTestId('current-auction-plan')
    const edit = plan.getByTestId('current-edit')
    const launch = current.getByTestId('current-launch')
    await expect(edit).toBeVisible()
    await expect(launch).toBeDisabled()
    await expect(current.getByTestId('current-operation')).not.toContainText(
      'Weights saved'
    )
    await expect(launch).toHaveAccessibleDescription(
      'Set exact basket weights before launching the rebalance auctions'
    )
    await currentCapture(
      page,
      current,
      info,
      `feedback-${width}-weights-required`
    )
    await currentSelect(page, 'data', 'error')
    await expect(edit).toBeDisabled()
    await expect(launch).toBeDisabled()
    await currentSelect(page, 'data', 'ready')
    await currentSelect(page, 'viewer', 'visitor')
    await expect(edit).toHaveCount(0)
    await expect(current.getByTestId('current-connect')).toBeEnabled()
    await currentSelect(page, 'viewer', 'launcher')
    await edit.click()
    await current.getByTestId('current-units-1').fill('0.0375')
    await current.getByTestId('current-weights-save').click()
    await expect(plan.getByTestId('current-edit')).toBeEnabled()
    await expect(launch).toBeEnabled()
    await expect(current.getByTestId('current-edit')).toHaveCount(1)
    await currentCapture(page, current, info, `feedback-${width}-weights-saved`)
    expect(
      await current.evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
    expect(txLog).toHaveLength(0)
  })

  test(`feedback: live chart and bids share alignment at ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(
      '/internal/design-system/components/table?current=live#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    await expect(current.getByTestId('current-chart-now')).toBeVisible()
    const chartTitle = await current.locator('figcaption').boundingBox()
    const bidsTitle = await current
      .getByTestId('current-bids-heading')
      .boundingBox()
    if (width === 1400) expect(chartTitle!.y).toBe(bidsTitle!.y)
    const axis = await current
      .getByTestId('current-chart-axis')
      .evaluate((el) => {
        const { x, width } = el.getBoundingClientRect()
        return { x, width }
      })
    const start = await current.getByTestId('current-chart-start').boundingBox()
    const end = await current.getByTestId('current-chart-end').boundingBox()
    const heading = await current
      .getByTestId('current-auction-heading')
      .boundingBox()
    const note = await current
      .getByTestId('current-activity')
      .locator('p')
      .boundingBox()
    expect(Math.abs(axis.x - chartTitle!.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(axis.x - heading!.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(axis.x - note!.x)).toBeLessThanOrEqual(1)
    expect(
      Math.abs(end!.x + end!.width - chartTitle!.x - chartTitle!.width)
    ).toBeLessThanOrEqual(1)
    expect(Math.abs(start!.x - axis!.x)).toBeLessThanOrEqual(1)
    expect(
      Math.abs(end!.x + end!.width - axis!.x - axis!.width)
    ).toBeLessThanOrEqual(1)
    await current.getByTestId('current-bid-1').click()
    await expect(current.getByTestId('current-bid-detail')).toBeVisible()
    await currentCapture(page, current, info, `feedback-${width}-live`)
    await currentSelect(page, 'data', 'auction-error')
    await expect(current.getByTestId('current-chart-now')).toHaveCount(0)
    expect(
      await current.evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
  })
}

test('feedback: history handoff is a lab control, not an outcome action', async ({
  page,
  txLog,
}, info) => {
  await page.goto(
    '/internal/design-system/components/table?current=complete#auctions-browse-review'
  )
  const current = page.getByTestId('current-rebalance-workspace')
  const result = current.getByTestId('current-result')
  await expect(result).toBeVisible()
  await expect(result.getByTestId('current-history-handoff')).toHaveCount(0)
  await expect(current.getByTestId('current-history-handoff')).toBeHidden()
  await currentCapture(page, current, info, 'feedback-complete')
  await current.getByText('Lab simulation controls', { exact: true }).click()
  await currentSelect(page, 'data', 'error')
  await expect(current.getByTestId('current-history-handoff')).toBeDisabled()
  await currentSelect(page, 'data', 'ready')
  await current.getByTestId('current-history-handoff').click()
  await expect(current).toHaveCount(0)
  await expect(
    page.getByRole('heading', { name: 'Historical Rebalances', exact: true })
  ).toBeFocused()
  expect(txLog).toHaveLength(0)
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`feedback: live preview advances and can pause with ${reducedMotion}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion })
    await freezeTime(page, Date.parse('2026-08-01T00:00:00Z') / 1000)
    await page.goto(
      '/internal/design-system/components/table?current=live#auctions-browse-review'
    )
    const current = page.getByTestId('current-rebalance-workspace')
    const clock = page.getByTestId('current-clock')
    await expect(clock).toHaveAttribute('aria-checked', 'true')
    const now = current.getByTestId('current-chart-now')
    await expect(now).toBeVisible()
    const before = Number(await now.getAttribute('cx'))
    const countdown = await current.getByTestId('current-end-time').innerText()
    await advanceTime(page, 2000)
    await expect(current.getByTestId('current-end-time')).not.toHaveText(
      countdown
    )
    expect(Number(await now.getAttribute('cx'))).toBeGreaterThan(before)
    await page.getByText('Data and simulation', { exact: true }).click()
    await clock.click()
    await expect(clock).toHaveAttribute('aria-checked', 'false')
    const paused = await now.getAttribute('cx')
    const pausedCountdown = await current
      .getByTestId('current-end-time')
      .innerText()
    await advanceTime(page, 2000)
    await expect(now).toHaveAttribute('cx', paused!)
    await expect(current.getByTestId('current-end-time')).toHaveText(
      pausedCountdown
    )
  })
}
