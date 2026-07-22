import { encodeAbiParameters, encodeFunctionData, erc20Abi } from 'viem'
import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'
import { loadSnapshot } from '../../../helpers/snapshots'

const TOTAL_SUPPLY = encodeFunctionData({ abi: erc20Abi, functionName: 'totalSupply' })
const ZERO_UINT = encodeAbiParameters([{ type: 'uint256' }], [0n])

// Overview edge cases that reach ledger bugs. Each asserts the DESIRED behavior
// and is `test.fixme` because the app is currently buggy — the failing assertion
// IS the validation that the suite catches the bug (flip to `test` when fixed).

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

// BUG H3 — use-dtf-price-history.ts: the history query's `enabled` gate requires
// a truthy `supply` (RPC totalSupply). A 0-supply DTF (totalSupply=0n) never
// fires the query, so the chart stays a perpetual skeleton with no empty/error
// state. Desired: the chart resolves to an empty/no-data state.
test.fixme(
  'overview: 0-supply DTF resolves the chart to an empty state, not a perpetual skeleton @smoke',
  async ({ harness }) => {
    const page = harness.page
    harness.mock.ethCall(base.address, TOTAL_SUPPLY, ZERO_UINT)
    await harness.goto(base, 'overview')

    // Hero still renders (SDK path is independent of totalSupply).
    await expect(page.getByTestId('overview-dtf-name')).toContainText(expectedName, {
      timeout: 15_000,
    })
    // Desired: the chart skeleton clears (empty state or content). BUG: stuck.
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
