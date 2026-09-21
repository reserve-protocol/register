// Prepares the protocol sandbox (index-subgraph/.fork, chain 1) for the native
// 6.0.0 stack lane: reads the sandbox fixture, moves the fork clock past the
// fixture's first auction so the launcher gate opens, impersonates and funds the
// sandbox actor (the folio's AUCTION_LAUNCHER), warms the reads Register issues,
// and writes the scenario manifest the spec consumes.
//
//   node e2e/fork/scripts/prepare-native-v6.mjs
//
// This lane owns the sandbox for the run: it appends blocks (never reverts), so
// the fork Graph Node keeps following. Run it after `sandbox.sh all`.
import { createPublicClient, http, keccak256, parseAbi, toHex } from 'viem'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rpcUrl = process.env.FORK_RPC_URL_1 ?? 'http://127.0.0.1:8545'
const fixturePath =
  process.env.INDEX_DTF_FORK_MANIFEST ??
  resolve('../index-subgraph/.fork/fixture.json')
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'))
const native = fixture.scenarios.v6Native
if (!native || native.expectedVersion !== '6.0.0' || !native.execution) {
  throw new Error(
    'fixture has no executed native 6.0.0 scenario; run the sandbox `all` workflow'
  )
}
const dtf = native.folio
const actor = native.execution.actor
const abi = parseAbi([
  'function getRebalance() view returns (uint256 nonce, uint8 priceControl, (address token,(uint256 low,uint256 spot,uint256 high) weight,(uint256 low,uint256 high) price,uint256 maxAuctionSize,bool inRebalance)[] tokens,(uint256 low,uint256 spot,uint256 high) limits,(uint256 startedAt,uint256 restrictedUntil,uint256 availableUntil) timestamps,bool bidsEnabled)',
  'function nextAuctionId() view returns (uint256)',
  'function auctions(uint256) view returns (uint256 rebalanceNonce,uint256 startTime,uint256 endTime)',
  'function totalAssets() view returns (address[] assets, uint256[] amounts)',
  'function totalSupply() view returns (uint256)',
  'function version() view returns (string)',
  'function maxAuctionLength() view returns (uint256)',
  'function hasRole(bytes32,address) view returns (bool)',
])

const client = createPublicClient({
  transport: http(rpcUrl, { timeout: 120_000 }),
})
const chainId = await client.getChainId()
const clientVersion = await client.request({ method: 'web3_clientVersion' })
if (
  chainId !== 1 ||
  !String(clientVersion).startsWith('anvil') ||
  !/127\.0\.0\.1|localhost/.test(rpcUrl)
) {
  throw new Error(
    `refusing: rpc ${rpcUrl} chainId ${chainId} client ${clientVersion}`
  )
}
const read = (functionName, args = []) =>
  client.readContract({ address: dtf, abi, functionName, args })
const [version, rebalance, nextAuctionId, maxAuctionLength] = await Promise.all(
  [
    read('version'),
    read('getRebalance'),
    read('nextAuctionId'),
    read('maxAuctionLength'),
  ]
)
if (version !== '6.0.0')
  throw new Error(`expected a 6.0.0 folio, got ${version}`)
const timestamps = rebalance[4]
const last =
  nextAuctionId > 0n ? await read('auctions', [nextAuctionId - 1n]) : null

// Register keeps the launch gate closed while the last auction is time-valid for the
// current nonce (warm-up included); move the fork clock just past it, inside the TTL.
let block = await client.getBlock()
if (last && last[0] === rebalance[0] && block.timestamp <= last[2]) {
  const target = last[2] + 60n
  if (target >= timestamps.availableUntil)
    throw new Error(
      'rebalance TTL ends before the first auction does; regenerate the fixture'
    )
  await client.request({
    method: 'evm_setNextBlockTimestamp',
    params: [toHex(target)],
  })
  await client.request({ method: 'evm_mine', params: [] })
  block = await client.getBlock()
  console.log(
    'advanced fork clock past auction',
    (nextAuctionId - 1n).toString(),
    'to',
    block.timestamp.toString()
  )
}
const windowOpen =
  timestamps.startedAt <= block.timestamp &&
  block.timestamp < timestamps.availableUntil
if (!windowOpen)
  throw new Error(
    'rebalance is not active at the fork head; regenerate the fixture'
  )

const AUCTION_LAUNCHER = keccak256(toHex('AUCTION_LAUNCHER'))
if (!(await read('hasRole', [AUCTION_LAUNCHER, actor])))
  throw new Error(`${actor} is not the auction launcher`)
await client.request({ method: 'anvil_impersonateAccount', params: [actor] })
await client.request({
  method: 'anvil_setBalance',
  params: [actor, toHex(10n ** 18n)],
})
console.log(
  'impersonating the sandbox actor',
  actor,
  '(labelled impersonation, not governance coverage)'
)

const [assets] = await read('totalAssets')
await Promise.all(assets.map((token) => client.getCode({ address: token })))
await read('totalSupply')

// Proposal written by propose-native-v6-rebalance.mjs; only trusted when it
// started the nonce the chain is on now.
const proposalPath = resolve('e2e/fork/.state/1/native-v6-proposal.json')
const proposed = existsSync(proposalPath)
  ? JSON.parse(readFileSync(proposalPath, 'utf8'))
  : undefined
const proposal =
  proposed && proposed.rebalanceNonce === rebalance[0].toString()
    ? proposed
    : undefined
if (!proposal)
  console.log(
    'no proposal file for nonce',
    rebalance[0].toString(),
    '(spec takes the first active item)'
  )

const manifest = {
  chainId,
  dtf,
  version,
  fixtureStateBlock: String(fixture.stateBlock),
  forkBlock: block.number.toString(),
  forkBlockHash: block.hash,
  forkTimestamp: block.timestamp.toString(),
  rebalanceNonce: rebalance[0].toString(),
  restrictedUntil: timestamps.restrictedUntil.toString(),
  availableUntil: timestamps.availableUntil.toString(),
  maxAuctionLength: maxAuctionLength.toString(),
  nextAuctionIdBefore: nextAuctionId.toString(),
  launcher: actor,
  governance: native.governance,
  proposalId: proposal?.proposalId,
  proposalDescription: proposal?.description,
  impersonated: ['AUCTION_LAUNCHER (sandbox actor)'],
  preparedAt: new Date().toISOString(),
}
const dir = resolve('e2e/fork/.state/1')
mkdirSync(dir, { recursive: true })
writeFileSync(
  resolve(dir, 'native-v6-scenario.json'),
  JSON.stringify(manifest, null, 2)
)
console.log(
  'manifest written',
  resolve(dir, 'native-v6-scenario.json'),
  JSON.stringify({
    dtf,
    nonce: manifest.rebalanceNonce,
    nextAuctionId: manifest.nextAuctionIdBefore,
    forkBlock: manifest.forkBlock,
  })
)
