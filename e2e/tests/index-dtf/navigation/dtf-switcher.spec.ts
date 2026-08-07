import { expect, test } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'
import { loadSnapshot } from '../../../helpers/snapshots'

// DTF switcher (nav logo / mobile pages menu): opening the popover lists the
// discover catalog and selecting another DTF lands on the SAME section for that
// DTF — the whole point of the control (stay on governance, change DTF). The
// inactive-DTF case re-routes away from Auctions, which inactive DTFs disable.

const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)! // lcap
const bsc = REGISTRY.find((d) => d.chainId === 56 && d.slug === 'cmc20')!
const deprecated = REGISTRY.find((d) => d.deprecated)! // base/vtf

interface DtfSnapshot {
  dtf: { token: { name: string; symbol: string } }
}

const symbolOf = (dir: string) =>
  loadSnapshot<DtfSnapshot>(`${dir}/dtf.json`).dtf.token.symbol

const optionFor = (page: import('@playwright/test').Page, address: string) =>
  page.locator(
    `[data-testid="dtf-switcher-option"][data-address="${address.toLowerCase()}"]`
  )

test('dtf switcher: desktop nav keeps the governance section across DTFs @smoke', async ({
  harness,
}) => {
  const page = harness.page
  await harness.goto(base, 'governance')
  await expect(page.getByTestId('governance-proposals').first()).toBeVisible({
    timeout: 20_000,
  })

  await page.getByTestId('dtf-switcher-trigger').click()
  await expect(page.getByTestId('dtf-switcher-content')).toBeVisible()

  const target = optionFor(page, bsc.address)
  await expect(target).toBeVisible({ timeout: 15_000 })
  await target.click()

  // Same section, different DTF — no detour through discover/overview.
  await expect(page).toHaveURL(
    new RegExp(`/bsc/index-dtf/${bsc.address}/governance$`, 'i')
  )
  await expect(page.getByTestId('governance-proposals').first()).toBeVisible({
    timeout: 20_000,
  })
  await expect(page.getByTestId('dtf-switcher-content')).toHaveCount(0)
})

test('dtf switcher: search narrows the list to the typed DTF @smoke', async ({
  harness,
}) => {
  const page = harness.page
  await harness.goto(base, 'overview')
  await expect(page.getByTestId('overview-dtf-symbol')).toHaveText(
    `$${symbolOf(base.snapshotDir)}`,
    { timeout: 20_000 }
  )

  await page.getByTestId('dtf-switcher-trigger').click()
  const options = page.getByTestId('dtf-switcher-option')
  await expect(options.first()).toBeVisible({ timeout: 15_000 })
  const total = await options.count()
  expect(total).toBeGreaterThan(1)

  // Filter by the destination's address: cmdk matches the item keywords.
  await page.getByTestId('dtf-switcher-search').fill(bsc.address)
  await expect(options).toHaveCount(1)
  await expect(optionFor(page, bsc.address)).toBeVisible()
})

test('dtf switcher: inactive DTF falls back to overview from auctions', async ({
  harness,
}) => {
  const page = harness.page
  await harness.goto(base, 'auctions')
  await page.getByTestId('dtf-switcher-trigger').click()

  const target = optionFor(page, deprecated.address)
  await expect(target).toBeVisible({ timeout: 15_000 })
  await target.click()

  // Auctions are disabled for inactive DTFs, so the switch lands on overview
  // rather than a route the destination refuses to render.
  await expect(page).toHaveURL(
    new RegExp(`/base/index-dtf/${deprecated.address}/overview$`, 'i')
  )
  await expect(page.getByTestId('overview-dtf-symbol')).toHaveText(
    `$${symbolOf(deprecated.snapshotDir)}`,
    { timeout: 20_000 }
  )
})

test('dtf switcher: mobile pages menu switches DTF in place @mobile', async ({
  harness,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'mobile',
    'mobile chrome only (bottom-nav portal menu)'
  )
  const page = harness.page
  await harness.goto(base, 'governance')
  await expect(page.getByTestId('governance-proposals').first()).toBeVisible({
    timeout: 20_000,
  })

  await page.getByTestId('dtf-nav-mobile-menu').click()
  await page.getByTestId('dtf-switcher-trigger-mobile').click()

  const target = optionFor(page, bsc.address)
  await expect(target).toBeVisible({ timeout: 15_000 })
  await target.click()

  await expect(page).toHaveURL(
    new RegExp(`/bsc/index-dtf/${bsc.address}/governance$`, 'i')
  )
  // Parent menu closes with the popover — no stale overlay over the new page.
  await expect(page.getByTestId('dtf-switcher-trigger-mobile')).toHaveCount(0)
  await expect(page.getByTestId('governance-proposals').first()).toBeVisible({
    timeout: 20_000,
  })
})
