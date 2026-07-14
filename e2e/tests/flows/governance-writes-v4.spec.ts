import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  erc20Abi,
  keccak256,
  parseAbi,
  stringToHex,
  type Hex,
} from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { advanceTime, freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress, TEST_ADDRESS } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'
import { loadEnrichedProposal } from '../../helpers/subgraph'
import type { MockOverrides } from '../../helpers/overrides'
import type { BoundaryRequest } from '../../helpers/requests'

// V4 WRITE coverage — the suite's only wallet-connected governance writes on a
// v4 folio. Every other write spec runs base/lcap (v5); the SDK version-gates
// the write ABIs off folio.version() (mainnet/open captures 4.0.0 in
// chain-state), so a v4 regression in vote/queue/execute ABI selection would be
// invisible without this. We drive the real transaction path through the mock
// wallet and decode the submitted calldata, asserting the tx targets the v4
// governor on chainId 1 with the correct OZ-governor args. A wrong ABI would
// surface as a decode failure or a mismatched function — reported, not fixed.
//
// All state/time is derived from the captured snapshot so re-captures don't rot
// the spec. The pinned proposal targets the vote-lock (DAO) governor + its
// timelock — a governance-parameter proposal, NOT a basket/rebalance one, so no
// per-token price preview is rendered (that path has a non-lcap helper gap).

const DTF_ADDRESS = '0x323c03c48660fe31186fa82c289b0766d331ce21' // mainnet/open, v4
// A captured proposal whose RAW state is ACTIVE with no queue/execution fields —
// the clean base for pinning any lifecycle phase. It targets the v4 vote-lock
// (DAO) governor + its timelock (governance parameters), NOT a basket/rebalance,
// so no per-token price preview renders (that path has a non-lcap helper gap).
const PROPOSAL_ID =
  '24772461670023241142033256853129160570492938116134050825294045193599788460182'

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

const UINT_ZERO = encodeAbiParameters([{ type: 'uint256' }], [0n])
const NATIVE_SENTINEL = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

// Connecting a wallet mounts the global TokenBalancesUpdater, which reads
// balanceOf(account) for a STATIC per-chain zap-token list (ZAP_TOKENS in
// src/state/wallet/updaters/TokenBalancesUpdater.tsx) plus a small current-price
// batch. The central mock seeds these for base/bsc but NOT mainnet, so this —
// the suite's first wallet-connected mainnet spec — must seed them per-test.
// HELPER GAP (see report): move the mainnet zap-token balance/price coverage
// into the central rpc/api mocks so future mainnet write specs don't repeat this.
const MAINNET_ZAP_TOKENS = [
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3', // MIM
  '0x853d955aCEf822Db058eb8505911ED77F175b99e', // FRAX
]
const BALANCE_OF_TEST_ADDRESS = encodeFunctionData({
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [TEST_ADDRESS as `0x${string}`],
})

function seedMainnetWalletReads(overrides: MockOverrides) {
  // Account holds nothing in the zap tokens — an inert, deterministic balance.
  for (const token of MAINNET_ZAP_TOKENS) {
    overrides.ethCall(token, BALANCE_OF_TEST_ADDRESS, UINT_ZERO)
  }

  // The zap-token price batch (/current/prices?chainId=1). Seed a superset —
  // zap tokens + the DTF basket + native sentinel — so any mainnet price read on
  // this page resolves. Prices are irrelevant to the write path we assert.
  const { basketTokens } = loadSnapshot<{ basketTokens: Array<{ address: string }> }>(
    `${dtf.snapshotDir}/chain-state.json`
  )
  const priceAddresses = [
    NATIVE_SENTINEL,
    ...MAINNET_ZAP_TOKENS,
    ...basketTokens.map((token) => token.address),
  ]
  overrides.api(
    { method: 'GET', pathname: '/current/prices', search: { chainId: '1' } },
    priceAddresses.map((address) => ({
      address: address.toLowerCase(),
      price: 1,
      timestamp: 0,
    }))
  )
}

// Full GetIndexDtfProposal overlay: the raw dtf object (same one the central
// mock serves) + the enriched proposal with per-test mutations. The captured
// proposal is raw EXECUTED, so lifecycle states are pinned by overlaying the
// raw `state` the SDK's getProposalState derivation reads + a frozen clock.
function proposalDetailOverlay(mutations: Record<string, unknown>) {
  const { dtf: dtfObj } = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`)
  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  return { dtf: dtfObj, proposal: { ...proposal, ...mutations } }
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

function overlayProposal(
  overrides: import('../../helpers/overrides').MockOverrides,
  mutations: Record<string, unknown>
) {
  overrides.subgraph(
    {
      operationName: 'GetIndexDtfProposal',
      variables: { proposalId: PROPOSAL_ID },
    },
    proposalDetailOverlay(mutations)
  )
}

function receiptRequestCount(requests: BoundaryRequest[], hash: string): number {
  return requests.filter(
    (request) =>
      request.boundary === 'rpc' &&
      request.method === 'eth_getTransactionReceipt' &&
      String(request.params[0]).toLowerCase() === hash.toLowerCase()
  ).length
}

test('v4: cast a For vote — castVote targets the v4 governor on chainId 1', async ({
  page,
  overrides,
  txLog,
  boundaryRequests,
}) => {
  const proposal = loadProposal()
  seedMainnetWalletReads(overrides)

  // The proposal is captured raw ACTIVE with no terminal fields, so a clock
  // inside its window resolves it ACTIVE and votable — no state overlay needed.
  await freezeTime(page, proposalTime(proposal, 'active'))

  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)

  // Pump — flush react-query: the paused clock freezes the notifyManager, so
  // the connected-account voter-state reads (voting power -> button enabled)
  // fetch but never reach React until time advances.
  await advanceTime(page, 5_000)

  const voteBtn = page.getByTestId('proposal-vote-btn')
  await expect(voteBtn).toBeVisible()
  await expect(voteBtn).toBeEnabled()

  await voteBtn.click()
  await page.getByTestId('vote-option-for').click()

  // Pump — the castVote simulate (isReady) reaches React only once the clock
  // advances, so the submit button stays disabled without this.
  await advanceTime(page, 5_000)

  await page.getByTestId('vote-submit-btn').click()

  // Wait until the send is recorded before pumping the frozen receipt timers —
  // advancing too early races the scheduled first poll under parallel load.
  await expect.poll(() => txLog.length).toBe(1)
  await advanceTime(page, 5_000) // first correlated receipt poll returns pending
  await expect
    .poll(() => receiptRequestCount(boundaryRequests, txLog[0].hash))
    .toBeGreaterThanOrEqual(1)
  await advanceTime(page, 5_000) // next poll returns the successful receipt

  await expect(page.getByTestId('vote-success')).toBeVisible()

  expect(txLog).toHaveLength(1)
  const voteTx = txLog[0]
  // V4 lives on mainnet — a wrong chain id would mean the wrong governor family.
  expect(voteTx.chainId).toBe(1)
  expect(voteTx.chainId).toBe(dtf.chainId)
  // to === the proposal's v4 governor (the vote-lock/DAO governor), lowercased.
  expect(voteTx.to).toBe(proposal.governance.id.toLowerCase())
  expect(BigInt(voteTx.value)).toBe(0n)

  // If the SDK selected a non-castVote v4 ABI this decode throws (wrong
  // selector) — that would be the version-gate bug this spec exists to catch.
  const decoded = decodeFunctionData({ abi: VOTE_ABI, data: voteTx.data as Hex })
  expect(decoded.functionName).toBe('castVote')
  expect(decoded.args).toEqual([BigInt(PROPOSAL_ID), 1])
})

test('v4: queue a succeeded proposal — queue targets the v4 governor on chainId 1', async ({
  page,
  overrides,
  txLog,
}) => {
  const proposal = loadProposal()
  seedMainnetWalletReads(overrides)

  // Raw ACTIVE (forces recompute) + winning tally after voteEnd -> SUCCEEDED ->
  // queue CTA. 20M For clears the ~112.6k quorum with zero Against.
  overlayProposal(overrides, {
    state: 'ACTIVE',
    isOptimistic: false,
    forWeightedVotes: '20000000000000000000000000',
    againstWeightedVotes: '0',
    abstainWeightedVotes: '0',
  })
  await freezeTime(page, proposalTime(proposal, 'ended'))

  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)

  // Pump — detail query + queueProposal simulate resolve only once the clock
  // advances under the paused notifyManager.
  await advanceTime(page, 5_000)

  const queueBtn = page.getByTestId('proposal-queue-btn')
  await expect(queueBtn).toBeVisible()
  await expect(queueBtn).toBeEnabled()

  await queueBtn.click()

  // Pump — receipt polling (useWatchTransaction) never elapses under the frozen
  // clock without a pump.
  await advanceTime(page, 10_000)

  await expect(page.getByTestId('proposal-result-queued')).toBeVisible()
  await expect(page.getByTestId('proposal-queue-btn')).toHaveCount(0)

  expect(txLog).toHaveLength(1)
  assertGovernorAction(txLog[0], 'queue', proposal)
})

test('v4: execute a queued proposal past its ETA — execute targets the v4 governor on chainId 1', async ({
  page,
  overrides,
  txLog,
}) => {
  const proposal = loadProposal()
  const voteEnd = Number(proposal.voteEnd)
  seedMainnetWalletReads(overrides)

  // Raw QUEUED with an ETA already in the past at voteEnd + 3600 ('ended') ->
  // canExecuteProposal is true -> execute CTA.
  overlayProposal(overrides, {
    state: 'QUEUED',
    isOptimistic: false,
    forWeightedVotes: '20000000000000000000000000',
    againstWeightedVotes: '0',
    abstainWeightedVotes: '0',
    queueTime: String(voteEnd + 60),
    queueBlock: '99999990',
    queueTxnHash: '0x' + 'd'.repeat(64),
    executionETA: voteEnd + 600,
  })
  await freezeTime(page, proposalTime(proposal, 'ended'))

  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)

  await advanceTime(page, 5_000)

  const executeBtn = page.getByTestId('proposal-execute-btn')
  await expect(executeBtn).toBeVisible()
  await expect(executeBtn).toBeEnabled()

  await executeBtn.click()

  await advanceTime(page, 10_000)

  await expect(page.getByTestId('proposal-result-executed')).toBeVisible()
  await expect(page.getByTestId('proposal-execute-tx-btn')).toBeVisible()
  await expect(page.getByTestId('proposal-execute-btn')).toHaveCount(0)

  expect(txLog).toHaveLength(1)
  assertGovernorAction(txLog[0], 'execute', proposal)
})

function assertGovernorAction(
  tx: { chainId: number; to: string; data: string; value: string },
  functionName: 'queue' | 'execute',
  proposal: {
    governance: { id: string }
    targets: string[]
    calldatas: string[]
    description: string
  }
) {
  expect(tx.chainId).toBe(1)
  expect(tx.chainId).toBe(dtf.chainId)
  expect(tx.to).toBe(proposal.governance.id.toLowerCase())
  expect(BigInt(tx.value)).toBe(0n)
  const decoded = decodeFunctionData({
    abi: GOVERNOR_ACTION_ABI,
    data: tx.data as Hex,
  })
  expect(decoded.functionName).toBe(functionName)
  expect(decoded.args[0].map((address) => address.toLowerCase())).toEqual(
    proposal.targets.map((address) => address.toLowerCase())
  )
  expect(decoded.args[1]).toEqual(proposal.targets.map(() => 0n))
  expect([...decoded.args[2]]).toEqual(proposal.calldatas)
  expect(decoded.args[3]).toBe(keccak256(stringToHex(proposal.description)))
}
