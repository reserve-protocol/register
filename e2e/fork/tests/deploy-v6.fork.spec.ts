import { expect, test, type Locator, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  type Address,
  createPublicClient,
  encodeAbiParameters,
  getAddress,
  http,
  keccak256,
  pad,
  parseAbi,
  parseEther,
  parseEventLogs,
  toHex,
} from 'viem'
import { folioDeployerV6Abi, INDEX_DTF_V6_DEPLOYER_ADDRESS } from '@reserve-protocol/react-sdk'
import { installForkWallet } from '../helpers/fork-wallet'

// Folio 6.0.0 deploy wizard on the Base fork: governed by the live vlRSR (manual route) and, when a local
// zapper is wired (ZAPPER_LOCAL_URL + VITE_ZAPPER_DEPLOY_API=/zapper-local/), ungoverned through the zap route.
const rpcUrl = process.env.FORK_RPC_URL_8453 ?? 'http://127.0.0.1:8546'
const evidenceDir = process.env.E2E_EVIDENCE_DIR ?? resolve('temp/evidence/fork-8453/deploy-v6')
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address
const WETH = '0x4200000000000000000000000000000000000006' as Address
const VLRSR = '0x2F0D6538807a77d4AdDCd4b4DAf214Ea2E818E3D' as Address
const PERMANENT = '0x000000000000000000000000000000000000bEEF' as Address
const V6 = INDEX_DTF_V6_DEPLOYER_ADDRESS[8453]

const folioAbi = parseAbi([
  'function version() view returns (string)',
  'function maxAuctionLength() view returns (uint256)',
  'function folioFeeForSelf() view returns (uint256)',
  'function feeRecipients(uint256) view returns (address recipient, uint96 portion)',
  'function immutableFeeRecipients(uint256) view returns (address recipient, uint96 portion)',
  'function balanceOf(address) view returns (uint256)',
])
const governorAbi = parseAbi([
  'function optimisticParams() view returns (uint48 vetoDelay, uint32 vetoPeriod, uint256 vetoThreshold)',
  'function lateQuorumVoteExtension() view returns (uint48)',
])
const vaultAbi = parseAbi(['function tokenJar() view returns (address)'])

test.skip(process.env.FORK_CHAIN_ID !== '8453', 'Base lane only')

const client = createPublicClient({ transport: http(rpcUrl, { timeout: 120_000 }) })
const rpc = (method: string, params: unknown[]) =>
  client.request({ method: method as never, params: params as never })

// A fresh wallet per run (so approvals always run), funded with ETH, USDC (FiatToken balances live in slot 9) and WETH.
const fundWallet = async (seed: number) => {
  const wallet = getAddress(pad(toHex(BigInt(Date.now()) * 16n + BigInt(seed)), { size: 20 }))
  await rpc('anvil_impersonateAccount', [wallet])
  await rpc('anvil_setBalance', [wallet, toHex(parseEther('100'))])
  await rpc('anvil_setStorageAt', [
    USDC,
    keccak256(encodeAbiParameters([{ type: 'address' }, { type: 'uint256' }], [wallet, 9n])),
    pad(toHex(100_000_000_000n)),
  ])
  const hash = (await rpc('eth_sendTransaction', [
    { from: wallet, to: WETH, data: '0xd0e30db0', value: toHex(parseEther('5')) },
  ])) as `0x${string}`
  await client.waitForTransactionReceipt({ hash })
  return wallet
}

// Skeleton pulses loop forever; only the finite ones (the drawer slide-in) are awaited.
const settled = (focus: Locator) =>
  focus.evaluate((el) =>
    Promise.all(
      el
        .getAnimations({ subtree: true })
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined))
    )
  )

// A viewport as tall as the element keeps sticky chrome out of the shot and avoids scroll-stitched captures.
const capture = async (page: Page, name: string, focus: Locator) => {
  for (const [label, width] of [
    ['desktop', 1440],
    ['mobile', 390],
  ] as const) {
    await page.setViewportSize({ width, height: 900 })
    await settled(focus)
    const box = await focus.boundingBox()
    await page.setViewportSize({ width, height: Math.max(900, Math.ceil((box?.height ?? 0) + 240)) })
    await focus.scrollIntoViewIfNeeded()
    await settled(focus)
    await focus.screenshot({ path: `${evidenceDir}/${name}-${label}.png`, animations: 'disabled' })
  }
  await page.setViewportSize({ width: 1440, height: 900 })
}

// The click right after a capture's viewport resize can land before the layout settles and leave the drawer shut.
const openDrawer = (page: Page, ready: string) =>
  expect(async () => {
    if (!(await page.getByTestId(ready).isVisible())) await page.getByTestId('deploy-open-drawer').click()
    await expect(page.getByTestId(ready)).toBeVisible({ timeout: 5_000 })
  }).toPass({ timeout: 60_000 })

const section = (page: Page, id: string) => page.locator(`#deploy-section-${id}`)
const confirm = (page: Page, id: string) =>
  section(page, id).getByTestId(`deploy-confirm-${id}`).click()

const fillCommonSteps = async (page: Page, name: string, symbol: string) => {
  await page.goto('/internal/deploy')
  await page.locator('input[name="tokenName"]').fill(name)
  await page.locator('input[name="symbol"]').fill(symbol)
  await page.locator('input[name="mandate"]').fill('Fork-tested 6.0.0 deploy from the UI')
  await page.getByTestId('deploy-chain-8453').click()
  await confirm(page, 'metadata')

  const basket = section(page, 'basket')
  await basket.getByTestId('deploy-basket-add-token').click()
  for (const token of [USDC, WETH]) {
    await page.getByTestId('deploy-token-search').fill(token)
    await page.getByTestId(`deploy-token-option-${token.toLowerCase()}`).click()
  }
  await page.getByTestId('deploy-token-select-submit').click()
  await basket.getByTestId('deploy-basket-input-share').click()
  await basket.locator('input[name="tokensDistribution.0.percentage"]').fill('50')
  await basket.locator('input[name="tokensDistribution.1.percentage"]').fill('50')
  await confirm(page, 'basket')
}

// The platform share is read on chain by the wizard; the rest of the split is set against it.
const fillFees = async (page: Page, governed: boolean) => {
  const fees = section(page, 'revenue-distribution')
  await expect(fees.getByText(/^\d+(\.\d+)? %$/)).toBeVisible({ timeout: 60_000 })
  const platform = Number((await fees.getByText(/^\d+(\.\d+)? %$/).innerText()).replace(' %', ''))
  const pool = 100 - platform - 7 - 10
  await fees.locator('input[name="folioFee"]').fill('1')
  await fees.locator('input[name="mintFee"]').fill('0.3')
  await fees.locator('input[name="holderShare"]').fill('7')
  if (governed) {
    await fees.locator('input[name="deployerShare"]').fill(String(pool - 30))
    await fees.locator('input[name="governanceShare"]').fill('30')
  } else {
    await fees.locator('input[name="deployerShare"]').fill(String(pool))
  }
  await fees.getByTestId('deploy-add-permanentRevenueRecipients').click()
  await fees.locator('input[name="permanentRevenueRecipients[0].address"]').fill(PERMANENT)
  await fees.locator('input[name="permanentRevenueRecipients[0].share"]').fill('10')

  return platform
}

const fillRolesAuctionsAndGovernance = async (page: Page, wallet: Address, shoot: boolean) => {
  const roles = section(page, 'roles')
  for (const role of ['guardians', 'brandManagers', 'auctionLaunchers'])
    await roles.locator(`input[name="${role}[0]"]`).fill(wallet)
  await confirm(page, 'roles')

  const auctions = section(page, 'auctions')
  await auctions.locator('input[name="maxAuctionLength"]').fill('45')
  if (shoot) await capture(page, 'auctions', auctions)
  await confirm(page, 'auctions')

  const settings = section(page, 'governance-settings')
  await settings.getByTestId('deploy-optimistic-action-startRebalance').click()
  await settings.locator('input[name="optimisticProposers[0]"]').fill(wallet)
  if (shoot) await capture(page, 'governance-settings', settings)
  await confirm(page, 'governance-settings')
}

test('a Folio 6.0.0 governed by vlRSR deploys from the wizard (manual route)', async ({ page }) => {
  test.setTimeout(420_000)
  mkdirSync(evidenceDir, { recursive: true })
  const wallet = await fundWallet(1)
  await installForkWallet(page, { address: wallet, chainId: 8453, rpcUrl })

  await fillCommonSteps(page, 'Fork Six', 'FSIX')
  const governance = section(page, 'governance')
  await governance.getByTestId('deploy-governance-option-governanceVoteLock').click()
  await governance.locator('input[name="governanceVoteLock"]').fill(VLRSR)
  if (process.env.CAPTURE) await capture(page, 'governance-existing-vault', governance)
  await confirm(page, 'governance')

  await fillFees(page, true)
  if (process.env.CAPTURE) await capture(page, 'fees', section(page, 'revenue-distribution'))
  await confirm(page, 'revenue-distribution')
  await fillRolesAuctionsAndGovernance(page, wallet, !!process.env.CAPTURE)

  await openDrawer(page, 'deploy-tab-manual')
  const drawer = page.getByRole('dialog')
  await page.getByTestId('deploy-tab-manual').click()
  await page.getByTestId('deploy-manual-amount').fill('2')
  // The fork wallet has no batched calls, so the per-asset buttons pick up what the batch left.
  const submit = page.getByTestId('deploy-manual-submit')
  await page.getByTestId('deploy-approve-all').click()
  const approve = page.getByTestId('deploy-asset-approve')
  await expect
    .poll(async () => {
      if (await approve.count()) await approve.first().click().catch(() => {})
      return approve.count()
    }, { timeout: 120_000, intervals: [3_000] })
    .toBe(0)
  await expect(submit).toBeEnabled({ timeout: 120_000 })
  if (process.env.CAPTURE) await capture(page, 'manual-drawer', drawer)
  const fromBlock = await client.getBlockNumber()
  await submit.click()
  await expect(page.getByTestId('deploy-success')).toBeVisible({ timeout: 120_000 })
  if (process.env.CAPTURE) await capture(page, 'deploy-success', page.getByTestId('deploy-success'))

  const logs = await client.getLogs({ address: V6, fromBlock })
  const [event] = parseEventLogs({ abi: folioDeployerV6Abi, logs, eventName: 'GovernedFolioDeployed' })
  const { folio, ownerGovernor } = event.args
  const read = <T>(functionName: string, args: unknown[] = []) =>
    client.readContract({ address: folio, abi: folioAbi, functionName: functionName as never, args: args as never }) as Promise<T>
  const tokenJar = await client.readContract({ address: VLRSR, abi: vaultAbi, functionName: 'tokenJar' })

  expect(await read<string>('version')).toBe('6.0.0')
  expect(await read<bigint>('maxAuctionLength')).toBe(45n * 60n)
  expect(await read<bigint>('balanceOf', [wallet])).toBe(parseEther('2'))
  expect(await read<bigint>('folioFeeForSelf')).toBeGreaterThan(0n)
  const rows = [await read<readonly [Address, bigint]>('feeRecipients', [0n]), await read<readonly [Address, bigint]>('feeRecipients', [1n])]
  expect(rows.map(([recipient]) => recipient)).toContain(tokenJar)
  expect((await read<readonly [Address, bigint]>('immutableFeeRecipients', [0n]))[0]).toBe(PERMANENT)
  expect(
    await client.readContract({ address: ownerGovernor, abi: governorAbi, functionName: 'optimisticParams' })
  ).toEqual([4 * 3_600, 20 * 3_600, parseEther('0.01')])
  expect(
    await client.readContract({ address: ownerGovernor, abi: governorAbi, functionName: 'lateQuorumVoteExtension' })
  ).toBe(2 * 86_400)
})

test('an ungoverned Folio 6.0.0 deploys through the local zapper (simple route)', async ({ page }) => {
  test.skip(!process.env.ZAPPER_LOCAL_URL, 'needs a local zapper-api (ZAPPER_LOCAL_URL)')
  test.setTimeout(420_000)
  mkdirSync(evidenceDir, { recursive: true })
  const wallet = await fundWallet(2)
  await installForkWallet(page, { address: wallet, chainId: 8453, rpcUrl })

  await fillCommonSteps(page, 'Fork Zap', 'FZAP')
  const governance = section(page, 'governance')
  await governance.getByTestId('deploy-governance-option-governanceWalletAddress').click()
  await governance.locator('input[name="governanceWalletAddress"]').fill(wallet)
  await confirm(page, 'governance')
  await fillFees(page, false)
  await confirm(page, 'revenue-distribution')
  await fillRolesAuctionsAndGovernance(page, wallet, false)

  await openDrawer(page, 'deploy-simple')
  const drawer = page.getByTestId('deploy-simple')
  // The default input on Base is ETH.
  await drawer.locator('input').first().fill('0.01')
  const submit = page.getByTestId('deploy-zap-submit')
  await expect(submit).toBeEnabled({ timeout: 180_000 })
  if (process.env.CAPTURE) await capture(page, 'zap-drawer', drawer)
  // First click approves USDC to the ZapperDeployer, the second sends the quoted deploy.
  const fromBlock = await client.getBlockNumber()
  await submit.click()
  await expect
    .poll(async () => {
      if (await page.getByTestId('deploy-success').count()) return true
      // The zap route waits for 3 confirmations on Base; Anvil only mines on new transactions.
      await rpc('anvil_mine', ['0x3'])
      if (await submit.isEnabled().catch(() => false)) await submit.click().catch(() => {})
      return false
    }, { timeout: 240_000, intervals: [5_000] })
    .toBe(true)

  const logs = await client.getLogs({ address: V6, fromBlock })
  const [event] = parseEventLogs({ abi: folioDeployerV6Abi, logs, eventName: 'FolioDeployed' })
  const folio = event.args.folio
  expect(await client.readContract({ address: folio, abi: folioAbi, functionName: 'version' })).toBe('6.0.0')
  expect(await client.readContract({ address: folio, abi: folioAbi, functionName: 'balanceOf', args: [wallet] })).toBeGreaterThan(0n)
})
