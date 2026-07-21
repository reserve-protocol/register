import { connectWallet, expect, test } from '../../fixtures/wallet'
import { advanceTime, freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadEnrichedProposal } from '../../helpers/subgraph'
import { loadSnapshot } from '../../helpers/snapshots'
import {
  decodeFunctionData,
  encodeAbiParameters,
  parseAbi,
  parseEther,
  type Address,
  type Hex,
} from 'viem'
import type { MockOverrides } from '../../helpers/overrides'
import type { Page } from '@playwright/test'
import { seedFeeRegistry } from '../../harness/seed'

// DTF-settings (fees) propose flow — money-critical. Pure on-snapshot data
// (no price/liquidity API), so we drive the fee form, submit, and decode the
// governor propose(targets, values, calldatas, description) payload to prove
// the UI percentage round-trips into the setTVLFee/setMintFee calldata exactly.
//
// NOTE (fixture gap): unlike the DAO-settings surface, the propose-dtf-settings
// components ship NO data-testids on the section trigger / confirm / submit
// buttons, so this spec falls back to the section DOM id (#propose-section-fees,
// stable) plus getByRole with English copy (locale is pinned to `en` in the base
// fixture, so this is deterministic here). Reported as a follow-up.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap, v5
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'

const PROPOSE_ABI = parseAbi([
  'function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)',
])
const SET_TVL_FEE_ABI = parseAbi(['function setTVLFee(uint256 _newFee)'])
const SET_MINT_FEE_ABI = parseAbi(['function setMintFee(uint256 _newFee)'])

const dtf = findDtfByAddress(DTF_ADDRESS)!

type DtfSnapshot = {
  dtf: { ownerGovernance: { id: string }; stToken: { id: string } }
}
const loadDtf = () => loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`).dtf

const BOOL_TRUE = encodeAbiParameters([{ type: 'bool' }], [true])
const UINT_ZERO = encodeAbiParameters([{ type: 'uint256' }], [0n])

// Anchor the frozen clock inside the captured proposal's voting window so every
// time-derived read stays consistent with the snapshots.
async function bootProposeFees(page: Page, overrides: MockOverrides) {
  const snapshot = loadDtf()

  // The propose form's revenue seeding is gated on the platform fee resolving
  // (feeRecipientsAtom returns undefined otherwise). Since B1/M1 a failed
  // registry read is 'unavailable' — it no longer falls back to a fabricated
  // 50% that happened to unblock this form — so model a real registry read.
  seedFeeRegistry(overrides, dtf, 1n, 5n) // platformFee = 20%

  // bidsEnabled() (0x459cf24b) on the folio is read by the DTF-settings Updater
  // (v5) but isn't in the central chain-state seed — answer it (inert: we never
  // toggle bids).
  overrides.ethCall(DTF_ADDRESS, '0x459cf24b', BOOL_TRUE)

  // The DTF-settings overview auto-runs a Tenderly simulation once the proposal
  // is confirmed. That POSTs to a tenderly host (intercepted as an RPC with no
  // `method`, which the strict mock rejects). The simulate hook is gated on
  // `voteTokenSupply` (the stToken's totalSupply), so forcing it to 0 keeps the
  // card not-ready and the POST never fires. Inert for the propose/submit path
  // (voting power comes from getVotes, not totalSupply). We are NOT covering
  // simulation here — see the coverage gap in the report.
  overrides.ethCall(snapshot.stToken.id, '0x18160ddd', UINT_ZERO)

  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  await freezeTime(
    page,
    proposalTime(proposal as { voteStart: string; voteEnd: string }, 'active')
  )

  await page.goto(dtfPath(dtf, 'governance/propose/dtf'))
  await connectWallet(page)

  // Pump — getFull hydration + proposer-state reads resolve but never reach
  // React under the paused clock; the form only mounts once the DTF hydrates.
  await advanceTime(page, 5_000)

  // Open the "Fees & Distribution" accordion section (stable DOM id).
  await page.locator('#propose-section-fees').getByRole('button').first().click()
  // Pump — the accordion scroll helper runs on a 250ms setTimeout.
  await advanceTime(page, 1_000)
}

// The first numeric input in the fees section is the Annualized TVL Fee
// (folioFee); the second is the Mint Fee.
const tvlFeeInput = (page: Page) =>
  page.locator('#propose-section-fees input[type="number"]').first()
const mintFeeInput = (page: Page) =>
  page.locator('#propose-section-fees input[type="number"]').nth(1)

// The form seeds the field from the DTF's current fee via a two-step dependent
// RPC chain (daoFeeRegistry -> getFeeDetails -> platformFee -> feeRecipients ->
// form reset). Under the paused clock, React Query only notifies React when the
// clock is pumped, so we advance time in steps until the seeded value lands
// (never a bare poll, which would just re-read the stale 0).
async function readSeededFee(page: Page, input: ReturnType<typeof tvlFeeInput>) {
  await expect(input).toBeVisible()
  for (let i = 0; i < 12; i++) {
    if (Number(await input.inputValue()) > 0) break
    await advanceTime(page, 1_000)
  }
  const value = Number(await input.inputValue())
  expect(value).toBeGreaterThan(0)
  return value
}

const confirmButton = (page: Page) =>
  page.getByRole('button', { name: 'Confirm & prepare proposal' })
const submitButton = (page: Page) =>
  page.getByRole('button', { name: 'Submit proposal onchain' })

test('TVL fee change: UI percent round-trips into setTVLFee calldata', async ({
  page,
  txLog,
  overrides,
}) => {
  await bootProposeFees(page, overrides)

  const input = tvlFeeInput(page)
  const currentTvl = await readSeededFee(page, input)
  // Derive a new fee from the live (snapshot-seeded) default so a re-capture
  // can't stale the diff: current + 1, clamped into [0.15, 10].
  const newTvl = currentTvl + 1 > 10 ? currentTvl - 1 : currentTvl + 1

  await input.fill(String(newTvl))
  // The UI must actually show the value we typed — the money-critical half of
  // the round-trip (UI shows X%).
  await expect(input).toHaveValue(String(newTvl))
  await advanceTime(page, 1_000)

  const confirmBtn = confirmButton(page)
  await expect(confirmBtn).toBeEnabled()
  await confirmBtn.click()
  // Pump — confirm stage lazy-loads the MD editor (Suspense).
  await advanceTime(page, 2_000)

  // Injection probe: markdown + script content in the title must survive into
  // the on-chain description verbatim (sanitization is the detail view's job).
  const INJECTION = '<script>alert(1)</script> **bold** [x](javascript:alert(1))'
  await page.locator('#title').fill(INJECTION)
  await advanceTime(page, 1_000)

  const submitBtn = submitButton(page)
  await expect(submitBtn).toBeEnabled()
  await submitBtn.click()

  // Pump — receipt polling completes pending -> confirming -> success.
  await advanceTime(page, 10_000)

  // Exactly one tx and, post-success, the submit CTA is locked (isSubmitted) —
  // the button can no longer be found by its submittable name.
  expect(txLog).toHaveLength(1)
  await expect(submitBtn).toHaveCount(0)

  const proposalTx = txLog[0]
  expect(proposalTx.chainId).toBe(dtf.chainId)
  expect(proposalTx.to).toBe(loadDtf().ownerGovernance.id.toLowerCase())
  expect(BigInt(proposalTx.value)).toBe(0n)

  const decoded = decodeFunctionData({
    abi: PROPOSE_ABI,
    data: proposalTx.data as Hex,
  })
  expect(decoded.functionName).toBe('propose')
  const [targets, values, calldatas, description] = decoded.args

  // Exactly one action: setTVLFee on the folio contract, value 0.
  expect(calldatas).toHaveLength(1)
  expect(targets).toHaveLength(1)
  expect(values).toEqual([0n])
  expect((targets[0] as Address).toLowerCase()).toBe(DTF_ADDRESS.toLowerCase())

  const fee = decodeFunctionData({ abi: SET_TVL_FEE_ABI, data: calldatas[0] as Hex })
  expect(fee.functionName).toBe('setTVLFee')
  // CRITICAL: UI X% -> parseEther(X / 100), 18-decimal precision, no drift.
  expect(fee.args[0]).toBe(parseEther((newTvl / 100).toString()))

  // Injection payload reached the description arg unmodified.
  expect(description).toContain(INJECTION)
})

test('Mint fee change: UI percent round-trips into setMintFee calldata', async ({
  page,
  txLog,
  overrides,
}) => {
  await bootProposeFees(page, overrides)

  const input = mintFeeInput(page)
  const currentMint = await readSeededFee(page, input)
  // Mint fee range is [0.15, 5].
  const newMint = currentMint + 1 > 5 ? currentMint - 0.1 : currentMint + 1

  await input.fill(String(newMint))
  await expect(input).toHaveValue(String(newMint))
  await advanceTime(page, 1_000)

  const confirmBtn = confirmButton(page)
  await expect(confirmBtn).toBeEnabled()
  await confirmBtn.click()
  await advanceTime(page, 2_000)

  await page.locator('#title').fill('E2E mint fee change')
  await advanceTime(page, 1_000)

  const submitBtn = submitButton(page)
  await expect(submitBtn).toBeEnabled()
  await submitBtn.click()
  await advanceTime(page, 10_000)

  expect(txLog).toHaveLength(1)
  const decoded = decodeFunctionData({
    abi: PROPOSE_ABI,
    data: txLog[0].data as Hex,
  })
  const [targets, values, calldatas] = decoded.args
  expect(calldatas).toHaveLength(1)
  expect(values).toEqual([0n])
  expect((targets[0] as Address).toLowerCase()).toBe(DTF_ADDRESS.toLowerCase())

  const fee = decodeFunctionData({ abi: SET_MINT_FEE_ABI, data: calldatas[0] as Hex })
  expect(fee.functionName).toBe('setMintFee')
  expect(fee.args[0]).toBe(parseEther((newMint / 100).toString()))
})

test('no change keeps confirm disabled and never submits', async ({
  page,
  txLog,
  overrides,
}) => {
  await bootProposeFees(page, overrides)

  const input = tvlFeeInput(page)
  const current = await readSeededFee(page, input)

  // With nothing changed, there is no proposal to prepare — confirm is disabled
  // (this gate is independent of the localhost validation bypass; see report).
  await expect(confirmButton(page)).toBeDisabled()

  // Setting the field back to its current value is still "no change".
  await input.fill(String(current))
  await advanceTime(page, 1_000)
  await expect(confirmButton(page)).toBeDisabled()

  expect(txLog).toHaveLength(0)
})
