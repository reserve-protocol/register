import { connectWallet, expect, test } from '../../fixtures/wallet'
import { advanceTime, freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadEnrichedProposal } from '../../helpers/subgraph'
import { loadSnapshot } from '../../helpers/snapshots'
import { encodeAbiParameters } from 'viem'
import type { MockOverrides } from '../../helpers/overrides'
import type { Page } from '@playwright/test'

// Basket-change propose flow — the reachable slice. base/lcap is a v5 HYBRID DTF
// (unit-based basket), so the setup table renders in unit mode and the proposal
// calldata (folio.startRebalance) is derived from proposed units + token prices
// + supply + rebalanceControl (all served by the existing SDK/current-dtf and
// chain-state mocks). We cover: (1) the form renders with the real basket
// listed, and (2) the empty/no-change guard blocks preparing a proposal.
//
// NOT covered here (honest partial — see report): the full submit of a modified
// unit basket. Driving a *valid* new unit distribution for a hybrid DTF depends
// on the derived-share math (units x price -> shares) AND the TTL / launch-window
// settings, and the resulting startRebalance byte payload comes out of
// @reserve-protocol/dtf-rebalance-lib's getStartRebalance — a shape we cannot
// assert against without a captured golden calldata. See the fixture-gap note.
//
// NOTE (fixture gap): the basket propose components ship NO data-testids and the
// setup accordion item has no DOM id (unlike propose-dtf-settings'
// #propose-section-fees), so selection falls back to getByRole with English copy
// (locale pinned to `en` in the base fixture -> deterministic here).

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap, v5 hybrid
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'

const dtf = findDtfByAddress(DTF_ADDRESS)!

type ChainState = {
  basketTokens: Array<{ address: string; symbol: string; decimals: number }>
}
const loadBasket = () =>
  loadSnapshot<ChainState>(`${dtf.snapshotDir}/chain-state.json`).basketTokens

const BOOL_TRUE = encodeAbiParameters([{ type: 'bool' }], [true])
const UINT_ZERO = encodeAbiParameters([{ type: 'uint256' }], [0n])

async function bootProposeBasket(page: Page, overrides: MockOverrides) {
  // Folio reads the DTF-settings Updater / basket updater make that the central
  // chain-state seed doesn't cover. Inert values — the basket form doesn't
  // depend on their magnitude.
  overrides.ethCall(DTF_ADDRESS, '0x459cf24b', BOOL_TRUE) // bidsEnabled()
  overrides.ethCall(DTF_ADDRESS, '0x759e3d21', UINT_ZERO) // auctionDelay()

  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  await freezeTime(
    page,
    proposalTime(proposal as { voteStart: string; voteEnd: string }, 'active')
  )

  await page.goto(dtfPath(dtf, 'governance/propose/basket'))
  await connectWallet(page)
  await advanceTime(page, 5_000)

  // The basket step is collapsed by default (default step is "advance"); open it.
  await page.getByRole('button', { name: /Set basket composition/ }).click()
  await advanceTime(page, 2_000)
}

// Exact match: a non-exact name also matches an unrelated lowercase
// "Confirm & prepare proposal" button elsewhere on the page.
const confirmPrepareButton = (page: Page) =>
  page.getByRole('button', { name: 'Confirm & Prepare Proposal', exact: true })

test('basket propose: form renders with the current basket listed', async ({
  page,
  overrides,
}) => {
  await bootProposeBasket(page, overrides)

  const tokens = loadBasket()
  // Pump until the basket hydrates (SDK current-dtf + chain-state totalAssets),
  // then assert every real basket token is listed.
  for (let i = 0; i < 10; i++) {
    if (await page.getByText(tokens[0].symbol, { exact: false }).count()) break
    await advanceTime(page, 1_000)
  }
  for (const token of tokens) {
    await expect(
      page.getByText(token.symbol, { exact: false }).first()
    ).toBeVisible()
  }
})

test('basket propose: no change cannot prepare a proposal (empty-submission guard)', async ({
  page,
  txLog,
  overrides,
}) => {
  await bootProposeBasket(page, overrides)

  const tokens = loadBasket()
  for (let i = 0; i < 10; i++) {
    if (await page.getByText(tokens[0].symbol, { exact: false }).count()) break
    await advanceTime(page, 1_000)
  }

  // With the basket unchanged there is nothing to rebalance — the derived-share
  // diff is empty, so "Confirm & Prepare Proposal" must stay disabled. This is
  // the reachable half of the validation surface (a proposal can't be prepared,
  // let alone submitted, from an unmodified basket).
  const confirmBtn = confirmPrepareButton(page)
  await expect(confirmBtn).toBeVisible()
  await expect(confirmBtn).toBeDisabled()

  // Re-typing a token's current unit value is still a no-op change.
  const unitInput = page
    .locator('table input[inputmode="decimal"], table input[type="text"]')
    .first()
  if (await unitInput.count()) {
    const current = await unitInput.inputValue()
    await unitInput.fill(current)
    await advanceTime(page, 1_000)
    await expect(confirmBtn).toBeDisabled()
  }

  // Nothing was ever submitted.
  expect(txLog).toHaveLength(0)
})
