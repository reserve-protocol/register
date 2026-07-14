import {
  bytesToHex,
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
  hexToBytes,
  keccak256,
  pad,
  parseAbi,
  parseAbiParameters,
  toBytes,
  zeroHash,
  type Hex,
} from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { advanceTime, freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress, TEST_ADDRESS } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'
import { loadEnrichedProposal } from '../../helpers/subgraph'
import type { MockOverrides } from '../../helpers/overrides'

// GOVERNANCE PERMISSION GATES — the "who is allowed to act" half of governance,
// the sibling of governance-vote/states (which cover the happy path). Every test
// asserts the negative contract too: a gated control must NOT be actionable and
// txLog must stay EMPTY. Two families:
//   - VOTE permission: zero voting power, already-voted, disconnected, and the
//     clock gate (window closed) each keep the vote CTA un-submittable.
//   - CANCEL permission: Timelock.cancel is gated by CANCELLER_ROLE (hasRole on
//     the timelock). A non-canceller must not even SEE the control; a canceller
//     can submit, and the decoded calldata must target the timelock's cancel.
//
// All state/time is derived from the captured snapshot so re-captures don't rot
// the spec. Pinned proposal is base/lcap (v5), raw ACTIVE with no terminal
// fields — the clean base for pinning any lifecycle phase.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'
const dtf = findDtfByAddress(DTF_ADDRESS)!

const GET_VOTES_ABI = parseAbi([
  'function getVotes(address account, uint256 timepoint) view returns (uint256)',
])
const HAS_ROLE_ABI = parseAbi([
  'function hasRole(bytes32 role, address account) view returns (bool)',
])
const CANCEL_ABI = parseAbi(['function cancel(bytes32 id)'])
const CANCELLER_ROLE = keccak256(toBytes('CANCELLER_ROLE'))
const UINT_ZERO = encodeAbiParameters([{ type: 'uint256' }], [0n])
const BOOL_TRUE = encodeAbiParameters([{ type: 'bool' }], [true])

interface DtfSnapshot {
  dtf: Record<string, unknown>
}

interface EnrichedProposal {
  voteStart: string
  voteEnd: string
  description: string
  targets: string[]
  calldatas: string[]
  votes: Array<Record<string, unknown>>
  governance: { id: string; timelock: { id: string } }
  [key: string]: unknown
}

function loadProposal(): EnrichedProposal {
  return loadEnrichedProposal(PROPOSAL_ID)!.proposal as unknown as EnrichedProposal
}

// Full GetIndexDtfProposal overlay: the raw dtf object (same one the central
// mock serves) + the enriched proposal with per-test mutations. Mirrors the
// pattern in governance-states/queue-execute.
function proposalDetailOverlay(mutations: Record<string, unknown>) {
  const { dtf: dtfObj } = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`)
  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  return { dtf: dtfObj, proposal: { ...proposal, ...mutations } }
}

function overlayProposal(overrides: MockOverrides, mutations: Record<string, unknown>) {
  overrides.subgraph(
    { operationName: 'GetIndexDtfProposal', variables: { proposalId: PROPOSAL_ID } },
    proposalDetailOverlay(mutations)
  )
}

// The standard-proposal voting-power read the SDK issues: getVotes(account,
// timepoint) on the GOVERNOR. At an 'active' clock, the snapshot timepoint
// (voteStart-1) is the min, so the calldata is deterministic and overridable.
function seedZeroVotingPower(overrides: MockOverrides, proposal: EnrichedProposal) {
  const timepoint = BigInt(Number(proposal.voteStart) - 1)
  const calldata = encodeFunctionData({
    abi: GET_VOTES_ABI,
    functionName: 'getVotes',
    args: [getAddress(TEST_ADDRESS), timepoint],
  })
  overrides.ethCall(proposal.governance.id, calldata, UINT_ZERO)
}

// ---------------------------------------------------------------------------
// VOTE PERMISSION
// ---------------------------------------------------------------------------

test('zero voting power: vote CTA is disabled and cannot open the modal', async ({
  page,
  overrides,
  txLog,
}) => {
  const proposal = loadProposal()
  // Force getVotes -> 0 so the SDK derives hasVotingPower=false for this account.
  seedZeroVotingPower(overrides, proposal)

  await freezeTime(page, proposalTime(proposal, 'active'))
  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)

  // Pump — a paused clock freezes react-query's notifyManager, so the voter
  // state read resolves into React only after time advances.
  await advanceTime(page, 5_000)

  const voteBtn = page.getByTestId('proposal-vote-btn')
  await expect(voteBtn).toBeVisible()
  await expect(voteBtn).toBeDisabled()

  // The gate holds: the modal never opens and no transaction is possible.
  await expect(page.getByTestId('vote-submit-btn')).toHaveCount(0)
  expect(txLog).toHaveLength(0)
})

test('already voted: vote CTA is disabled and cannot open the modal', async ({
  page,
  overrides,
  txLog,
}) => {
  const proposal = loadProposal()

  // A vote by TEST_ADDRESS in the tally -> the SDK resolves voterState.vote to
  // that choice -> the CTA is disabled ("You voted"). ACTIVE proposals read the
  // voting-snapshot query, whose votes OVERWRITE the detail votes on merge, so
  // the account's vote must be present in BOTH payloads.
  const myVote = {
    choice: 'AGAINST',
    voter: { address: TEST_ADDRESS },
    weight: '1000000000000000000',
  }
  const votes = [...(proposal.votes ?? []), myVote]
  overlayProposal(overrides, { votes })
  overrides.subgraph(
    {
      operationName: 'GetIndexDtfProposalVotingSnapshot',
      variables: { proposalId: PROPOSAL_ID },
    },
    { proposal: { ...loadEnrichedProposal(PROPOSAL_ID)!.proposal, votes } }
  )

  await freezeTime(page, proposalTime(proposal, 'active'))
  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)
  await advanceTime(page, 5_000)

  const voteBtn = page.getByTestId('proposal-vote-btn')
  await expect(voteBtn).toBeVisible()
  await expect(voteBtn).toBeDisabled()
  await expect(page.getByTestId('vote-submit-btn')).toHaveCount(0)
  expect(txLog).toHaveLength(0)
})

// NOTE: the disconnected-visitor case (vote CTA disabled with no wallet) is
// covered in governance-states.spec.ts, which runs on the base fixture. This
// spec imports the wallet fixture, which injects window.ethereum and lets wagmi
// auto-connect on mount — so it cannot model a truly disconnected session.

test('window closed: a passed proposal shows no vote CTA even with full power', async ({
  page,
  overrides,
  txLog,
}) => {
  const proposal = loadProposal()
  // Raw ACTIVE + a winning tally, but the clock is PAST voteEnd -> the SDK
  // derives SUCCEEDED (not ACTIVE): the clock gate closes voting regardless of
  // the account's power. The queue CTA replaces the vote CTA.
  overlayProposal(overrides, {
    forWeightedVotes: '20000000000000000000000000',
    againstWeightedVotes: '0',
    abstainWeightedVotes: '0',
  })
  await freezeTime(page, proposalTime(proposal, 'ended'))
  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)
  await advanceTime(page, 5_000)

  // Voting is impossible after the window — no vote CTA — but the proposal DID
  // pass (queue CTA present), proving the state is SUCCEEDED, not merely blank.
  await expect(page.getByTestId('proposal-queue-btn')).toBeVisible()
  await expect(page.getByTestId('proposal-vote-btn')).toHaveCount(0)
  await expect(page.getByTestId('vote-submit-btn')).toHaveCount(0)
  expect(txLog).toHaveLength(0)
})

// ---------------------------------------------------------------------------
// CANCEL PERMISSION (Timelock.cancel gated by CANCELLER_ROLE)
// ---------------------------------------------------------------------------

// Pin a QUEUED proposal (the only state whose action area renders the cancel
// control) with an ETA already in the past. Mirrors governance-queue-execute.
function queuedOverlay(overrides: MockOverrides, proposal: EnrichedProposal) {
  const voteEnd = Number(proposal.voteEnd)
  overlayProposal(overrides, {
    state: 'QUEUED',
    forWeightedVotes: '20000000000000000000000000',
    againstWeightedVotes: '0',
    abstainWeightedVotes: '0',
    queueTime: String(voteEnd + 60),
    queueBlock: '99999990',
    queueTxnHash: '0x' + 'd'.repeat(64),
    executionETA: voteEnd + 600,
  })
}

test('cancel gate: a non-canceller never sees the cancel control on a QUEUED proposal', async ({
  page,
  overrides,
  txLog,
}) => {
  const proposal = loadProposal()
  queuedOverlay(overrides, proposal)
  // hasRole(CANCELLER_ROLE, account) is NOT overridden -> the central mock
  // answers the timelock's hasRole with zero (false), so canCancel is false.

  await freezeTime(page, proposalTime(proposal, 'ended'))
  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)
  await advanceTime(page, 5_000)

  // The execute CTA proves we ARE on the QUEUED action area (post-ETA), yet the
  // cancel control is absent for a non-canceller — the permission gate holds.
  await expect(page.getByTestId('proposal-execute-btn')).toBeVisible()
  await expect(page.getByTestId('proposal-cancel-btn')).toHaveCount(0)
  expect(txLog).toHaveLength(0)
})

test('cancel gate: a CANCELLER can cancel — calldata targets the timelock cancel(id)', async ({
  page,
  overrides,
  txLog,
}) => {
  const proposal = loadProposal()
  queuedOverlay(overrides, proposal)

  const timelock = proposal.governance.timelock.id

  // Grant CANCELLER_ROLE to the connected account (hasRole -> true).
  const hasRoleCalldata = encodeFunctionData({
    abi: HAS_ROLE_ABI,
    functionName: 'hasRole',
    args: [CANCELLER_ROLE, getAddress(TEST_ADDRESS)],
  })
  overrides.ethCall(timelock, hasRoleCalldata, BOOL_TRUE)

  // The cancel write simulates timelock.cancel(operationId). With no on-chain
  // timelockId the SDK derives the LEGACY operation id; seed that exact call so
  // the simulate resolves (and assert the submitted calldata matches it).
  const operationId = legacyTimelockOperationId(proposal)
  const cancelCalldata = encodeFunctionData({
    abi: CANCEL_ABI,
    functionName: 'cancel',
    args: [operationId],
  })
  overrides.ethCall(timelock, cancelCalldata, '0x')

  await freezeTime(page, proposalTime(proposal, 'ended'))
  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)
  await advanceTime(page, 5_000)

  const cancelBtn = page.getByTestId('proposal-cancel-btn')
  await expect(cancelBtn).toBeVisible()
  await expect(cancelBtn).toBeEnabled()

  await cancelBtn.click()
  await advanceTime(page, 10_000)

  // The permission-gated write reached the chain: exactly one tx, to the
  // timelock, calling cancel(operationId) with zero value.
  expect(txLog).toHaveLength(1)
  const tx = txLog[0]
  expect(tx.chainId).toBe(dtf.chainId)
  expect(tx.to).toBe(timelock.toLowerCase())
  expect(BigInt(tx.value)).toBe(0n)
  const decoded = decodeFunctionData({ abi: CANCEL_ABI, data: tx.data as Hex })
  expect(decoded.functionName).toBe('cancel')
  expect(decoded.args[0]).toBe(operationId)
})

// Replicates the SDK's getTimelockOperationId legacy path (calculateLegacy…):
// keccak of the abi-encoded (targets, zero-values, calldatas, zeroHash, salt),
// where salt = governor(32B, right-padded) XOR keccak(description). Kept local
// so the assertion pins the EXACT id the app cancels, from snapshot data.
function legacyTimelockOperationId(proposal: EnrichedProposal): Hex {
  const targets = proposal.targets as Hex[]
  const values = targets.map(() => 0n)
  const calldatas = proposal.calldatas as Hex[]
  const salt = timelockSalt(proposal.governance.id, proposal.description)
  return keccak256(
    encodeAbiParameters(
      parseAbiParameters('address[], uint256[], bytes[], bytes32, bytes32'),
      [targets, values, calldatas, zeroHash, salt]
    )
  )
}

function timelockSalt(governance: string, description: string): Hex {
  const governorBytes = hexToBytes(
    pad(getAddress(governance).toLowerCase() as Hex, { size: 32, dir: 'right' })
  )
  const descriptionHashBytes = hexToBytes(keccak256(toBytes(description)))
  const salt = new Uint8Array(32)
  for (let i = 0; i < salt.length; i++) {
    salt[i] = governorBytes[i] ^ descriptionHashBytes[i]
  }
  return bytesToHex(salt)
}
