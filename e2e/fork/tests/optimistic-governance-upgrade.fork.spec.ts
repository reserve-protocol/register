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

// Real governance migration on a fork, driven from the Register UI: the
// pre-upgrade card locks into the new vault, banner 1 proposes upgradeFolio on
// the Folio governor, banner 2 proposes the old vault's retirement on its DAO
// governor, and the migration modal moves a real holder's stake into the new
// vault. Proposals are voted, queued and executed on the fork; every outcome is
// read back with viem. FORK_SCENARIO picks the DTF: lcap (Base, vlRSR), abx
// (Base, vlALTT) or open (Ethereum, vlSQUILL).
// Requires `prepare-optimistic-governance.mjs` and the subgraph proxy for the chain.
const scenario = process.env.FORK_SCENARIO ?? 'lcap'
const chainId = Number(process.env.FORK_CHAIN_ID ?? '8453')
const network = chainId === 1 ? 'ethereum' : 'base'
const rpcUrl =
  process.env[`FORK_RPC_URL_${chainId}`] ??
  (chainId === 1 ? 'http://127.0.0.1:8545' : 'http://127.0.0.1:8546')
const manifestPath = resolve(
  `e2e/fork/.state/${chainId}/optimistic-governance-${scenario}.json`
)
const evidenceDir =
  process.env.E2E_EVIDENCE_DIR ?? resolve(`temp/evidence/fork-${scenario}`)
const LOCK_AMOUNT = 1000n * 10n ** 18n
const DEFAULT_ADMIN_ROLE = `0x${'0'.repeat(64)}` as Hex
const REBALANCE_MANAGER = keccak256(toHex('REBALANCE_MANAGER'))

interface Manifest {
  chainId: number
  symbol: string
  dtf: Address
  spell: Address
  newVault: Address
  feeRecipient: Address
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
  'function symbol() view returns (string)',
  'function asset() view returns (address)',
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

test.skip(!['1', '8453'].includes(process.env.FORK_CHAIN_ID ?? ''), 'Ethereum and Base lanes only')
test.skip(
  !existsSync(manifestPath),
  'run prepare-optimistic-governance.mjs first'
)

test(`${scenario.toUpperCase()} migrates governance, retires its old vault and moves a holder to its new vault from the Register UI`, async ({
  page,
}) => {
  test.setTimeout(600_000)
  const raw = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest
  const manifest = {
    ...raw,
    dtf: getAddress(raw.dtf),
    newVault: getAddress(raw.newVault),
    feeRecipient: getAddress(raw.feeRecipient),
  }
  expect(manifest.chainId).toBe(chainId)
  const dtfRoute = `/${network}/index-dtf/${manifest.dtf.toLowerCase()}`
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

  // Gives the holder underlying to lock without moving tokens out of a real vault.
  // The balance slot is whichever slot balanceOf reads, so any storage layout works.
  const dealErc20 = async (token: Address, account: Address, amount: bigint) => {
    const trace = (await rpc('debug_traceCall', [
      {
        to: token,
        data: encodeFunctionData({
          abi: readAbi,
          functionName: 'balanceOf',
          args: [account],
        }),
      },
      'latest',
      { tracer: 'prestateTracer' },
    ])) as Record<string, { storage?: Record<Hex, Hex> }>
    const touched = Object.entries(trace).find(
      ([address]) => address.toLowerCase() === token.toLowerCase()
    )?.[1].storage
    for (const key of Object.keys(touched ?? {}) as Hex[]) {
      const previous = (await rpc('eth_getStorageAt', [token, key, 'latest'])) as Hex
      await rpc('anvil_setStorageAt', [token, key, toHex(amount, { size: 32 })])
      if ((await read<bigint>(token, 'balanceOf', [account])) === amount) return
      await rpc('anvil_setStorageAt', [token, key, previous])
    }
    throw new Error(`no balance slot found for ${token}`)
  }

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
    chainId,
    rpcUrl,
  })
  await page.clock.install({
    time: (Number(manifest.forkTimestamp) + 30) * 1000,
  })
  await page.goto(`${dtfRoute}/governance/propose`)
  const wallet = page.getByTestId('header-wallet')
  try {
    await expect(wallet).toBeVisible({ timeout: 15_000 })
  } catch {
    await page.getByTestId('header-connect-btn').click()
    await page.getByRole('button', { name: 'Fork Wallet' }).click()
    await expect(wallet).toBeVisible()
  }

  const newSymbol = await read<string>(manifest.newVault, 'symbol')
  const underlying = await read<Address>(manifest.newVault, 'asset')
  const underlyingSymbol = await read<string>(underlying, 'symbol')

  // Before the upgrade, the DTF page offers to lock straight into the new vault.
  if ((await read<bigint>(underlying, 'balanceOf', [manifest.proposer])) < LOCK_AMOUNT) {
    await dealErc20(underlying, manifest.proposer, LOCK_AMOUNT)
  }
  const sharesBeforeLock = await read<bigint>(manifest.newVault, 'balanceOf', [
    manifest.proposer,
  ])
  await page.goto(`${dtfRoute}/governance`)
  const upcoming = page.getByTestId('upcoming-vote-lock')
  await expect(upcoming).toContainText(
    `Lock ${underlyingSymbol} in ${newSymbol}`,
    { timeout: 120_000 }
  )
  await page.screenshot({ path: `${evidenceDir}/00-upcoming-card.png` })
  await page.getByTestId('upcoming-vote-lock-cta').click()
  await page.getByTestId('vote-lock-input').fill('1000')
  await expect(page.getByTestId('vote-lock-output')).not.toHaveValue('', {
    timeout: 120_000,
  })
  await page.getByRole('dialog').getByRole('checkbox').click()
  const lockSubmit = page.getByTestId('vote-lock-submit')
  await expect(lockSubmit).toContainText('Approve', { timeout: 120_000 })
  await lockSubmit.click()
  await expect(lockSubmit).toContainText(`Vote lock ${underlyingSymbol}`, {
    timeout: 120_000,
  })
  await expect(lockSubmit).toBeEnabled({ timeout: 120_000 })
  await page.screenshot({ path: `${evidenceDir}/00-upcoming-drawer.png` })
  await lockSubmit.click()
  await expect
    .poll(
      () => read<bigint>(manifest.newVault, 'balanceOf', [manifest.proposer]),
      { timeout: 120_000 }
    )
    .toBeGreaterThan(sharesBeforeLock)
  await page.keyboard.press('Escape')

  // Before the DTF migrates, banner 2 lists it as still governed by the old vault and stays disabled.
  await page.goto(`${dtfRoute}/governance/propose`)
  await expect(
    page.getByTestId('governance-retire-vote-lock-pending')
  ).toContainText(manifest.symbol, { timeout: 120_000 })
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
  expect(upgradeArgs[2]).toBe(manifest.newVault)
  expect((upgradeArgs[3] as string).toLowerCase()).toBe(
    manifest.ownerGovernor.toLowerCase()
  )
  expect(upgradeArgs[8]).toBe(getAddress(manifest.feeRecipient))

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
  expect(deployment.stakingVault).toBe(manifest.newVault)
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
    manifest.newVault
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
  // A zero fee recipient makes the spell pay the old vault's share straight to the new vault.
  const expectedRecipient =
    manifest.feeRecipient === zeroAddress ? manifest.newVault : manifest.feeRecipient
  expect(recipients).toContain(expectedRecipient.toLowerCase())
  expect(recipients).not.toContain(manifest.oldVault.toLowerCase())

  // Banner 2: retire the old vault through its DAO governor (no dependent left after the DTF migrated).
  await syncBrowserClock(page)
  await page.goto(`${dtfRoute}/governance/propose`)
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
    manifest.newVault,
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
  await visitor.goto(`${dtfRoute}/governance`)
  const prompt = visitor.getByTestId('vote-lock-migration-card')
  await expect(prompt).toContainText('Connect to check', { timeout: 120_000 })
  await capture('governance-disconnected', visitor, prompt)
  await visitor.close()

  await page.goto(`${dtfRoute}/governance`)
  await expect(card).toBeVisible({ timeout: 120_000 })
  await expect(page.getByTestId('vote-lock-open-btn')).toHaveCount(0)
  await capture('governance-card')

  // Portfolio lists the old position from the Reserve API; the fork's reads mark it as needing migration.
  await page.goto('/portfolio')
  await expect(card).toContainText('vote-lock', { timeout: 120_000 })
  await capture('portfolio-banner')
  await capture('portfolio-row', page, page.getByTestId('vote-lock-migration-row-action'))

  await page.goto(`${dtfRoute}/overview`)
  await expect(wallet).toBeVisible({ timeout: 60_000 })
  await capture('overview-card')

  await page.goto(`${dtfRoute}/governance`)
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
  await expect(card).toContainText(`locked in ${newSymbol}`)
  await capture('card-complete')
  await page.getByTestId('vote-lock-migration-dismiss').click()
  await expect(card).toHaveCount(0)
  await expect(page.getByTestId('vote-lock-open-btn')).toBeVisible({ timeout: 120_000 })

  expect(
    await read<bigint>(manifest.oldVault, 'balanceOf', [manifest.proposer])
  ).toBe(0n)
  const newShares =
    (await read<bigint>(manifest.newVault, 'balanceOf', [
      manifest.proposer,
    ])) - newSharesBefore
  expect(newShares).toBeGreaterThan(0n)
  // The holder keeps the delegate they had on the old vault (self when they had none).
  const expectedDelegate =
    oldDelegate.toLowerCase() === zeroAddress ? manifest.proposer : oldDelegate
  expect(
    (
      await read<Address>(manifest.newVault, 'delegates', [
        manifest.proposer,
      ])
    ).toLowerCase()
  ).toBe(expectedDelegate.toLowerCase())
  expect(
    await read<bigint>(manifest.newVault, 'getVotes', [expectedDelegate])
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
        receivedNewVaultShares: newShares.toString(),
      },
      null,
      2
    )
  )
})
