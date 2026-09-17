// Prepares the BSC fork for the CMC20 real-launch spec: impersonates and funds
// the real auction launcher, warms the reads Register issues on the rebalance
// page, and writes the scenario manifest the spec consumes.
//
//   FORK_RPC_URL_56=http://127.0.0.1:8547 node e2e/fork/scripts/prepare-cmc20.mjs
//
// The fork must be pinned inside CMC20's launcher window (see the fork-e2e
// skill): a rebalance started on the fork by impersonation would never render,
// because the list joins rebalances to proposals through the subgraph.
import { createPublicClient, http, keccak256, parseAbi, toHex } from 'viem'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rpcUrl = process.env.FORK_RPC_URL_56 ?? 'http://127.0.0.1:8547'
const CMC20 = '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867'
const abi = parseAbi([
  'function getRebalance() view returns (uint256 nonce, uint8 priceControl, (address token,(uint256 low,uint256 spot,uint256 high) weight,(uint256 low,uint256 high) price,uint256 maxAuctionSize,bool inRebalance)[] tokens,(uint256 low,uint256 spot,uint256 high) limits,(uint256 startedAt,uint256 restrictedUntil,uint256 availableUntil) timestamps,bool bidsEnabled)',
  'function nextAuctionId() view returns (uint256)',
  'function auctions(uint256) view returns (uint256 rebalanceNonce,uint256 startTime,uint256 endTime)',
  'function totalAssets() view returns (address[] assets, uint256[] amounts)',
  'function totalSupply() view returns (uint256)',
  'function version() view returns (string)',
  'function getRoleMemberCount(bytes32) view returns (uint256)',
  'function getRoleMember(bytes32,uint256) view returns (address)',
  'function rebalanceControl() view returns (bool weightControl, uint8 priceControl)',
])

const client = createPublicClient({ transport: http(rpcUrl, { timeout: 120_000 }) })
const chainId = await client.getChainId()
const clientVersion = await client.request({ method: 'web3_clientVersion' })
if (chainId !== 56 || !String(clientVersion).startsWith('anvil') || !/127\.0\.0\.1|localhost/.test(rpcUrl)) {
  throw new Error(`refusing: rpc ${rpcUrl} chainId ${chainId} client ${clientVersion}`)
}

const block = await client.getBlock()
const read = (functionName, args = []) => client.readContract({ address: CMC20, abi, functionName, args })
console.log('warming reads at block', block.number, 'ts', block.timestamp)
const [version, rebalance, nextAuctionId, supply, assets] = await Promise.all([
  read('version'), read('getRebalance'), read('nextAuctionId'), read('totalSupply'), read('totalAssets'),
])
const timestamps = rebalance[4]
const windowOpen = timestamps.startedAt <= block.timestamp && block.timestamp < timestamps.restrictedUntil
console.log({ version, nonce: rebalance[0], startedAt: timestamps.startedAt, restrictedUntil: timestamps.restrictedUntil, availableUntil: timestamps.availableUntil, windowOpen, nextAuctionId, tokens: rebalance[2].length })
if (!windowOpen) throw new Error('fork block is not inside the launcher window; repin FORK_BLOCK')

const AUCTION_LAUNCHER = keccak256(toHex('AUCTION_LAUNCHER'))
const launcherCount = await read('getRoleMemberCount', [AUCTION_LAUNCHER])
if (launcherCount === 0n) throw new Error('no auction launcher on this DTF')
const launcher = await read('getRoleMember', [AUCTION_LAUNCHER, 0n])
await client.request({ method: 'anvil_impersonateAccount', params: [launcher] })
await client.request({ method: 'anvil_setBalance', params: [launcher, toHex(10n ** 18n)] })
console.log('impersonating launcher', launcher, '(labelled impersonation, not governance coverage)')

// Warm the basket token reads Register issues (decimals/balances via multicall).
await Promise.all(assets[0].map((token) => client.getCode({ address: token })))
if (nextAuctionId > 0n) await read('auctions', [nextAuctionId - 1n])

const manifest = {
  chainId,
  dtf: CMC20,
  version,
  forkBlock: block.number.toString(),
  forkTimestamp: block.timestamp.toString(),
  rebalanceNonce: rebalance[0].toString(),
  restrictedUntil: timestamps.restrictedUntil.toString(),
  availableUntil: timestamps.availableUntil.toString(),
  nextAuctionIdBefore: nextAuctionId.toString(),
  launcher,
  impersonated: ['AUCTION_LAUNCHER'],
  preparedAt: new Date().toISOString(),
}
const dir = resolve('e2e/fork/.state/56')
mkdirSync(dir, { recursive: true })
writeFileSync(resolve(dir, 'cmc20-scenario.json'), JSON.stringify(manifest, null, 2))
console.log('manifest written', resolve(dir, 'cmc20-scenario.json'))
