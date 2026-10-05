import { expect, test } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  type Address,
  type Hex,
  createPublicClient,
  decodeFunctionData,
  http,
  parseAbi,
  zeroAddress,
} from 'viem'
import { installForkWallet } from '../helpers/fork-wallet'
import { forkGovernance } from '../helpers/governance'

// Folio 5.0.0 → 6.0.0 through the Register banner on the Base fork, both governance topologies: MIDAS
// (optimistic: four calls, selector rotation) and ABX (legacy: two calls, zero registry). The proposal is
// voted, queued and executed on the fork; version, ownership and selector permissions are read back with viem.
// Requires `prepare-v6-upgrade.mjs` and the subgraph proxy on :18310.
const rpcUrl = process.env.FORK_RPC_URL_8453 ?? 'http://127.0.0.1:8546'
const manifestPath = resolve('e2e/fork/.state/8453/v6-upgrade-scenario.json')
const evidenceDir =
  process.env.E2E_EVIDENCE_DIR ?? resolve('temp/evidence/fork-8453-v6')
const DEFAULT_ADMIN_ROLE = `0x${'0'.repeat(64)}` as Hex
const START_REBALANCE_V5 = '0x207c8eed'
const START_REBALANCE_V6 = '0xc1e54b89'

type Target = {
  symbol: string
  dtf: Address
  topology: 'optimistic' | 'legacy'
  proxyAdmin: Address
  governor: Address
  voter: Address
}
interface Manifest {
  spell: Address
  forkBlock: string
  forkBlockHash: Hex
  forkTimestamp: string
  targets: Target[]
}

const callAbi = parseAbi([
  'function registerSelectors((address target, bytes4[] selectors)[])',
  'function unregisterSelectors((address target, bytes4[] selectors)[])',
  'function transferOwnership(address)',
  'function cast(address folio, address proxyAdmin, address selectorRegistry)',
])
const readAbi = parseAbi([
  'function version() view returns (string)',
  'function owner() view returns (address)',
  'function timelock() view returns (address)',
  'function selectorRegistry() view returns (address)',
  'function getRoleMemberCount(bytes32) view returns (uint256)',
  'function getRoleMember(bytes32,uint256) view returns (address)',
  'function isAllowed(address target, bytes4 selector) view returns (bool)',
])

test.skip(process.env.FORK_CHAIN_ID !== '8453', 'Base lane only')
test.skip(!existsSync(manifestPath), 'run prepare-v6-upgrade.mjs first')
test.describe.configure({ mode: 'serial' })

const manifest = existsSync(manifestPath)
  ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest)
  : undefined

for (const target of manifest?.targets ?? []) {
  test(`${target.symbol} upgrades to Folio 6.0.0 through ${target.topology} governance from the Register banner`, async ({
    page,
  }) => {
    test.setTimeout(300_000)
    const client = createPublicClient({
      transport: http(rpcUrl, { timeout: 120_000 }),
    })
    const read = <T>(address: Address, functionName: string, args: unknown[] = []) =>
      client.readContract({
        address,
        abi: readAbi,
        functionName: functionName as never,
        args: args as never,
      }) as Promise<T>
    const { syncBrowserClock, proposeFromBanner, passProposal } =
      forkGovernance(client)
    mkdirSync(evidenceDir, { recursive: true })
    const pinned = await client.getBlock({
      blockNumber: BigInt(manifest!.forkBlock),
    })
    expect(pinned.hash).toBe(manifest!.forkBlockHash)

    const timelock = await read<Address>(target.governor, 'timelock')
    const registry =
      target.topology === 'optimistic'
        ? await read<Address>(target.governor, 'selectorRegistry')
        : zeroAddress

    await installForkWallet(page, {
      address: target.voter,
      chainId: 8453,
      rpcUrl,
    })
    await page.clock.install({
      time: (Number(manifest!.forkTimestamp) + 30) * 1000,
    })
    await syncBrowserClock(page)
    await page.goto(`/base/index-dtf/${target.dtf}/governance/propose`)
    const wallet = page.getByTestId('header-wallet')
    try {
      await expect(wallet).toBeVisible({ timeout: 15_000 })
    } catch {
      await page.getByTestId('header-connect-btn').click()
      await page.getByRole('button', { name: 'Fork Wallet' }).click()
      await expect(wallet).toBeVisible()
    }
    await expect(page.getByTestId('governance-v6-upgrade')).toBeVisible({
      timeout: 120_000,
    })

    const proposal = await proposeFromBanner(
      page,
      target.governor,
      'governance-v6-upgrade-btn',
      `${evidenceDir}/${target.symbol}-banner.png`
    )
    const calls = proposal.calldatas.map((data) =>
      decodeFunctionData({ abi: callAbi, data })
    )
    expect(proposal.values.every((value) => value === 0n)).toBe(true)
    expect(proposal.description).toMatch(/^Release 6\.0\.0 upgrade #\d+$/)
    if (target.topology === 'optimistic') {
      expect(proposal.targets).toEqual([registry, registry, target.proxyAdmin, manifest!.spell])
      expect(calls).toEqual([
        { functionName: 'registerSelectors', args: [[{ target: target.dtf, selectors: [START_REBALANCE_V6] }]] },
        { functionName: 'unregisterSelectors', args: [[{ target: target.dtf, selectors: [START_REBALANCE_V5] }]] },
        { functionName: 'transferOwnership', args: [manifest!.spell] },
        { functionName: 'cast', args: [target.dtf, target.proxyAdmin, registry] },
      ])
    } else {
      expect(proposal.targets).toEqual([target.proxyAdmin, manifest!.spell])
      expect(calls).toEqual([
        { functionName: 'transferOwnership', args: [manifest!.spell] },
        { functionName: 'cast', args: [target.dtf, target.proxyAdmin, zeroAddress] },
      ])
    }

    const executed = await passProposal(target.governor, target.voter, proposal)

    expect(await read<string>(target.dtf, 'version')).toBe('6.0.0')
    expect(await read<Address>(target.proxyAdmin, 'owner')).toBe(timelock)
    expect(await read<bigint>(target.dtf, 'getRoleMemberCount', [DEFAULT_ADMIN_ROLE])).toBe(1n)
    expect(await read<Address>(target.dtf, 'getRoleMember', [DEFAULT_ADMIN_ROLE, 0n])).toBe(timelock)
    if (target.topology === 'optimistic') {
      expect(await read<boolean>(registry, 'isAllowed', [target.dtf, START_REBALANCE_V6])).toBe(true)
      expect(await read<boolean>(registry, 'isAllowed', [target.dtf, START_REBALANCE_V5])).toBe(false)
    }

    writeFileSync(
      `${evidenceDir}/${target.symbol}.json`,
      JSON.stringify(
        {
          topology: target.topology,
          proposalId: proposal.proposalId.toString(),
          proposalTx: proposal.transactionHash,
          executeTx: executed.transactionHash,
          version: '6.0.0',
          proxyAdminOwner: timelock,
        },
        null,
        2
      )
    )
  })
}
