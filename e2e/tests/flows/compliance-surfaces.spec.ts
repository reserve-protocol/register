import type { Page } from '@playwright/test'
import {
  encodeAbiParameters,
  encodeFunctionData,
  parseAbi,
  type Address,
  type Hex,
} from 'viem'
import { test as baseTest } from '../../fixtures/base'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { advanceTime, freezeTime, proposalTime } from '../../helpers/clock'
import type { MockOverrides } from '../../helpers/overrides'
import { dtfPath, findDtfByAddress, TEST_ADDRESS } from '../../helpers/registry'
import type { BoundaryRequest } from '../../helpers/requests'
import { loadSnapshot } from '../../helpers/snapshots'

// Compliance / geolocation gating BEYOND the zap surface. flows/compliance.spec
// already covers the swap surface (top-level geo block, per-DTF VPN block,
// unrestricted-open). This file closes the two gaps that matter for the
// guardrail:
//   1. the MANUAL issuance surface must gate mint the same way the zap surface
//      gates (inputs disabled, nothing sent) — and NOT block redeem;
//   2. a restriction must NOT leak into read/govern surfaces (overview,
//      governance) — over-blocking is the real regression risk here, so those
//      tests assert POSITIVE functionality, not just the absence of an alert.
//
// Gating recap (see flows/compliance.spec header + use-compliance-restrictions):
//   - top-level /v2/compliance/geolocation restricted:true short-circuits
//     everything (driven by the `compliance` fixture option);
//   - per-DTF /v2/compliance/geolocation/dtf/<addr> carries a granular
//     `restriction` ('geolocation-prohibited' | 'vpn' | ...), consulted only
//     when the top-level check passes. Both funnel into useIsComplianceRestricted.
//   - On MANUAL, the restriction disables inputs ONLY in buy(mint) mode
//     (manual/components/input-box.tsx: `useIsComplianceRestricted() && mode==='buy'`);
//     sell(redeem) stays open by design.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const DTF = findDtfByAddress(DTF_ADDRESS)!

// A captured proposal that was ACTIVE — freezing inside its window keeps it
// votable regardless of snapshot age (same id the governance-vote reference uses).
const ACTIVE_PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'

const DTF_GEO_PATH = `/v2/compliance/geolocation/dtf/${DTF_ADDRESS}`
const restrictedDtfGeo = (restriction: 'vpn' | 'geolocation-prohibited') => ({
  country: 'Germany',
  countryCode: 'DE',
  restricted: true,
  restriction,
})

// ---- Manual-surface mock seeding (mirrors flows/issuance-manual.spec) --------
// The manual page reads toAssets(1e18,0) + symbol() on the folio, and per basket
// token balanceOf/allowance/approve-probe on mount; seed them so strict
// teardown stays clean even though these tests only assert gating.
const READ_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function toAssets(uint256 shares, uint8 rounding) view returns (address[], uint256[])',
])
const INDEX_DEPLOYER = '0x3451fD177E9a8bB4Eb8271E627A804BD22A816F9' // base deployer (useIsUSDT probe)
const SYMBOL = '0x95d89b41'
const encUint = (v: bigint): Hex => encodeAbiParameters([{ type: 'uint256' }], [v])
const encBool = (v: boolean): Hex => encodeAbiParameters([{ type: 'bool' }], [v])
const encString = (v: string): Hex => encodeAbiParameters([{ type: 'string' }], [v])

interface ChainState {
  totalAssets: { tokens: string[]; amounts: string[] }
  totalSupply: string
}

function basketRates() {
  const state = loadSnapshot<ChainState>(`${DTF.snapshotDir}/chain-state.json`)
  const supply = BigInt(state.totalSupply)
  return state.totalAssets.tokens.map((address, i) => ({
    address: address as Address,
    rate: (BigInt(state.totalAssets.amounts[i]) * 10n ** 18n) / supply,
  }))
}

function seedManualReads(overrides: MockOverrides) {
  const rates = basketRates()
  overrides.ethCall(
    DTF_ADDRESS,
    encodeFunctionData({ abi: READ_ABI, functionName: 'toAssets', args: [10n ** 18n, 0] }),
    encodeAbiParameters(
      [{ type: 'address[]' }, { type: 'uint256[]' }],
      [rates.map((r) => r.address), rates.map((r) => r.rate)]
    )
  )
  overrides.ethCall(DTF_ADDRESS, SYMBOL, encString('LCAP'))
  for (const { address } of rates) {
    overrides.ethCall(
      address,
      encodeFunctionData({ abi: READ_ABI, functionName: 'balanceOf', args: [TEST_ADDRESS] }),
      encUint(0n)
    )
    overrides.ethCall(
      address,
      encodeFunctionData({
        abi: READ_ABI,
        functionName: 'allowance',
        args: [TEST_ADDRESS, DTF_ADDRESS],
      }),
      encUint(0n)
    )
    overrides.ethCall(
      address,
      encodeFunctionData({ abi: READ_ABI, functionName: 'approve', args: [INDEX_DEPLOYER, 1n] }),
      encBool(true)
    )
  }
}

// Pump react-query (notifyManager is frozen under a paused clock) until the
// SDK's GetIndexDTF lands and the manual view mounts.
async function settleManual(page: Page, boundaryRequests: BoundaryRequest[]) {
  await advanceTime(page, 5_000)
  await expect
    .poll(() =>
      boundaryRequests.some(
        (r) => r.boundary === 'subgraph' && r.operationName === 'GetIndexDTF'
      )
    )
    .toBe(true)
  await advanceTime(page, 5_000)
}

async function openManual(
  page: Page,
  overrides: MockOverrides,
  boundaryRequests: BoundaryRequest[]
) {
  seedManualReads(overrides)
  await freezeTime(page, Math.floor(Date.now() / 1000))
  await page.goto(dtfPath(DTF, 'issuance/manual'))
  await settleManual(page, boundaryRequests)
  await expect(page.getByTestId('issuance-mode-buy')).toBeVisible()
}

// A restriction on the manual surface must disable the mint inputs and let
// nothing be sent — and (adversarial) must NOT bleed into redeem, whose inputs
// stay live because redemption out of a restricted region is allowed.
for (const restriction of ['geolocation-prohibited', 'vpn'] as const) {
  test(`manual issuance: per-DTF '${restriction}' disables mint inputs, redeem stays open, empty txLog`, async ({
    page,
    overrides,
    boundaryRequests,
    txLog,
  }) => {
    // Top-level geolocation stays unrestricted (fixture default) so the per-DTF
    // granular reason is actually reached.
    overrides.api(
      { pathname: DTF_GEO_PATH, search: { chainId: String(DTF.chainId) } },
      restrictedDtfGeo(restriction)
    )

    await openManual(page, overrides, boundaryRequests)

    // Default mode is buy(mint): the amount input and the Max shortcut are both
    // disabled, so no mint amount can be entered.
    await expect(page.getByTestId('issuance-amount-input')).toBeDisabled()
    await expect(page.getByTestId('issuance-max-btn')).toBeDisabled()

    // Switching to sell(redeem) re-enables the input — the gate is mint-only.
    await page.getByTestId('issuance-mode-sell').click()
    await expect(page.getByTestId('issuance-amount-input')).toBeEnabled()

    expect(txLog).toEqual([])
  })
}

const TOP_LEVEL_RESTRICTED = {
  country: 'France',
  countryCode: 'FR',
  restricted: true,
  isVPN: false,
}

// Over-blocking guard: with the STRONGEST restriction (top-level geo block), the
// read + governance surfaces must remain FULLY functional. Asserts positive
// behavior, not just the absence of the compliance alert.
//
// The overview test uses the wallet-free base fixture on purpose: the geo
// restriction is IP-based (no wallet needed), and installing the injected
// wallet would auto-connect and fire account-position subgraph queries this
// read-only assertion has no reason to seed.
baseTest.describe('restriction must not leak into the overview surface', () => {
  baseTest.use({ compliance: TOP_LEVEL_RESTRICTED })

  baseTest('overview stays fully functional under a top-level geo restriction', async ({
    page,
    unmockedCalls,
  }) => {
    await page.goto(dtfPath(DTF, 'overview'))

    // Holdings table renders with data — the page is not blocked.
    const basket = page.getByTestId('overview-basket')
    await expect(basket).toBeVisible({ timeout: 15_000 })
    const exposureRows = basket.getByTestId('overview-basket-row')
    await expect(exposureRows.first()).toBeVisible()
    const exposureCount = await exposureRows.count()
    expect(exposureCount).toBeGreaterThan(0)

    // Interactive: the Collateral/Exposure tab switch still works under the
    // restriction (proves no compliance freeze on the read surface).
    await page.getByTestId('overview-basket-tab-collateral').click()
    await expect(basket.getByTestId('overview-basket-row').first()).toBeVisible()

    // No mint alert leaks onto the overview holdings surface.
    await expect(page.getByTestId('compliance-alert')).toHaveCount(0)
    expect(unmockedCalls).toEqual([])
  })
})

// Governance needs a connected wallet (to enable the vote CTA), so this describe
// uses the wallet fixture. Same top-level geo restriction.
test.describe('restriction must not leak into the governance surface', () => {
  test.use({ compliance: TOP_LEVEL_RESTRICTED })

  test('governance voting stays functional under a top-level geo restriction', async ({
    page,
    boundaryRequests,
  }) => {
    const { proposal } = loadSnapshot<{
      proposal: { id: string; voteStart: string; voteEnd: string }
    }>(`${DTF.snapshotDir}/proposals/${ACTIVE_PROPOSAL_ID}.json`)

    // Freeze inside the voting window so the SDK derives ACTIVE, connect the
    // wallet, and drive the same setup governance-vote uses.
    await freezeTime(page, proposalTime(proposal, 'active'))
    await page.goto(dtfPath(DTF, `governance/proposal/${ACTIVE_PROPOSAL_ID}`))
    await connectWallet(page)

    // Pump — flush react-query so the proposal + connected voter-state reads
    // reach React (paused clock freezes the notifyManager).
    await advanceTime(page, 5_000)
    await expect
      .poll(() =>
        boundaryRequests.some(
          (r) => r.boundary === 'subgraph' && r.operationName === 'GetIndexDtfProposal'
        )
      )
      .toBe(true)
    await advanceTime(page, 5_000)

    // The vote CTA is present AND enabled — governance interaction is not
    // compliance-gated. This is the positive-functionality proof.
    const voteBtn = page.getByTestId('proposal-vote-btn')
    await expect(voteBtn).toBeVisible()
    await expect(voteBtn).toBeEnabled({ timeout: 15_000 })
  })
})
