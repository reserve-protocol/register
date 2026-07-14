import { decodeFunctionData, parseAbi, type Hex } from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { advanceTime, freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadEnrichedProposal } from '../../helpers/subgraph'
import type { BoundaryRequest } from '../../helpers/requests'

// SUPPORT-ENUM characterization — the highest-value governance invariant: the
// button a voter picks must encode the SAME support value on-chain. The vote
// modal maps its three choices to OZ Governor support ints
// (AGAINST=0, FOR=1, ABSTAIN=2); a swapped mapping is a P0 (a user votes "For"
// and the calldata says "Against"). Each test drives the real castVote through
// the mock wallet and decodes the submitted calldata's `support` arg, asserting
// it equals the enum for the chosen testid — the ONLY thing that proves the UI
// label and the encoded vote agree. Sibling of governance-vote (which only
// covers For); this closes Against + Abstain.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'
const dtf = findDtfByAddress(DTF_ADDRESS)!

const VOTE_ABI = parseAbi([
  'function castVote(uint256 proposalId, uint8 support) returns (uint256)',
])

function loadProposal() {
  return loadEnrichedProposal(PROPOSAL_ID)!.proposal as {
    voteStart: string
    voteEnd: string
    governance: { id: string }
  }
}

function receiptRequestCount(requests: BoundaryRequest[], hash: string): number {
  return requests.filter(
    (request) =>
      request.boundary === 'rpc' &&
      request.method === 'eth_getTransactionReceipt' &&
      String(request.params[0]).toLowerCase() === hash.toLowerCase()
  ).length
}

// The one thing this spec exists to pin: the chosen option's testid and the
// OZ Governor support int the calldata must carry. AGAINST=0, FOR=1, ABSTAIN=2.
const SUPPORT_VARIANTS = [
  { option: 'for', support: 1 },
  { option: 'against', support: 0 },
  { option: 'abstain', support: 2 },
] as const

for (const { option, support } of SUPPORT_VARIANTS) {
  test(`vote "${option}" encodes castVote support=${support}`, async ({
    page,
    txLog,
    boundaryRequests,
  }) => {
    const proposal = loadProposal()

    // Clock inside the window keeps the proposal ACTIVE and votable (the SDK
    // derives display state from the raw subgraph state + this frozen clock).
    await freezeTime(page, proposalTime(proposal, 'active'))
    await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
    await connectWallet(page)

    // Pump — a paused clock freezes react-query's notifyManager, so the
    // connected-account voter-state reads (voting power -> button enabled) fetch
    // but never reach React until time advances.
    await advanceTime(page, 5_000)

    const voteBtn = page.getByTestId('proposal-vote-btn')
    await expect(voteBtn).toBeEnabled()
    await voteBtn.click()

    // Select this variant's choice by its stable testid (never copy — the label
    // is Lingui-translated). This is the exact mapping under test.
    await page.getByTestId(`vote-option-${option}`).click()

    // Pump — the castVote useSimulateContract (isReady) reaches React only once
    // the clock advances, so the submit button stays disabled without this.
    await advanceTime(page, 5_000)
    const submit = page.getByTestId('vote-submit-btn')
    await expect(submit).toBeEnabled()
    await submit.click()

    // Drain the receipt: wait for the send, pump the first (pending) poll, wait
    // until it was polled, then pump the poll that returns the success receipt.
    await expect.poll(() => txLog.length).toBe(1)
    await advanceTime(page, 5_000)
    await expect
      .poll(() => receiptRequestCount(boundaryRequests, txLog[0].hash))
      .toBeGreaterThanOrEqual(1)
    await advanceTime(page, 5_000)

    await expect(page.getByTestId('vote-success')).toBeVisible()

    // The calldata is the source of truth: decode it and assert the support arg
    // equals the enum for the option we clicked. A swapped mapping fails HERE.
    expect(txLog).toHaveLength(1)
    const voteTx = txLog[0]
    expect(voteTx.chainId).toBe(dtf.chainId)
    expect(voteTx.to).toBe(proposal.governance.id.toLowerCase())
    expect(BigInt(voteTx.value)).toBe(0n)
    const decoded = decodeFunctionData({ abi: VOTE_ABI, data: voteTx.data as Hex })
    expect(decoded.functionName).toBe('castVote')
    expect(decoded.args).toEqual([BigInt(PROPOSAL_ID), support])
  })
}
