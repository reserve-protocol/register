import { expect, test, type Page } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  type Address,
  createPublicClient,
  decodeFunctionData,
  getAddress,
  http,
  parseAbi,
  parseEther,
} from 'viem'
import { folioV6Abi } from '@reserve-protocol/react-sdk'
import { installForkWallet } from '../helpers/fork-wallet'
import { forkGovernance } from '../helpers/governance'

// Folio 6.0 DTF-settings proposal from the Register UI on the Base fork, after the
// upgrade lane moved MIDAS to 6.0.0: max auction length, holder share (self fee), a
// one-point revenue split change (two-table setFeeRecipients) and an enforced trade
// allowlist are proposed, voted, queued and executed; the new values are read back.
// Requires `upgrade-v6.fork.spec.ts` (MIDAS) on the same Anvil and the subgraph proxy.
const rpcUrl = process.env.FORK_RPC_URL_8453 ?? 'http://127.0.0.1:8546'
const manifestPath = resolve('e2e/fork/.state/8453/v6-upgrade-scenario.json')
const evidenceDir =
  process.env.E2E_EVIDENCE_DIR ?? resolve('temp/evidence/fork-8453-v6-settings')
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const WETH = '0x4200000000000000000000000000000000000006'

const readAbi = parseAbi([
  'function version() view returns (string)',
  'function maxAuctionLength() view returns (uint256)',
  'function folioFeeForSelf() view returns (uint256)',
  'function tradeAllowlistEnabled() view returns (bool)',
  'function getTokenAllowlist() view returns (address[])',
  'function feeRecipients(uint256) view returns (address recipient, uint96 portion)',
])

type Manifest = {
  targets: { symbol: string; dtf: Address; governor: Address; voter: Address }[]
}

test.skip(process.env.FORK_CHAIN_ID !== '8453', 'Base lane only')
test.skip(!existsSync(manifestPath), 'run prepare-v6-upgrade.mjs and the upgrade lane first')

const openSection = async (page: Page, id: string) => {
  await page.locator(`#propose-section-${id}`).getByRole('button').first().click()
}

test('MIDAS on Folio 6.0 changes its settings through governance from the Register UI', async ({
  page,
}) => {
  test.setTimeout(420_000)
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest
  const target = manifest.targets.find((t) => t.symbol === 'MIDAS')!
  const client = createPublicClient({ transport: http(rpcUrl, { timeout: 120_000 }) })
  const read = <T>(functionName: string, args: unknown[] = []) =>
    client.readContract({
      address: target.dtf,
      abi: readAbi,
      functionName: functionName as never,
      args: args as never,
    }) as Promise<T>
  const { syncBrowserClock, proposeFromBanner, passProposal } = forkGovernance(client)
  mkdirSync(evidenceDir, { recursive: true })

  test.skip((await read<string>('version')) !== '6.0.0', 'MIDAS is not on 6.0.0 yet')
  test.skip(
    await read<boolean>('tradeAllowlistEnabled'),
    'the allowlist is already enforced on this fork: restart Anvil and re-run the upgrade lane'
  )
  const maxBefore = await read<bigint>('maxAuctionLength')
  const newMinutes = maxBefore === 30n * 60n ? 45 : 30

  await installForkWallet(page, { address: target.voter, chainId: 8453, rpcUrl })
  await page.clock.install({ time: Number((await client.getBlock()).timestamp + 30n) * 1000 })
  await syncBrowserClock(page)
  await page.goto(`/base/index-dtf/${target.dtf}/governance/propose/dtf`)
  const wallet = page.getByTestId('header-wallet')
  try {
    await expect(wallet).toBeVisible({ timeout: 15_000 })
  } catch {
    await page.getByTestId('header-connect-btn').click()
    await page.getByRole('button', { name: 'Fork Wallet' }).click()
    await expect(wallet).toBeVisible()
  }

  await openSection(page, 'fees')
  const selfFee = page.locator('input[name="selfFee"]')
  await expect(selfFee).toHaveValue('0', { timeout: 120_000 })
  // Route the whole non-platform share to governance: one mutable recipient, the vault side.
  const registry = await client.readContract({
    address: target.dtf,
    abi: parseAbi(['function daoFeeRegistry() view returns (address)']),
    functionName: 'daoFeeRegistry',
  })
  const [, numerator, denominator] = await client.readContract({
    address: registry,
    abi: parseAbi([
      'function getFeeDetails(address) view returns (address, uint256, uint256, uint256)',
    ]),
    functionName: 'getFeeDetails',
    args: [target.dtf],
  })
  const platform = Number((numerator * 10_000n) / denominator) / 100
  await page.locator('input[name="deployerShare"]').fill('0')
  await page.locator('input[name="governanceShare"]').fill(String(100 - platform))
  await selfFee.fill('10')

  await openSection(page, 'auction')
  await page.locator('input[name="auctionLength"]').fill(String(newMinutes))

  await openSection(page, 'allowlist')
  await page.getByTestId('settings-trade-allowlist-enabled').click()
  await page.locator('input[name="tradeAllowlistTokens[0]"]').fill(USDC)
  await page.getByRole('button', { name: 'Add token' }).click()
  await page.locator('input[name="tradeAllowlistTokens[1]"]').fill(WETH)

  await expect(page.getByTestId('settings-trade-allowlist-changes')).toBeVisible()
  await page.screenshot({ path: `${evidenceDir}/changes.png`, fullPage: true })
  await page.getByTestId('settings-confirm-btn').click()
  await page.locator('#title').fill('Folio 6.0 settings')

  const proposal = await proposeFromBanner(
    page,
    target.governor,
    'settings-propose-submit',
    `${evidenceDir}/confirm.png`
  )
  const calls = proposal.calldatas.map((data) => decodeFunctionData({ abi: folioV6Abi, data }))
  expect(calls.map((call) => call.functionName).sort()).toEqual(
    [
      'addToAllowlist',
      'setFeeRecipients',
      'setFolioSelfFee',
      'setMaxAuctionLength',
      'setTradeAllowlistEnabled',
    ].sort()
  )
  expect(proposal.targets.every((t) => getAddress(t) === getAddress(target.dtf))).toBe(true)

  const executed = await passProposal(target.governor, target.voter, proposal)
  expect(executed.status).toBe('success')

  expect(await read<bigint>('maxAuctionLength')).toBe(BigInt(newMinutes * 60))
  expect(await read<bigint>('folioFeeForSelf')).toBe(parseEther('0.1'))
  expect(await read<boolean>('tradeAllowlistEnabled')).toBe(true)
  expect(new Set((await read<Address[]>('getTokenAllowlist')).map((t) => getAddress(t)))).toEqual(
    new Set([getAddress(USDC), getAddress(WETH)])
  )
  const feeCall = calls.find((call) => call.functionName === 'setFeeRecipients')!
  const [mutable] = feeCall.args as unknown as [{ recipient: Address; portion: bigint }[]]
  for (const [index, entry] of mutable.entries()) {
    const [recipient, portion] = await read<[Address, bigint]>('feeRecipients', [BigInt(index)])
    expect(getAddress(recipient)).toBe(getAddress(entry.recipient))
    expect(portion).toBe(entry.portion)
  }

  // The settings page reads the 6.0 values from RPC; the subgraph proxy stays at the fork block.
  await page.goto(`/base/index-dtf/${target.dtf}/settings`)
  await expect(page.getByTestId('settings-max-auction-length')).toContainText(`${newMinutes}m`, {
    timeout: 120_000,
  })
  await expect(page.getByTestId('settings-trade-allowlist')).toContainText('2')
  await expect(page.getByTestId('settings-fee-holders')).toBeVisible()
  await page.screenshot({ path: `${evidenceDir}/settings-page.png`, fullPage: true })

  writeFileSync(
    `${evidenceDir}/MIDAS.json`,
    JSON.stringify(
      {
        proposalId: proposal.proposalId.toString(),
        proposalTx: proposal.transactionHash,
        executeTx: executed.transactionHash,
        calls: calls.map((call) => call.functionName),
        maxAuctionLength: newMinutes * 60,
        feeRecipients: mutable.map((r) => ({ recipient: r.recipient, portion: r.portion.toString() })),
      },
      null,
      2
    )
  )
})
