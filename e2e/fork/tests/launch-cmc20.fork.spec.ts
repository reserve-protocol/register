import { expect, test } from '@playwright/test'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createPublicClient, decodeEventLog, http, parseAbi } from 'viem'
import { installForkWallet } from '../helpers/fork-wallet'

// Real launch on the BSC fork: the impersonated CMC20 auction launcher opens an
// auction from the Register UI; state is verified on the fork with viem, not
// from the page. Requires the fork pinned inside the launcher window and
// `prepare-cmc20.mjs` run first.
const rpcUrl = process.env.FORK_RPC_URL_56 ?? 'http://127.0.0.1:8547'
const manifestPath = resolve('e2e/fork/.state/56/cmc20-scenario.json')
const evidenceDir = process.env.E2E_EVIDENCE_DIR ?? resolve('temp/evidence/fork-56')

interface Manifest {
  dtf: `0x${string}`
  launcher: `0x${string}`
  rebalanceNonce: string
  forkBlock: string
  forkBlockHash: `0x${string}`
  forkTimestamp: string
  nextAuctionIdBefore: string
}

const abi = parseAbi([
  'function nextAuctionId() view returns (uint256)',
  'function auctions(uint256) view returns (uint256 rebalanceNonce,uint256 startTime,uint256 endTime)',
  'event AuctionOpened(uint256 indexed rebalanceNonce, uint256 indexed auctionId, address[] tokens, (uint256 low,uint256 spot,uint256 high)[] weights, (uint256 low,uint256 high)[] prices, (uint256 low,uint256 spot,uint256 high) limits, uint256 startTime, uint256 endTime)',
])

test('cmc20 launcher opens an auction on the BSC fork from the UI', async ({ page }) => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest
  const client = createPublicClient({ transport: http(rpcUrl, { timeout: 120_000 }) })
  mkdirSync(evidenceDir, { recursive: true })
  // Same fork identity the manifest was prepared on, not just any later head.
  const pinned = await client.getBlock({ blockNumber: BigInt(manifest.forkBlock) })
  expect(pinned.hash).toBe(manifest.forkBlockHash)

  // Diagnostics for a failed run: console errors and fork RPC errors.
  const consoleErrors: string[] = []
  const rpcErrors: string[] = []
  const failedUrls: string[] = []
  const forkCalls: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300))
  })
  page.on('requestfailed', (req) => failedUrls.push(`${req.failure()?.errorText} ${new URL(req.url()).host}`))
  page.on('request', (req) => {
    if (!req.url().startsWith(rpcUrl)) return
    try {
      const body = JSON.parse(req.postData() ?? 'null') as
        | { method: string; params?: unknown[] }
        | { method: string; params?: unknown[] }[]
      for (const item of Array.isArray(body) ? body : [body]) {
        const call = item.params?.[0] as { to?: string; data?: string } | undefined
        forkCalls.push(
          item.method === 'eth_call'
            ? `eth_call ${call?.to?.slice(0, 10)} ${call?.data?.slice(0, 10)}`
            : item.method
        )
      }
    } catch {
      /* not json */
    }
  })
  page.on('response', async (res) => {
    if (res.status() >= 400) failedUrls.push(`${res.status()} ${new URL(res.url()).host}${new URL(res.url()).pathname.slice(0, 40)}`)
    if (!res.url().startsWith(rpcUrl)) return
    try {
      const body = (await res.json()) as { error?: { message?: string } } | { error?: { message?: string } }[]
      const items = Array.isArray(body) ? body : [body]
      for (const item of items) if (item?.error) rpcErrors.push(String(item.error.message).slice(0, 200))
    } catch {
      /* not json */
    }
  })
  test.info().annotations.push({ type: 'diag', description: 'see stdout on failure' })
  const dumpDiagnostics = async () => {
    await page.screenshot({ path: `${evidenceDir}/diag-failure.png`, fullPage: true }).catch(() => undefined)
    const label = await page.getByTestId('auctions-launch-btn').textContent({ timeout: 2_000 }).catch(() => null)
    const priceMsg = await page.getByTestId('auctions-price-unavailable').textContent({ timeout: 2_000 }).catch(() => null)
    const buttons = await page.locator('[data-testid="dtf-auctions"] button').allTextContents().catch(() => [])
    console.log('[fork-diag] launch button:', label, '| price:', priceMsg, '| buttons:', buttons.slice(0, 12))
    console.log('[fork-diag] console errors:', consoleErrors.slice(0, 10))
    console.log('[fork-diag] rpc errors:', rpcErrors.slice(0, 10))
    console.log('[fork-diag] failed urls:', [...new Set(failedUrls)].slice(0, 15))
    const counts = new Map<string, number>()
    for (const c of forkCalls) counts.set(c, (counts.get(c) ?? 0) + 1)
    console.log('[fork-diag] fork calls:', [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25))
  }

  await installForkWallet(page, { address: manifest.launcher, chainId: 56, rpcUrl })
  // The chain sits at the fork timestamp; the browser must agree or the window
  // (and the auction) read as expired against today's wall clock. The clock
  // keeps ticking: a paused clock starves the real network path.
  await page.clock.install({ time: (Number(manifest.forkTimestamp) + 30) * 1000 })

  await page.goto(`/bsc/index-dtf/${manifest.dtf}/auctions`)
  // wagmi auto-connects the injected wallet in most runs; drive the modal otherwise.
  const wallet = page.getByTestId('header-wallet')
  try {
    await expect(wallet).toBeVisible({ timeout: 15_000 })
  } catch {
    await page.getByTestId('header-connect-btn').click()
    await page.getByRole('button', { name: 'Fork Wallet' }).click()
    await expect(wallet).toBeVisible()
  }

  const activeItem = page.getByTestId('auctions-active-item').first()
  await expect(activeItem).toBeVisible({ timeout: 120_000 })
  await activeItem.click()
  await expect(page.getByTestId('dtf-auctions')).toBeVisible()

  const launch = page.getByTestId('auctions-launch-btn')
  await expect(launch).toBeVisible({ timeout: 150_000 })
  try {
    await expect(launch).toBeEnabled({ timeout: 150_000 })
  } catch (error) {
    await dumpDiagnostics()
    throw error
  }
  await page.screenshot({ path: `${evidenceDir}/01-before-launch.png`, fullPage: true })

  const before = await client.readContract({ address: manifest.dtf, abi, functionName: 'nextAuctionId' })
  expect(before).toBe(BigInt(manifest.nextAuctionIdBefore))

  await launch.click()

  // Receipt on the fork: exactly one new auction for the live rebalance nonce.
  await expect
    .poll(
      () => client.readContract({ address: manifest.dtf, abi, functionName: 'nextAuctionId' }),
      { timeout: 60_000 }
    )
    .toBe(before + 1n)
  const [rebalanceNonce, startTime, endTime] = await client.readContract({
    address: manifest.dtf,
    abi,
    functionName: 'auctions',
    args: [before],
  })
  expect(rebalanceNonce).toBe(BigInt(manifest.rebalanceNonce))
  expect(endTime).toBeGreaterThan(startTime)

  const latestBlock = await client.getBlockNumber()
  const logs = await client.getLogs({
    address: manifest.dtf,
    event: abi[2],
    fromBlock: latestBlock - 5n,
    toBlock: latestBlock,
  })
  expect(logs.length).toBe(1)
  const opened = decodeEventLog({ abi, data: logs[0].data, topics: logs[0].topics })
  const receipt = await client.getTransactionReceipt({ hash: logs[0].transactionHash })
  expect(receipt.status).toBe('success')
  expect(receipt.from.toLowerCase()).toBe(manifest.launcher.toLowerCase())

  // RPC-first refresh: the gate flips to ongoing from chain state.
  await expect(launch).toHaveAttribute('data-ongoing', 'true', { timeout: 60_000 })
  await expect(launch).toBeDisabled()
  await page.screenshot({ path: `${evidenceDir}/02-after-launch.png`, fullPage: true })

  writeFileSync(
    `${evidenceDir}/receipt.json`,
    JSON.stringify(
      {
        chainId: 56,
        dtf: manifest.dtf,
        launcher: manifest.launcher,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber.toString(),
        status: receipt.status,
        auctionId: before.toString(),
        rebalanceNonce: rebalanceNonce.toString(),
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        event: { name: opened.eventName, args: JSON.parse(JSON.stringify(opened.args, (_, v) => (typeof v === 'bigint' ? v.toString() : v))) },
      },
      null,
      2
    )
  )
})
