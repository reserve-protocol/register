import { encodeAbiParameters, encodeFunctionData, erc20Abi } from 'viem'
import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'
import { loadSnapshot } from '../../../helpers/snapshots'

const TOTAL_SUPPLY = encodeFunctionData({ abi: erc20Abi, functionName: 'totalSupply' })
const ZERO_UINT = encodeAbiParameters([{ type: 'uint256' }], [0n])

// Overview edge cases that reach ledger bugs. Active tests cover fixed
// regressions; remaining `test.fixme` cases document desired behavior and are
// promoted after their implementation lands.

const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!
const expectedName = loadSnapshot<{ dtf: { token: { name: string } } }>(
  `${base.snapshotDir}/dtf.json`
).dtf.token.name.replace(/\s*\((ETH|BASE|BSC)\)\s*$/i, '')

// BUG M6 — chart-overlay.tsx:104,122: PriceValue always reads indexDTFPriceAtom
// (the unit price), so selecting the "Market Cap" or "Supply" data-type switches
// only the chart Y-axis; the hero keeps showing the unit price. Desired: the
// hero value reflects the selected data-type.
test.fixme(
  'overview: Market Cap data-type shows the market cap, not the unit price @smoke',
  async ({ harness }) => {
    const page = harness.page
    await harness.goto(base, 'overview')
    const price = page.getByTestId('overview-dtf-price')
    await expect(price).toHaveText(/^\$[\d,]+(\.\d+)?$/, { timeout: 15_000 })
    const unitPrice = (await price.textContent())?.trim() ?? ''

    await page.locator('[data-testid="overview-datatype-marketCap"]:visible').first().click()
    await expect(page.locator('[data-testid="overview-datatype-marketCap"]:visible').first()).toHaveAttribute(
      'data-active',
      'true'
    )
    // Market cap ≫ unit price, so the hero text MUST change.
    await expect(price).not.toHaveText(unitPrice, { timeout: 5_000 })
  }
)

// H3 regression — a 0-supply DTF must still run the history query. Guarding on
// a truthy RPC totalSupply left the chart in a perpetual skeleton.
test(
  'overview: 0-supply DTF resolves the chart to an empty state, not a perpetual skeleton @smoke',
  async ({ harness }) => {
    const page = harness.page
    harness.mock.ethCall(base.address, TOTAL_SUPPLY, ZERO_UINT)
    await harness.goto(base, 'overview')

    // Hero still renders (SDK path is independent of totalSupply).
    await expect(page.getByTestId('overview-dtf-name')).toContainText(expectedName, {
      timeout: 15_000,
    })
    // The history request settles, so the skeleton clears to content or empty state.
    await expect(page.getByTestId('overview-chart-skeleton').first()).toBeHidden({
      timeout: 8_000,
    })
  }
)

// M1 regression (CXR-008-I1): an UNBRANDED DTF — folio-manager answers with no
// parsedData, so the SDK settles brand as undefined — must collapse the cover
// slot once the DTF itself loads. Gating the skeleton on brand-value presence
// (brand === undefined) held the skeleton forever, because undefined is ALSO
// the settled "no brand" result.
test(
  'overview: unbranded DTF collapses the cover skeleton once loaded @smoke',
  async ({ harness }) => {
    const page = harness.page
    harness.mock.api({ pathname: '/folio-manager/read' }, {})
    await harness.goto(base, 'overview')

    // The rest of the overview still renders (brand is optional data).
    // overview-dtf-name reads the same indexDTFAtom the cover gates on, so once
    // the name paints the DTF has settled.
    await expect(page.getByTestId('overview-dtf-name')).toContainText(expectedName, {
      timeout: 15_000,
    })
    // Loaded + no brand → the cover skeleton is dropped from the DOM (not merely
    // clipped by a collapsing grid, which raced the render). The slot stays
    // mounted; asserting its presence first keeps a vanished testid from
    // false-greening the skeleton check.
    await expect(page.getByTestId('overview-cover-slot')).toBeAttached()
    await expect(page.getByTestId('overview-cover-skeleton')).toHaveCount(0)
  }
)
