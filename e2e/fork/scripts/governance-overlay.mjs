// Writes the subgraph-proxy OVERLAY for a DTF whose governance changed on the fork (a governance
// migration): the proxy then serves the new governor, timelock and vault, which the upstream
// subgraph never indexed. Values are read from the fork; the templates only give the shape.
//
//   DTF=0x… GOVERNOR=0x… GOVERNANCE_FROM=<DTF on the same governor version> STTOKEN_FROM=<DTF on the new vault> \
//   FORK_RPC_URL_8453=http://127.0.0.1:8546 OVERLAY=e2e/fork/.state/8453/governance-overlay.json \
//   node e2e/fork/scripts/governance-overlay.mjs
import { createPublicClient, http, keccak256, parseAbi, toHex } from 'viem'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const rpcUrl = process.env.FORK_RPC_URL_8453 ?? 'http://127.0.0.1:8546'
const required = ['DTF', 'GOVERNOR', 'GOVERNANCE_FROM', 'STTOKEN_FROM', 'OVERLAY']
for (const name of required) if (!process.env[name]) throw new Error(`set ${name}`)

const client = createPublicClient({ transport: http(rpcUrl, { timeout: 120_000 }) })
const clientVersion = await client.request({ method: 'web3_clientVersion' })
if (!String(clientVersion).startsWith('anvil') || !/127\.0\.0\.1|localhost/.test(rpcUrl)) {
  throw new Error(`refusing: rpc ${rpcUrl} client ${clientVersion}`)
}

const abi = parseAbi([
  'function name() view returns (string)',
  'function version() view returns (string)',
  'function votingDelay() view returns (uint256)',
  'function votingPeriod() view returns (uint256)',
  'function proposalThreshold() view returns (uint256)',
  'function quorumNumerator() view returns (uint256)',
  'function quorumDenominator() view returns (uint256)',
  'function lateQuorumVoteExtension() view returns (uint48)',
  'function selectorRegistry() view returns (address)',
  'function timelock() view returns (address)',
  'function token() view returns (address)',
  'function proposalThrottleCapacity() view returns (uint256)',
  'function optimisticParams() view returns (uint256 vetoDelay, uint256 vetoPeriod, uint256 vetoThreshold)',
  'function getMinDelay() view returns (uint256)',
  'function getPastTotalSupply(uint256) view returns (uint256)',
  'function getRoleMemberCount(bytes32) view returns (uint256)',
  'function getRoleMember(bytes32,uint256) view returns (address)',
  'function feeRecipients(uint256) view returns (address recipient, uint96 portion)',
  'function immutableFeeRecipients(uint256) view returns (address recipient, uint96 portion)',
  'function folioFeeForSelf() view returns (uint256)',
])
const governor = process.env.GOVERNOR
const read = (address, functionName, args = []) => client.readContract({ address, abi, functionName, args })

const [timelock, vault, block] = await Promise.all([
  read(governor, 'timelock'),
  read(governor, 'token'),
  client.getBlock(),
])
const [threshold, pastSupply, optimistic] = await Promise.all([
  read(governor, 'proposalThreshold'),
  read(vault, 'getPastTotalSupply', [block.timestamp - 1n]),
  read(governor, 'optimisticParams'),
])
const OPTIMISTIC_PROPOSER_ROLE = keccak256(toHex('OPTIMISTIC_PROPOSER_ROLE'))
const proposerCount = await read(timelock, 'getRoleMemberCount', [OPTIMISTIC_PROPOSER_ROLE]).catch(() => 0n)
const optimisticProposers = await Promise.all(
  Array.from({ length: Number(proposerCount) }, (_, i) =>
    read(timelock, 'getRoleMember', [OPTIMISTIC_PROPOSER_ROLE, BigInt(i)]).then((a) => a.toLowerCase())
  )
)
const quorumNumerator = await read(governor, 'quorumNumerator')
// The subgraph lists every timelock canceller (the governor included) as a guardian.
const CANCELLER_ROLE = keccak256(toHex('CANCELLER_ROLE'))
const cancellerCount = await read(timelock, 'getRoleMemberCount', [CANCELLER_ROLE])
const guardians = await Promise.all(
  Array.from({ length: Number(cancellerCount) }, (_, i) =>
    read(timelock, 'getRoleMember', [CANCELLER_ROLE, BigInt(i)]).then((a) => a.toLowerCase())
  )
)

// Folio 6.0 keeps both recipient tables as public arrays; the subgraph flattens each into "address:portion,…".
const readTable = async (functionName) => {
  const rows = []
  for (let i = 0n; ; i++) {
    const row = await read(process.env.DTF, functionName, [i]).catch(() => undefined)
    if (!row) return rows.length ? rows.map(([r, p]) => `${r.toLowerCase()}:${p}`).join(',') : null
    rows.push(row)
  }
}
const folioVersion = await read(process.env.DTF, 'version')

const overlay = {
  dtf: process.env.DTF.toLowerCase(),
  governanceFrom: process.env.GOVERNANCE_FROM.toLowerCase(),
  stTokenFrom: process.env.STTOKEN_FROM.toLowerCase(),
  governance: {
    id: governor.toLowerCase(),
    timelock: timelock.toLowerCase(),
    fields: {
      name: await read(governor, 'name'),
      version: await read(governor, 'version'),
      votingDelay: String(await read(governor, 'votingDelay')),
      votingPeriod: String(await read(governor, 'votingPeriod')),
      // The subgraph stores the threshold as a D18 share of the vote supply.
      proposalThreshold: String(pastSupply > 0n ? (threshold * 10n ** 18n) / pastSupply : 0n),
      proposalThresholdExact: pastSupply > 0n,
      lateQuorumVoteExtension: String(await read(governor, 'lateQuorumVoteExtension')),
      quorumVotes: String(quorumNumerator),
      quorumNumerator: String(quorumNumerator),
      quorumDenominator: String(await read(governor, 'quorumDenominator')),
      isOptimistic: true,
      optimisticVetoDelay: String(optimistic[0]),
      optimisticVetoPeriod: String(optimistic[1]),
      optimisticVetoThreshold: String(optimistic[2]),
      optimisticProposalThrottleCapacity: String(await read(governor, 'proposalThrottleCapacity')),
      optimisticSelectorRegistry: (await read(governor, 'selectorRegistry')).toLowerCase(),
      optimisticProposers,
    },
    timelockFields: { executionDelay: String(await read(timelock, 'getMinDelay')), type: 'OWNER', guardians },
  },
  dtfFields: {
    version: folioVersion,
    feeRecipients: await readTable('feeRecipients'),
    immutableFeeRecipients: await readTable('immutableFeeRecipients'),
    folioFeeForSelf: String(await read(process.env.DTF, 'folioFeeForSelf').catch(() => 0n)),
  },
  readAtBlock: block.number.toString(),
}
const out = resolve(process.env.OVERLAY)
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, JSON.stringify(overlay, null, 2))
console.log(JSON.stringify(overlay, null, 2))
