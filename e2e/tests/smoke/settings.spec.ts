import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Smoke: the Index DTF settings page renders snapshot-derived content fully
// offline. The @smoke gate fails on ANY unmocked boundary call, so a green run
// proves the whole settings surface (basics/fees/roles + the container's
// updaters) loads without touching a live RPC/subgraph/API.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const dtf = findDtfByAddress(DTF_ADDRESS)!

interface DtfSnapshot {
  dtf: {
    token: { name: string; symbol: string }
  }
}

test('settings page renders snapshot-derived content offline @smoke', async ({
  page,
}) => {
  const { dtf: data } = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`)

  await page.goto(dtfPath(dtf, 'settings'))

  const settings = page.getByTestId('dtf-settings')
  await expect(settings).toBeVisible()

  // Concrete snapshot-derived values (data, not translated chrome) — asserting
  // them proves the SDK/subgraph data actually reached the page. Scoped to the
  // settings container; format-tolerant (substring / case-insensitive).
  await expect(settings).toContainText(data.token.name) // "CF Large Cap Index"
  await expect(settings.getByText(data.token.symbol, { exact: false }).first()).toBeVisible()

  // Fees card shows a percentage derived from the snapshot's fee params — assert
  // the shape, not an exact figure, so SDK fee normalization can shift freely.
  await expect(settings).toContainText(/%/)
})
