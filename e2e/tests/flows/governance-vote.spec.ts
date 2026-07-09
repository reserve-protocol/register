import { connectWallet, expect, test } from '../../fixtures/wallet'
import { freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'
import { loadEnrichedProposal } from '../../helpers/subgraph'

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
  await page.clock.runFor(5_000)

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
  overrides.subgraph('GetIndexDtfProposalVotingSnapshot', {
    proposal: { ...overlay.proposal, forWeightedVotes: '42000000000000000000000000' },
  })

  // Pump — flush react-query: selecting a choice fires the castVote
  // useSimulateContract; its result (isReady) reaches React only once the clock
  // advances, so the submit button stays disabled without this.
  await page.clock.runFor(5_000)

  // 4. Submit — the modal's TransactionButton runs the write. The mock provider
  //    answers eth_sendTransaction with a fixed hash; the RPC mock serves a
  //    confirmations-safe receipt.
  await page.getByTestId('vote-submit-btn').click()

  // Pump 1 — receipt polling: useWaitForTransactionReceipt polls
  // eth_getTransactionReceipt on an interval that never elapses under the frozen
  // clock; advance it so pending -> confirming -> success can complete.
  await page.clock.runFor(10_000)

  // Success state a user actually sees (Lingui copy -> testid, not text).
  await expect(page.getByTestId('vote-success')).toBeVisible()

  // Pump 2 — post-vote refetch: the success handler invalidates the proposal +
  // voting-snapshot queries; advance so the refetch (which hits the overlay)
  // settles before we assert.
  await page.clock.runFor(5_000)

  // 5. The observed tally reflects the overlaid voting snapshot.
  await expect(forVotes).toHaveText('42M')
})
