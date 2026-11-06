import { test, expect } from '../../../harness'
import { REGISTRY, findDtfByAddress } from '../../../helpers/registry'

// Governance proposal-list lifecycle: the list feeds from the proposals subgraph
// op; holding it parks the list (dtf already loaded) → list skeleton → release →
// the proposals card. A reliable subgraph-op island freeze.
const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!

test('governance list: skeleton → proposals @smoke @mobile', async ({ harness }) => {
  const page = harness.page
  const skeleton = page.getByTestId('governance-list-skeleton')

  const hold = harness.mock.hold({ boundary: 'subgraph', operationName: 'GetIndexDtfProposals' })
  await harness.goto(base, 'governance')

  await expect(skeleton.first()).toBeVisible({ timeout: 12_000 })
  await expect.poll(() => hold.hits, { timeout: 10_000 }).toBeGreaterThan(0)

  hold.release()
  await expect(page.getByTestId('governance-proposals').first()).toBeVisible({ timeout: 15_000 })
  await expect(skeleton).toHaveCount(0, { timeout: 15_000 })
})

// Proposal detail: holding the proposal op parks the votes and status cards on
// skeletons instead of placeholder values (0 of Unavailable, a 1969 date).
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'

test('proposal detail: skeleton → votes and status @smoke @mobile', async ({ harness }) => {
  const page = harness.page
  const lcap = findDtfByAddress('0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8')!
  const stats = page.getByTestId('proposal-stats-skeleton')
  const timeline = page.getByTestId('proposal-timeline-skeleton')

  const hold = harness.mock.hold({ boundary: 'subgraph', operationName: 'GetIndexDtfProposal' })
  await harness.goto(lcap, `governance/proposal/${PROPOSAL_ID}`)

  await expect.poll(() => hold.hits, { timeout: 10_000 }).toBeGreaterThan(0)
  await expect(stats).toBeVisible({ timeout: 12_000 })
  await expect(timeline).toBeVisible()
  await expect(page.getByTestId('proposal-for-votes')).toHaveCount(0)

  hold.release()
  await expect(page.getByTestId('proposal-for-votes')).toBeVisible({ timeout: 15_000 })
  await expect(stats).toHaveCount(0)
  await expect(timeline).toHaveCount(0)
})
