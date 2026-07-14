import { connectWallet, expect, test } from '../../../fixtures/wallet'
import { advanceTime, freezeTime, proposalTime } from '../../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../../helpers/registry'
import { loadEnrichedProposal } from '../../../helpers/subgraph'
import { loadSnapshot } from '../../../helpers/snapshots'
import { encodeAbiParameters } from 'viem'
import type { MockOverrides } from '../../../helpers/overrides'
import type { Page } from '@playwright/test'

// B3 (REGISTER_HARDENING.md): zod form bounds used to be bypassed on
// localhost/dev, so they were unassertable in e2e AND a broken bound could
// ship unnoticed. The e2e Vite server now sets VITE_E2E, which pins
// shouldBypassFormValidation OFF — this spec proves an out-of-range fee is
// actually rejected by the UI gate, like prod.
//
// RED-verify: remove VITE_E2E from playwright.config.ts webServer.env (or
// revert the VITE_E2E branch in src/utils/form-validation.ts) — the bypass
// re-enables the confirm button on the invalid value and this test must fail.
//
// Boot mirrors flows/governance-propose-dtf-settings.spec.ts (same form, same
// seams); see there for the WHYs on each override.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap, v5
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'

const dtf = findDtfByAddress(DTF_ADDRESS)!

type DtfSnapshot = { dtf: { stToken: { id: string } } }

const BOOL_TRUE = encodeAbiParameters([{ type: 'bool' }], [true])
const UINT_ZERO = encodeAbiParameters([{ type: 'uint256' }], [0n])

async function bootProposeFees(page: Page, overrides: MockOverrides) {
  const snapshot = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`).dtf
  overrides.ethCall(DTF_ADDRESS, '0x459cf24b', BOOL_TRUE) // bidsEnabled()
  overrides.ethCall(snapshot.stToken.id, '0x18160ddd', UINT_ZERO) // keep Tenderly sim not-ready

  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  await freezeTime(
    page,
    proposalTime(proposal as { voteStart: string; voteEnd: string }, 'active')
  )

  await page.goto(dtfPath(dtf, 'governance/propose/dtf'))
  await connectWallet(page)
  await advanceTime(page, 5_000)

  await page.locator('#propose-section-fees').getByRole('button').first().click()
  await advanceTime(page, 1_000)
}

const tvlFeeInput = (page: Page) =>
  page.locator('#propose-section-fees input[type="number"]').first()
const confirmButton = (page: Page) =>
  page.getByRole('button', { name: 'Confirm & prepare proposal' })

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

test('out-of-range TVL fee is rejected: confirm gate stays disabled', async ({
  page,
  overrides,
  txLog,
}) => {
  await bootProposeFees(page, overrides)

  const input = tvlFeeInput(page)
  const current = await readSeededFee(page, input)

  // Control: an IN-range change enables confirm — proving the disabled state
  // below is the validation gate, not a missing-change or boot problem.
  const inRange = current + 1 > 10 ? current - 1 : current + 1
  await input.fill(String(inRange))
  await advanceTime(page, 1_000)
  await expect(confirmButton(page)).toBeEnabled()

  // Out of range (schema max is 10%): the zod bound must gate the flow.
  await input.fill('50')
  await advanceTime(page, 1_000)
  await expect(confirmButton(page)).toBeDisabled()

  // Below the 0.15% minimum too.
  await input.fill('0.01')
  await advanceTime(page, 1_000)
  await expect(confirmButton(page)).toBeDisabled()

  expect(txLog).toHaveLength(0)
})
