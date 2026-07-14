import { test, expect } from '../../../harness'
import { expectStablePosition } from '../../../harness/lifecycle'
import { REGISTRY } from '../../../helpers/registry'
import { loadSnapshot } from '../../../helpers/snapshots'

// Overview hero loading lifecycle (L0→L3) + no-reflow, on the harness hold gate.
// Runs desktop-smoke AND mobile (@smoke @mobile). The SDK `GetIndexDTF` subgraph
// query feeds name/symbol/price (price = indexDTFPriceAtom, derived from the
// SDK basket prices — NOT current/dtf), so holding it freezes the whole hero.
const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!
const expectedName = loadSnapshot<{ dtf: { token: { name: string } } }>(
  `${base.snapshotDir}/dtf.json`
).dtf.token.name.replace(/\s*\((ETH|BASE|BSC)\)\s*$/i, '')

test('overview hero: L1 skeletons → L3 content, no reflow @smoke @mobile', async ({
  harness,
}) => {
  const page = harness.page
  const nameSkeleton = page.getByTestId('overview-name-skeleton')
  const priceSkeleton = page.getByTestId('overview-price-skeleton')
  const priceBox = page.getByTestId('overview-dtf-price') // stable wrapper (skeleton OR value)

  const hold = harness.mock.hold({ boundary: 'subgraph', operationName: 'GetIndexDTF' })
  await harness.goto(base, 'overview')

  // L0/L1: query fired and parked → the hero shows its skeletons in the box the
  // content will occupy; the resolved name is not present yet.
  await expect.poll(() => hold.hits, { timeout: 10_000 }).toBeGreaterThan(0)
  await expect(nameSkeleton).toBeVisible()
  await expect(priceSkeleton).toBeVisible()
  await expect(page.getByTestId('overview-dtf-name')).toHaveCount(0)

  // L1 → L3: releasing resolves the hero without MOVING the price wrapper
  // (its width changes as skeleton→value swaps; its top-left must hold).
  await expectStablePosition(
    priceBox,
    async () => {
      hold.release()
      await expect(page.getByTestId('overview-dtf-name')).toContainText(expectedName, {
        timeout: 15_000,
      })
    },
    2
  )

  // L3: the price resolved to a well-formed dollar value.
  await expect(priceBox).toHaveText(/^\$[\d,]+(\.\d+)?$/)
})

test('overview chart: L2 island resolves independently of the hero @smoke @mobile', async ({
  harness,
}) => {
  const page = harness.page

  // Freeze only the chart's price-history REST call; the hero (SDK subgraph)
  // resolves on its own → proves islands are independent (L2).
  const hold = harness.mock.hold({ boundary: 'api', pathname: '/historical/dtf' })
  await harness.goto(base, 'overview')

  // Hero resolves while the chart island is parked in its skeleton.
  await expect(page.getByTestId('overview-dtf-name')).toContainText(expectedName, {
    timeout: 15_000,
  })
  await expect(page.getByTestId('overview-chart-skeleton').first()).toBeVisible()
  expect(hold.hits).toBeGreaterThan(0)

  // Release → the chart body renders in place.
  hold.release()
  await expect(page.getByTestId('overview-price-chart').first()).toBeVisible({ timeout: 15_000 })
})
