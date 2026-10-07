import { expect, test, type Page } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  type Address,
  type PublicClient,
  createPublicClient,
  decodeFunctionData,
  getAddress,
  http,
  parseAbi,
} from 'viem'
import { folioV6Abi } from '@reserve-protocol/react-sdk'
import { installForkWallet } from '../helpers/fork-wallet'
import { forkGovernance } from '../helpers/governance'

// Folio 6.0 basket proposal from the Register UI on the Base fork, after the
// upgrade lane moved MIDAS to 6.0.0: the proposal carries the next rebalance nonce
// and a deadline covering the trading governor's lifecycle plus three days; it is
// voted, queued and executed, and the rebalance starts on-chain with that nonce.
// Requires `upgrade-v6.fork.spec.ts` (MIDAS) on the same Anvil and the subgraph proxy.
const rpcUrl = process.env.FORK_RPC_URL_8453 ?? 'http://127.0.0.1:8546'
const subgraphUrl = process.env.FORK_SUBGRAPH_URL_8453 ?? 'http://127.0.0.1:18310'
const manifestPath = resolve('e2e/fork/.state/8453/v6-upgrade-scenario.json')
const evidenceDir =
  process.env.E2E_EVIDENCE_DIR ?? resolve('temp/evidence/fork-8453-v6-basket')
const DEADLINE_BUFFER = 3n * 86_400n
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const WETH = '0x4200000000000000000000000000000000000006'
const CBBTC = '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf'

const readAbi = parseAbi([
  'function version() view returns (string)',
  'function getRebalanceNonce() view returns (uint256)',
  'function tradeAllowlistEnabled() view returns (bool)',
  'function votingDelay() view returns (uint256)',
  'function votingPeriod() view returns (uint256)',
  'function timelock() view returns (address)',
  'function getMinDelay() view returns (uint256)',
  'function optimisticParams() view returns (uint48 vetoDelay, uint32 vetoPeriod, uint256 vetoThreshold)',
])

type Target = { symbol: string; dtf: Address; voter: Address }
type Manifest = { targets: Target[] }

test.skip(process.env.FORK_CHAIN_ID !== '8453', 'Base lane only')
test.skip(!existsSync(manifestPath), 'run prepare-v6-upgrade.mjs and the upgrade lane first')
test.describe.configure({ mode: 'serial' })

const setup = () => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest
  const target = manifest.targets.find((t) => t.symbol === 'MIDAS')!
  const client = createPublicClient({ transport: http(rpcUrl, { timeout: 120_000 }) })
  const read = <T>(address: Address, functionName: string) =>
    client.readContract({ address, abi: readAbi, functionName: functionName as never }) as Promise<T>
  mkdirSync(evidenceDir, { recursive: true })
  return { target, client, read }
}

// Opens the basket proposal as the voter and loads a two-token basket from CSV.
const openBasketProposal = async (
  page: Page,
  client: PublicClient,
  target: Target,
  csv: string
) => {
  await installForkWallet(page, { address: target.voter, chainId: 8453, rpcUrl })
  await page.clock.install({ time: Number((await client.getBlock()).timestamp + 30n) * 1000 })
  await forkGovernance(client).syncBrowserClock(page)
  await page.goto(`/base/index-dtf/${target.dtf}/governance/propose/basket`)
  const wallet = page.getByTestId('header-wallet')
  try {
    await expect(wallet).toBeVisible({ timeout: 15_000 })
  } catch {
    await page.getByTestId('header-connect-btn').click()
    await page.getByRole('button', { name: 'Fork Wallet' }).click()
    await expect(wallet).toBeVisible()
  }
  await page.getByTestId('basket-step-basket').click()
  await expect(page.locator('table input').first()).toBeVisible({ timeout: 120_000 })
  await page.locator('input[type="file"]').setInputFiles({
    name: 'basket.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(`symbol,address,value\n${csv}`),
  })
  await expect(page.locator('table input')).toHaveCount(2, { timeout: 30_000 })
}

test('MIDAS on Folio 6.0 proposes, passes and starts a basket rebalance from the Register UI', async ({
  page,
}) => {
  test.setTimeout(420_000)
  const { target, client, read } = setup()
  const { proposeFromBanner, passProposal } = forkGovernance(client)
  test.skip((await read<string>(target.dtf, 'version')) !== '6.0.0', 'MIDAS is not on 6.0.0 yet')

  const { data } = await (
    await fetch(subgraphUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `{ dtf(id: "${target.dtf.toLowerCase()}") { tradingGovernance { id } } }`,
      }),
    })
  ).json()
  const governor = getAddress(data.dtf.tradingGovernance.id)
  const nonceBefore = await read<bigint>(target.dtf, 'getRebalanceNonce')

  await openBasketProposal(page, client, target, `USDC,${USDC},50\nWETH,${WETH},50`)
  await page.screenshot({ path: `${evidenceDir}/basket-step.png`, fullPage: true })
  await page.getByTestId('basket-confirm-btn').click()
  await page.locator('#title').fill('Folio 6.0 basket: USDC/WETH 50/50')
  await expect(page.getByTestId('rebalance-preview-v6-terms')).toBeVisible({ timeout: 60_000 })

  const confirmedAt = BigInt(Math.floor((await page.evaluate(() => Date.now())) / 1000))
  const [votingDelay, votingPeriod, timelock, veto] = await Promise.all([
    read<bigint>(governor, 'votingDelay'),
    read<bigint>(governor, 'votingPeriod'),
    read<Address>(governor, 'timelock'),
    read<readonly [number, number, bigint]>(governor, 'optimisticParams').catch(() => undefined),
  ])
  const timelockDelay = await read<bigint>(timelock, 'getMinDelay')
  const lifecycle =
    votingDelay +
    votingPeriod +
    timelockDelay +
    (veto ? BigInt(veto[0]) + BigInt(veto[1]) : 0n) +
    DEADLINE_BUFFER

  const proposal = await proposeFromBanner(
    page,
    governor,
    'basket-propose-submit',
    `${evidenceDir}/confirm.png`
  )
  expect(proposal.targets).toEqual([getAddress(target.dtf)])
  const call = decodeFunctionData({ abi: folioV6Abi, data: proposal.calldatas[0] })
  expect(call.functionName).toBe('startRebalance')
  const args = call.args as unknown as readonly unknown[]
  expect(args[0]).toBe(nonceBefore + 1n)
  const deadline = args[5] as bigint
  // The deadline anchors at confirmation: allow the seconds between that click and this read.
  expect(deadline - confirmedAt - lifecycle).toBeGreaterThanOrEqual(-120n)
  expect(deadline - confirmedAt - lifecycle).toBeLessThanOrEqual(120n)
  const tokens = (args[1] as { token: Address }[]).map((t) => getAddress(t.token))
  expect(new Set(tokens)).toEqual(new Set([getAddress(USDC), getAddress(WETH)]))

  const executed = await passProposal(governor, target.voter, proposal)
  expect(executed.status).toBe('success')
  expect(await read<bigint>(target.dtf, 'getRebalanceNonce')).toBe(nonceBefore + 1n)
  expect((await client.getBlock()).timestamp).toBeLessThanOrEqual(deadline)

  writeFileSync(
    `${evidenceDir}/MIDAS.json`,
    JSON.stringify(
      {
        governor,
        proposalId: proposal.proposalId.toString(),
        proposalTx: proposal.transactionHash,
        executeTx: executed.transactionHash,
        rebalanceNonce: (nonceBefore + 1n).toString(),
        deadline: deadline.toString(),
        lifecycleSeconds: lifecycle.toString(),
      },
      null,
      2
    )
  )
})

test('MIDAS on Folio 6.0 blocks a basket proposal with a token outside its enforced trade allowlist', async ({
  page,
}) => {
  test.setTimeout(300_000)
  const { target, client, read } = setup()
  test.skip((await read<string>(target.dtf, 'version')) !== '6.0.0', 'MIDAS is not on 6.0.0 yet')
  test.skip(
    !(await read<boolean>(target.dtf, 'tradeAllowlistEnabled')),
    'run settings-v6.fork.spec.ts first to enforce the allowlist'
  )

  await openBasketProposal(page, client, target, `USDC,${USDC},50\ncbBTC,${CBBTC},50`)
  await page.getByTestId('basket-confirm-btn').click()
  await page.locator('#title').fill('Not allowlisted')
  const blocked = page.getByTestId('basket-propose-not-allowlisted')
  await expect(blocked).toBeVisible({ timeout: 60_000 })
  await expect(blocked).toBeDisabled()
  await expect(page.getByTestId('basket-propose-submit')).toHaveCount(0)
  await page.screenshot({ path: `${evidenceDir}/not-allowlisted.png`, fullPage: true })
})
