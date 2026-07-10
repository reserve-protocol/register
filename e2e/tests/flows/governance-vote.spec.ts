import { decodeFunctionData, parseAbi, type Hex } from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { advanceTime, freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'
import { loadEnrichedProposal } from '../../helpers/subgraph'
import type { BoundaryRequest } from '../../helpers/requests'

// Vertical slice: the full governance write path on base/lcap. Proves the whole
// offline stack end-to-end — frozen clock pins an ACTIVE voting window, the mock
// wallet connects, the TransactionButton drives pending -> confirming -> success,
// and a per-test overlay lets the UI observe a changed vote tally after the tx.
// This is the reference spec the flow swarm copies; keep the shape obvious.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
// A captured proposal that was ACTIVE — the SDK derives live state from the
// subgraph `state` + the frozen clock, so freezing inside the window keeps it
// ACTIVE and votable regardless of when the snapshot ages.
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'
const VOTE_ABI = parseAbi(['function castVote(uint256 proposalId, uint8 support) returns (uint256)'])

interface ProposalSnapshot {
  proposal: {
    id: string
    voteStart: string
    voteEnd: string
    forWeightedVotes: string
    [key: string]: unknown
  }
}

function loadProposal(): ProposalSnapshot {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  return loadSnapshot<ProposalSnapshot>(`${dtf.snapshotDir}/proposals/${PROPOSAL_ID}.json`)
}

test('cast a For vote through the full transaction flow', async ({
  page,
  overrides,
  txLog,
  boundaryRequests,
}) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const { proposal } = loadProposal()

  // 1. Freeze time INSIDE the voting window (before any navigation) so the SDK
  //    resolves the proposal as ACTIVE and the vote button is live.
  await freezeTime(page, proposalTime(proposal, 'active'))

  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))

  // 2. Connect the mock wallet (first real use of the wallet fixture).
  await connectWallet(page)

  // Pump — flush react-query: a paused clock also freezes react-query's
  // notifyManager (setTimeout-batched), so the connected-account reads (voter
  // state -> voting power) fetch but never reach React until time advances.
  // Without this the vote button stays disabled forever.
  await advanceTime(page, 5_000)

  // Baseline tally before voting — the captured "For" weight, compact-formatted.
  const forVotes = page.getByTestId('proposal-for-votes')
  await expect(forVotes).toBeVisible()
  await expect(forVotes).not.toHaveText('42M')

  // 3. Open the vote modal. The button is now enabled (voter-state resolved).
  await page.getByTestId('proposal-vote-btn').click()
  await page.getByTestId('vote-option-for').click()

  // Stage the post-tx overlay: after the vote, the app refetches the voting
  // snapshot (a second subgraph query). Serve a fresher one with a bumped tally
  // so the UI observes a real change — the mechanism every flow spec reuses.
  // Build it from the same enriched snapshot the mock serves, so only the field
  // under test changes. 42M is distinct from the captured ~1.8M For weight.
  const overlay = loadEnrichedProposal(PROPOSAL_ID)!
  overrides.subgraph(
    {
      operationName: 'GetIndexDtfProposalVotingSnapshot',
      variables: { proposalId: PROPOSAL_ID },
    },
    {
      proposal: { ...overlay.proposal, forWeightedVotes: '42000000000000000000000000' },
    }
  )

  // Pump — flush react-query: selecting a choice fires the castVote
  // useSimulateContract; its result (isReady) reaches React only once the clock
  // advances, so the submit button stays disabled without this.
  await advanceTime(page, 5_000)

  // 4. Submit — the modal's TransactionButton runs the write. The mock provider
  //    records a unique hash; the RPC mock serves only its correlated receipt.
  await page.getByTestId('vote-submit-btn').click()

  // Wait until the provider has actually accepted the send before pumping its
  // frozen receipt timers. Advancing too early races the scheduled first poll
  // under parallel load and made this flow flaky.
  await expect.poll(() => txLog.length).toBe(1)
  await advanceTime(page, 5_000) // first correlated receipt poll returns pending
  await expect
    .poll(() => receiptRequestCount(boundaryRequests, txLog[0].hash))
    .toBeGreaterThanOrEqual(1)
  await advanceTime(page, 5_000) // next poll returns the successful receipt

  // Success state a user actually sees (Lingui copy -> testid, not text).
  await expect(page.getByTestId('vote-success')).toBeVisible()

  // Pump 2 — post-vote refetch: the success handler invalidates the proposal +
  // voting-snapshot queries; advance so the refetch (which hits the overlay)
  // settles before we assert.
  await advanceTime(page, 5_000)

  // 5. The observed tally reflects the overlaid voting snapshot.
  await expect(forVotes).toHaveText('42M')

  expect(txLog).toHaveLength(1)
  const voteTx = txLog[0]
  expect(voteTx.chainId).toBe(dtf.chainId)
  const governance = overlay.proposal.governance as { id: string }
  expect(voteTx.to).toBe(governance.id.toLowerCase())
  expect(BigInt(voteTx.value)).toBe(0n)
  const decoded = decodeFunctionData({ abi: VOTE_ABI, data: voteTx.data as Hex })
  expect(decoded.functionName).toBe('castVote')
  expect(decoded.args).toEqual([BigInt(PROPOSAL_ID), 1])
})

function receiptRequestCount(requests: BoundaryRequest[], hash: string): number {
  return requests.filter(
    (request) =>
      request.boundary === 'rpc' &&
      request.method === 'eth_getTransactionReceipt' &&
      String(request.params[0]).toLowerCase() === hash.toLowerCase()
  ).length
}
