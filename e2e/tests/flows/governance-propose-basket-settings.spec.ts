import { connectWallet, expect, test } from '../../fixtures/wallet'
import { advanceTime, freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadEnrichedProposal } from '../../helpers/subgraph'
import { loadSnapshot } from '../../helpers/snapshots'
import {
  decodeFunctionData,
  encodeAbiParameters,
  parseAbi,
  type Address,
  type Hex,
} from 'viem'
import type { MockOverrides } from '../../helpers/overrides'
import type { Page } from '@playwright/test'

// Basket-settings (trading-governor params + roles) propose flow. This is the
// governance-parameter surface — it mirrors the dtf-settings scaffolding (open a
// section, change a value, confirm, describe, submit) but targets the TRADING
// governance, NOT the basket price/liquidity flow. We drive a voting-period
// change, submit, and decode the governor propose(targets, values, calldatas,
// description) payload to prove the setVotingPeriod setter calldata round-trips
// against the trading governor with value 0.
//
// FINDING (app bug, see report): this surface ALSO emits a phantom
// setProposalThreshold calldata on every proposal, and its empty-change guard
// never trips — the updater seeds `basketVotingThreshold` from the SDK's
// already-percentage `proposalThreshold` but compares it against
// `Number(proposalThreshold) / 1e18` (updater.tsx ~L48 vs ~L128), so the field
// value never equals its own baseline and proposalThreshold is ALWAYS flagged
// changed. The two assertions that depend on correct behaviour are test.fixme'd
// below; the round-trip test is written to tolerate the extra calldata.
//
// Like propose-dtf-settings, these components ship NO data-testids on the
// confirm / submit buttons, so we fall back to the stable section DOM id
// (#propose-section-governance) plus getByRole with English copy (locale pinned
// to `en` in the base fixture). Reported as a follow-up.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap, v5
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'

const PROPOSE_ABI = parseAbi([
  'function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)',
])
// The governor's real signature is setVotingPeriod(uint32) (selector 0xe540d01d),
// not the OZ-standard uint256 — decode with the exact width or the selector won't
// match. viem decodes a uint32 arg to `number`.
const SET_VOTING_PERIOD_ABI = parseAbi(['function setVotingPeriod(uint32 newVotingPeriod)'])
const SET_VOTING_PERIOD_SELECTOR = '0xe540d01d'
const SET_PROPOSAL_THRESHOLD_SELECTOR = '0xece40cc1'

const dtf = findDtfByAddress(DTF_ADDRESS)!

type DtfSnapshot = {
  dtf: { tradingGovernance: { id: string }; stToken: { id: string } }
}
const loadDtf = () => loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`).dtf

const BOOL_TRUE = encodeAbiParameters([{ type: 'bool' }], [true])
const UINT_ZERO = encodeAbiParameters([{ type: 'uint256' }], [0n])

// Boot the basket-settings propose page with the frozen clock anchored inside
// the captured proposal's voting window, then open the Governance section.
async function bootProposeBasketSettings(page: Page, overrides: MockOverrides) {
  const snapshot = loadDtf()

  // bidsEnabled() (0x459cf24b) on the folio is read by the DTF-settings Updater
  // on this page shell but isn't in the central chain-state seed — answer it
  // (inert: we never toggle bids).
  overrides.ethCall(DTF_ADDRESS, '0x459cf24b', BOOL_TRUE)

  // The overview auto-runs a Tenderly simulation once the proposal is confirmed.
  // That POSTs to a tenderly host (an RPC with no `method`, which the strict mock
  // rejects). useProposalSimulation gates handleSimulation on the vote token's
  // totalSupply, so forcing it to 0 keeps the sim not-ready and the POST never
  // fires. Inert for propose/submit (voting power comes from getVotes). We are
  // NOT covering simulation here — see the coverage gap in the report.
  overrides.ethCall(snapshot.stToken.id, '0x18160ddd', UINT_ZERO)

  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  await freezeTime(
    page,
    proposalTime(proposal as { voteStart: string; voteEnd: string }, 'active')
  )

  await page.goto(dtfPath(dtf, 'governance/propose/basket-settings'))
  await connectWallet(page)

  // Pump — getFull hydration + proposer-state reads resolve but never reach
  // React under the paused clock; the form only mounts once the DTF hydrates.
  await advanceTime(page, 5_000)

  // Open the "Governance" accordion section (stable DOM id).
  await page
    .locator('#propose-section-governance')
    .getByRole('button')
    .first()
    .click()
  // Pump — the accordion scroll helper runs on a 250ms setTimeout.
  await advanceTime(page, 1_000)
}

// The governance section renders one number input per parameter, in order:
// Voting Delay, Voting Period, Proposal Threshold, Voting Quorum, Execution
// Delay. The Voting Period input is the second one.
const votingPeriodInput = (page: Page) =>
  page.locator('#propose-section-governance input[type="number"]').nth(1)

// The form seeds each field from the DTF's current governance params once the
// DTF hydrates (secondsToDays). Under the paused clock, React Query only
// notifies React when the clock is pumped, so advance in steps until the seeded
// value lands (never a bare poll, which would just re-read the stale 0).
async function readSeededValue(
  page: Page,
  input: ReturnType<typeof votingPeriodInput>
) {
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

// Drive the form to a new voting period, confirm, describe, and submit. Returns
// the decoded propose() args from the single recorded transaction.
async function submitVotingPeriodChange(
  page: Page,
  overrides: MockOverrides,
  txLog: { data: string; to: string; chainId: number; value: string }[]
) {
  await bootProposeBasketSettings(page, overrides)

  const input = votingPeriodInput(page)
  const currentDays = await readSeededValue(page, input)
  // Derive the new value from the live (snapshot-seeded) default so a re-capture
  // can't stale the diff. The updater compares days*86400 to the current period,
  // so any different day count registers a change.
  const newDays = currentDays + 1
  const newSeconds = Math.round(newDays * 86400)

  await input.fill(String(newDays))
  await expect(input).toHaveValue(String(newDays))
  await advanceTime(page, 1_000)

  const confirmBtn = confirmButton(page)
  await expect(confirmBtn).toBeEnabled()
  await confirmBtn.click()
  // Pump — confirm stage lazy-loads the MD editor (Suspense).
  await advanceTime(page, 2_000)

  await page.locator('#title').fill('E2E basket voting period change')
  await advanceTime(page, 1_000)

  const submitBtn = submitButton(page)
  await expect(submitBtn).toBeEnabled()
  await submitBtn.click()

  // Pump — receipt polling completes pending -> confirming -> success.
  await advanceTime(page, 10_000)

  expect(txLog).toHaveLength(1)
  const proposalTx = txLog[0]
  const decoded = decodeFunctionData({ abi: PROPOSE_ABI, data: proposalTx.data as Hex })
  expect(decoded.functionName).toBe('propose')
  return { proposalTx, args: decoded.args, newSeconds }
}

test('voting-period change round-trips into a setVotingPeriod calldata on the trading governor', async ({
  page,
  txLog,
  overrides,
}) => {
  const { proposalTx, args, newSeconds } = await submitVotingPeriodChange(
    page,
    overrides,
    txLog
  )
  const [targets, values, calldatas] = args

  // Basket settings route through the TRADING governor, not owner/vote-lock.
  const governor = loadDtf().tradingGovernance.id.toLowerCase()
  expect(proposalTx.chainId).toBe(dtf.chainId)
  expect(proposalTx.to).toBe(governor)
  expect(BigInt(proposalTx.value)).toBe(0n)

  // Every action in a basket-settings proposal targets the trading governor with
  // value 0.
  for (const target of targets) {
    expect((target as Address).toLowerCase()).toBe(governor)
  }
  expect(values).toEqual(targets.map(() => 0n))

  // Exactly one setVotingPeriod action, carrying our change. (Tolerant of the
  // phantom setProposalThreshold calldata — see the fixme test + report.)
  const votingPeriodCalldatas = (calldatas as Hex[]).filter((calldata) =>
    calldata.toLowerCase().startsWith(SET_VOTING_PERIOD_SELECTOR)
  )
  expect(votingPeriodCalldatas).toHaveLength(1)

  const setter = decodeFunctionData({
    abi: SET_VOTING_PERIOD_ABI,
    data: votingPeriodCalldatas[0],
  })
  expect(setter.functionName).toBe('setVotingPeriod')
  // CRITICAL: UI days -> seconds, exact round-trip, no drift (uint32 -> number).
  expect(Number(setter.args[0])).toBe(newSeconds)
})

test.fixme(
  'voting-period-only proposal contains a single action (no phantom threshold)',
  async ({ page, txLog, overrides }) => {
    // BUG: a voting-period-only basket-settings proposal ALSO emits a
    // setProposalThreshold (0xece40cc1) calldata the user never touched. Root
    // cause: propose-basket-settings/updater.tsx seeds basketVotingThreshold from
    // the SDK's already-percentage proposalThreshold (~L48) but its change
    // detector compares that field to Number(proposalThreshold) / 1e18 (~L128),
    // so proposalThreshold is permanently flagged changed. Un-fixme when the
    // updater compares like-for-like. Repro: exactly one calldata is expected.
    const { args } = await submitVotingPeriodChange(page, overrides, txLog)
    const calldatas = args[2] as Hex[]
    expect(calldatas).toHaveLength(1)
    expect(
      calldatas.some((calldata) =>
        calldata.toLowerCase().startsWith(SET_PROPOSAL_THRESHOLD_SELECTOR)
      )
    ).toBe(false)
  }
)

test.fixme(
  'no change keeps confirm disabled and never submits',
  async ({ page, txLog, overrides }) => {
    // BUG (same root cause as above): with nothing changed the confirm button
    // should stay disabled (isProposalValid = false) and no tx should be
    // possible. The phantom proposalThreshold change keeps isProposalValid true,
    // so confirm is enabled on an untouched form and an "empty" proposal can be
    // submitted. Un-fixme when the threshold change detector is fixed.
    await bootProposeBasketSettings(page, overrides)

    const input = votingPeriodInput(page)
    const current = await readSeededValue(page, input)

    await expect(confirmButton(page)).toBeDisabled()

    await input.fill(String(current))
    await advanceTime(page, 1_000)
    await expect(confirmButton(page)).toBeDisabled()

    expect(txLog).toHaveLength(0)
  }
)
