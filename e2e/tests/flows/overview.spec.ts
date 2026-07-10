import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress, type RegistryDTF } from '../../helpers/registry'

// Behavioral coverage for the Index DTF overview surface: the holdings table
// shell + Exposure/Collateral tab switching, the price-chart container, and the
// deprecated-DTF route. Every test drives snapshot-backed mocks offline and ends
// with zero unmocked boundary calls.
//
// BLOCKED (shared-infra, see e2e retro): the data-level coverage this area is
// meant to own — holdings rows matching exposure.json, the Exposure-vs-Collateral
// market-cap framings, the rendered price-chart SVG across time ranges, the
// deprecated "Inactive" badge — all require `useCurrentIndexDtf().data`, which
// is `undefined` under the current mocks (`sdk.index.get` + `mapIndexDtfData`
// need an SDK-shaped `GetIndexDTF` payload + RPC basket reads the snapshot/mock
// don't provide). The overview stays skeleton, so those assertions can't run
// yet. The testids they target are already instrumented; flip these on once the
// snapshot is re-captured in the SDK shape.

const LCAP = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const DEPRECATED = '0x47686106181b3cefe4eaf94c4c10b48ac750370b' // base/deprecated (VTF)

test('holdings table mounts and switches between the Exposure/Collateral tabs', async ({
  page,
  unmockedCalls,
}) => {
  const dtf = findDtfByAddress(LCAP) as RegistryDTF
  await page.goto(dtfPath(dtf, 'overview'))

  const basket = page.getByTestId('overview-basket')
  await expect(basket).toBeVisible()

  // The desktop tab controls render regardless of DTF data. Exposure is the
  // default; switching to Collateral must not crash or hit a live boundary
  // (the two tabs read different market-cap sources — the invariant covered at
  // the value level once the basket data can load).
  const collateralTab = page.getByTestId('overview-basket-tab-collateral')
  const exposureTab = page.getByTestId('overview-basket-tab-exposure')
  await expect(collateralTab).toBeVisible()

  await collateralTab.click()
  await expect(basket).toBeVisible()
  await exposureTab.click()
  await expect(basket).toBeVisible()

  expect(unmockedCalls).toEqual([])
})

test('price chart container renders offline', async ({ page, unmockedCalls }) => {
  const dtf = findDtfByAddress(LCAP) as RegistryDTF
  await page.goto(dtfPath(dtf, 'overview'))

  await expect(page.getByTestId('overview-price-chart')).toBeVisible()

  expect(unmockedCalls).toEqual([])
})

test('deprecated DTF overview route mounts offline', async ({
  page,
  unmockedCalls,
}) => {
  const dtf = findDtfByAddress(DEPRECATED) as RegistryDTF
  await page.goto(dtfPath(dtf, 'overview'))

  // Route resolves and the overview shell mounts for a deprecated DTF.
  await expect(page.getByTestId('dtf-nav')).toBeVisible()
  await expect(page.getByTestId('overview-basket')).toBeVisible()

  expect(unmockedCalls).toEqual([])
})
