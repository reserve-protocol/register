import { expect, test } from '../../fixtures/base'
import { advanceTime, freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress, type RegistryDTF } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'
import { loadEnrichedProposal } from '../../helpers/subgraph'
import type { BoundaryRequest } from '../../helpers/requests'

// MULTICHAIN governance coverage. The existing governance specs all pin
// base/lcap (v5); this one runs the SAME list + lifecycle-state recipes against
// the two chains nobody else exercises:
//   - bsc/cmc20  (v5, chainId 56)
//   - mainnet/open (v4, chainId 1) — the suite's ONLY v4 governance path, where
//     the SDK's version-gated mappers are most likely to break.
// Every assertion is derived from the captured snapshots (governance.json +
// proposals/<id>.json), never hardcoded, so re-captures don't rot the spec.
//
// The lifecycle-state tests pin a NON-basket (governance-parameter) proposal per
// chain on purpose: a basket/rebalance proposal renders the v5 rebalance-preview,
// which fetches per-token /current + /historical prices for tokens outside the
// captured basket — the shared api mock only knows registry-basket tokens, so
// those 500 at teardown (a HELPER GAP that only bites non-lcap chains; see
// report). Governance-param proposals target the governor and skip the preview
// entirely, so the state derivation is exercised without that gap.

const DEFAULT_PAGE_SIZE = 10 // governance-proposal-list slices to 10 pre-"Show all"

// SDK getProposalState only RECOMPUTES display state for raw PENDING/ACTIVE/
// QUEUED; a raw EXECUTED passes straight through. So DEFEATED is derived from a
// raw-ACTIVE base (clock past voteEnd, against > for), while EXECUTED is pinned
// by overlaying the terminal state + an execution-tx hash the CTA links to.
const SYNTHETIC_EXECUTION_TX = '0x' + 'e'.repeat(64)

interface ChainUnderTest {
  address: string
  // A NON-basket proposal that has a detail snapshot under
  // <chain>/<slug>/proposals/ (targets the governor, so no rebalance preview).
  proposalId: string
  // Substring the execution-tx explorer link must contain for this chain
  // (getExplorerLink keys the host off chainIdAtom — a wrong chain id here is
  // exactly the multichain regression this asserts against).
  explorerHost: string
}

const CHAINS: ChainUnderTest[] = [
  {
    address: '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867', // bsc/cmc20 (v5)
    proposalId:
      '20993322382459865649676332454444973503609459565990645911459642956210570068483',
    explorerHost: 'bscscan.com',
  },
  {
    address: '0x323c03c48660fe31186fa82c289b0766d331ce21', // mainnet/open (v4)
    proposalId:
      '102380104465757607779355122336829913377375941933675137263679009382933794255161',
    explorerHost: 'etherscan',
  },
]

interface GovernanceSnapshot {
  governances: Array<{
    proposals: Array<{ id: string; description: string; creationTime: string }>
  }>
}
interface DtfSnapshot {
  dtf: Record<string, unknown>
}

function loadProposal(proposalId: string) {
  return loadEnrichedProposal(proposalId)!.proposal as {
    voteStart: string
    voteEnd: string
    quorumVotes: string
  }
}

// Full GetIndexDtfProposal overlay: the raw dtf object (same one the central
// mock serves) + the enriched proposal with per-test mutations — mirrors the
// base/lcap governance-states recipe so the SDK derivation reads real context.
function proposalDetailOverlay(
  dtf: RegistryDTF,
  proposalId: string,
  mutations: Record<string, unknown>
) {
  const { dtf: dtfObj } = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`)
  const { proposal } = loadEnrichedProposal(proposalId)!
  return { dtf: dtfObj, proposal: { ...proposal, ...mutations } }
}

// The proposal-detail query resolves in two frozen-clock flush rounds (the DTF
// identity flush enables the detail query, whose response then flushes into
// React). Same pump as governance-states.spec.
async function settleProposal(
  page: import('@playwright/test').Page,
  boundaryRequests: BoundaryRequest[]
) {
  await advanceTime(page, 5_000)
  await expect
    .poll(() =>
      boundaryRequests.some(
        (request) =>
          request.boundary === 'subgraph' &&
          request.operationName === 'GetIndexDtfProposal'
      )
    )
    .toBe(true)
  await advanceTime(page, 5_000)
}

for (const chain of CHAINS) {
  const dtf = findDtfByAddress(chain.address)!

  test.describe(`governance multichain — ${dtf.snapshotDir}`, () => {
    test('proposal list renders snapshot rows for this chain', async ({
      page,
    }) => {
      const { governances } = loadSnapshot<GovernanceSnapshot>(
        `${dtf.snapshotDir}/governance.json`
      )
      const allProposals = governances.flatMap((g) => g.proposals)
      const uniqueIds = new Set(allProposals.map((p) => p.id))
      const expectedRows = Math.min(uniqueIds.size, DEFAULT_PAGE_SIZE)

      await page.goto(dtfPath(dtf, 'governance'))
      await expect(page.getByTestId('dtf-governance')).toBeVisible()

      const proposals = page.getByTestId('governance-proposals')
      await expect(proposals).toBeVisible()

      const rows = proposals.locator('a[href*="/proposal/"]')
      await expect(rows).toHaveCount(expectedRows)

      // Rows are sorted by creationTime desc; the newest proposal's title
      // reaches the first row (data-derived, not Lingui copy).
      const newest = [...allProposals].sort(
        (a, b) => Number(b.creationTime) - Number(a.creationTime)
      )[0]
      const title = newest.description
        .split(/\r?\n/)[0]
        .replaceAll('#', '')
        .trim()
      await expect(rows.first()).toContainText(title.slice(0, 40))
    })

    test('pending proposal shows a disabled vote CTA', async ({
      page,
      overrides,
      boundaryRequests,
    }) => {
      const proposal = loadProposal(chain.proposalId)

      // Raw PENDING + clock before voteStart -> SDK derives PENDING.
      overrides.subgraph(
        {
          operationName: 'GetIndexDtfProposal',
          variables: { proposalId: chain.proposalId },
        },
        proposalDetailOverlay(dtf, chain.proposalId, { state: 'PENDING' })
      )
      await freezeTime(page, proposalTime(proposal, 'pending'))

      await page.goto(dtfPath(dtf, `governance/proposal/${chain.proposalId}`))
      await settleProposal(page, boundaryRequests)

      const voteBtn = page.getByTestId('proposal-vote-btn')
      await expect(voteBtn).toBeVisible()
      await expect(voteBtn).toBeDisabled()

      await expect(page.locator('[data-testid^="proposal-result-"]')).toHaveCount(
        0
      )
      await expect(page.getByTestId('proposal-queue-btn')).toHaveCount(0)
      await expect(page.getByTestId('proposal-execute-btn')).toHaveCount(0)
    })

    test('ended proposal with more against votes derives DEFEATED', async ({
      page,
      overrides,
      boundaryRequests,
    }) => {
      const proposal = loadProposal(chain.proposalId)

      // Raw ACTIVE (so the derivation recomputes) + against > for after voteEnd
      // -> DEFEATED. isOptimistic false pins the standard (non-veto) tally path.
      // 18-decimal raw strings.
      overrides.subgraph(
        {
          operationName: 'GetIndexDtfProposal',
          variables: { proposalId: chain.proposalId },
        },
        proposalDetailOverlay(dtf, chain.proposalId, {
          state: 'ACTIVE',
          isOptimistic: false,
          forWeightedVotes: '1000000000000000000000000', // 1M
          againstWeightedVotes: '15000000000000000000000000', // 15M
          abstainWeightedVotes: '0',
        })
      )
      await freezeTime(page, proposalTime(proposal, 'ended'))

      await page.goto(dtfPath(dtf, `governance/proposal/${chain.proposalId}`))
      await settleProposal(page, boundaryRequests)

      await expect(page.getByTestId('proposal-result-defeated')).toBeVisible()
      await expect(page.getByTestId('proposal-vote-btn')).toHaveCount(0)
      await expect(page.getByTestId('proposal-queue-btn')).toHaveCount(0)
      await expect(page.getByTestId('proposal-execute-btn')).toHaveCount(0)
    })

    test('executed proposal shows result and a chain-correct execute-tx link', async ({
      page,
      overrides,
      boundaryRequests,
    }) => {
      const proposal = loadProposal(chain.proposalId)

      // Raw EXECUTED passes through the derivation; the execution-tx hash feeds
      // the "View execute tx" CTA, whose href host is derived from chainIdAtom.
      overrides.subgraph(
        {
          operationName: 'GetIndexDtfProposal',
          variables: { proposalId: chain.proposalId },
        },
        proposalDetailOverlay(dtf, chain.proposalId, {
          state: 'EXECUTED',
          executionTxnHash: SYNTHETIC_EXECUTION_TX,
          executionTime: String(Number(proposal.voteEnd) + 7200),
          executionETA: Number(proposal.voteEnd) + 7200,
          queueTxnHash: '0x' + 'd'.repeat(64),
          queueTime: proposal.voteEnd,
        })
      )
      await freezeTime(page, proposalTime(proposal, 'ended'))

      await page.goto(dtfPath(dtf, `governance/proposal/${chain.proposalId}`))
      await settleProposal(page, boundaryRequests)

      await expect(page.getByTestId('proposal-result-executed')).toBeVisible()

      const executeTxBtn = page.getByTestId('proposal-execute-tx-btn')
      await expect(executeTxBtn).toBeVisible()

      // A wrong chain id points the link at the wrong explorer. Assert both the
      // correct host and the linked tx hash.
      const href = await executeTxBtn
        .locator('xpath=ancestor::a')
        .getAttribute('href')
      expect(href).toContain(chain.explorerHost)
      expect(href).toContain(SYNTHETIC_EXECUTION_TX)

      await expect(page.getByTestId('proposal-vote-btn')).toHaveCount(0)
      await expect(page.getByTestId('proposal-queue-btn')).toHaveCount(0)
      await expect(page.getByTestId('proposal-execute-btn')).toHaveCount(0)
    })
  })
}
