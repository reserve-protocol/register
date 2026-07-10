import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Smoke: the Index DTF settings page renders snapshot-derived content fully
// offline. The @smoke gate fails on ANY unmocked boundary call, so a green run
// proves the whole settings surface (basics/fees/roles + the container's
// updaters) loads without touching a live RPC/subgraph/API.
//
// KNOWN BLOCKER (shared infra — reported to orchestrator): react-sdk 0.2.0's
// `sdk.index.get` throws while processing the goldsky `GetIndexDTF` response
// because `e2e/scripts/capture.ts` QUERIES.getDTF captures a FLAT schema that no
// longer matches the SDK 0.2.0 query shape (it expects nested
// governance/roles/fees/token.snapshot/voteLockVault/financials). So
// `indexDTFAtom` never populates and every DTF-data value here stays a skeleton.
// The @smoke gate itself passes (zero unmocked); only the data assertions fail.
// This spec is correct and goes green once the DTF snapshot is re-captured
// against SDK 0.2.0. No prior spec caught this (boot=home, governance-vote=
// proposal testids), so the DTF-data mock layer was never exercised.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const dtf = findDtfByAddress(DTF_ADDRESS)!

interface DtfSnapshot {
  dtf: {
    token: { name: string; symbol: string }
    stToken?: { id: string }
  }
}

// A single zero word — benign zero for address / uint / empty-collection returns.
const ZERO_WORD = ('0x' + '0'.repeat(64)) as `0x${string}`

test.beforeEach(async ({ overrides }) => {
  const { dtf: data } = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`)
  const vault = data.stToken?.id
  // Settings-only on-chain reads the shared RPC mock doesn't seed. Answer them
  // with benign zero so they don't log as unmocked and trip the @smoke gate:
  //   FeesInfo.tokenJar() + RewardTokens.getAllRewardTokens() live on the
  //   staking vault; DistributeFees.getPendingFeeShares() on the DTF itself.
  // (Reported to the orchestrator as an rpc.ts gap — see spec notes.)
  if (vault) {
    overrides.ethCall(vault, '0x490c98f5', ZERO_WORD) // tokenJar()
    overrides.ethCall(vault, '0x12edb24c', ZERO_WORD) // getAllRewardTokens() -> empty
  }
  overrides.ethCall(DTF_ADDRESS, '0x834e630f', ZERO_WORD) // getPendingFeeShares()
})

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
