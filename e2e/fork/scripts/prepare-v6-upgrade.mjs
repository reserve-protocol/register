// Prepares the Base fork for the Folio 6.0.0 upgrade spec: registers 6.0.0 in the Folio version registry (the
// protocol prerequisite the banner waits for, replayed by labelled impersonation) and picks, per DTF, a real voter
// that clears threshold and quorum on its owner governor. MIDAS covers optimistic governance, ABX legacy.
//
//   FORK_RPC_URL_8453=http://127.0.0.1:8546 node e2e/fork/scripts/prepare-v6-upgrade.mjs
import { createPublicClient, encodeFunctionData, getAddress, http, keccak256, parseAbi, toHex } from 'viem'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rpcUrl = process.env.FORK_RPC_URL_8453 ?? 'http://127.0.0.1:8546'
const SUBGRAPH =
  'https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-base/1.11.2-test/gn'
const VERSION_REGISTRY = '0xA665b273997F70b647B66fa7Ed021287544849dB'
const V6_DEPLOYER = '0x4c891fCa6319d492866672E3D2AfdAAA5bDcfF67'
const TARGETS = [
  { symbol: 'MIDAS', dtf: '0x055adf5d33c9187a93df898e3830e7fbde7bfb17', topology: 'optimistic' },
  { symbol: 'ABX', dtf: '0xebcda5b80f62dd4dd2a96357b42bb6facbf30267', topology: 'legacy' },
]
const ZERO_ROLE = `0x${'0'.repeat(64)}`

const abi = parseAbi([
  'function roleRegistry() view returns (address)',
  'function getRoleMember(bytes32,uint256) view returns (address)',
  'function registerVersion(address)',
  'function getLatestVersion() view returns (bytes32,string,address,bool)',
  'function deployments(bytes32) view returns (address)',
  'function proposalThreshold() view returns (uint256)',
  'function quorum(uint256) view returns (uint256)',
  'function getVotes(address) view returns (uint256)',
  'function token() view returns (address)',
  'function version() view returns (string)',
  'function proxyAdmin() view returns (address)',
])

const client = createPublicClient({ transport: http(rpcUrl, { timeout: 120_000 }) })
const chainId = await client.getChainId()
const clientVersion = await client.request({ method: 'web3_clientVersion' })
if (chainId !== 8453 || !String(clientVersion).startsWith('anvil') || !/127\.0\.0\.1|localhost/.test(rpcUrl)) {
  throw new Error(`refusing: rpc ${rpcUrl} chainId ${chainId} client ${clientVersion}`)
}

const read = (address, functionName, args = []) => client.readContract({ address, abi, functionName, args })
const query = async (q) =>
  (await (await fetch(SUBGRAPH, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: q }) })).json()).data
const impersonatedSend = async (from, to, data) => {
  await client.request({ method: 'anvil_impersonateAccount', params: [from] })
  await client.request({ method: 'anvil_setBalance', params: [from, toHex(10n ** 18n)] })
  const hash = await client.request({ method: 'eth_sendTransaction', params: [{ from, to, data }] })
  const receipt = await client.waitForTransactionReceipt({ hash })
  if (receipt.status !== 'success') throw new Error(`tx from ${from} to ${to} reverted`)
}

const impersonated = []
const v6 = keccak256(toHex('6.0.0'))
if ((await read(VERSION_REGISTRY, 'deployments', [v6])).toLowerCase() === `0x${'0'.repeat(40)}`) {
  const owner = await read(await read(VERSION_REGISTRY, 'roleRegistry'), 'getRoleMember', [ZERO_ROLE, 0n])
  await impersonatedSend(owner, VERSION_REGISTRY, encodeFunctionData({ abi, functionName: 'registerVersion', args: [V6_DEPLOYER] }))
  impersonated.push(`RoleRegistry owner ${owner}: FolioVersionRegistry.registerVersion(${V6_DEPLOYER})`)
}
const [, latest] = await read(VERSION_REGISTRY, 'getLatestVersion')
if (latest !== '6.0.0') throw new Error(`version registry latest is ${latest}`)

const block = await client.getBlock()
const targets = []
for (const target of TARGETS) {
  if ((await read(target.dtf, 'version')) !== '5.0.0') throw new Error(`${target.symbol} is not on 5.0.0`)
  const { dtf } = await query(`{ dtf(id: "${target.dtf}") { proxyAdmin ownerGovernance { id } } }`)
  const governor = getAddress(dtf.ownerGovernance.id)
  const vault = (await read(governor, 'token')).toLowerCase()
  const { delegates } = await query(
    `{ delegates(first: 5, orderBy: delegatedVotesRaw, orderDirection: desc, where: { token: "${vault}" }) { address } }`
  )
  const [threshold, quorum] = await Promise.all([
    read(governor, 'proposalThreshold'),
    read(governor, 'quorum', [block.timestamp - 1n]),
  ])
  const votes = await Promise.all(delegates.map((d) => read(vault, 'getVotes', [d.address])))
  const index = votes.findIndex((v) => v >= threshold && v >= quorum)
  if (index < 0) throw new Error(`${target.symbol}: no single delegate clears threshold and quorum`)
  const voter = getAddress(delegates[index].address)
  await client.request({ method: 'anvil_impersonateAccount', params: [voter] })
  await client.request({ method: 'anvil_setBalance', params: [voter, toHex(10n ** 18n)] })
  impersonated.push(`${target.symbol} voter ${voter} (on-chain votes ${votes[index]}): proposes and votes`)
  targets.push({ ...target, dtf: getAddress(target.dtf), proxyAdmin: getAddress(dtf.proxyAdmin), governor, voter })
}

const manifest = {
  chainId,
  forkBlock: block.number.toString(),
  forkBlockHash: block.hash,
  forkTimestamp: block.timestamp.toString(),
  spell: '0x4bCd4101729C25F4e65B29357387440e357D43c1',
  targets,
  impersonated,
  preparedAt: new Date().toISOString(),
}
const dir = resolve('e2e/fork/.state/8453')
mkdirSync(dir, { recursive: true })
writeFileSync(resolve(dir, 'v6-upgrade-scenario.json'), JSON.stringify(manifest, null, 2))
console.log(JSON.stringify(manifest, null, 2))
