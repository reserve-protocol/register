import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Canary for the DTF *data* pipeline (shared infra owns this spec). The other
// overview smokes only prove the shell mounts; this one proves the SDK data
// path resolves end-to-end under the mocks:
//
//   subgraph GetIndexDTF snapshot (dtf.json, SDK 0.2.0 shape)
//     -> sdk.index.get (mapIndexDtf -> mapIndexDtfData)  => DTF name renders
//   RPC totalAssets()/token-metadata (chain-state.json overrides in rpc.ts)
//     + api current/dtf (current-price.json)              => basket rows render
//
// If an SDK bump changes the GetIndexDTF query shape, mapIndexDtf throws inside
// the SDK, indexDTFAtom never populates, and the name assertion fails — that is
// this spec's job. Fix: sync QUERIES.getDTF in e2e/scripts/capture.ts with the
// SDK's GetIndexDtfDocument and run `pnpm e2e:capture --only=dtf`.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const dtf = findDtfByAddress(DTF_ADDRESS)!

interface DtfSnapshot {
  dtf: { token: { name: string } }
}

test('overview renders SDK-derived DTF data offline @smoke', async ({ page }) => {
  const { dtf: data } = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`)

  await page.goto(dtfPath(dtf, 'overview'))

  // Name comes out of useCurrentIndexDtf (subgraph snapshot through the SDK
  // mappers) — a skeleton here means the GetIndexDTF payload no longer maps.
  const name = page.getByTestId('overview-dtf-name')
  await expect(name).toBeVisible()
  await expect(name).toContainText(data.token.name)

  // Basket rows come from RPC totalAssets + token metadata (chain-state
  // overrides) joined with API prices — empty means the RPC seeding regressed.
  await expect(page.getByTestId('overview-basket-row').first()).toBeVisible()
  expect(await page.getByTestId('overview-basket-row').count()).toBeGreaterThan(0)
})
