import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  formatEther,
  maxUint256,
  parseAbi,
  parseEther,
  type Address,
  type Hex,
} from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { advanceTime, freezeTime } from '../../helpers/clock'
import type { MockOverrides } from '../../helpers/overrides'
import type { BoundaryRequest } from '../../helpers/requests'
import { dtfPath, findDtfByAddress, TEST_ADDRESS } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Manual-issuance MATH BOUNDARY characterization on base/lcap (v5 = v2 ABI,
// 3-arg mint). Sibling of issuance-manual.spec.ts (happy-path); this file
// probes the load-bearing on-chain-math glue: the MAX / maxMintAmount ceil
// guard, the client-side minSharesOut / minAmountsOut rounding, decimal
// truncation, input guards, and the no-redundant-approve path. Everything is
// decoded off txLog and derived from the snapshot — re-captures must not break
// the assertions.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const INDEX_DEPLOYER = '0x3451fD177E9a8bB4Eb8271E627A804BD22A816F9'
const DTF = findDtfByAddress(DTF_ADDRESS)!

const APPROVE = '0x095ea7b3' // approve(address,uint256)
const SYMBOL = '0x95d89b41' // symbol()

const FOLIO_MINT_ABI = parseAbi([
  'function mint(uint256 shares, address receiver, uint256 minSharesOut)',
])
const FOLIO_REDEEM_ABI = parseAbi([
  'function redeem(uint256 shares, address receiver, address[] assets, uint256[] minAmountsOut)',
])
const ISSUANCE_READ_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function toAssets(uint256 shares, uint8 rounding) view returns (address[], uint256[])',
])

interface ChainState {
  totalAssets: { tokens: string[]; amounts: string[] }
  totalSupply: string
}

const encUint = (v: bigint): Hex => encodeAbiParameters([{ type: 'uint256' }], [v])
const encBool = (v: boolean): Hex => encodeAbiParameters([{ type: 'bool' }], [v])
const encString = (v: string): Hex => encodeAbiParameters([{ type: 'string' }], [v])

const E18 = parseEther('1')
const MINT_FEE_FLOOR = parseEther('0.0015')

// Per-share basket rates from the captured chain state: toAssets(1e18, 0) floors
// folioBalance_i * 1e18 / totalSupply for each basket token (native decimals).
function basketRates() {
  const state = loadSnapshot<ChainState>(`${DTF.snapshotDir}/chain-state.json`)
  const supply = BigInt(state.totalSupply)
  return state.totalAssets.tokens.map((address, i) => ({
    address: address as Address,
    rate: (BigInt(state.totalAssets.amounts[i]) * E18) / supply,
  }))
}

// The exact mint fee the app applies. The SDK exposes mintingFee as a JS number
// (Number(formatEther(raw))); the component re-parses number.toString(). Replicate
// that round-trip so the derived minSharesOut matches byte-for-byte.
function mintFeeApplied(): bigint {
  const raw = loadSnapshot<{ dtf: { mintingFee: string } }>(
    `${DTF.snapshotDir}/dtf.json`
  ).dtf.mintingFee
  const asNumber = Number(formatEther(BigInt(raw)))
  const parsed = parseEther(asNumber.toString())
  return parsed > MINT_FEE_FLOOR ? parsed : MINT_FEE_FLOOR
}

// Mirror of index-manual-issuance.tsx: (shares * (1e18 - feeFloor) - 1) / 1e18.
function expectedMinSharesOut(shares: bigint): bigint {
  return (shares * (E18 - mintFeeApplied()) - 1n) / E18
}

// Mirror of maxMintAmountAtom: min over assets of balance_i * 1e18 / (rate_i + 1).
function expectedMaxMint(
  rates: ReturnType<typeof basketRates>,
  balanceOf: (rate: bigint) => bigint
): bigint {
  let maxAmount: bigint | undefined
  for (const { rate } of rates) {
    if (rate === 0n) continue
    const possible = (balanceOf(rate) * E18) / (rate + 1n)
    if (maxAmount === undefined || possible < maxAmount) maxAmount = possible
  }
  return maxAmount ?? 0n
}

function seedFolio(overrides: MockOverrides, rates: ReturnType<typeof basketRates>) {
  overrides.ethCall(
    DTF_ADDRESS,
    encodeFunctionData({
      abi: ISSUANCE_READ_ABI,
      functionName: 'toAssets',
      args: [E18, 0],
    }),
    encodeAbiParameters(
      [{ type: 'address[]' }, { type: 'uint256[]' }],
      [rates.map((r) => r.address), rates.map((r) => r.rate)]
    )
  )
  overrides.ethCall(DTF_ADDRESS, SYMBOL, encString('LCAP'))
}

function seedWalletState(
  overrides: MockOverrides,
  rates: ReturnType<typeof basketRates>,
  opts: { balancePerToken: (rate: bigint) => bigint; allowance: bigint }
) {
  for (const { address, rate } of rates) {
    overrides.ethCall(
      address,
      encodeFunctionData({
        abi: ISSUANCE_READ_ABI,
        functionName: 'balanceOf',
        args: [TEST_ADDRESS],
      }),
      encUint(opts.balancePerToken(rate))
    )
    overrides.ethCall(
      address,
      encodeFunctionData({
        abi: ISSUANCE_READ_ABI,
        functionName: 'allowance',
        args: [TEST_ADDRESS, DTF_ADDRESS],
      }),
      encUint(opts.allowance)
    )
    overrides.ethCall(
      address,
      encodeFunctionData({
        abi: ISSUANCE_READ_ABI,
        functionName: 'approve',
        args: [INDEX_DEPLOYER, 1n],
      }),
      encBool(true)
    )
  }
}

function seedDtfBalance(overrides: MockOverrides, shares: bigint) {
  overrides.ethCall(
    DTF_ADDRESS,
    encodeFunctionData({
      abi: ISSUANCE_READ_ABI,
      functionName: 'balanceOf',
      args: [TEST_ADDRESS],
    }),
    encUint(shares)
  )
}

async function gotoManual(
  page: import('@playwright/test').Page,
  boundaryRequests: BoundaryRequest[]
) {
  await freezeTime(page, Math.floor(Date.now() / 1000))
  await page.goto(dtfPath(DTF, 'issuance/manual'))
  await connectWallet(page)
  // Pump — flush react-query: connected-account reads (balances/allowances/
  // toAssets) resolve but only reach React once the clock advances.
  await advanceTime(page, 5_000)
  // Confirm the DTF identity actually settled through the SDK index query so the
  // math atoms have live basket data (not a wrong-chain / empty read).
  await expect
    .poll(() =>
      boundaryRequests.some(
        (r) => r.boundary === 'subgraph' && r.operationName === 'GetIndexDTF'
      )
    )
    .toBe(true)
}

const mintTxOf = (txLog: { to: string; data: string }[], folio: string) =>
  txLog.find((t) => t.to === folio && !t.data.startsWith(APPROVE))

// ---------------------------------------------------------------------------
// MAX button — the ceil-guard boundary.
// ---------------------------------------------------------------------------

test('mint MAX: submitted shares equal maxMintAmount and the pull fits every balance', async ({
  page,
  overrides,
  boundaryRequests,
  txLog,
}) => {
  const rates = basketRates()
  seedFolio(overrides, rates)
  // ~1000 shares' worth per token, everything pre-approved so MAX → Mint has no
  // approve gate in the way.
  const balanceOf = (rate: bigint) => rate * 1000n
  seedWalletState(overrides, rates, { balancePerToken: balanceOf, allowance: maxUint256 })

  await gotoManual(page, boundaryRequests)

  const maxMint = expectedMaxMint(rates, balanceOf)
  expect(maxMint).toBeGreaterThan(0n)

  // Click "Use" (MAX) — sets the input to formatEther(maxMint).
  await page.getByTestId('issuance-max-btn').click()
  await expect(page.getByTestId('issuance-amount-input')).toHaveValue(
    formatEther(maxMint)
  )

  // MAX must always be a VALID mint: submit enabled, no approve gate.
  const submit = page.getByTestId('issuance-submit-btn')
  await expect(submit).toBeEnabled()
  await expect(page.getByTestId('issuance-approve-all-btn')).toHaveCount(0)

  await submit.click()
  await advanceTime(page, 10_000)
  await advanceTime(page, 5_000)
  await expect(page.getByTestId('issuance-amount-input')).toHaveValue('')

  const folio = DTF_ADDRESS.toLowerCase()
  const mint = mintTxOf(txLog, folio)
  expect(mint).toBeDefined()
  const { args } = decodeFunctionData({ abi: FOLIO_MINT_ABI, data: mint!.data as Hex })
  const shares = args[0]

  // The MAX button round-trips through formatEther → safeParseEther with no loss.
  expect(shares).toBe(maxMint)
  expect(args[2]).toBe(expectedMinSharesOut(shares))

  // Load-bearing property of the +1n ceil guard: at the exact max, the floored
  // client-required amount for EVERY asset stays STRICTLY below the wallet
  // balance — leaving the wei of headroom the contract's Ceil pull consumes.
  // A naive divide-by-rate (no +1n) would let this hit balance exactly, so the
  // strict inequality is the regression the guard exists to prevent.
  for (const { rate } of rates) {
    const clientRequired = (rate * shares) / E18 // floored quote, native decimals
    expect(clientRequired).toBeLessThan(balanceOf(rate))
  }
})

// ---------------------------------------------------------------------------
// minSharesOut — client-side fee-adjusted floor (v2 ABI).
// ---------------------------------------------------------------------------

test('mint minSharesOut: exact fee-adjusted floor, strictly below shares', async ({
  page,
  overrides,
  boundaryRequests,
  txLog,
}) => {
  const rates = basketRates()
  seedFolio(overrides, rates)
  seedWalletState(overrides, rates, {
    balancePerToken: (rate) => rate * 2000n,
    allowance: maxUint256,
  })

  await gotoManual(page, boundaryRequests)

  await page.getByTestId('issuance-amount-input').fill('1')
  const submit = page.getByTestId('issuance-submit-btn')
  await expect(submit).toBeEnabled()
  await submit.click()
  await advanceTime(page, 10_000)
  await advanceTime(page, 5_000)

  const mint = mintTxOf(txLog, DTF_ADDRESS.toLowerCase())
  expect(mint).toBeDefined()
  const { args } = decodeFunctionData({ abi: FOLIO_MINT_ABI, data: mint!.data as Hex })
  expect(args[0]).toBe(parseEther('1'))
  // Fee floor is max(mintingFee, 0.15%). base/lcap mintingFee = 0.3% > floor, so
  // the applied factor is (1e18 - 3e15). Assert the EXACT wei, not just a bound.
  expect(args[2]).toBe(expectedMinSharesOut(parseEther('1')))
  expect(args[2]).toBeLessThan(args[0])
  expect(args[2]).toBeGreaterThan(0n)
})

// ---------------------------------------------------------------------------
// Decimal truncation — safeParseEther keeps 18 decimals.
// ---------------------------------------------------------------------------

test('mint: >18-decimal input truncates to exactly 18 decimals in the shares arg', async ({
  page,
  overrides,
  boundaryRequests,
  txLog,
}) => {
  const rates = basketRates()
  seedFolio(overrides, rates)
  seedWalletState(overrides, rates, {
    balancePerToken: (rate) => rate * 5n,
    allowance: maxUint256,
  })

  await gotoManual(page, boundaryRequests)

  // 22 fractional digits — safeParseEther drops everything past the 18th.
  await page.getByTestId('issuance-amount-input').fill('1.1234567890123456789999')
  const submit = page.getByTestId('issuance-submit-btn')
  await expect(submit).toBeEnabled()
  await submit.click()
  await advanceTime(page, 10_000)
  await advanceTime(page, 5_000)

  const mint = mintTxOf(txLog, DTF_ADDRESS.toLowerCase())
  expect(mint).toBeDefined()
  const { args } = decodeFunctionData({ abi: FOLIO_MINT_ABI, data: mint!.data as Hex })
  expect(args[0]).toBe(1_123456789012345678n) // truncated, NOT rounded
})

// ---------------------------------------------------------------------------
// Input guards — empty / zero / over-balance never submit a tx.
// ---------------------------------------------------------------------------

test('mint: empty, zero, and over-balance inputs keep submit disabled and txLog empty', async ({
  page,
  overrides,
  boundaryRequests,
  txLog,
}) => {
  const rates = basketRates()
  seedFolio(overrides, rates)
  // Balance supports ~1 share; allowance is unlimited so the gate is the Mint
  // button (not Approve All) for every case.
  seedWalletState(overrides, rates, {
    balancePerToken: (rate) => rate * 1n,
    allowance: maxUint256,
  })

  await gotoManual(page, boundaryRequests)

  const input = page.getByTestId('issuance-amount-input')
  const submit = page.getByTestId('issuance-submit-btn')

  // A valid small amount first, to prove the button CAN enable (baseline).
  await input.fill('0.5')
  await expect(submit).toBeEnabled()

  for (const bad of ['', '0', '0.0', '999999999']) {
    await input.fill(bad)
    await expect(page.getByTestId('issuance-approve-all-btn')).toHaveCount(0)
    await expect(submit).toBeDisabled()
  }

  expect(txLog).toHaveLength(0)
})

// ---------------------------------------------------------------------------
// Redeem minAmountsOut — flat 5% floor per asset.
// ---------------------------------------------------------------------------

test('redeem: minAmountsOut is the exact 5% floor of the per-asset required amount', async ({
  page,
  overrides,
  boundaryRequests,
  txLog,
}) => {
  const rates = basketRates()
  seedFolio(overrides, rates)
  seedWalletState(overrides, rates, { balancePerToken: () => 0n, allowance: 0n })
  seedDtfBalance(overrides, 100n * E18)

  await gotoManual(page, boundaryRequests)
  await page.getByTestId('issuance-mode-sell').click()
  await advanceTime(page, 2_000)

  const shares = parseEther('10')
  await page.getByTestId('issuance-amount-input').fill('10')
  const submit = page.getByTestId('issuance-submit-btn')
  await expect(submit).toBeEnabled()
  await submit.click()
  await advanceTime(page, 10_000)
  await advanceTime(page, 5_000)

  expect(txLog).toHaveLength(1)
  const decoded = decodeFunctionData({
    abi: FOLIO_REDEEM_ABI,
    data: txLog[0].data as Hex,
  })
  expect(decoded.functionName).toBe('redeem')
  expect(decoded.args[0]).toBe(shares)
  // required_i = floor(rate_i * shares / 1e18); minOut_i = floor(required_i * 95 / 100).
  const expectedMinOuts = rates.map((r) => {
    const required = (r.rate * shares) / E18
    return (required * 95n) / 100n
  })
  expect(decoded.args[3]).toEqual(expectedMinOuts)
})

// BUG (ledger, ENGINEER REVIEW REQUIRED — money). A non-trivial redeem ships
// minAmountsOut = 0 for the low-rate / low-decimal asset (cbBTC: 8-decimal, rate
// ~3567/1e18; below ~0.00028 shares its required amount rounds to 0 and the 5%
// floor collapses to 0), silently removing that asset's slippage protection.
//
// DESIRED (this fixme, CODEX IDX-MAN-006): a real redeem must NEVER ship zero
// slippage protection on a leg — either enforce a nonzero floor OR block the
// unsafe-dust redeem with a visible warning. Engineer must pick the policy. This
// asserts the safety invariant (no zero-protection leg); it fails today, which
// is the point — we do NOT codify the unprotected redeem as green product truth.
test.fixme(
  'redeem never silently ships zero slippage protection on a leg',
  async ({ page, overrides, boundaryRequests, txLog }) => {
    const rates = basketRates()
    seedFolio(overrides, rates)
    seedWalletState(overrides, rates, { balancePerToken: () => 0n, allowance: 0n })
    seedDtfBalance(overrides, 100n * E18)

    await gotoManual(page, boundaryRequests)
    await page.getByTestId('issuance-mode-sell').click()
    await advanceTime(page, 2_000)

    await page.getByTestId('issuance-amount-input').fill('0.0001')
    const submit = page.getByTestId('issuance-submit-btn')
    await expect(submit).toBeEnabled()
    await submit.click()
    await advanceTime(page, 10_000)
    await advanceTime(page, 5_000)

    const decoded = decodeFunctionData({
      abi: FOLIO_REDEEM_ABI,
      data: txLog[0].data as Hex,
    })
    const minOuts = decoded.args[3] as readonly bigint[]
    // Safety invariant: every leg keeps nonzero protection.
    expect(minOuts.every((m) => m > 0n)).toBe(true)
  }
)

// ---------------------------------------------------------------------------
// Approve→mint→mint — no redundant re-approval once allowance covers it.
// ---------------------------------------------------------------------------

test('mint twice: a second mint under an existing allowance does not re-approve', async ({
  page,
  overrides,
  boundaryRequests,
  txLog,
}) => {
  const rates = basketRates()
  seedFolio(overrides, rates)
  // Allowance already unlimited → the approve gate is never shown; a well-behaved
  // flow must NOT emit spurious approvals before either mint.
  seedWalletState(overrides, rates, {
    balancePerToken: (rate) => rate * 2000n,
    allowance: maxUint256,
  })

  await gotoManual(page, boundaryRequests)

  const input = page.getByTestId('issuance-amount-input')
  const submit = page.getByTestId('issuance-submit-btn')

  await input.fill('1')
  await expect(submit).toBeEnabled()
  await submit.click()
  await advanceTime(page, 10_000)
  await advanceTime(page, 5_000)
  await expect(input).toHaveValue('') // first mint success reset

  await input.fill('2')
  await expect(submit).toBeEnabled()
  await submit.click()
  await advanceTime(page, 10_000)
  await advanceTime(page, 5_000)
  await expect(input).toHaveValue('')

  // Exactly two mints, zero approvals — allowance was reused, not re-granted.
  const approves = txLog.filter((t) => t.data.startsWith(APPROVE))
  expect(approves).toHaveLength(0)
  const folio = DTF_ADDRESS.toLowerCase()
  const mints = txLog.filter((t) => t.to === folio && !t.data.startsWith(APPROVE))
  expect(mints).toHaveLength(2)
  expect(
    decodeFunctionData({ abi: FOLIO_MINT_ABI, data: mints[0].data as Hex }).args[0]
  ).toBe(parseEther('1'))
  expect(
    decodeFunctionData({ abi: FOLIO_MINT_ABI, data: mints[1].data as Hex }).args[0]
  ).toBe(parseEther('2'))
})
