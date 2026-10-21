// Prepares a fork for the Folio governance upgrade spec (a single-governor DTF's
// governor and timelock to 1.1.0): replays the vlRSR singleton upgrade the banner
// waits for, picks a real vlRSR voter as proposer, and writes the manifest the spec reads.
//
//   FORK_SCENARIO=power FORK_RPC_URL_56=http://127.0.0.1:8547 node e2e/fork/scripts/prepare-folio-governance-upgrade.mjs
//
// MAG7 is listed for completeness but cannot load on Anvil (a basket token's totalAssets reverts).
//
// Prerequisites replayed by impersonation (labelled in the manifest):
//   0. RoleRegistry owner registers the 1.1.0 governor deployer in the VersionRegistry.
//   1. The vlRSR singleton's timelock upgrades the vault to 1.1.0.
import { createPublicClient, encodeFunctionData, http, keccak256, parseAbi, toHex } from 'viem'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SCENARIOS = {
  mag7: { chainId: 8453, network: 'base', symbol: 'MAG7', dtf: '0xcef8db49e456f872e288e1c042f916e9ced7c781', vault: '0x2F0D6538807a77d4AdDCd4b4DAf214Ea2E818E3D' },
  power: { chainId: 56, network: 'bsc', symbol: 'POWER', dtf: '0x290bcc0fd5096cc3261ae2021841c7bc67cb0f51', vault: '0xE744C8157c346B2931807F42552c8CBc0BB6D34f' },
}
const scenarioName = process.env.FORK_SCENARIO ?? 'power'
const scenario = SCENARIOS[scenarioName]
if (!scenario) throw new Error(`unknown FORK_SCENARIO ${scenarioName}`)
const CHAIN_ID = scenario.chainId
const SUBGRAPH = `https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-${scenario.network}/prod/gn`
const DTF = scenario.dtf
const VAULT = scenario.vault
const ZERO_ROLE = `0x${'0'.repeat(64)}`
const rpcUrl = process.env[`FORK_RPC_URL_${CHAIN_ID}`]
if (!rpcUrl) throw new Error(`set FORK_RPC_URL_${CHAIN_ID}`)

const abi = parseAbi([
  'function version() view returns (string)',
  'function versionRegistry() view returns (address)',
  'function roleRegistry() view returns (address)',
  'function getLatestVersion() view returns (bytes32,string,address,bool)',
  'function getImplementationsForVersion(bytes32) view returns (address,address,address)',
  'function getRoleMember(bytes32,uint256) view returns (address)',
  'function upgradeToAndCall(address,bytes)',
  'function initializeAverageVotes()',
  'function proposalThreshold() view returns (uint256)',
  'function quorum(uint256) view returns (uint256)',
  'function getVotes(address) view returns (uint256)',
  'function token() view returns (address)',
  'function timelock() view returns (address)',
])

const client = createPublicClient({ transport: http(rpcUrl, { timeout: 120_000 }) })
const chainId = await client.getChainId()
const clientVersion = await client.request({ method: 'web3_clientVersion' })
if (chainId !== CHAIN_ID || !String(clientVersion).startsWith('anvil') || !/127\.0\.0\.1|localhost/.test(rpcUrl)) {
  throw new Error(`refusing: rpc ${rpcUrl} chainId ${chainId} client ${clientVersion}`)
}

const read = (address, functionName, args = []) => client.readContract({ address, abi, functionName, args })
const impersonatedSend = async (from, to, data) => {
  await client.request({ method: 'anvil_impersonateAccount', params: [from] })
  await client.request({ method: 'anvil_setBalance', params: [from, toHex(10n ** 18n)] })
  const hash = await client.request({ method: 'eth_sendTransaction', params: [{ from, to, data }] })
  const receipt = await client.waitForTransactionReceipt({ hash })
  if (receipt.status !== 'success') throw new Error(`tx from ${from} to ${to} reverted`)
}

const v110 = keccak256(toHex('1.1.0'))
const registry = await read(VAULT, 'versionRegistry')
const impersonated = []
const [latest] = await read(registry, 'getLatestVersion')
if (latest !== v110) throw new Error('1.1.0 is not the latest version in the registry')

if ((await read(VAULT, 'version')) !== '1.1.0') {
  const vaultAdmin = await read(VAULT, 'getRoleMember', [ZERO_ROLE, 0n])
  const [vaultImpl] = await read(registry, 'getImplementationsForVersion', [v110])
  const init = encodeFunctionData({ abi, functionName: 'initializeAverageVotes' })
  await impersonatedSend(vaultAdmin, VAULT, encodeFunctionData({ abi, functionName: 'upgradeToAndCall', args: [vaultImpl, init] }))
  impersonated.push(`vlRSR singleton timelock ${vaultAdmin}: upgradeToAndCall(${vaultImpl}, initializeAverageVotes())`)
}

const dtfQuery = `{ dtf(id: "${DTF}") { ownerGovernance { id } tradingGovernance { id } stToken { id } } }`
const { data } = await (await fetch(SUBGRAPH, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: dtfQuery }) })).json()
const governor = data.dtf.ownerGovernance.id
if (data.dtf.tradingGovernance.id !== governor) throw new Error(`${scenario.symbol} has a separate trading governor`)
if (data.dtf.stToken.id !== VAULT.toLowerCase()) throw new Error(`${scenario.symbol} does not vote with the vlRSR singleton`)
const timelock = await read(governor, 'timelock')

const delegatesQuery = `{ delegates(first: 10, orderBy: delegatedVotesRaw, orderDirection: desc, where: { token: "${VAULT.toLowerCase()}" }) { address } }`
const delegates = (await (await fetch(SUBGRAPH, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: delegatesQuery }) })).json()).data.delegates
const block = await client.getBlock()
const [threshold, quorum] = await Promise.all([
  read(governor, 'proposalThreshold'),
  read(governor, 'quorum', [block.timestamp - 1n]),
])
const votes = await Promise.all(delegates.map((d) => read(VAULT, 'getVotes', [d.address])))
const proposerIndex = votes.findIndex((v) => v >= threshold && v >= quorum)
if (proposerIndex < 0) throw new Error('no single vlRSR delegate clears threshold and quorum')
const proposer = delegates[proposerIndex].address
await client.request({ method: 'anvil_impersonateAccount', params: [proposer] })
await client.request({ method: 'anvil_setBalance', params: [proposer, toHex(10n ** 18n)] })
impersonated.push(`vlRSR voter ${proposer} (on-chain votes ${votes[proposerIndex]}): proposes and votes`)

const manifest = {
  chainId,
  scenario: scenarioName,
  network: scenario.network,
  symbol: scenario.symbol,
  dtf: DTF,
  vault: VAULT,
  registry,
  governor,
  timelock,
  proposer,
  proposerVotes: votes[proposerIndex].toString(),
  proposalThreshold: threshold.toString(),
  quorum: quorum.toString(),
  forkBlock: block.number.toString(),
  forkBlockHash: block.hash,
  forkTimestamp: block.timestamp.toString(),
  impersonated,
  preparedAt: new Date().toISOString(),
}
const dir = resolve(`e2e/fork/.state/${chainId}`)
mkdirSync(dir, { recursive: true })
writeFileSync(resolve(dir, `folio-governance-upgrade-${scenarioName}.json`), JSON.stringify(manifest, null, 2))
console.log(JSON.stringify(manifest, null, 2))
