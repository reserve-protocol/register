import { expect, test } from '../../fixtures/base'
import { freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'
import { loadEnrichedProposal } from '../../helpers/subgraph'

// Proposal detail rendered in distinct lifecycle states. The SDK derives the
// display state (proposal.votingState.state) from the RAW subgraph `state` +
// vote tallies + the frozen clock (getProposalState), so each test pins one
// state by combining freezeTime with a GetIndexDtfProposal overlay that mutates
// exactly the fields the derivation reads:
//   - PENDING            -> raw state PENDING + clock before voteStart
//   - DEFEATED           -> clock after voteEnd + against > for (vote totals)
//   - QUORUM_NOT_REACHED -> clock after voteEnd + for wins but misses quorum
//   - EXECUTED           -> raw state EXECUTED + execution fields set
// No wallet needed — states and their CTAs render for a disconnected visitor.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'

const dtf = findDtfByAddress(DTF_ADDRESS)!

interface DtfSnapshot {
  dtf: Record<string, unknown>
}

// Build a full GetIndexDtfProposal overlay payload: the raw dtf object (same
// one the central mock serves) + the enriched proposal with per-test mutations.
function proposalDetailOverlay(mutations: Record<string, unknown>) {
  const { dtf: dtfObj } = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`)
  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  return { dtf: dtfObj, proposal: { ...proposal, ...mutations } }
}

function loadProposal() {
  return loadEnrichedProposal(PROPOSAL_ID)!.proposal as {
    voteStart: string
    voteEnd: string
    quorumVotes: string
  }
}

test('pending proposal shows a disabled vote CTA and no result', async ({
  page,
  overrides,
}) => {
  const proposal = loadProposal()

  // Raw PENDING + frozen before voteStart -> SDK derives PENDING (the captured
  // raw state is ACTIVE, which never derives back to PENDING).
  overrides.subgraph(
    'GetIndexDtfProposal',
    proposalDetailOverlay({ state: 'PENDING' })
  )
  await freezeTime(page, proposalTime(proposal, 'pending'))

  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))

  // Pump — flush react-query (notifyManager is frozen under a paused clock):
  // the proposal detail query resolves but never reaches React otherwise.
  await page.clock.runFor(5_000)

  // PENDING renders the vote button, disabled (no wallet + voting not open).
  const voteBtn = page.getByTestId('proposal-vote-btn')
  await expect(voteBtn).toBeVisible()
  await expect(voteBtn).toBeDisabled()

  // No terminal-result badge and no queue/execute CTAs in PENDING.
  await expect(page.locator('[data-testid^="proposal-result-"]')).toHaveCount(0)
  await expect(page.getByTestId('proposal-queue-btn')).toHaveCount(0)
  await expect(page.getByTestId('proposal-execute-btn')).toHaveCount(0)
})

test('ended proposal with more against votes derives DEFEATED', async ({
  page,
  overrides,
}) => {
  const proposal = loadProposal()

  // Vote totals are the fields the derivation reads: against > for after
  // voteEnd -> DEFEATED. Amounts are 18-decimal raw strings.
  overrides.subgraph(
    'GetIndexDtfProposal',
    proposalDetailOverlay({
      forWeightedVotes: '1000000000000000000000000', // 1M
      againstWeightedVotes: '15000000000000000000000000', // 15M
      abstainWeightedVotes: '0',
    })
  )
  await freezeTime(page, proposalTime(proposal, 'ended'))

  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))

  // Pump — flush react-query so the detail query's data reaches React.
  await page.clock.runFor(5_000)

  // Timeline result badge shows the derived DEFEATED state.
  await expect(page.getByTestId('proposal-result-defeated')).toBeVisible()

  // No actions on a defeated proposal.
  await expect(page.getByTestId('proposal-vote-btn')).toHaveCount(0)
  await expect(page.getByTestId('proposal-queue-btn')).toHaveCount(0)
  await expect(page.getByTestId('proposal-execute-btn')).toHaveCount(0)
})

test('ended proposal below quorum derives QUORUM_NOT_REACHED', async ({
  page,
  overrides,
}) => {
  const proposal = loadProposal()
  const quorum = BigInt(proposal.quorumVotes) // ~6.48M for lcap

  // For wins the majority but for+abstain misses quorum -> QUORUM_NOT_REACHED.
  overrides.subgraph(
    'GetIndexDtfProposal',
    proposalDetailOverlay({
      forWeightedVotes: (quorum / 2n).toString(),
      againstWeightedVotes: '1000000000000000000000', // 1k
      abstainWeightedVotes: '0',
    })
  )
  await freezeTime(page, proposalTime(proposal, 'ended'))

  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))

  // Pump — flush react-query so the detail query's data reaches React.
  await page.clock.runFor(5_000)

  await expect(
    page.getByTestId('proposal-result-quorum_not_reached')
  ).toBeVisible()
  await expect(page.getByTestId('proposal-vote-btn')).toHaveCount(0)
  await expect(page.getByTestId('proposal-queue-btn')).toHaveCount(0)
})

test('executed proposal shows result and the execute-tx link', async ({
  page,
  overrides,
}) => {
  const proposal = loadProposal()
  const executionTime = Number(proposal.voteEnd) + 7200

  // Execution fields are what the app reads for a terminal EXECUTED proposal:
  // raw state EXECUTED passes straight through the derivation; the tx hash
  // feeds the "View execute tx" CTA.
  overrides.subgraph(
    'GetIndexDtfProposal',
    proposalDetailOverlay({
      state: 'EXECUTED',
      executionTime: String(executionTime),
      executionBlock: '99999999',
      executionTxnHash: '0x' + 'e'.repeat(64),
      queueTime: proposal.voteEnd,
      queueBlock: '99999990',
      queueTxnHash: '0x' + 'd'.repeat(64),
      executionETA: executionTime,
    })
  )
  await freezeTime(page, proposalTime(proposal, 'ended'))

  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))

  // Pump — flush react-query so the detail query's data reaches React.
  await page.clock.runFor(5_000)

  // Timeline shows the executed result (label is "Proposal succeeded").
  await expect(page.getByTestId('proposal-result-executed')).toBeVisible()

  // The action area offers the explorer link to the execution tx instead of
  // any vote/queue/execute CTA.
  await expect(page.getByTestId('proposal-execute-tx-btn')).toBeVisible()
  await expect(page.getByTestId('proposal-vote-btn')).toHaveCount(0)
  await expect(page.getByTestId('proposal-queue-btn')).toHaveCount(0)
  await expect(page.getByTestId('proposal-execute-btn')).toHaveCount(0)
})
