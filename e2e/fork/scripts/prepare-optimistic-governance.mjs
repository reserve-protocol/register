// Prepares the Base fork for the optimistic-governance upgrade spec (LCAP):
// replays the protocol-side prerequisites the Register banner waits for, picks
// a real LCAP voter as proposer, and writes the scenario manifest the spec reads.
//
//   FORK_RPC_URL_8453=http://127.0.0.1:8546 node e2e/fork/scripts/prepare-optimistic-governance.mjs
//
// Prerequisites replayed by impersonation (labelled in the manifest):
//   0. RoleRegistry owner registers the 1.1.0 governor deployer in the VersionRegistry.
//   1. The vlRSR singleton's timelock upgrades the vault to 1.1.0 (Taylor's step 2).
import { createPublicClient, encodeFunctionData, http, keccak256, parseAbi, toHex } from 'viem'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rpcUrl = process.env.FORK_RPC_URL_8453 ?? 'http://127.0.0.1:8546'
const SUBGRAPH =
  'https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-base/prod/gn'
const LCAP = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8'
const SPELL = '0x5771d976696AA180Fed276FB6571fE2f41D0b849'
const SINGLETON_VAULT = '0x2F0D6538807a77d4AdDCd4b4DAf214Ea2E818E3D'
const ZERO_ROLE = `0x${'0'.repeat(64)}`

const abi = parseAbi([
  'function version() view returns (string)',
  'function governorDeployer() view returns (address)',
  'function versionRegistry() view returns (address)',
  'function stakingVaultImpl() view returns (address)',
  'function roleRegistry() view returns (address)',
  'function getLatestVersion() view returns (bytes32,address,uint256,bool)',
  'function registerVersion(address)',
  'function getRoleMember(bytes32,uint256) view returns (address)',
  'function upgradeToAndCall(address,bytes)',
  'function initializeAverageVotes()',
  'function proposalThreshold() view returns (uint256)',
  'function quorum(uint256) view returns (uint256)',
  'function getVotes(address) view returns (uint256)',
  'function token() view returns (address)',
])

const client = createPublicClient({ transport: http(rpcUrl, { timeout: 120_000 }) })
const chainId = await client.getChainId()
const clientVersion = await client.request({ method: 'web3_clientVersion' })
if (chainId !== 8453 || !String(clientVersion).startsWith('anvil') || !/127\.0\.0\.1|localhost/.test(rpcUrl)) {
  throw new Error(`refusing: rpc ${rpcUrl} chainId ${chainId} client ${clientVersion}`)
}

const read = (address, functionName, args = []) => client.readContract({ address, abi, functionName, args })
const impersonatedSend = async (from, to, data) => {
  await client.request({ method: 'anvil_impersonateAccount', params: [from] })
  await client.request({ method: 'anvil_setBalance', params: [from, toHex(10n ** 18n)] })
  const hash = await client.request({ method: 'eth_sendTransaction', params: [{ from, to, data }] })
  const receipt = await client.waitForTransactionReceipt({ hash })
  if (receipt.status !== 'success') throw new Error(`tx from ${from} to ${to} reverted`)
  return hash
}

const deployer = await read(SPELL, 'governorDeployer')
const versionRegistry = await read(deployer, 'versionRegistry')
const v110 = keccak256(toHex('1.1.0'))
const impersonated = []

const [latest] = await read(versionRegistry, 'getLatestVersion')
if (latest !== v110) {
  const roleRegistry = await read(versionRegistry, 'roleRegistry')
  const owner = await read(roleRegistry, 'getRoleMember', [ZERO_ROLE, 0n])
  await impersonatedSend(owner, versionRegistry, encodeFunctionData({ abi, functionName: 'registerVersion', args: [deployer] }))
  impersonated.push(`RoleRegistry owner ${owner}: VersionRegistry.registerVersion(${deployer})`)
}

if ((await read(SINGLETON_VAULT, 'version')) !== '1.1.0') {
  const vaultAdmin = await read(SINGLETON_VAULT, 'getRoleMember', [ZERO_ROLE, 0n])
  const impl = await read(deployer, 'stakingVaultImpl')
  const init = encodeFunctionData({ abi, functionName: 'initializeAverageVotes' })
  await impersonatedSend(vaultAdmin, SINGLETON_VAULT, encodeFunctionData({ abi, functionName: 'upgradeToAndCall', args: [impl, init] }))
  impersonated.push(`vlRSR singleton timelock ${vaultAdmin}: upgradeToAndCall(${impl}, initializeAverageVotes())`)
}
const vaultVersion = await read(SINGLETON_VAULT, 'version')
if (vaultVersion !== '1.1.0') throw new Error(`singleton vault still on ${vaultVersion}`)

const dtfQuery = `{ dtf(id: "${LCAP.toLowerCase()}") { ownerGovernance { id } tradingGovernance { id } stToken { id governance { id } } } }`
const { data } = await (await fetch(SUBGRAPH, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: dtfQuery }) })).json()
const ownerGovernor = data.dtf.ownerGovernance.id
const oldVault = data.dtf.stToken.id
const oldVaultGovernor = data.dtf.stToken.governance.id
if ((await read(ownerGovernor, 'token')).toLowerCase() !== oldVault) throw new Error('owner governor does not vote with the DTF vault')

const delegatesQuery = `{ delegates(first: 5, orderBy: delegatedVotesRaw, orderDirection: desc, where: { token: "${oldVault}" }) { address } }`
const delegates = (await (await fetch(SUBGRAPH, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: delegatesQuery }) })).json()).data.delegates
const block = await client.getBlock()
const [threshold, quorum] = await Promise.all([
  read(ownerGovernor, 'proposalThreshold'),
  read(ownerGovernor, 'quorum', [block.timestamp - 1n]),
])
const votes = await Promise.all(delegates.map((d) => read(oldVault, 'getVotes', [d.address])))
const proposerIndex = votes.findIndex((v) => v >= threshold && v >= quorum)
if (proposerIndex < 0) throw new Error('no single delegate clears threshold and quorum')
const proposer = delegates[proposerIndex].address
await client.request({ method: 'anvil_impersonateAccount', params: [proposer] })
await client.request({ method: 'anvil_setBalance', params: [proposer, toHex(10n ** 18n)] })
impersonated.push(`LCAP voter ${proposer} (on-chain votes ${votes[proposerIndex]}): proposes and votes`)

const manifest = {
  chainId,
  dtf: LCAP,
  spell: SPELL,
  singletonVault: SINGLETON_VAULT,
  oldVault,
  oldVaultGovernor,
  ownerGovernor,
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
const dir = resolve('e2e/fork/.state/8453')
mkdirSync(dir, { recursive: true })
writeFileSync(resolve(dir, 'optimistic-governance-scenario.json'), JSON.stringify(manifest, null, 2))
console.log(JSON.stringify(manifest, null, 2))
