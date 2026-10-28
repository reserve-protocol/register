// Prepares a fork for the optimistic-governance upgrade spec: replays the
// protocol-side prerequisites the Register banners wait for, picks a real voter
// of the DTF's old vault as proposer, and writes the scenario manifest the spec reads.
//
//   FORK_SCENARIO=lcap FORK_RPC_URL_8453=http://127.0.0.1:8546 node e2e/fork/scripts/prepare-optimistic-governance.mjs
//   FORK_SCENARIO=abx  FORK_RPC_URL_8453=http://127.0.0.1:8546 node e2e/fork/scripts/prepare-optimistic-governance.mjs
//   FORK_SCENARIO=open FORK_RPC_URL_1=http://127.0.0.1:8545 node e2e/fork/scripts/prepare-optimistic-governance.mjs
//
// Prerequisites replayed by impersonation (labelled in the manifest):
//   0. RoleRegistry owner registers the 1.1.0 governor deployer in the VersionRegistry.
//   1. The vlRSR singleton's timelock upgrades the vault to 1.1.0 (step 1a; LCAP only).
import { createPublicClient, encodeFunctionData, http, keccak256, parseAbi, toHex, zeroAddress } from 'viem'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SUBGRAPHS = {
  1: 'https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-mainnet/prod/gn',
  8453: 'https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-base/prod/gn',
}
const TOKEN_JAR_BASE = '0xEAfA84184BEb90891cb5c4942ebD59C18dda0bfE'
// Mirrors DTF_UPGRADE_TARGETS and the shared defaults in src/components/vote-lock/migration/migration-targets.ts.
const SCENARIOS = {
  lcap: {
    chainId: 8453,
    symbol: 'LCAP',
    dtf: '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8',
    spell: '0x24a4B37F9c40fB0E80ec436Df2e9989FBAFa8bB7',
    newVault: '0x2F0D6538807a77d4AdDCd4b4DAf214Ea2E818E3D',
    feeRecipient: TOKEN_JAR_BASE,
    upgradesSharedVault: true,
  },
  abx: {
    chainId: 8453,
    symbol: 'ABX',
    dtf: '0xebcda5b80f62dd4dd2a96357b42bb6facbf30267',
    spell: '0x24a4B37F9c40fB0E80ec436Df2e9989FBAFa8bB7',
    newVault: '0xcb99d380302220E9896776d559AC98D552357a00',
    feeRecipient: zeroAddress,
    upgradesSharedVault: false,
  },
  open: {
    chainId: 1,
    symbol: 'OPEN',
    dtf: '0x323c03c48660fe31186fa82c289b0766d331ce21',
    spell: '0xaf029ad44Cc44fB2AefFF84029dd0c29D5Ea8D87',
    newVault: '0x60e71dd36Fa5Bf92bcd9320e85cF0040ffe437Bc',
    feeRecipient: zeroAddress,
    upgradesSharedVault: false,
  },
}
const scenarioName = process.env.FORK_SCENARIO ?? 'lcap'
const scenario = SCENARIOS[scenarioName]
if (!scenario) throw new Error(`unknown FORK_SCENARIO ${scenarioName}`)
const rpcUrl =
  process.env[`FORK_RPC_URL_${scenario.chainId}`] ?? (scenario.chainId === 1 ? 'http://127.0.0.1:8545' : 'http://127.0.0.1:8546')
const SUBGRAPH = SUBGRAPHS[scenario.chainId]
const DTF = scenario.dtf
const SPELL = scenario.spell
const NEW_VAULT = scenario.newVault
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
  'function balanceOf(address) view returns (uint256)',
  'function token() view returns (address)',
])

const client = createPublicClient({ transport: http(rpcUrl, { timeout: 120_000 }) })
const chainId = await client.getChainId()
const clientVersion = await client.request({ method: 'web3_clientVersion' })
if (chainId !== scenario.chainId || !String(clientVersion).startsWith('anvil') || !/127\.0\.0\.1|localhost/.test(rpcUrl)) {
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

if (scenario.upgradesSharedVault && (await read(NEW_VAULT, 'version')) !== '1.1.0') {
  const vaultAdmin = await read(NEW_VAULT, 'getRoleMember', [ZERO_ROLE, 0n])
  const impl = await read(deployer, 'stakingVaultImpl')
  const init = encodeFunctionData({ abi, functionName: 'initializeAverageVotes' })
  await impersonatedSend(vaultAdmin, NEW_VAULT, encodeFunctionData({ abi, functionName: 'upgradeToAndCall', args: [impl, init] }))
  impersonated.push(`vlRSR singleton timelock ${vaultAdmin}: upgradeToAndCall(${impl}, initializeAverageVotes())`)
}
const vaultVersion = await read(NEW_VAULT, 'version')
if (vaultVersion !== '1.1.0') throw new Error(`new vault still on ${vaultVersion}`)

const dtfQuery = `{ dtf(id: "${DTF.toLowerCase()}") { ownerGovernance { id } tradingGovernance { id } stToken { id governance { id } } } }`
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
const balances = await Promise.all(delegates.map((d) => read(oldVault, 'balanceOf', [d.address])))
// The proposer is also the migrating holder, so it must own old-vault shares, not only delegated votes.
const proposerIndex = votes.findIndex((v, i) => v >= threshold && v >= quorum && balances[i] > 0n)
if (proposerIndex < 0) throw new Error('no single delegate with old-vault shares clears threshold and quorum')
const proposer = delegates[proposerIndex].address
await client.request({ method: 'anvil_impersonateAccount', params: [proposer] })
await client.request({ method: 'anvil_setBalance', params: [proposer, toHex(10n ** 18n)] })
impersonated.push(`${scenario.symbol} voter ${proposer} (on-chain votes ${votes[proposerIndex]}): proposes and votes`)

const manifest = {
  chainId,
  scenario: scenarioName,
  symbol: scenario.symbol,
  dtf: DTF,
  spell: SPELL,
  newVault: NEW_VAULT,
  feeRecipient: scenario.feeRecipient,
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
const dir = resolve(`e2e/fork/.state/${chainId}`)
mkdirSync(dir, { recursive: true })
writeFileSync(resolve(dir, `optimistic-governance-${scenarioName}.json`), JSON.stringify(manifest, null, 2))
console.log(JSON.stringify(manifest, null, 2))
