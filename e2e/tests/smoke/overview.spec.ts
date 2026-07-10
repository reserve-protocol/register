import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress, type RegistryDTF } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Index DTF overview renders SDK-derived data fully offline, per chain. The
// base fixture fails these @smoke tests at teardown on ANY unmocked call, so a
// green run proves name/symbol/price render from chain-correct snapshots
// without touching a live boundary. The base/bsc/mainnet matrix is
// load-bearing: it validates the RPC/subgraph/api mocks answer per the URL's
// chain (mainnet/open is a v4.0.0 DTF — true chain state), not a single
// hardcoded Base-shaped answer.

interface DtfSnapshot {
  dtf: { token: { name: string; symbol: string } }
}
interface CurrentPriceSnapshot {
  price: number
}

// Strip the "$" + thousands separators the UI adds so the rendered price can be
// compared numerically instead of pinning an exact format.
function parsePrice(text: string): number {
  return Number(text.replace(/[$,]/g, ''))
}

const CASES: { address: string; label: string }[] = [
  { address: '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8', label: 'base/lcap' },
  { address: '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867', label: 'bsc/cmc20' },
  { address: '0x323c03c48660fe31186fa82c289b0766d331ce21', label: 'mainnet/open' },
]

for (const { address, label } of CASES) {
  test(`${label} overview renders name, symbol and price @smoke`, async ({
    page,
  }) => {
    const dtf = findDtfByAddress(address) as RegistryDTF
    const { token } = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`).dtf
    const { price } = loadSnapshot<CurrentPriceSnapshot>(
      `${dtf.snapshotDir}/current-price.json`
    )

    await page.goto(dtfPath(dtf, 'overview'))

    // Name + symbol come out of useCurrentIndexDtf (GetIndexDTF snapshot
    // through the SDK mappers). The overlay strips "(ETH|BASE|BSC)" catalog
    // suffixes, so match on the suffix-stripped name.
    const displayName = token.name.replace(/\s*\((ETH|BASE|BSC)\)\s*$/i, '')
    await expect(page.getByTestId('overview-dtf-name')).toContainText(displayName)
    await expect(page.getByTestId('overview-dtf-symbol')).toHaveText(
      `$${token.symbol}`
    )

    // Price is a well-formed dollar amount tracking the current-price snapshot.
    // Format-tolerant (the UI rounds to 2dp / 4 significant digits) and ~loose
    // on value so minor SDK re-derivation doesn't break it.
    const priceCell = page.getByTestId('overview-dtf-price')
    await expect(priceCell).toHaveText(/^\$[\d,]+(\.\d+)?$/)
    const rendered = parsePrice(await priceCell.innerText())
    expect(rendered).toBeGreaterThan(0)
    expect(Math.abs(rendered - price) / price).toBeLessThan(0.05)

    // The chart area mounted an SVG — the price-history data path resolved.
    await expect(
      page.getByTestId('overview-price-chart').locator('svg').first()
    ).toBeVisible()
  })
}
