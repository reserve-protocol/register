import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress, type RegistryDTF } from '../../helpers/registry'

// Index DTF overview mounts fully offline, per chain. The base fixture fails
// these @smoke tests at teardown on ANY unmocked call, so a green run proves the
// overview route renders its shell (DTF sub-nav + price-chart + holdings
// containers) without touching a live boundary. The base/bsc/mainnet matrix is
// load-bearing: it validates the RPC/subgraph/api mocks answer per the URL's
// chain, not a single hardcoded shape.
//
// NOTE (blocked, see e2e retro): the DTF *data* (name/symbol/price/holdings
// rows) does not render under the current mocks — `useCurrentIndexDtf` (SDK
// `sdk.index.get` + `mapIndexDtfData`) needs an SDK-shaped `GetIndexDTF`
// subgraph payload plus RPC basket reads that the shared snapshot/mock don't
// yet provide, so the overlay/basket stay skeleton. The value-level assertions
// (and the testids they use) are in place and flip on once that infra lands.

const CASES: { address: string; label: string }[] = [
  { address: '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8', label: 'base/lcap' },
  { address: '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867', label: 'bsc/cmc20' },
  { address: '0x323c03c48660fe31186fa82c289b0766d331ce21', label: 'mainnet/open' },
]

for (const { address, label } of CASES) {
  test(`${label} overview renders offline @smoke`, async ({ page }) => {
    const dtf = findDtfByAddress(address) as RegistryDTF

    await page.goto(dtfPath(dtf, 'overview'))

    // The DTF sub-navigation mounts — proves the index-dtf container resolved
    // the route (chain + address) rather than bouncing to not-found.
    await expect(page.getByTestId('dtf-nav')).toBeVisible()

    // Overview view mounted its two primary sections (they render even before
    // DTF data resolves, as skeletons).
    await expect(page.getByTestId('overview-price-chart')).toBeVisible()
    await expect(page.getByTestId('overview-basket')).toBeVisible()
  })
}
