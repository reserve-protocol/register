import type { Locator, Page } from '@playwright/test'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { mockZapperRoutes, seedZapSurface, zapUnmockedLogger } from '../../helpers/zapper'

// Characterizes the DEPRECATED-DTF trade surface on /issuance. base/deprecated
// (a v4.0.0 VTF) is flagged inactive by the deprecation registry
// (use-dtf-status.ts), which drives indexDTFStatusAtom -> isInactiveDTF -> the
// react-zapper widget's `sellOnly` prop (issuance/index.tsx). The product
// intent: a deprecated DTF can be REDEEMED (sold) but never MINTED (bought), so
// holders can exit but no new capital flows in. This spec pins that contract:
//
//   - sellOnly forces the widget onto the SELL tab and DISABLES the BUY tab,
//   - the sell surface stays interactive (redeem is still available),
//   - no buy panel is reachable, so no mint tx is ever submittable (txLog empty).
//
// If buying is reachable or submittable on a deprecated DTF this is a real
// exit-only bug — the test converts to test.fixme + a BUG note rather than
// masking it.
//
// SELECTORS: the react-zapper package ships no data-testids and its copy is
// Lingui-translated, so we anchor on locale-independent structure (same
// contract as zap-buy-sell.spec.ts): register's `issuance-zap-widget` scopes
// the card; Radix Tabs render value-derived ids ("…-trigger-buy"/"-sell") and
// data-state; the amount fields are the only inputmode="decimal" inputs.
//
// TIME is deliberately NOT frozen — nothing here derives from snapshot
// timestamps and every mock answers instantly (matches the zap specs).

const DEPRECATED = '0x47686106181b3cefe4eaf94c4c10b48ac750370b' // base/deprecated (VTF, v4.0.0)

function widget(page: Page): Locator {
  return page.getByTestId('issuance-zap-widget')
}

function buyTab(page: Page): Locator {
  return widget(page).locator('button[role="tab"][id$="-trigger-buy"]')
}

function sellTab(page: Page): Locator {
  return widget(page).locator('button[role="tab"][id$="-trigger-sell"]')
}

function activePanel(page: Page): Locator {
  return widget(page).locator('div[role="tabpanel"][data-state="active"]')
}

async function setupDeprecatedIssuance(
  page: Page,
  overrides: Parameters<typeof seedZapSurface>[0],
  unmockedCalls: string[]
) {
  // Seed the folio's own name/symbol reads and install the zapper boundary. No
  // zap-*.json snapshots exist for the deprecated DTF (nothing enters an amount
  // here), so mockZapperRoutes installs pure fail-loud guards: any stray quote
  // 500s + lands in unmockedCalls instead of escaping to the network.
  seedZapSurface(overrides, DEPRECATED)
  await mockZapperRoutes(page, DEPRECATED, zapUnmockedLogger(unmockedCalls))
  const dtf = findDtfByAddress(DEPRECATED)!
  await page.goto(dtfPath(dtf, 'issuance'))
  await connectWallet(page)
  await expect(widget(page)).toBeVisible({ timeout: 15_000 })
}

test('deprecated DTF forces sell-only: buy tab disabled, sell active, no mint submittable', async ({
  page,
  overrides,
  unmockedCalls,
  txLog,
}) => {
  await setupDeprecatedIssuance(page, overrides, unmockedCalls)

  // sellOnly pins the active tab to SELL and disables BUY. Both triggers still
  // render (the widget only greys out buy), so redeem is discoverable and the
  // one-way restriction is visible rather than silently hiding the surface.
  await expect(sellTab(page)).toHaveAttribute('data-state', 'active')
  await expect(buyTab(page)).toHaveAttribute('data-state', 'inactive')
  await expect(buyTab(page)).toBeDisabled()

  // Redeem stays interactive: the active (sell) panel mounts its amount fields.
  const panel = activePanel(page)
  await expect(panel.locator('input[inputmode="decimal"]')).toHaveCount(2)

  // The disabled buy tab must not switch panels even under a forced click — the
  // widget's onValueChange drops "buy" while sellOnly is set, so no buy panel
  // ever mounts and there is no reachable mint input.
  await buyTab(page).click({ force: true })
  await expect(sellTab(page)).toHaveAttribute('data-state', 'active')
  await expect(
    widget(page).locator('div[role="tabpanel"][id$="-content-buy"][data-state="active"]')
  ).toHaveCount(0)

  // No buy path was reachable, so nothing was ever submitted — the mint side is
  // not just visually blocked but non-transactable.
  expect(txLog).toHaveLength(0)
  expect(unmockedCalls).toEqual([])
})
