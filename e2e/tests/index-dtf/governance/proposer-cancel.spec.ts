import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
  keccak256,
  parseAbi,
  toBytes,
  type Address,
  type Hex,
} from 'viem'
import { connectWallet, expect, test } from '../../../fixtures/wallet'
import { advanceTime, freezeTime, proposalTime } from '../../../helpers/clock'
import {
  dtfPath,
  findDtfByAddress,
  TEST_ADDRESS,
} from '../../../helpers/registry'
import { loadSnapshot } from '../../../helpers/snapshots'
import { loadEnrichedProposal } from '../../../helpers/subgraph'
import type { MockOverrides } from '../../../helpers/overrides'

const dtf = findDtfByAddress('0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8')!
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'
const CANCEL_ABI = parseAbi([
  'function cancel(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)',
])

function seedProposal(
  overrides: MockOverrides,
  mutations: Record<string, unknown> = {}
) {
  const { dtf: snapshotDtf } = loadSnapshot<{ dtf: Record<string, unknown> }>(
    `${dtf.snapshotDir}/dtf.json`
  )
  const captured = loadEnrichedProposal(PROPOSAL_ID)!.proposal
  const proposal = {
    ...captured,
    voteStart: captured.voteStart as string,
    voteEnd: captured.voteEnd as string,
    proposer: { address: TEST_ADDRESS.toLowerCase() },
    state: 'PENDING',
    ...mutations,
  }
  overrides.subgraph(
    {
      operationName: 'GetIndexDtfProposal',
      variables: { proposalId: PROPOSAL_ID },
    },
    { dtf: snapshotDtf, proposal }
  )
  overrides.subgraph(
    {
      operationName: 'GetIndexDtfProposalVotingSnapshot',
      variables: { proposalId: PROPOSAL_ID },
    },
    { proposal }
  )
  const args = [
    (captured.targets as Address[]).map(getAddress),
    (captured.targets as Address[]).map(() => 0n),
    captured.calldatas as Hex[],
    keccak256(toBytes(captured.description as string)),
  ] as const
  const governance = captured.governance as {
    id: Address
    token: { id: Address }
  }
  const governor = governance.id
  overrides.ethCall(
    governance.token.id,
    encodeFunctionData({
      abi: parseAbi([
        'function getPastOptimisticVotes(address account, uint256 timepoint) view returns (uint256)',
      ]),
      functionName: 'getPastOptimisticVotes',
      args: [getAddress(TEST_ADDRESS), BigInt(proposal.voteStart)],
    }),
    encodeAbiParameters([{ type: 'uint256' }], [100_000n * 10n ** 18n])
  )
  overrides.ethCall(
    governor,
    encodeFunctionData({ abi: CANCEL_ABI, functionName: 'cancel', args }),
    encodeAbiParameters([{ type: 'uint256' }], [BigInt(PROPOSAL_ID)])
  )
  return { proposal, governor, args }
}

test('proposer confirms a pending cancellation through the governor @mobile', async ({
  page,
  overrides,
  txLog,
}, testInfo) => {
  const { proposal, governor, args } = seedProposal(overrides)
  await freezeTime(
    page,
    proposalTime(proposal as { voteStart: string; voteEnd: string }, 'pending')
  )
  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)
  await advanceTime(page, 5_000)

  await page.getByTestId('proposal-proposer-cancel-btn').click()
  await advanceTime(page, 5_000)
  const dialog = page.getByTestId('proposal-cancel-dialog')
  await expect(dialog).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('cancel-confirmation.png'),
  })
  const box = await dialog.boundingBox()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
  expect(txLog).toHaveLength(0)
  await page.getByTestId('proposal-cancel-dismiss-btn').click()
  await expect(dialog).toBeHidden()
  expect(txLog).toHaveLength(0)

  await page.getByTestId('proposal-proposer-cancel-btn').click()
  await advanceTime(page, 5_000)
  const submit = page.getByTestId('proposal-cancel-confirm-btn')
  await expect(submit).toBeEnabled()
  overrides.transaction({ kind: 'success', pendingPolls: 2 })
  await submit.click()
  await expect.poll(() => txLog.length).toBe(1)
  await advanceTime(page, 100)
  await expect(submit).toBeDisabled()
  await advanceTime(page, 15_000)
  await expect(dialog).toBeHidden()
  await expect(page.getByTestId('proposal-proposer-cancel-btn')).toHaveCount(0)

  expect(txLog).toHaveLength(1)
  expect(txLog[0].to).toBe(governor.toLowerCase())
  expect(txLog[0].chainId).toBe(dtf.chainId)
  expect(BigInt(txLog[0].value)).toBe(0n)
  const decoded = decodeFunctionData({
    abi: CANCEL_ABI,
    data: txLog[0].data as Hex,
  })
  expect(decoded.functionName).toBe('cancel')
  expect(decoded.args).toEqual(args)
})

for (const scenario of [
  { state: 'PENDING', phase: 'pending', optimistic: false, visible: true },
  { state: 'ACTIVE', phase: 'active', optimistic: false, visible: false },
  { state: 'SUCCEEDED', phase: 'ended', optimistic: false, visible: false },
  { state: 'PENDING', phase: 'pending', optimistic: true, visible: true },
  { state: 'ACTIVE', phase: 'active', optimistic: true, visible: true },
  { state: 'SUCCEEDED', phase: 'ended', optimistic: true, visible: true },
  { state: 'DEFEATED', phase: 'ended', optimistic: true, visible: false },
  { state: 'CANCELED', phase: 'ended', optimistic: true, visible: false },
  { state: 'EXECUTED', phase: 'ended', optimistic: true, visible: false },
  { state: 'QUEUED', phase: 'ended', optimistic: false, visible: false },
] as const) {
  test(`proposer cancel visibility: ${scenario.optimistic ? 'fast' : 'standard'} ${scenario.state} @mobile`, async ({
    page,
    overrides,
    txLog,
  }) => {
    const { proposal } = seedProposal(overrides, {
      state: scenario.state,
      isOptimistic: scenario.optimistic,
      forWeightedVotes: '20000000000000000000000000',
      againstWeightedVotes: '0',
      abstainWeightedVotes: '0',
    })
    await freezeTime(page, proposalTime(proposal, scenario.phase))
    await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
    await connectWallet(page)
    await advanceTime(page, 5_000)
    await expect(page.getByTestId('proposal-title')).toHaveAttribute(
      'data-state',
      scenario.state
    )
    const cancel = page.getByTestId('proposal-proposer-cancel-btn')
    if (scenario.visible) {
      await expect(cancel).toBeVisible()
    } else {
      await expect(cancel).toHaveCount(0)
    }
    expect(txLog).toHaveLength(0)
  })
}

test('a different account never sees proposer cancellation @mobile', async ({
  page,
  overrides,
  txLog,
}) => {
  const { proposal } = seedProposal(overrides, {
    proposer: { address: dtf.address },
  })
  await freezeTime(page, proposalTime(proposal, 'pending'))
  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)
  await advanceTime(page, 5_000)
  await expect(page.getByTestId('proposal-vote-btn')).toBeVisible()
  await expect(page.getByTestId('proposal-proposer-cancel-btn')).toHaveCount(0)
  expect(txLog).toHaveLength(0)
})

for (const kind of ['reject', 'revert'] as const) {
  test(`cancel ${kind}: confirmation stays open without a false success @mobile`, async ({
    page,
    overrides,
    txLog,
  }) => {
    const { proposal, governor, args } = seedProposal(overrides)
    await freezeTime(page, proposalTime(proposal, 'pending'))
    await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
    await connectWallet(page)
    await advanceTime(page, 5_000)
    await page.getByTestId('proposal-proposer-cancel-btn').click()
    await advanceTime(page, 5_000)
    const submit = page.getByTestId('proposal-cancel-confirm-btn')
    await expect(submit).toBeEnabled()
    overrides.transaction({ kind })
    await submit.click()
    if (kind === 'revert') {
      await expect.poll(() => txLog.length).toBe(1)
      overrides.ethCallRevert(
        governor,
        encodeFunctionData({ abi: CANCEL_ABI, functionName: 'cancel', args }),
        'Cancellation rejected'
      )
    }
    await advanceTime(page, 15_000)
    await expect(page.getByTestId('proposal-cancel-dialog')).toBeVisible()
    await expect(submit).toBeEnabled()
    await page.getByTestId('proposal-cancel-dismiss-btn').click()
    await expect(page.getByTestId('proposal-proposer-cancel-btn')).toBeVisible()
    expect(txLog).toHaveLength(kind === 'revert' ? 1 : 0)
  })
}

test.describe('disconnected', () => {
  test.use({ wallet: false })
  test('the proposer flow is hidden without a connected wallet @mobile', async ({
    page,
    overrides,
    txLog,
  }) => {
    const { proposal } = seedProposal(overrides)
    await freezeTime(page, proposalTime(proposal, 'pending'))
    await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
    await advanceTime(page, 5_000)
    await expect(page.getByTestId('proposal-vote-btn')).toBeVisible()
    await expect(page.getByTestId('proposal-proposer-cancel-btn')).toHaveCount(
      0
    )
    expect(txLog).toHaveLength(0)
  })
})
