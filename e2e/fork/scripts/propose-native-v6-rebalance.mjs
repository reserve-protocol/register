// Runs a realistic rebalance through the native 6.0.0 folio's optimistic
// governance on the protocol sandbox, the way a proposer would from Register:
// the SDK builds the basket proposal from live prices, the sandbox actor (an
// OPTIMISTIC_PROPOSER) submits it, the fork clock moves past the veto window,
// and the governor executes `startRebalance` through its timelock. The fixture's
// own rebalance is synthetic (placeholder prices) and Register's launch math
// rejects it; this one is what a real launcher would see.
//
//   node e2e/fork/scripts/propose-native-v6-rebalance.mjs
//
// Appends blocks only (never reverts), so the fork Graph Node keeps following.
import {
  createPublicClient,
  http,
  keccak256,
  parseAbi,
  toBytes,
  toHex,
} from 'viem'
import { mainnet } from 'viem/chains'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createDtfSdk } from '../../../../sdk/packages/sdk/dist/index.mjs'

const rpcUrl = process.env.FORK_RPC_URL_1 ?? 'http://127.0.0.1:8545'
const subgraphUrl =
  process.env.FORK_SUBGRAPH_URL_1 ??
  'http://127.0.0.1:18000/subgraphs/name/dtf-index-subgraph-fork'
const fixturePath =
  process.env.INDEX_DTF_FORK_MANIFEST ??
  resolve('../index-subgraph/.fork/fixture.json')
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'))
const native = fixture.scenarios.v6Native
if (!native?.execution || native.expectedVersion !== '6.0.0')
  throw new Error('fixture has no executed native 6.0.0 scenario')
const dtf = native.folio
const actor = native.execution.actor
const governor = native.governanceAddresses.governor
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl, { timeout: 120_000 }),
})
const clientVersion = await publicClient.request({
  method: 'web3_clientVersion',
})
if (
  (await publicClient.getChainId()) !== 1 ||
  !String(clientVersion).startsWith('anvil') ||
  !/127\.0\.0\.1|localhost/.test(rpcUrl)
) {
  throw new Error(`refusing: ${rpcUrl} is not a loopback anvil mainnet fork`)
}
// The fork's own client, never a fallback to a public endpoint.
const sdk = createDtfSdk({
  chains: { 1: { publicClient, indexSubgraphUrl: subgraphUrl } },
})
const rpc = (method, params = []) => publicClient.request({ method, params })
const governorAbi = parseAbi([
  'function state(uint256) view returns (uint8)',
  'function proposalSnapshot(uint256) view returns (uint256)',
  'function proposalDeadline(uint256) view returns (uint256)',
  'function hashProposal(address[],uint256[],bytes[],bytes32) view returns (uint256)',
])
const folioAbi = parseAbi([
  'function getRebalance() view returns (uint256 nonce, uint8 priceControl, (address token,(uint256 low,uint256 spot,uint256 high) weight,(uint256 low,uint256 high) price,uint256 maxAuctionSize,bool inRebalance)[] tokens,(uint256 low,uint256 spot,uint256 high) limits,(uint256 startedAt,uint256 restrictedUntil,uint256 availableUntil) timestamps,bool bidsEnabled)',
  'function hasRole(bytes32,address) view returns (bool)',
])

async function send(from, call) {
  const hash = await rpc('eth_sendTransaction', [
    { from, to: call.to, data: call.data, value: toHex(call.value ?? 0n) },
  ])
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  if (receipt.status !== 'success') throw new Error(`reverted: ${hash}`)
  return receipt
}
async function warpTo(timestamp) {
  const head = await publicClient.getBlock()
  if (head.timestamp >= timestamp) return
  await rpc('evm_setNextBlockTimestamp', [toHex(timestamp)])
  await rpc('evm_mine', [])
}

const OPTIMISTIC_PROPOSER = keccak256(toBytes('OPTIMISTIC_PROPOSER_ROLE'))
const timelock = native.governanceAddresses.timelock
const proposerAbi = parseAbi([
  'function hasRole(bytes32,address) view returns (bool)',
])
if (
  !(await publicClient.readContract({
    address: timelock,
    abi: proposerAbi,
    functionName: 'hasRole',
    args: [OPTIMISTIC_PROPOSER, actor],
  }))
) {
  throw new Error(`${actor} is not an optimistic proposer on ${timelock}`)
}
await rpc('anvil_impersonateAccount', [actor])
await rpc('anvil_setBalance', [actor, toHex(10n ** 18n)])

const before = await publicClient.readContract({
  address: dtf,
  abi: folioAbi,
  functionName: 'getRebalance',
})
const head = await publicClient.getBlock()
// The execution deadline must outlive the governor's veto delay and period plus the timelock delay.
const deadline = head.timestamp + 7n * 86_400n
// A real target: half WETH, half USDC by value, prices from the API like Register's proposal form.
const proposal = await sdk.index.buildBasketProposal({
  address: dtf,
  chainId: 1,
  version: '6.0.0',
  governance: governor,
  basket: {
    type: 'shares',
    tokens: [
      { address: WETH, share: 50 },
      { address: USDC, share: 50 },
    ],
  },
  deadline,
  description: `Stack lane rebalance: 50/50 WETH/USDC at ${head.timestamp}`,
})
console.log('built proposal', {
  nonce: String(proposal.context.rebalanceNonce),
  deadline: String(proposal.context.deadline),
  tokens: proposal.context.tokens.map(
    (t) => `${t.symbol ?? t.address}@${t.price}`
  ),
})
if (proposal.context.rebalanceNonce !== before[0] + 1n)
  throw new Error('SDK nonce does not follow the on-chain rebalance nonce')

const submit = sdk.index.prepareSubmitOptimisticProposal({
  chainId: 1,
  proposal,
})
const submitted = await send(actor, submit)
const proposalId = await publicClient.readContract({
  address: governor,
  abi: governorAbi,
  functionName: 'hashProposal',
  args: [
    proposal.targets,
    proposal.targets.map(() => 0n),
    proposal.calldatas,
    keccak256(toBytes(proposal.description)),
  ],
})
console.log('proposed', {
  proposalId: proposalId.toString(),
  block: submitted.blockNumber.toString(),
  state: await publicClient.readContract({
    address: governor,
    abi: governorAbi,
    functionName: 'state',
    args: [proposalId],
  }),
})

// Optimistic flow: veto delay, then veto period with no veto, then execution.
const snapshot = await publicClient.readContract({
  address: governor,
  abi: governorAbi,
  functionName: 'proposalSnapshot',
  args: [proposalId],
})
await warpTo(snapshot + 1n)
const voteDeadline = await publicClient.readContract({
  address: governor,
  abi: governorAbi,
  functionName: 'proposalDeadline',
  args: [proposalId],
})
await warpTo(voteDeadline + 1n)
const stateBeforeExecute = await publicClient.readContract({
  address: governor,
  abi: governorAbi,
  functionName: 'state',
  args: [proposalId],
})
console.log('after veto window state', stateBeforeExecute)
const executed = await send(
  actor,
  sdk.index.prepareExecuteProposal({ chainId: 1, proposal })
)
const after = await publicClient.readContract({
  address: dtf,
  abi: folioAbi,
  functionName: 'getRebalance',
})
if (after[0] !== before[0] + 1n)
  throw new Error(`rebalance nonce did not advance: ${after[0]}`)
console.log('executed', {
  block: executed.blockNumber.toString(),
  nonce: after[0].toString(),
  restrictedUntil: after[4].restrictedUntil.toString(),
  availableUntil: after[4].availableUntil.toString(),
  tokens: after[2].map(
    (t) => `${t.token} price ${t.price.low}-${t.price.high}`
  ),
})

// The spec picks this run's rebalance by proposal, not "first active item":
// earlier runs on the persistent fork leave their own rebalances behind.
const stateDir = resolve('e2e/fork/.state/1')
mkdirSync(stateDir, { recursive: true })
writeFileSync(
  resolve(stateDir, 'native-v6-proposal.json'),
  JSON.stringify(
    {
      proposalId: proposalId.toString(),
      description: proposal.description,
      executionBlock: executed.blockNumber.toString(),
      rebalanceNonce: after[0].toString(),
    },
    null,
    2
  )
)
