import { connectWallet, expect, test } from '../../fixtures/wallet'
import { freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadEnrichedProposal } from '../../helpers/subgraph'

// Create-proposal write path on the simplest deterministic proposal type: DAO
// settings (governance/propose/other). Unlike basket proposals (price/liquidity
// dependent) the DAO form is pure on-snapshot data: tweak one governance
// parameter, confirm, describe, submit. The mock wallet answers
// eth_sendTransaction with a fixed hash and the RPC mock serves a success
// receipt WITHOUT logs — so the app's ProposalCreated parsing falls back and,
// per SubmitProposalButton's onFallback, navigates back to the governance list
// after a 10s timeout. That fallback is the asserted post-create behavior.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'

const dtf = findDtfByAddress(DTF_ADDRESS)!

test('create a DAO-settings proposal through the full submit flow', async ({
  page,
}) => {
  // Freeze on a snapshot-anchored time (inside the captured proposal's voting
  // window) so every time-derived read stays consistent with the snapshots.
  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  await freezeTime(
    page,
    proposalTime(proposal as { voteStart: string; voteEnd: string }, 'active')
  )

  await page.goto(dtfPath(dtf, 'governance/propose/other'))
  await connectWallet(page)

  // Pump — flush react-query: getFull (indexDTFAtom hydration) + proposer-state
  // reads resolve but never reach React under the paused clock. The DAO form
  // fields only mount once stToken.governance hydrates.
  await page.clock.runFor(5_000)

  // Open the Governance section of the DAO settings accordion.
  await page.getByTestId('propose-section-trigger-governance').click()

  // Pump — the accordion's scroll helper runs on a 250ms setTimeout.
  await page.clock.runFor(1_000)

  // Change the voting delay (currently 2 days on lcap) to 3 days via the
  // custom input — the first numeric field in the governance section.
  const votingDelayInput = page
    .locator('#propose-section-governance')
    .locator('input[type="number"]')
    .first()
  await expect(votingDelayInput).toBeVisible()
  await votingDelayInput.fill('3')

  // Pump — the form updater diffs values into daoGovernanceChangesAtom and the
  // zod resolver revalidates; both settle on timers.
  await page.clock.runFor(1_000)

  // Confirm & prepare the proposal.
  const confirmBtn = page.getByTestId('propose-confirm-btn')
  await expect(confirmBtn).toBeEnabled()
  await confirmBtn.click()

  // Pump — the confirm stage lazy-loads the MD editor (Suspense) and mounts
  // the description form.
  await page.clock.runFor(2_000)

  // A title is the only required description input (#title is a stable id).
  await page.locator('#title').fill('E2E DAO settings proposal')

  // Pump — the description effect + proposal-data atom recompute settle.
  await page.clock.runFor(1_000)

  // Submit onchain. 100k voting power (getVotes mock) clears every proposal
  // threshold, so the gatekeeper renders the live submit button.
  const submitBtn = page.getByTestId('propose-submit-btn')
  await expect(submitBtn).toBeEnabled()
  await submitBtn.click()

  // Pump — receipt polling: useWaitForTransactionReceipt never elapses under
  // the frozen clock; advance so pending -> confirming -> success completes.
  await page.clock.runFor(10_000)

  // While waiting/after success the button stays disabled (isSubmitted).
  await expect(submitBtn).toBeDisabled()

  // Pump — post-create fallback: the empty-logs receipt has no ProposalCreated
  // event, so handleRecentProposalReceipt falls back to a 10s-delayed navigate
  // back to the governance list.
  await page.clock.runFor(11_000)

  await expect(page).toHaveURL(/\/governance$/)
  await expect(page.getByTestId('dtf-governance')).toBeVisible()
})
