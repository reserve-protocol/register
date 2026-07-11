import { decodeFunctionData, parseAbi, type Hex } from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { advanceTime, freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'
import { loadEnrichedProposal } from '../../helpers/subgraph'
import type { BoundaryRequest } from '../../helpers/requests'
import type { TxRecord } from '../../helpers/provider'
import type { Page } from '@playwright/test'

// FAILURE paths for the governance write flows (vote / queue / execute) on
// base/lcap. Sibling of governance-vote + governance-queue-execute; those cover
// SUCCESS, these cover revert + user-reject via `overrides.transaction`.
//
// The contract of the mock wallet (helpers/provider.ts):
//  - kind:'revert'  -> the send IS accepted, a hash is recorded in txLog with
//    receiptStatus 'revert', and the RPC mock serves a receipt with status 0x0.
//    useWaitForTransactionReceipt resolves the reverted receipt as a query
//    'error', so useWatchTransaction reports status 'error' (NOT 'success') and
//    the button never shows the success view — verified below.
//  - kind:'reject'  -> eth_sendTransaction THROWS (code 4001) BEFORE recording
//    anything, so txLog stays empty. This is the provider's promise, asserted.
//
// Two mock-fidelity notes the revert tests depend on:
//  1. Recovery takes ~2 receipt-poll cycles of pumped clock (the button sits on
//     "Confirming…" for the first cycle), so revert tests pump generously before
//     asserting the control re-armed.
//  2. On a reverted receipt viem re-calls the tx (to+data) to read the revert
//     reason; that eth_call is unmocked by default, so each revert test seeds it
//     from the recorded tx once the send lands (a per-test override, not a
//     shared-helper edit).

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'
const dtf = findDtfByAddress(DTF_ADDRESS)!

const VOTE_ABI = parseAbi([
  'function castVote(uint256 proposalId, uint8 support) returns (uint256)',
])
const GOVERNOR_ACTION_ABI = parseAbi([
  'function queue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)',
  'function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) payable returns (uint256)',
])

interface DtfSnapshot {
  dtf: Record<string, unknown>
}

function loadProposal() {
  return loadEnrichedProposal(PROPOSAL_ID)!.proposal as {
    voteStart: string
    voteEnd: string
    governance: { id: string }
    targets: string[]
    calldatas: string[]
    description: string
    [key: string]: unknown
  }
}

function proposalDetailOverlay(mutations: Record<string, unknown>) {
  const { dtf: dtfObj } = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`)
  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  return { dtf: dtfObj, proposal: { ...proposal, ...mutations } }
}

function receiptRequestCount(requests: BoundaryRequest[], hash: string): number {
  return requests.filter(
    (request) =>
      request.boundary === 'rpc' &&
      request.method === 'eth_getTransactionReceipt' &&
      String(request.params[0]).toLowerCase() === hash.toLowerCase()
  ).length
}

// Drive one recorded (revert or success) send to its terminal receipt: wait for
// the send, pump the first (pending) poll, wait until it was polled, then pump
// the poll that returns the final receipt. Mirrors governance-vote's sequence.
async function drainReceipt(
  page: Page,
  txLog: TxRecord[],
  boundaryRequests: BoundaryRequest[],
  index: number
) {
  await expect.poll(() => txLog.length).toBeGreaterThan(index)
  const { hash } = txLog[index]
  await advanceTime(page, 5_000)
  await expect
    .poll(() => receiptRequestCount(boundaryRequests, hash))
    .toBeGreaterThanOrEqual(1)
  await advanceTime(page, 5_000)
  await advanceTime(page, 5_000)
}

// After a send lands in txLog, seed the reverted tx's revert-reason re-call
// (viem re-calls to+data on a 0x0 receipt) and pump the frozen clock through the
// receipt-poll cycles so the button settles out of "Confirming…". Returns once
// enough clock has been pumped for recovery to be observable.
async function settleRevert(
  page: Page,
  overrides: { ethCall: (a: string, c: string, r: Hex) => void },
  txLog: TxRecord[]
) {
  await expect.poll(() => txLog.length).toBe(1)
  overrides.ethCall(txLog[0].to, txLog[0].data, ('0x' + '0'.repeat(64)) as Hex)
  for (let i = 0; i < 8; i++) await advanceTime(page, 5_000)
}

// ---------------------------------------------------------------------------
// VOTE
// ---------------------------------------------------------------------------

async function openVoteModal(page: Page) {
  const proposal = loadProposal()
  await freezeTime(page, proposalTime(proposal, 'active'))
  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)
  await advanceTime(page, 5_000)
  await expect(page.getByTestId('proposal-for-votes')).toBeVisible()
  await page.getByTestId('proposal-vote-btn').click()
  await page.getByTestId('vote-option-for').click()
  await advanceTime(page, 5_000)
  const submit = page.getByTestId('vote-submit-btn')
  await expect(submit).toBeEnabled()
  return submit
}

// Post-vote overlay: a bumped tally the UI would ONLY observe if it refetched on
// a (real) success. After a revert it must NOT be shown — fake success data.
function stageBumpedTally(overrides: {
  subgraph: (m: { operationName: string; variables?: Record<string, unknown> }, d: unknown) => void
}) {
  const overlay = loadEnrichedProposal(PROPOSAL_ID)!
  overrides.subgraph(
    {
      operationName: 'GetIndexDtfProposalVotingSnapshot',
      variables: { proposalId: PROPOSAL_ID },
    },
    { proposal: { ...overlay.proposal, forWeightedVotes: '42000000000000000000000000' } }
  )
}

test('vote: user rejects the wallet request — no success, submit recovers, retry works', async ({
  page,
  overrides,
  txLog,
  boundaryRequests,
}) => {
  const submit = await openVoteModal(page)

  overrides.transaction({ kind: 'reject' })
  await submit.click()
  await advanceTime(page, 5_000)

  // Rejection surfaced: the modal never flips to the success view and the
  // provider recorded nothing (its reject contract — throw before txLog.push).
  await expect(page.getByTestId('vote-success')).toHaveCount(0)
  expect(txLog).toHaveLength(0)
  // Recovery: the submit control is actionable again (not hung on pending).
  await expect(submit).toBeEnabled()

  // Retry with the queue now empty (default success) proves the button was
  // genuinely re-armed AND that the first click consumed the reject outcome.
  await submit.click()
  await drainReceipt(page, txLog, boundaryRequests, 0)
  await expect(page.getByTestId('vote-success')).toBeVisible()
  expect(txLog).toHaveLength(1)
  expect(txLog[0].receiptStatus).toBe('success')
  const decoded = decodeFunctionData({ abi: VOTE_ABI, data: txLog[0].data as Hex })
  expect(decoded.functionName).toBe('castVote')
})

// A reverted vote must NOT be surfaced as success: the modal stays on the vote
// form, the success view never mounts, the staged (fake) post-vote tally is
// never shown, and the submit control re-arms rather than hanging on
// "Confirming…".
test('vote: reverted tx surfaces failure and recovers (staged tally must stay hidden)', async ({
  page,
  overrides,
  txLog,
}) => {
  const submit = await openVoteModal(page)
  const forVotes = page.getByTestId('proposal-for-votes')
  await expect(forVotes).not.toHaveText('42M')
  // Stage a bumped tally the UI would only observe if it (wrongly) refetched on
  // a success — it must stay hidden after a revert.
  stageBumpedTally(overrides)

  overrides.transaction({ kind: 'revert' })
  await submit.click()
  await settleRevert(page, overrides, txLog)

  expect(txLog).toHaveLength(1)
  expect(txLog[0].receiptStatus).toBe('revert')
  await expect(page.getByTestId('vote-success')).toHaveCount(0)
  await expect(forVotes).not.toHaveText('42M')
  await expect(submit).toBeEnabled()
})

// ---------------------------------------------------------------------------
// QUEUE
// ---------------------------------------------------------------------------

async function openQueueCta(page: Page, overrides: Parameters<typeof stageBumpedTally>[0]) {
  const proposal = loadProposal()
  // Winning tallies after voteEnd -> SDK derives SUCCEEDED -> queue CTA.
  overrides.subgraph(
    { operationName: 'GetIndexDtfProposal', variables: { proposalId: PROPOSAL_ID } },
    proposalDetailOverlay({
      forWeightedVotes: '20000000000000000000000000',
      againstWeightedVotes: '0',
      abstainWeightedVotes: '0',
    })
  )
  await freezeTime(page, proposalTime(proposal, 'ended'))
  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)
  await advanceTime(page, 5_000)
  const queueBtn = page.getByTestId('proposal-queue-btn')
  await expect(queueBtn).toBeEnabled()
  return queueBtn
}

test('queue: user rejects the wallet request — no queued state, CTA recovers, retry works', async ({
  page,
  overrides,
  txLog,
  boundaryRequests,
}) => {
  const queueBtn = await openQueueCta(page, overrides)

  overrides.transaction({ kind: 'reject' })
  await queueBtn.click()
  await advanceTime(page, 5_000)

  await expect(page.getByTestId('proposal-result-queued')).toHaveCount(0)
  expect(txLog).toHaveLength(0)
  await expect(queueBtn).toBeEnabled()

  await queueBtn.click()
  await drainReceipt(page, txLog, boundaryRequests, 0)
  await expect(page.getByTestId('proposal-result-queued')).toBeVisible()
  expect(txLog).toHaveLength(1)
  expect(txLog[0].receiptStatus).toBe('success')
  const decoded = decodeFunctionData({ abi: GOVERNOR_ACTION_ABI, data: txLog[0].data as Hex })
  expect(decoded.functionName).toBe('queue')
})

// A reverted queue tx must NOT move the proposal to QUEUED; the CTA recovers.
test('queue: reverted tx does not move the proposal to QUEUED', async ({
  page,
  overrides,
  txLog,
}) => {
  const queueBtn = await openQueueCta(page, overrides)

  overrides.transaction({ kind: 'revert' })
  await queueBtn.click()
  await settleRevert(page, overrides, txLog)

  expect(txLog).toHaveLength(1)
  expect(txLog[0].receiptStatus).toBe('revert')
  await expect(page.getByTestId('proposal-result-queued')).toHaveCount(0)
  await expect(queueBtn).toBeEnabled()
})

// ---------------------------------------------------------------------------
// EXECUTE
// ---------------------------------------------------------------------------

async function openExecuteCta(page: Page, overrides: Parameters<typeof stageBumpedTally>[0]) {
  const proposal = loadProposal()
  const voteEnd = Number(proposal.voteEnd)
  // Raw QUEUED with an ETA already in the past -> execute CTA is live.
  overrides.subgraph(
    { operationName: 'GetIndexDtfProposal', variables: { proposalId: PROPOSAL_ID } },
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
  await advanceTime(page, 5_000)
  const executeBtn = page.getByTestId('proposal-execute-btn')
  await expect(executeBtn).toBeEnabled()
  return executeBtn
}

test('execute: user rejects the wallet request — no executed state, CTA recovers, retry works', async ({
  page,
  overrides,
  txLog,
  boundaryRequests,
}) => {
  const executeBtn = await openExecuteCta(page, overrides)

  overrides.transaction({ kind: 'reject' })
  await executeBtn.click()
  await advanceTime(page, 5_000)

  await expect(page.getByTestId('proposal-result-executed')).toHaveCount(0)
  expect(txLog).toHaveLength(0)
  await expect(executeBtn).toBeEnabled()

  await executeBtn.click()
  await drainReceipt(page, txLog, boundaryRequests, 0)
  await expect(page.getByTestId('proposal-result-executed')).toBeVisible()
  expect(txLog).toHaveLength(1)
  expect(txLog[0].receiptStatus).toBe('success')
  const decoded = decodeFunctionData({ abi: GOVERNOR_ACTION_ABI, data: txLog[0].data as Hex })
  expect(decoded.functionName).toBe('execute')
})

// A reverted execute tx must NOT move the proposal to EXECUTED; the CTA recovers.
test('execute: reverted tx does not move the proposal to EXECUTED', async ({
  page,
  overrides,
  txLog,
}) => {
  const executeBtn = await openExecuteCta(page, overrides)

  overrides.transaction({ kind: 'revert' })
  await executeBtn.click()
  await settleRevert(page, overrides, txLog)

  expect(txLog).toHaveLength(1)
  expect(txLog[0].receiptStatus).toBe('revert')
  await expect(page.getByTestId('proposal-result-executed')).toHaveCount(0)
  await expect(executeBtn).toBeEnabled()
})
