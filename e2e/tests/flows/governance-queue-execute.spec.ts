import { connectWallet, expect, test } from '../../fixtures/wallet'
import { freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'
import { loadEnrichedProposal } from '../../helpers/subgraph'

// Queue + execute write paths, the two steps after a vote succeeds. Each test
// pins its starting state with the GetIndexDtfProposal overlay (mutating the
// fields the SDK's getProposalState derivation reads) + a frozen clock, then
// drives the TransactionButton through the mock wallet's fixed-hash tx and the
// RPC mock's success receipt. Both buttons update proposalDetailAtom locally on
// success, which is the user-visible transition asserted here.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'

const dtf = findDtfByAddress(DTF_ADDRESS)!

interface DtfSnapshot {
  dtf: Record<string, unknown>
}

function proposalDetailOverlay(mutations: Record<string, unknown>) {
  const { dtf: dtfObj } = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`)
  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  return { dtf: dtfObj, proposal: { ...proposal, ...mutations } }
}

function loadProposal() {
  return loadEnrichedProposal(PROPOSAL_ID)!.proposal as {
    voteStart: string
    voteEnd: string
  }
}

test('queue a succeeded proposal through the full transaction flow', async ({
  page,
  overrides,
}) => {
  const proposal = loadProposal()

  // Winning tallies after voteEnd -> SDK derives SUCCEEDED -> queue CTA.
  // 20M For clears lcap's ~6.48M quorum with zero Against.
  overrides.subgraph(
    'GetIndexDtfProposal',
    proposalDetailOverlay({
      forWeightedVotes: '20000000000000000000000000',
      againstWeightedVotes: '0',
      abstainWeightedVotes: '0',
    })
  )
  await freezeTime(page, proposalTime(proposal, 'ended'))

  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)

  // Pump — flush react-query: the detail query + the queueProposal
  // useSimulateContract (isReady) resolve but only reach React once the paused
  // clock advances.
  await page.clock.runFor(5_000)

  const queueBtn = page.getByTestId('proposal-queue-btn')
  await expect(queueBtn).toBeVisible()
  await expect(queueBtn).toBeEnabled()

  await queueBtn.click()

  // Pump — receipt polling: useWatchTransaction polls the receipt on an
  // interval that never elapses under the frozen clock.
  await page.clock.runFor(10_000)

  // On success the component moves the proposal to QUEUED locally: the queue
  // CTA disappears and the timeline shows the queued result step.
  await expect(page.getByTestId('proposal-result-queued')).toBeVisible()
  await expect(page.getByTestId('proposal-queue-btn')).toHaveCount(0)

  // Execution is still timelocked (ETA = now + executionDelay), so no execute
  // CTA yet — exactly what a governor sees right after queueing.
  await expect(page.getByTestId('proposal-execute-btn')).toHaveCount(0)
})

test('execute a queued proposal past its ETA through the full transaction flow', async ({
  page,
  overrides,
}) => {
  const proposal = loadProposal()
  const voteEnd = Number(proposal.voteEnd)

  // Raw QUEUED with an ETA already in the past when we freeze at
  // voteEnd + 3600 ('ended' phase) -> canExecuteProposal is true -> execute CTA.
  overrides.subgraph(
    'GetIndexDtfProposal',
    proposalDetailOverlay({
      state: 'QUEUED',
      forWeightedVotes: '20000000000000000000000000',
      againstWeightedVotes: '0',
      abstainWeightedVotes: '0',
      queueTime: String(voteEnd + 60),
      queueBlock: '99999990',
      queueTxnHash: '0x' + 'd'.repeat(64),
      executionETA: voteEnd + 600,
    })
  )
  await freezeTime(page, proposalTime(proposal, 'ended'))

  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)

  // Pump — flush react-query: detail query + executeProposal simulate
  // (isReady) reach React only when the clock advances.
  await page.clock.runFor(5_000)

  const executeBtn = page.getByTestId('proposal-execute-btn')
  await expect(executeBtn).toBeVisible()
  await expect(executeBtn).toBeEnabled()

  await executeBtn.click()

  // Pump — receipt polling for the execute tx.
  await page.clock.runFor(10_000)

  // On success the component moves the proposal to EXECUTED locally: the
  // timeline shows the executed result and the action area now links to the
  // execution tx (the mock wallet's fixed hash).
  await expect(page.getByTestId('proposal-result-executed')).toBeVisible()
  await expect(page.getByTestId('proposal-execute-tx-btn')).toBeVisible()
  await expect(page.getByTestId('proposal-execute-btn')).toHaveCount(0)
})
