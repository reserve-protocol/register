import { expect, test, type Page } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  type Address,
  type Hex,
  createPublicClient,
  decodeEventLog,
  decodeFunctionData,
  encodeFunctionData,
  getAddress,
  http,
  keccak256,
  parseAbi,
  toHex,
  zeroAddress,
} from 'viem'
import { installForkWallet } from '../helpers/fork-wallet'

// Real LCAP governance migration on the Base fork, driven from the Register UI:
// banner 1 proposes upgradeFolio on the Folio governor, banner 2 proposes the
// old vault's retirement on its DAO governor, and the migration modal moves a
// real holder's stake into the vlRSR singleton. Proposals are voted, queued and
// executed on the fork; every outcome is read back with viem.
// Requires `prepare-optimistic-governance.mjs` and the subgraph proxy on :18310.
const rpcUrl = process.env.FORK_RPC_URL_8453 ?? 'http://127.0.0.1:8546'
const manifestPath = resolve(
  'e2e/fork/.state/8453/optimistic-governance-scenario.json'
)
const evidenceDir =
  process.env.E2E_EVIDENCE_DIR ?? resolve('temp/evidence/fork-8453')
const TOKEN_JAR = '0xEAfA84184BEb90891cb5c4942ebD59C18dda0bfE'
const DEFAULT_ADMIN_ROLE = `0x${'0'.repeat(64)}` as Hex
const REBALANCE_MANAGER = keccak256(toHex('REBALANCE_MANAGER'))

interface Manifest {
  dtf: Address
  spell: Address
  singletonVault: Address
  oldVault: Address
  oldVaultGovernor: Address
  ownerGovernor: Address
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

const governorAbi = parseAbi([
  'event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)',
  'function castVote(uint256 proposalId, uint8 support) returns (uint256)',
  'function queue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) returns (uint256)',
  'function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) payable returns (uint256)',
  'function state(uint256 proposalId) view returns (uint8)',
  'function timelock() view returns (address)',
  'function token() view returns (address)',
])
const actionAbi = parseAbi([
  'function grantRole(bytes32 role, address account)',
  'function transferOwnership(address newOwner)',
  'function upgradeFolio(address folio, address folioProxyAdmin, address newStakingVault, address oldFolioGovernor, address tradingGovernor, (uint48 vetoDelay, uint32 vetoPeriod, uint256 vetoThreshold) optimisticParams, address[] optimisticProposers, address[] guardians, address newFeeRecipient, bytes32 deploymentNonce) returns ((address stakingVault, address newGovernor, address newTimelock, address newSelectorRegistry))',
  'function retireOldStakingVault(address oldStakingVault)',
  'event NewGovernanceDeployment((address stakingVault, address newGovernor, address newTimelock, address newSelectorRegistry) newDeployment)',
])
const readAbi = parseAbi([
  'function getMinDelay() view returns (uint256)',
  'function getRoleMemberCount(bytes32) view returns (uint256)',
  'function getRoleMember(bytes32,uint256) view returns (address)',
  'function owner() view returns (address)',
  'function feeRecipients(uint256) view returns (address recipient, uint96 portion)',
  'function unstakingDelay() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function getVotes(address) view returns (uint256)',
  'function delegates(address) view returns (address)',
])

test.skip(process.env.FORK_CHAIN_ID !== '8453', 'Base lane only')
test.skip(
  !existsSync(manifestPath),
  'run prepare-optimistic-governance.mjs first'
)

test('LCAP migrates governance, retires its old vault and moves a holder to vlRSR from the Register UI', async ({
  page,
}) => {
  test.setTimeout(600_000)
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest
  const client = createPublicClient({
    transport: http(rpcUrl, { timeout: 120_000 }),
  })
  mkdirSync(evidenceDir, { recursive: true })
  const pinned = await client.getBlock({
    blockNumber: BigInt(manifest.forkBlock),
  })
  expect(pinned.hash).toBe(manifest.forkBlockHash)

  const rpc = (method: string, params: unknown[]) =>
    client.request({ method: method as never, params: params as never })
  const send = async (from: Address, to: Address, data: Hex) => {
    await rpc('anvil_impersonateAccount', [from])
    await rpc('anvil_setBalance', [from, toHex(10n ** 18n)])
    // Anvil's estimate is exact for the outer call and starves the spell's nested calls (63/64 rule).
    const gas =
      ((await client.estimateGas({ account: from, to, data })) * 3n) / 2n
    const hash = (await rpc('eth_sendTransaction', [
      { from, to, data, gas: toHex(gas) },
    ])) as Hex
    const receipt = await client.waitForTransactionReceipt({ hash })
    expect(receipt.status, `${to} ${data.slice(0, 10)}`).toBe('success')
    return receipt
  }
  const warpTo = async (timestamp: bigint) => {
    await rpc('evm_setNextBlockTimestamp', [toHex(timestamp)])
    await rpc('evm_mine', [])
  }
  const read = <T>(
    address: Address,
    functionName: string,
    args: unknown[] = []
  ) =>
    client.readContract({
      address,
      abi: [...readAbi, ...governorAbi],
      functionName: functionName as never,
      args: args as never,
    }) as Promise<T>

  const proposeFromBanner = async (
    governor: Address,
    button: string,
    screenshot: string
  ) => {
    const fromBlock = await client.getBlockNumber()
    const action = page.getByTestId(button)
    await expect(action).toBeEnabled({ timeout: 120_000 })
    await page.screenshot({
      path: `${evidenceDir}/${screenshot}`,
      fullPage: true,
    })
    await action.click()
    const created = () =>
      client.getContractEvents({
        address: governor,
        abi: governorAbi,
        eventName: 'ProposalCreated',
        fromBlock: fromBlock + 1n,
      })
    await expect
      .poll(async () => (await created()).length, { timeout: 120_000 })
      .toBe(1)
    const [log] = await created()
    return { ...(log.args as Proposal), transactionHash: log.transactionHash }
  }
  const passProposal = async (governor: Address, proposal: Proposal) => {
    expect(proposal.proposer.toLowerCase()).toBe(
      manifest.proposer.toLowerCase()
    )
    await warpTo(proposal.voteStart + 1n)
    await send(
      manifest.proposer,
      governor,
      encodeFunctionData({
        abi: governorAbi,
        functionName: 'castVote',
        args: [proposal.proposalId, 1],
      })
    )
    await warpTo(proposal.voteEnd + 1n)
    expect(await read<number>(governor, 'state', [proposal.proposalId])).toBe(4)
    const args = [
      proposal.targets,
      proposal.values,
      proposal.calldatas,
      keccak256(toHex(proposal.description)),
    ] as const
    await send(
      manifest.proposer,
      governor,
      encodeFunctionData({ abi: governorAbi, functionName: 'queue', args })
    )
    const timelock = await read<Address>(governor, 'timelock')
    const delay = await read<bigint>(timelock, 'getMinDelay')
    await warpTo((await client.getBlock()).timestamp + delay + 1n)
    return send(
      manifest.proposer,
      governor,
      encodeFunctionData({ abi: governorAbi, functionName: 'execute', args })
    )
  }
  // The fork clock jumped past the voting windows; the browser must agree with the chain.
  const syncBrowserClock = async (target: Page) => {
    const { timestamp } = await client.getBlock()
    await target.clock.setSystemTime(Number(timestamp + 30n) * 1000)
  }

  await installForkWallet(page, {
    address: manifest.proposer,
    chainId: 8453,
    rpcUrl,
  })
  await page.clock.install({
    time: (Number(manifest.forkTimestamp) + 30) * 1000,
  })
  await page.goto(`/base/index-dtf/${manifest.dtf}/governance/propose`)
  const wallet = page.getByTestId('header-wallet')
  try {
    await expect(wallet).toBeVisible({ timeout: 15_000 })
  } catch {
    await page.getByTestId('header-connect-btn').click()
    await page.getByRole('button', { name: 'Fork Wallet' }).click()
    await expect(wallet).toBeVisible()
  }

  // Before LCAP migrates, banner 2 lists it as still governed by the old vault and stays disabled.
  await expect(
    page.getByTestId('governance-retire-vote-lock-pending')
  ).toContainText('LCAP', { timeout: 120_000 })
  await expect(page.getByTestId('governance-retire-vote-lock-btn')).toBeDisabled()

  // Banner 1: upgradeFolio on the Folio's owner governor.
  const upgrade = await proposeFromBanner(
    manifest.ownerGovernor,
    'governance-optimistic-upgrade-btn',
    '01-upgrade-banner.png'
  )
  expect(upgrade.targets[0].toLowerCase()).toBe(manifest.dtf.toLowerCase())
  expect(upgrade.targets[2].toLowerCase()).toBe(manifest.spell.toLowerCase())
  const actions = upgrade.calldatas.map((data) =>
    decodeFunctionData({ abi: actionAbi, data })
  )
  expect(actions.map((a) => a.functionName)).toEqual([
    'grantRole',
    'transferOwnership',
    'upgradeFolio',
  ])
  expect(actions[0].args).toEqual([DEFAULT_ADMIN_ROLE, manifest.spell])
  expect(actions[1].args).toEqual([manifest.spell])
  const upgradeArgs = actions[2].args as readonly unknown[]
  expect((upgradeArgs[0] as string).toLowerCase()).toBe(
    manifest.dtf.toLowerCase()
  )
  expect((upgradeArgs[1] as string).toLowerCase()).toBe(
    upgrade.targets[1].toLowerCase()
  )
  expect(upgradeArgs[2]).toBe(manifest.singletonVault)
  expect((upgradeArgs[3] as string).toLowerCase()).toBe(
    manifest.ownerGovernor.toLowerCase()
  )
  expect(upgradeArgs[8]).toBe(TOKEN_JAR)

  const executed = await passProposal(manifest.ownerGovernor, upgrade)
  const deploymentLog = executed.logs
    .filter((log) => log.address.toLowerCase() === manifest.spell.toLowerCase())
    .map((log) => {
      try {
        return decodeEventLog({
          abi: actionAbi,
          data: log.data,
          topics: log.topics,
        })
      } catch {
        return undefined
      }
    })
    .find((event) => event?.eventName === 'NewGovernanceDeployment')
  expect(deploymentLog).toBeDefined()
  const deployment = (
    deploymentLog!.args as {
      newDeployment: {
        stakingVault: Address
        newGovernor: Address
        newTimelock: Address
      }
    }
  ).newDeployment
  expect(deployment.stakingVault).toBe(manifest.singletonVault)
  expect(
    await read<bigint>(manifest.dtf, 'getRoleMemberCount', [DEFAULT_ADMIN_ROLE])
  ).toBe(1n)
  expect(
    await read<Address>(manifest.dtf, 'getRoleMember', [DEFAULT_ADMIN_ROLE, 0n])
  ).toBe(deployment.newTimelock)
  expect(
    await read<Address>(manifest.dtf, 'getRoleMember', [REBALANCE_MANAGER, 0n])
  ).toBe(deployment.newTimelock)
  expect(await read<Address>(upgrade.targets[1], 'owner')).toBe(
    deployment.newTimelock
  )
  expect(await read<Address>(deployment.newGovernor, 'token')).toBe(
    manifest.singletonVault
  )
  const recipients: string[] = []
  for (let i = 0n; ; i++) {
    const recipient = await read<readonly [Address, bigint]>(
      manifest.dtf,
      'feeRecipients',
      [i]
    )
      .then((r) => r[0].toLowerCase())
      .catch(() => undefined)
    if (!recipient) break
    recipients.push(recipient)
  }
  expect(recipients).toContain(TOKEN_JAR.toLowerCase())
  expect(recipients).not.toContain(manifest.oldVault.toLowerCase())

  // Banner 2: retire the old vault through its DAO governor (no dependent left after LCAP migrated).
  await syncBrowserClock(page)
  await page.goto(`/base/index-dtf/${manifest.dtf}/governance/propose`)
  await expect(wallet).toBeVisible({ timeout: 60_000 })
  const retire = await proposeFromBanner(
    manifest.oldVaultGovernor,
    'governance-retire-vote-lock-btn',
    '02-retire-banner.png'
  )
  await expect(
    page.getByTestId('governance-retire-vote-lock-pending')
  ).toHaveCount(0)
  expect(retire.targets.map((t) => t.toLowerCase())).toEqual([
    manifest.oldVault.toLowerCase(),
    manifest.spell.toLowerCase(),
  ])
  expect(
    retire.calldatas.map((data) => decodeFunctionData({ abi: actionAbi, data }))
  ).toEqual([
    { functionName: 'transferOwnership', args: [getAddress(manifest.spell)] },
    {
      functionName: 'retireOldStakingVault',
      args: [getAddress(manifest.oldVault)],
    },
  ])
  await passProposal(manifest.oldVaultGovernor, retire)
  expect(await read<bigint>(manifest.oldVault, 'unstakingDelay')).toBe(0n)
  expect(await read<Address>(manifest.oldVault, 'owner')).toBe(zeroAddress)

  // Migration modal: the holder moves the whole old position into the singleton.
  const oldShares = await read<bigint>(manifest.oldVault, 'balanceOf', [
    manifest.proposer,
  ])
  const newSharesBefore = await read<bigint>(
    manifest.singletonVault,
    'balanceOf',
    [manifest.proposer]
  )
  expect(oldShares).toBeGreaterThan(0n)
  await syncBrowserClock(page)
  const banner = page.getByTestId('vote-lock-migration-banner')
  const modal = page.getByTestId('vote-lock-migration-modal')
  // Only the dialog's own enter animation: skeleton pulses elsewhere on the page never finish.
  const settled = () =>
    modal.evaluate((el) =>
      Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished))
    )
  await page.goto(`/base/index-dtf/${manifest.dtf}/governance`)
  await expect(banner).toBeVisible({ timeout: 120_000 })
  await page.screenshot({ path: `${evidenceDir}/migration-governance-page.png` })

  // Mobile: the banner stacks and the modal opens as a bottom sheet; closing it before any tx keeps nothing.
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`/base/index-dtf/${manifest.dtf}/overview`)
  await expect(banner).toBeVisible({ timeout: 120_000 })
  await banner.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${evidenceDir}/migration-mobile-banner.png` })
  await page.getByTestId('vote-lock-migration-open-btn').click()
  await expect(modal).toBeVisible()
  await settled()
  await page.screenshot({ path: `${evidenceDir}/migration-mobile-modal.png` })
  await page.keyboard.press('Escape')
  await expect(modal).toBeHidden()
  await page.setViewportSize({ width: 1280, height: 720 })

  await page.goto(`/base/index-dtf/${manifest.dtf}/overview`)
  await expect(wallet).toBeVisible({ timeout: 60_000 })
  await expect(banner).toBeVisible({ timeout: 120_000 })
  await page.screenshot({ path: `${evidenceDir}/migration-overview-banner.png` })
  await page.getByTestId('vote-lock-migration-open-btn').click()
  await expect(modal).toBeVisible()
  const action = page.getByTestId('vote-lock-migration-action-btn')
  for (const expected of ['redeem', 'approve', 'deposit']) {
    await expect(action).toHaveAttribute('data-step', expected, {
      timeout: 120_000,
    })
    await expect(action).toBeEnabled({ timeout: 120_000 })
    await settled()
    await page.screenshot({ path: `${evidenceDir}/migration-step-${expected}.png` })
    await action.click()
  }
  await expect(page.getByTestId('vote-lock-migration-done')).toBeVisible({
    timeout: 120_000,
  })
  await page.screenshot({ path: `${evidenceDir}/migration-step-done.png` })
  await page.getByTestId('vote-lock-migration-done').click()
  await expect(modal).toBeHidden()
  await expect(banner).toBeHidden({ timeout: 60_000 })
  await page.screenshot({ path: `${evidenceDir}/migration-after.png` })

  expect(
    await read<bigint>(manifest.oldVault, 'balanceOf', [manifest.proposer])
  ).toBe(0n)
  const newShares =
    (await read<bigint>(manifest.singletonVault, 'balanceOf', [
      manifest.proposer,
    ])) - newSharesBefore
  expect(newShares).toBeGreaterThan(0n)
  expect(
    (
      await read<Address>(manifest.singletonVault, 'delegates', [
        manifest.proposer,
      ])
    ).toLowerCase()
  ).toBe(manifest.proposer.toLowerCase())
  expect(
    await read<bigint>(manifest.singletonVault, 'getVotes', [manifest.proposer])
  ).toBeGreaterThanOrEqual(newShares)

  writeFileSync(
    `${evidenceDir}/optimistic-governance.json`,
    JSON.stringify(
      {
        forkBlock: manifest.forkBlock,
        upgradeProposalId: upgrade.proposalId.toString(),
        upgradeProposalTx: upgrade.transactionHash,
        upgradeExecuteTx: executed.transactionHash,
        newGovernor: deployment.newGovernor,
        newTimelock: deployment.newTimelock,
        feeRecipients: recipients,
        retireProposalId: retire.proposalId.toString(),
        retireProposalTx: retire.transactionHash,
        oldVaultUnstakingDelay: '0',
        migratedOldShares: oldShares.toString(),
        receivedSingletonShares: newShares.toString(),
      },
      null,
      2
    )
  )
})
