import { expect, test } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  type Address,
  type Hex,
  createPublicClient,
  encodeFunctionData,
  getAddress,
  http,
  keccak256,
  parseAbi,
  toHex,
} from 'viem'
import { installForkWallet } from '../helpers/fork-wallet'

// A single-governor DTF on a vlRSR singleton (AI DTFs, MAG7) upgrades its own
// governor and timelock to 1.1.0 from the Register banner after the singleton runs
// 1.1.0. The proposal is voted, queued and executed on the fork, then the upgraded
// governor must still accept a new proposal, which reads the vault's average votes.
// FORK_SCENARIO picks the DTF (power on BSC by default).
// Requires `prepare-folio-governance-upgrade.mjs` and the subgraph proxy for the chain.
const scenario = process.env.FORK_SCENARIO ?? 'power'
const chainId = Number(process.env.FORK_CHAIN_ID ?? '56')
const rpcUrl = process.env[`FORK_RPC_URL_${chainId}`] ?? ''
const manifestPath = resolve(
  `e2e/fork/.state/${chainId}/folio-governance-upgrade-${scenario}.json`
)
const evidenceDir =
  process.env.E2E_EVIDENCE_DIR ?? resolve(`temp/evidence/fork-${scenario}`)

interface Manifest {
  network: string
  symbol: string
  dtf: Address
  vault: Address
  registry: Address
  governor: Address
  timelock: Address
  proposer: Address
  forkBlock: string
  forkBlockHash: Hex
  forkTimestamp: string
}

type Proposal = {
  proposalId: bigint
  proposer: Address
  targets: Address[]
  values: bigint[]
  calldatas: Hex[]
  voteStart: bigint
  voteEnd: bigint
  description: string
}

const abi = parseAbi([
  'event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)',
  'function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)',
  'function castVote(uint256 proposalId, uint8 support) returns (uint256)',
  'function queue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)',
  'function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) payable returns (uint256)',
  'function state(uint256 proposalId) view returns (uint8)',
  'function version() view returns (string)',
  'function versionRegistry() view returns (address)',
  'function getMinDelay() view returns (uint256)',
  'function updateDelay(uint256 newDelay)',
])

test.skip(!['56', '8453'].includes(process.env.FORK_CHAIN_ID ?? ''), 'BSC and Base lanes only')
test.skip(!existsSync(manifestPath), 'run prepare-folio-governance-upgrade.mjs first')

test(`${scenario.toUpperCase()} upgrades its governor and timelock to 1.1.0 from the Register banner`, async ({
  page,
}) => {
  test.setTimeout(600_000)
  const raw = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest
  const manifest = {
    ...raw,
    dtf: getAddress(raw.dtf),
    governor: getAddress(raw.governor),
    timelock: getAddress(raw.timelock),
    proposer: getAddress(raw.proposer),
  }
  const client = createPublicClient({ transport: http(rpcUrl, { timeout: 120_000 }) })
  mkdirSync(evidenceDir, { recursive: true })
  const pinned = await client.getBlock({ blockNumber: BigInt(manifest.forkBlock) })
  expect(pinned.hash).toBe(manifest.forkBlockHash)

  const rpc = (method: string, params: unknown[]) =>
    client.request({ method: method as never, params: params as never })
  const read = <T>(address: Address, functionName: string, args: unknown[] = []) =>
    client.readContract({
      address,
      abi,
      functionName: functionName as never,
      args: args as never,
    }) as Promise<T>
  const send = async (data: Hex) => {
    const tx = { from: manifest.proposer, to: manifest.governor, data }
    const estimate = BigInt((await rpc('eth_estimateGas', [tx])) as Hex)
    const hash = (await rpc('eth_sendTransaction', [
      { ...tx, gas: toHex((estimate * 3n) / 2n) },
    ])) as Hex
    const receipt = await client.waitForTransactionReceipt({ hash })
    expect(receipt.status, data.slice(0, 10)).toBe('success')
    return receipt
  }
  const warpTo = async (timestamp: bigint) => {
    await rpc('evm_setNextBlockTimestamp', [toHex(timestamp)])
    await rpc('evm_mine', [])
  }
  const createdSince = async (fromBlock: bigint) =>
    client.getContractEvents({
      address: manifest.governor,
      abi,
      eventName: 'ProposalCreated',
      fromBlock: fromBlock + 1n,
    })

  await installForkWallet(page, { address: manifest.proposer, chainId, rpcUrl })
  // AI DTFs hold tokenized stocks: an unconfirmed wallet gets an eligibility modal over the banner.
  await page.addInitScript((wallet) => {
    localStorage.setItem('reserve:index-dtf-eligibility:v3', JSON.stringify([wallet]))
  }, manifest.proposer.toLowerCase())
  await page.clock.install({ time: (Number(manifest.forkTimestamp) + 30) * 1000 })
  const proposeRoute = `/${manifest.network}/index-dtf/${manifest.dtf.toLowerCase()}/governance/propose`
  await page.goto(proposeRoute)

  const banner = page.getByTestId('governance-folio-governance-upgrade')
  await expect(banner).toContainText(`${manifest.symbol} governance 1.1.0 available`, {
    timeout: 120_000,
  })
  // The vlRSR singleton is already on 1.1.0, so its own upgrade banner is gone.
  await expect(page.getByTestId('governance-vote-lock-upgrade')).toHaveCount(0)
  await banner.screenshot({ path: `${evidenceDir}/00-banner.png` })
  await page.screenshot({ path: `${evidenceDir}/01-propose-page.png`, fullPage: true })

  const fromBlock = await client.getBlockNumber()
  await page.getByTestId('governance-folio-governance-upgrade-btn').click()
  await expect.poll(async () => (await createdSince(fromBlock)).length, { timeout: 120_000 }).toBe(1)
  const [log] = await createdSince(fromBlock)
  const proposal = log.args as Proposal
  expect(proposal.proposer).toBe(manifest.proposer)
  expect(proposal.targets.map((t) => getAddress(t))).toEqual([manifest.governor, manifest.timelock])
  expect(proposal.description).toBe('Upgrade DTF governance to 1.1.0 #1')

  await warpTo(proposal.voteStart + 1n)
  await send(encodeFunctionData({ abi, functionName: 'castVote', args: [proposal.proposalId, 1] }))
  await warpTo(proposal.voteEnd + 1n)
  expect(await read<number>(manifest.governor, 'state', [proposal.proposalId])).toBe(4)
  const args = [
    proposal.targets,
    proposal.values,
    proposal.calldatas,
    keccak256(toHex(proposal.description)),
  ] as const
  await send(encodeFunctionData({ abi, functionName: 'queue', args }))
  const delay = await read<bigint>(manifest.timelock, 'getMinDelay')
  await warpTo((await client.getBlock()).timestamp + delay + 1n)
  await send(encodeFunctionData({ abi, functionName: 'execute', args }))

  expect(await read<string>(manifest.governor, 'version')).toBe('1.1.0')
  expect(await read<string>(manifest.timelock, 'version')).toBe('1.1.0')
  expect(getAddress(await read<Address>(manifest.governor, 'versionRegistry'))).toBe(
    getAddress(manifest.registry)
  )
  expect(getAddress(await read<Address>(manifest.timelock, 'versionRegistry'))).toBe(
    getAddress(manifest.registry)
  )

  // The upgraded governor reads average votes on propose; a revert here would lock the DTF out of proposals.
  const nextFrom = await client.getBlockNumber()
  await send(
    encodeFunctionData({
      abi,
      functionName: 'propose',
      args: [
        [manifest.timelock],
        [0n],
        [encodeFunctionData({ abi, functionName: 'updateDelay', args: [delay] })],
        'Post-upgrade proposal check',
      ],
    })
  )
  expect(await createdSince(nextFrom)).toHaveLength(1)

  const { timestamp } = await client.getBlock()
  await page.clock.setSystemTime(Number(timestamp + 30n) * 1000)
  await page.goto(proposeRoute)
  await expect(page.getByTestId('header-wallet')).toBeVisible({ timeout: 60_000 })
  // The banner's chain reads settle after the page; give them time before asserting absence.
  await page.waitForTimeout(10_000)
  await expect(page.getByTestId('governance-folio-governance-upgrade')).toHaveCount(0)
  await page.screenshot({ path: `${evidenceDir}/02-after-upgrade.png`, fullPage: true })
})
