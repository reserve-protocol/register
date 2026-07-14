import humanizeDuration from 'humanize-duration'
import type { Page } from '@playwright/test'
import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  formatUnits,
  getAddress,
  parseAbi,
  type Hex,
} from 'viem'
import { expect, test } from '../../fixtures/base'
import { connectWallet, test as walletTest } from '../../fixtures/wallet'
import { advanceTime, freezeTime } from '../../helpers/clock'
import type { MockOverrides } from '../../helpers/overrides'
import { dtfPath, findDtfByAddress, TEST_ADDRESS } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Index-DTF SETTINGS — value/behavior coverage, distinct from the shell smoke.
// Every asserted number is derived from the DTF snapshot through the SAME math
// the app + SDK apply, so a re-capture can shift figures without editing the
// spec. Boundary reads the settings page makes that the shared mock does not
// model (the DAO fee registry) are seeded per-test via `overrides`.

const DTF = findDtfByAddress('0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8')! // base/lcap (v5)

interface GovSnap {
  id: string
  votingDelay: string
  votingPeriod: string
  timelock: { id: string; guardians: string[]; executionDelay: string }
}
interface DtfSnapshot {
  dtf: {
    id: string
    deployer: string
    mintingFee: string
    annualizedTvlFee: string
    feeRecipients: string
    weightControl: boolean
    bidsEnabled: boolean
    auctionLaunchers: string[]
    brandManagers: string[]
    token: { name: string; symbol: string }
    stToken: {
      id: string
      token: { symbol: string }
      underlying: { symbol: string }
      governance: GovSnap
    }
    ownerGovernance: GovSnap
    tradingGovernance: GovSnap
  }
}

const { dtf: data } = loadSnapshot<DtfSnapshot>(`${DTF.snapshotDir}/dtf.json`)
const { version } = loadSnapshot<{ version: string }>(
  `${DTF.snapshotDir}/chain-state.json`
)

// --- replicas of the app's display transforms (src/utils) ---

// formatPercentage(value): value is already a percent number; render as en-US
// percent with ≤2 fraction digits (trailing zeros dropped — 1.50 → "1.5%").
function formatPercentage(value: number, decimals = 2): string {
  return (value / 100).toLocaleString('en-US', {
    style: 'percent',
    maximumFractionDigits: decimals,
  })
}
// shortenAddress(address, 4): checksum, then 0x + 4…4.
function shortAddr(address: string): string {
  const parsed = getAddress(address)
  return `${parsed.substring(0, 6)}...${parsed.substring(38)}`
}
// parseDuration(seconds): humanizeDuration in en (locale is pinned to en).
function humanize(seconds: string | number): string {
  return humanizeDuration(Number(seconds) * 1000, { language: 'en' })
}

// --- fee math (SDK mapFeeRecipients + component getFeeRecipients) ---

interface RawRecipient {
  address: string
  rawPercentage: bigint
}
function parseRecipients(): RawRecipient[] {
  return data.feeRecipients.split(',').map((entry) => {
    const [address, pct] = entry.split(':')
    return { address: address.toLowerCase(), rawPercentage: BigInt(pct) }
  })
}
// SDK: percentage = formatUnits(raw * 100, 18). Component: divide by
// PERCENT_ADJUST = 100 / (100 - platformFee), then formatPercentage.
function displayShare(rawPercentage: bigint, platformFee: number): string {
  const sdkPercent = Number(formatUnits(rawPercentage * 100n, 18))
  const adjust = 100 / (100 - platformFee)
  return formatPercentage(sdkPercent / adjust)
}

// --- DAO fee registry (PlatformFeeUpdater's two chained reads) ---
// The shared mock answers getFeeDetails with a too-short word, so the app takes
// its error FALLBACK. Model the registry so the platform fee is derived from a
// real on-chain read: platformFee = Number(numerator * 100 / denominator).
const DAO_FEE_REGISTRY_SELECTOR = '0x9980cb23' // daoFeeRegistry()
const FEE_REGISTRY = '0x1234567890123456789012345678901234567890'
const FEE_DETAILS_ABI = parseAbi([
  'function getFeeDetails(address rToken) view returns (address recipient, uint256 feeNumerator, uint256 feeDenominator, uint256 feeFloor)',
])
function seedFeeRegistry(
  overrides: MockOverrides,
  numerator: bigint,
  denominator: bigint
) {
  overrides.ethCall(
    DTF.address,
    DAO_FEE_REGISTRY_SELECTOR,
    encodeAbiParameters([{ type: 'address' }], [FEE_REGISTRY as Hex])
  )
  overrides.ethCall(
    FEE_REGISTRY,
    encodeFunctionData({
      abi: FEE_DETAILS_ABI,
      functionName: 'getFeeDetails',
      args: [DTF.address as Hex],
    }),
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'uint256' }],
      [FEE_REGISTRY as Hex, numerator, denominator, 0n]
    )
  )
}

async function gotoSettings(page: Page) {
  await freezeTime(page, Math.floor(Date.now() / 1000))
  await page.goto(dtfPath(DTF, 'settings'))
  await expect(page.getByTestId('dtf-settings')).toBeVisible()
  // Pump react-query so the SDK DTF query + the container's on-chain updaters
  // (version, platform fee, tokenJar) reach React under the frozen clock.
  await advanceTime(page, 5_000)
  await advanceTime(page, 5_000)
}

// ---------------------------------------------------------------------------

test('basics + fee percentages are the snapshot values, correctly scaled', async ({
  page,
}) => {
  await gotoSettings(page)

  const basics = page.locator('#basics')
  await expect(basics).toContainText(data.token.name)
  await expect(basics).toContainText(data.token.symbol)
  await expect(basics).toContainText(shortAddr(data.id))
  await expect(basics).toContainText(shortAddr(data.deployer))
  await expect(basics).toContainText(version) // 5.0.0, from the on-chain version() read
  await expect(page.getByTestId('settings-weight-control')).toContainText(
    data.weightControl ? 'Enabled' : 'Disabled'
  )
  await expect(page.getByTestId('settings-permissionless-bids')).toContainText(
    data.bidsEnabled ? 'Enabled' : 'Disabled'
  )

  // 1e18-scaled raw fee → formatUnits(_,18) → ×100 → percent. The core of the
  // "off-by-scale" check: raw 15000000000000000 must read 1.5%, not 15% or 0.015%.
  const annualized = formatPercentage(
    Number(formatUnits(BigInt(data.annualizedTvlFee), 18)) * 100
  )
  const minting = formatPercentage(
    Number(formatUnits(BigInt(data.mintingFee), 18)) * 100
  )
  expect(annualized).toBe('1.5%') // guards the derivation itself against a silent formula drift
  expect(minting).toBe('0.3%')
  await expect(page.getByTestId('settings-fee-annualized')).toContainText(annualized)
  await expect(page.getByTestId('settings-fee-minting')).toContainText(minting)
})

test('fee recipient shares are platform-fee adjusted from the on-chain registry', async ({
  page,
  overrides,
}) => {
  // Model a real registry read → platformFee = 100 × 1 / 5 = 20 (distinct from
  // the 50% fallback, so the assertion proves the shares track the real read).
  seedFeeRegistry(overrides, 1n, 5n)
  const platformFee = 20

  await gotoSettings(page)

  await expect(page.getByTestId('settings-fee-platform')).toContainText(
    `${platformFee}%`
  )

  const recipients = parseRecipients()
  const stTokenId = data.stToken.id.toLowerCase()
  const deployer = data.deployer.toLowerCase()
  const governance = recipients.find((r) => r.address === stTokenId)!
  const others = recipients.filter(
    (r) => r.address !== stTokenId && r.address !== deployer
  )

  // The stToken recipient folds into Governance Share; the rest are "Other N".
  await expect(page.getByTestId('settings-fee-governance')).toContainText(
    displayShare(governance.rawPercentage, platformFee)
  )
  // No recipient is the deployer in this DTF → Deployer Share defaults to 0%.
  expect(recipients.some((r) => r.address === deployer)).toBe(false)
  await expect(page.getByTestId('settings-fee-deployer')).toContainText('0%')

  await expect(page.getByTestId('settings-fee-other-1')).toContainText(
    displayShare(others[0].rawPercentage, platformFee)
  )
  await expect(page.getByTestId('settings-fee-other-2')).toContainText(
    displayShare(others[1].rawPercentage, platformFee)
  )
})

// BUG M10 (ledger). When the DAO fee-registry read fails, PlatformFeeUpdater
// (index-dtf-container.tsx:351-358) silently sets a HARDCODED fallback
// (FALLBACK_PLATFORM_FEES[8453] = 50) and the "Fixed Platform Share" row shows
// "50%" as if it were the real protocol fee — no error indicator — and that
// fabricated 50% feeds PERCENT_ADJUST, scaling every recipient share off a guess.
//
// DESIRED behavior (this fixme, CODEX IDX-SET-002): a failed registry read must
// surface an indeterminate/error state, NEVER present a fabricated percentage as
// live truth. Fails today (no `settings-fee-unavailable` state exists) — that's
// the point; do NOT re-assert the fabricated 50% as green product truth. Un-fixme
// when the app stops masking the read failure.
test.fixme(
  'registry read failure surfaces UNAVAILABLE, not a fabricated 50% fee',
  async ({ page }) => {
    await gotoSettings(page) // no seedFeeRegistry → error path

    // The platform-fee surface must NOT confidently render a percentage it never
    // read; it must show an explicit unavailable/error affordance.
    await expect(page.getByTestId('settings-fee-unavailable')).toBeVisible()
    await expect(page.getByTestId('settings-fee-platform')).not.toContainText('50%')
  }
)

// BUG (medium/high): a fee registry whose getFeeDetails returns feeDenominator=0
// crashes the WHOLE index-DTF container. PlatformFeeUpdater does
// `Number((feeNumerator * 100n) / feeDenominator)` with no zero guard, so a 0
// denominator throws `RangeError: Division by zero` inside the updater's effect,
// which unmounts the entire container subtree (every tab, not just settings).
// Repro (confirmed): seedFeeRegistry(overrides, 1n, 0n) → pageerror
// "RangeError: Division by zero" and `dtf-settings` never mounts (count 0).
// Fix: guard denominator === 0n before dividing (fall back like the read-error
// path). Marked fixme — the desired post-fix behavior is that the page survives.
test(
  'BUG: zero fee denominator must not crash the DTF container',
  async ({ page, overrides }) => {
    seedFeeRegistry(overrides, 1n, 0n)
    await gotoSettings(page)
    await expect(page.getByTestId('dtf-settings')).toBeVisible()
    await expect(page.getByTestId('settings-fee-annualized')).toBeVisible()
  }
)

test('roles list is the snapshot roster and is public to any viewer', async ({
  page,
}) => {
  await gotoSettings(page)
  const roles = page.locator('#roles')

  // guardiansAtom: union of both timelocks' guardians, deduped, dropping any
  // guardian that equals a governor address (self-referential entries).
  const govIds = new Set(
    [data.ownerGovernance.id, data.tradingGovernance.id].map((s) =>
      s.toLowerCase()
    )
  )
  const seen = new Set<string>()
  const guardians = [
    ...data.ownerGovernance.timelock.guardians,
    ...data.tradingGovernance.timelock.guardians,
  ].filter((g) => {
    const l = g.toLowerCase()
    if (seen.has(l) || govIds.has(l)) return false
    seen.add(l)
    return true
  })
  expect(guardians.length).toBe(4)
  for (const guardian of guardians) {
    await expect(roles).toContainText(shortAddr(guardian))
  }
  // The trading governor is listed as its own guardian in the snapshot; the
  // dedup must drop it, so it never appears in the Roles card.
  await expect(roles).not.toContainText(shortAddr(data.tradingGovernance.id))

  for (const launcher of data.auctionLaunchers) {
    await expect(roles).toContainText(shortAddr(launcher))
  }
  for (const manager of data.brandManagers) {
    await expect(roles).toContainText(shortAddr(manager))
  }
})

test('governance cards show snapshot governor/timelock + durations', async ({
  page,
}) => {
  await gotoSettings(page)

  // Governance Token card.
  const govToken = page.locator('#governance-token')
  await expect(govToken).toContainText(data.stToken.token.symbol) // vlRSR-LCAP
  await expect(govToken).toContainText(data.stToken.underlying.symbol) // RSR

  // DTF (owner) governance.
  const owner = page.locator('#non-basket-governance')
  await expect(owner).toContainText(shortAddr(data.ownerGovernance.id))
  await expect(owner).toContainText(shortAddr(data.ownerGovernance.timelock.id))
  await expect(owner).toContainText(humanize(data.ownerGovernance.votingDelay))
  await expect(owner).toContainText(humanize(data.ownerGovernance.votingPeriod))
  await expect(owner).toContainText(
    humanize(data.ownerGovernance.timelock.executionDelay)
  )

  // Basket (trading) governance — distinct governor/timelock + shorter windows.
  const trading = page.locator('#basket-governance')
  await expect(trading).toContainText(shortAddr(data.tradingGovernance.id))
  await expect(trading).toContainText(
    shortAddr(data.tradingGovernance.timelock.id)
  )
  await expect(trading).toContainText(
    humanize(data.tradingGovernance.votingDelay)
  )
  await expect(trading).toContainText(
    humanize(data.tradingGovernance.votingPeriod)
  )

  // DAO governance (vote-lock vault governor).
  const dao = page.locator('#dao-governance')
  await expect(dao).toContainText(shortAddr(data.stToken.governance.id))
  await expect(dao).toContainText(
    shortAddr(data.stToken.governance.timelock.id)
  )
})

test('disconnected: no distribute-fees submit control renders (public data still shows)', async ({
  page,
}) => {
  await gotoSettings(page)

  // With no wallet, the tx button is replaced by the Connect-Wallet slot — the
  // privileged submit control is simply absent, not merely disabled.
  await expect(page.getByTestId('settings-distribute-btn')).toHaveCount(0)

  // Read-only settings still render fully for a disconnected viewer.
  await expect(page.locator('#roles')).toBeVisible()
  await expect(page.getByTestId('settings-fee-annualized')).toBeVisible()
})

// --- write flow: needs the injected wallet ---

const DISTRIBUTE_FEES_ABI = parseAbi(['function distributeFees()'])
const PENDING_FEE_SHARES_SELECTOR = '0x834e630f' // getPendingFeeShares()

walletTest(
  'distribute fees: any connected wallet submits distributeFees() to the folio',
  async ({ page, overrides, txLog }) => {
    // Seed a non-zero pending amount so the readout is meaningful and the button
    // is actionable. distributeFees is permissionless on-chain — the UI copy even
    // says "Anyone can trigger" — so there is intentionally no role gate here.
    overrides.ethCall(
      DTF.address,
      PENDING_FEE_SHARES_SELECTOR,
      encodeAbiParameters([{ type: 'uint256' }], [5n * 10n ** 18n])
    )

    await gotoSettings(page)
    await connectWallet(page)
    await advanceTime(page, 5_000)

    // Pending readout: "<amount> $<symbol> ($<usd>)".
    await expect(page.getByTestId('settings-pending-fees')).toContainText(
      data.token.symbol
    )

    const button = page.getByTestId('settings-distribute-btn')
    await expect(button).toBeEnabled()
    await button.click()

    // Pump receipt polling (pending → confirming → success) under frozen time.
    await advanceTime(page, 10_000)
    await advanceTime(page, 5_000)

    expect(txLog).toHaveLength(1)
    const tx = txLog[0]
    expect(tx.to).toBe(DTF.address.toLowerCase())
    expect(tx.chainId).toBe(DTF.chainId)
    expect(BigInt(tx.value)).toBe(0n)
    const decoded = decodeFunctionData({
      abi: DISTRIBUTE_FEES_ABI,
      data: tx.data as Hex,
    })
    expect(decoded.functionName).toBe('distributeFees')
    expect(tx.from.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase())
  }
)
