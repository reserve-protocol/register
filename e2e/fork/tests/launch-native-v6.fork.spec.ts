import { expect, test } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  createPublicClient,
  decodeEventLog,
  decodeFunctionData,
  http,
  parseAbi,
} from 'viem'
import { installForkWallet } from '../helpers/fork-wallet'

// Stack lane on the protocol sandbox (chain 1): the native 6.0.0 folio's launcher
// opens a second auction from the Register UI. The write goes Register → SDK →
// fork; the read-back goes fork → fork Graph Node → Register. Requires
// `sandbox.sh all` and `prepare-native-v6.mjs` first.
const rpcUrl = process.env.FORK_RPC_URL_1 ?? 'http://127.0.0.1:8545'
const subgraphUrl =
  process.env.FORK_SUBGRAPH_URL_1 ??
  'http://127.0.0.1:18000/subgraphs/name/dtf-index-subgraph-fork'
const manifestPath = resolve('e2e/fork/.state/1/native-v6-scenario.json')
const evidenceDir =
  process.env.E2E_EVIDENCE_DIR ?? resolve('temp/evidence/fork-1')

interface Manifest {
  dtf: `0x${string}`
  launcher: `0x${string}`
  rebalanceNonce: string
  forkBlock: string
  forkBlockHash: `0x${string}`
  forkTimestamp: string
  maxAuctionLength: string
  nextAuctionIdBefore: string
  proposalId?: string
  proposalDescription?: string
}

const abi = parseAbi([
  'function nextAuctionId() view returns (uint256)',
  'function auctions(uint256) view returns (uint256 rebalanceNonce,uint256 startTime,uint256 endTime)',
  'function openAuction(uint256 rebalanceNonce, address[] tokens, (uint256 low,uint256 spot,uint256 high)[] newWeights, (uint256 low,uint256 high)[] newPrices, (uint256 low,uint256 spot,uint256 high) newLimits, uint256 auctionLength) returns (uint256)',
  'event AuctionOpened(uint256 indexed rebalanceNonce, uint256 indexed auctionId, address[] tokens, (uint256 low,uint256 spot,uint256 high)[] weights, (uint256 low,uint256 high)[] prices, (uint256 low,uint256 spot,uint256 high) limits, uint256 startTime, uint256 endTime)',
])

test.skip(
  process.env.FORK_CHAIN_ID !== '1',
  'sandbox lane only (FORK_CHAIN_ID=1)'
)
test.skip(!existsSync(manifestPath), 'run prepare-native-v6.mjs first')
// Cold fork reads, a governance-started rebalance, and two subgraph waits.
test.setTimeout(360_000)

async function querySubgraph<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = await fetch(subgraphUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const json = (await res.json()) as {
    data?: T
    errors?: { message: string }[]
  }
  if (json.errors?.length)
    throw new Error(json.errors.map((e) => e.message).join('; '))
  return json.data as T
}

test('native 6.0.0 launcher opens a second auction from the UI and the stack reads it back', async ({
  page,
}) => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest
  const client = createPublicClient({
    transport: http(rpcUrl, { timeout: 120_000 }),
  })
  mkdirSync(evidenceDir, { recursive: true })
  const pinned = await client.getBlock({
    blockNumber: BigInt(manifest.forkBlock),
  })
  expect(pinned.hash).toBe(manifest.forkBlockHash)

  const consoleErrors: string[] = []
  const failedUrls: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300))
  })
  page.on('response', (res) => {
    if (res.status() >= 400)
      failedUrls.push(
        `${res.status()} ${new URL(res.url()).host}${new URL(res.url()).pathname.slice(0, 60)}`
      )
  })
  const dumpDiagnostics = async () => {
    await page
      .screenshot({ path: `${evidenceDir}/diag-failure.png`, fullPage: true })
      .catch(() => undefined)
    const label = await page
      .getByTestId('auctions-launch-btn')
      .textContent({ timeout: 2_000 })
      .catch(() => null)
    const priceMsg = await page
      .getByTestId('auctions-price-unavailable')
      .textContent({ timeout: 2_000 })
      .catch(() => null)
    const live = await page
      .getByTestId('auctions-live-state-unavailable')
      .textContent({ timeout: 2_000 })
      .catch(() => null)
    console.log(
      '[fork-diag] launch button:',
      label,
      '| price:',
      priceMsg,
      '| live:',
      live
    )
    console.log('[fork-diag] console errors:', consoleErrors.slice(0, 10))
    console.log(
      '[fork-diag] failed urls:',
      [...new Set(failedUrls)].slice(0, 15)
    )
  }

  await installForkWallet(page, {
    address: manifest.launcher,
    chainId: 1,
    rpcUrl,
  })
  // The browser clock must agree with the fork, and keep ticking.
  await page.clock.install({
    time: (Number(manifest.forkTimestamp) + 30) * 1000,
  })

  // Register joins rebalances to proposals through the subgraph, so the fork
  // Graph Node must have this run's execution block before the list is trusted.
  await expect
    .poll(
      async () => {
        const data = await querySubgraph<{
          _meta: { block: { number: number } }
        }>('{ _meta { block { number } } }', {})
        return data._meta.block.number
      },
      { timeout: 120_000, intervals: [2_000] }
    )
    .toBeGreaterThanOrEqual(Number(manifest.forkBlock))

  await page.goto(`/ethereum/index-dtf/${manifest.dtf}/auctions`)
  const wallet = page.getByTestId('header-wallet')
  try {
    await expect(wallet).toBeVisible({ timeout: 15_000 })
  } catch {
    await page.getByTestId('header-connect-btn').click()
    await page.getByRole('button', { name: 'Fork Wallet' }).click()
    await expect(wallet).toBeVisible()
  }

  // The rebalance was started through governance (the lane's SDK proposal, or
  // the sandbox's own), so the subgraph join renders it as active without any
  // impersonated start. Earlier runs leave their rebalances on the persistent
  // fork, so pick this run's by its proposal description when the manifest has it.
  const activeItems = page.getByTestId('auctions-active-item')
  const activeItem = manifest.proposalDescription
    ? activeItems.filter({ hasText: manifest.proposalDescription })
    : activeItems.first()
  try {
    await expect(activeItem).toBeVisible({ timeout: 120_000 })
  } catch (error) {
    await dumpDiagnostics()
    throw error
  }
  await activeItem.click()
  await expect(page.getByTestId('dtf-auctions')).toBeVisible()
  if (manifest.proposalId) {
    await expect(page).toHaveURL(
      new RegExp(`/rebalance/${manifest.proposalId}$`)
    )
  }
  const rebalanceTitle = manifest.proposalDescription ?? ''
  await expect(page.getByTestId('auctions-rebalance-title')).toContainText(
    rebalanceTitle,
    { timeout: 60_000 }
  )

  const launch = page.getByTestId('auctions-launch-btn')
  await expect(launch).toBeVisible({ timeout: 150_000 })
  try {
    await expect(launch).toBeEnabled({ timeout: 150_000 })
  } catch (error) {
    await dumpDiagnostics()
    throw error
  }
  await page.screenshot({
    path: `${evidenceDir}/01-before-launch.png`,
    fullPage: true,
  })

  const before = await client.readContract({
    address: manifest.dtf,
    abi,
    functionName: 'nextAuctionId',
  })
  expect(before).toBe(BigInt(manifest.nextAuctionIdBefore))

  await launch.click()

  await expect
    .poll(
      () =>
        client.readContract({
          address: manifest.dtf,
          abi,
          functionName: 'nextAuctionId',
        }),
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
  expect(endTime - startTime).toBe(BigInt(manifest.maxAuctionLength))

  // Earlier lane runs leave their auctions on the persistent fork; pick this run's by id.
  const latestBlock = await client.getBlockNumber()
  const logs = (
    await client.getLogs({
      address: manifest.dtf,
      event: abi[3],
      args: { auctionId: before },
      fromBlock: BigInt(manifest.forkBlock),
      toBlock: latestBlock,
    })
  ).filter((log) => log.args.rebalanceNonce === BigInt(manifest.rebalanceNonce))
  expect(logs.length).toBe(1)
  const opened = decodeEventLog({
    abi,
    data: logs[0].data,
    topics: logs[0].topics,
  })
  const receipt = await client.getTransactionReceipt({
    hash: logs[0].transactionHash,
  })
  expect(receipt.status).toBe('success')
  expect(receipt.from.toLowerCase()).toBe(manifest.launcher.toLowerCase())
  // The UI sent the Folio 6.0 six-argument call with the folio's max auction length.
  const tx = await client.getTransaction({ hash: logs[0].transactionHash })
  const decoded = decodeFunctionData({ abi, data: tx.input })
  expect(decoded.functionName).toBe('openAuction')
  expect(decoded.args).toHaveLength(6)
  expect(decoded.args[5]).toBe(BigInt(manifest.maxAuctionLength))

  // The launcher closes from chain state first (RPC-first refresh flips the
  // gate); once the subgraph auctions arrive the button unmounts and the active
  // auction card takes its place. Either state proves the write was read back.
  const auctionId = `${manifest.dtf.toLowerCase()}-${before.toString()}`
  const activeCard = page.locator(
    `[data-testid="auctions-active-auction"][data-auction-id="${auctionId}"]`
  )
  await expect
    .poll(
      async () => {
        if (await activeCard.count()) return 'active-card'
        if ((await launch.getAttribute('data-ongoing')) === 'true')
          return 'gate-closed'
        return 'open'
      },
      { timeout: 60_000, intervals: [1_000] }
    )
    .not.toBe('open')
  await page.screenshot({
    path: `${evidenceDir}/02-after-launch.png`,
    fullPage: true,
  })

  // The fork subgraph indexes the new auction from the same chain the UI wrote to.
  await expect
    .poll(
      async () => {
        const data = await querySubgraph<{
          auction: { id: string } | null
          _meta: { block: { number: number } }
        }>(
          'query($id: ID!) { auction(id: $id) { id } _meta { block { number } } }',
          { id: auctionId }
        )
        return (
          data.auction?.id ??
          `indexed ${data._meta.block.number} < ${receipt.blockNumber}`
        )
      },
      { timeout: 120_000, intervals: [2_000] }
    )
    .toBe(auctionId)

  // Register reads the same subgraph: a cold reload rebuilds the page from the fork
  // subgraph and the fork RPC, lands on the same rebalance (the route keeps the
  // selection) and shows the auction it just opened as live, launcher hidden.
  await page.reload()
  await expect(page.getByTestId('auctions-rebalance-title')).toContainText(
    rebalanceTitle,
    { timeout: 150_000 }
  )
  await expect(activeCard).toBeVisible({ timeout: 150_000 })
  await expect(activeCard).toContainText('Bidding is ongoing')
  await expect(page.getByTestId('auctions-launch-btn')).toHaveCount(0)
  await page.screenshot({
    path: `${evidenceDir}/03-after-reload.png`,
    fullPage: true,
  })

  writeFileSync(
    `${evidenceDir}/receipt.json`,
    JSON.stringify(
      {
        chainId: 1,
        dtf: manifest.dtf,
        launcher: manifest.launcher,
        proposalId: manifest.proposalId,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber.toString(),
        status: receipt.status,
        auctionId: before.toString(),
        rebalanceNonce: rebalanceNonce.toString(),
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        auctionLengthArg: String(decoded.args[5]),
        subgraphAuctionId: auctionId,
        event: {
          name: opened.eventName,
          args: JSON.parse(
            JSON.stringify(opened.args, (_, v) =>
              typeof v === 'bigint' ? v.toString() : v
            )
          ),
        },
      },
      null,
      2
    )
  )
})
