import { expect, test, type Page } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  type Address,
  type Hex,
  createPublicClient,
  decodeEventLog,
  decodeFunctionData,
  getAddress,
  http,
  keccak256,
  parseAbi,
  toHex,
  zeroAddress,
} from 'viem'
import { installForkWallet } from '../helpers/fork-wallet'
import { forkGovernance, governorAbi, type Proposal } from '../helpers/governance'

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

  const { syncBrowserClock, proposeFromBanner: proposeFrom, passProposal: pass } =
    forkGovernance(client)
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
  const proposeFromBanner = (governor: Address, button: string, screenshot: string) =>
    proposeFrom(page, governor, button, `${evidenceDir}/${screenshot}`)
  const passProposal = (governor: Address, proposal: Proposal) => {
    expect(proposal.proposer.toLowerCase()).toBe(manifest.proposer.toLowerCase())
    return pass(governor, manifest.proposer, proposal)
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
  const oldDelegate = await read<Address>(manifest.oldVault, 'delegates', [
    manifest.proposer,
  ])
  await syncBrowserClock(page)
  const card = page.getByTestId('vote-lock-migration-card')
  const cta = page.getByTestId('vote-lock-migration-cta')
  const modal = page.getByTestId('vote-lock-migration-modal')
  const next = page.getByTestId('vote-lock-migration-next')
  const designDir = `${evidenceDir}/design`
  mkdirSync(designDir, { recursive: true })
  // Only the dialog's own enter animation: skeleton pulses elsewhere on the page never finish.
  const settled = () =>
    modal.evaluate((el) =>
      Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished))
    )
  // Every state is captured at a desktop and a phone width for the design review.
  const capture = async (name: string, target: Page = page, focus = card) => {
    for (const [label, size] of [
      ['desktop', { width: 1440, height: 900 }],
      ['mobile', { width: 390, height: 844 }],
    ] as const) {
      await target.setViewportSize(size)
      await expect(focus.first()).toBeVisible({ timeout: 120_000 })
      await focus.first().scrollIntoViewIfNeeded()
      if (focus === modal) await settled()
      await target.screenshot({ path: `${designDir}/${name}-${label}.png` })
    }
    await target.setViewportSize({ width: 1440, height: 900 })
  }

  // A visitor without a wallet sees the prompt to check theirs.
  const visitor = await page.context().newPage()
  await visitor.goto(`/base/index-dtf/${manifest.dtf}/governance`)
  const prompt = visitor.getByTestId('vote-lock-migration-card')
  await expect(prompt).toContainText('Connect to check', { timeout: 120_000 })
  await capture('governance-disconnected', visitor, prompt)
  await visitor.close()

  await page.goto(`/base/index-dtf/${manifest.dtf}/governance`)
  await expect(card).toBeVisible({ timeout: 120_000 })
  await expect(page.getByTestId('vote-lock-open-btn')).toHaveCount(0)
  await capture('governance-card')

  // Portfolio lists the old position from the Reserve API; the fork's reads mark it as needing migration.
  await page.goto('/portfolio')
  await expect(card).toContainText('vote-lock', { timeout: 120_000 })
  await capture('portfolio-banner')
  await capture('portfolio-row', page, page.getByTestId('vote-lock-migration-row-action'))

  await page.goto(`/base/index-dtf/${manifest.dtf}/overview`)
  await expect(wallet).toBeVisible({ timeout: 60_000 })
  await capture('overview-card')

  await page.goto(`/base/index-dtf/${manifest.dtf}/governance`)
  await cta.click()
  await expect(next).toHaveAttribute('data-step', 'redeem', { timeout: 120_000 })
  await expect(next).toBeEnabled({ timeout: 120_000 })
  await capture('modal-redeem', page, modal)
  await next.click()
  await expect(next).not.toHaveAttribute('data-step', 'redeem', { timeout: 120_000 })

  // A reload after the redeem resumes from the recorded receipt, not from the (now empty) old position.
  await page.reload()
  await expect(card).toContainText('Finish re-locking', { timeout: 120_000 })
  await capture('card-recovering')
  await cta.click()
  for (const expected of ['approve', 'deposit']) {
    await expect(next).toHaveAttribute('data-step', expected, {
      timeout: 120_000,
    })
    await expect(next).toBeEnabled({ timeout: 120_000 })
    await capture(`modal-${expected}`, page, modal)
    await next.click()
  }
  await expect(page.getByTestId('vote-lock-migration-done')).toBeVisible({
    timeout: 120_000,
  })
  await capture('modal-done', page, modal)

  // Closing the finished flow keeps an acknowledgment until the holder dismisses it.
  await page.keyboard.press('Escape')
  await expect(modal).toBeHidden()
  await expect(card).toContainText('locked in vlRSR')
  await capture('card-complete')
  await page.getByTestId('vote-lock-migration-dismiss').click()
  await expect(card).toHaveCount(0)
  await expect(page.getByTestId('vote-lock-open-btn')).toBeVisible({ timeout: 120_000 })

  expect(
    await read<bigint>(manifest.oldVault, 'balanceOf', [manifest.proposer])
  ).toBe(0n)
  const newShares =
    (await read<bigint>(manifest.singletonVault, 'balanceOf', [
      manifest.proposer,
    ])) - newSharesBefore
  expect(newShares).toBeGreaterThan(0n)
  // The holder keeps the delegate they had on the old vault (self when they had none).
  const expectedDelegate =
    oldDelegate.toLowerCase() === zeroAddress ? manifest.proposer : oldDelegate
  expect(
    (
      await read<Address>(manifest.singletonVault, 'delegates', [
        manifest.proposer,
      ])
    ).toLowerCase()
  ).toBe(expectedDelegate.toLowerCase())
  expect(
    await read<bigint>(manifest.singletonVault, 'getVotes', [expectedDelegate])
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
