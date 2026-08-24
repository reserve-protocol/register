import type { Locator, Page } from '@playwright/test'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import {
  activeZapPanel,
  mockZapperRoutes,
  seedZapSurface,
  zapFlipButton,
  zapPanel,
  zapUnmockedLogger,
} from '../../helpers/zapper'

// Characterizes the DEPRECATED-DTF trade surface on /issuance. base/deprecated
// (a v4.0.0 VTF) is flagged inactive by the deprecation registry
// (use-dtf-status.ts), which drives indexDTFStatusAtom -> isInactiveDTF -> the
// react-zapper widget's `sellOnly` prop (issuance/index.tsx). The product
// intent: a deprecated DTF can be REDEEMED (sold) but never MINTED (bought), so
// holders can exit but no new capital flows in. This spec pins that contract:
//
//   - sellOnly pins the widget to the SELL panel and removes the buy<->sell
//     direction arrow (its only switch since react-zapper 2.10 hid the tabs),
//   - the sell surface stays interactive (redeem is still available),
//   - no buy panel is reachable, so no mint tx is ever submittable (txLog empty).
//
// If buying is reachable or submittable on a deprecated DTF this is a real
// exit-only bug — the test converts to test.fixme + a BUG note rather than
// masking it.
//
// SELECTORS: the react-zapper package ships no data-testids and its copy is
// Lingui-translated, so we anchor on locale-independent structure (the widget
// structure contract in helpers/zapper.ts): register's `issuance-zap-widget`
// scopes the card; Radix panels carry value-derived ids ("…-content-buy"/
// "-sell") and data-state; the amount fields are the only inputmode="decimal"
// inputs.
//
// TIME is deliberately NOT frozen — nothing here derives from snapshot
// timestamps and every mock answers instantly (matches the zap specs).

// 90s per-test budget: page load + wallet connect + the widget's first paint
// take well past the 30s default when the full suite shares one dev server
// (same rationale as the zap flow specs; contention, not a product wait).
test.describe.configure({ timeout: 90_000 })

const DEPRECATED = '0x47686106181b3cefe4eaf94c4c10b48ac750370b' // base/deprecated (VTF, v4.0.0)

function widget(page: Page): Locator {
  return page.getByTestId('issuance-zap-widget')
}

function activePanel(page: Page): Locator {
  return activeZapPanel(widget(page))
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

test('deprecated DTF forces sell-only: sell active, no direction flip, no mint submittable', async ({
  page,
  overrides,
  unmockedCalls,
  txLog,
}) => {
  await setupDeprecatedIssuance(page, overrides, unmockedCalls)

  // sellOnly pins the active panel to SELL; the buy panel stays inactive.
  await expect(zapPanel(widget(page), 'sell')).toHaveAttribute(
    'data-state',
    'active'
  )
  await expect(zapPanel(widget(page), 'buy')).toHaveAttribute(
    'data-state',
    'inactive'
  )

  // Redeem stays interactive: the active (sell) panel mounts its amount fields.
  const panel = activePanel(page)
  await expect(panel).toBeVisible({ timeout: 15_000 })
  await expect(panel.locator('input[inputmode="decimal"]')).toHaveCount(2)

  // The direction arrow is the only buy<->sell switch and sellOnly drops it
  // (the sell form renders a static divider instead), so there is no reachable
  // control that could mount the buy panel and its mint input.
  await expect(zapFlipButton(widget(page))).toHaveCount(0)
  await expect(
    widget(page).locator(
      'div[role="tabpanel"][id$="-content-buy"][data-state="active"]'
    )
  ).toHaveCount(0)

  // No buy path was reachable, so nothing was ever submitted — the mint side is
  // not just visually blocked but non-transactable.
  expect(txLog).toHaveLength(0)
  expect(unmockedCalls).toEqual([])
})
