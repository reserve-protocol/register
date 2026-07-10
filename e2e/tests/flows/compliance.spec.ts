import type { Page } from '@playwright/test'
import { formatUnits } from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import type { MockOverrides } from '../../helpers/overrides'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import {
  loadZapSnapshot,
  mockZapperRoutes,
  seedZapSurface,
  zapUnmockedLogger,
} from '../../helpers/zapper'

// Geolocation / compliance gating on the Index DTF trade surface.
//
// Gating map (derived from src, no wallet needed — geolocation & DTF checks are
// IP-based in useComplianceRestrictions):
//   - /v2/compliance/geolocation (top-level) restricted:true  -> reason
//     'geolocation', short-circuits before the per-DTF check. The `compliance`
//     fixture option drives this response.
//   - /v2/compliance/geolocation/dtf/<addr> restricted:true   -> per-DTF gate,
//     carries a granular reason ('geolocation-restricted' | 'geolocation-
//     prohibited' | 'vpn'). The shared api mock answers it unrestricted by
//     default; restricted variants are driven here with overrides.api().
//   - Top-level `isVPN` is NOT a gating input (only useTrackPage reads it); the
//     'vpn' reason arrives via the per-DTF endpoint's `restriction` field.
//
// On the issuance page (panelMode defaults to 'swap') a restricted result
// renders <ComplianceAlert> (testid `compliance-alert`) and passes
// disabled=true to the Zapper; an allowed result renders neither.
//
// No frozen clock here: these flows don't pin a governance/rebalance phase, so
// react-query runs normally and needs no clock pumps.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const dtf = findDtfByAddress(DTF_ADDRESS)!

// Per-DTF geolocation endpoint shape (validated by isDTFGeolocationStatus in
// use-dtf-restricted.ts: requires `restriction`, not `isVPN`).
const DTF_GEO_PATH = `/v2/compliance/geolocation/dtf/${DTF_ADDRESS}`
const restrictedDtfGeo = (restriction: 'vpn' | 'geolocation-prohibited') => ({
  country: 'Germany',
  countryCode: 'DE',
  restricted: true,
  restriction,
})

async function openTradeSurface(
  page: Page,
  overrides: MockOverrides,
  unmockedCalls: string[]
) {
  seedZapSurface(overrides, DTF_ADDRESS)
  await mockZapperRoutes(page, DTF_ADDRESS, zapUnmockedLogger(unmockedCalls))
  await page.goto(dtfPath(dtf, 'issuance'))
  await connectWallet(page)
  const widget = page.getByTestId('issuance-zap-widget')
  await expect(widget).toBeVisible({ timeout: 15_000 })
  return widget
}

async function enterPinnedBuyAmount(widget: ReturnType<Page['getByTestId']>) {
  const snapshot = loadZapSnapshot(DTF_ADDRESS, 'buy')
  await widget
    .locator('input[inputmode="decimal"]:not([disabled])')
    .fill(formatUnits(BigInt(snapshot.params.amountIn), 18))
  await expect(widget.locator('input[inputmode="decimal"][disabled]')).not.toHaveValue('')
}

test.describe('restricted region', () => {
  test.use({
    compliance: {
      country: 'France',
      countryCode: 'FR',
      restricted: true,
      isVPN: false,
    },
  })

  test('top-level geo restriction blocks the issuance trade surface', async ({
    page,
    overrides,
    unmockedCalls,
    txLog,
  }) => {
    const widget = await openTradeSurface(page, overrides, unmockedCalls)

    // The issuance panel mounted, and the compliance alert gates it.
    await expect(page.getByTestId('dtf-issuance')).toBeVisible()
    await expect(page.getByTestId('compliance-alert')).toBeVisible()
    await expect(widget).toHaveAttribute('data-restricted', 'true')
    await expect(widget.locator('input[inputmode="decimal"]:not([disabled])')).toHaveCount(0)
    await expect(widget.locator('button').last()).toBeDisabled()
    expect(txLog).toEqual([])
  })
})

test.describe('per-DTF VPN restriction', () => {
  // Top-level geolocation is unrestricted; the per-DTF endpoint flags a VPN.
  // Proves the 'vpn' reason path (useDTFRestricted) gates independently of the
  // top-level check — the code branch that top-level `isVPN` does NOT drive.
  test('a VPN flag from the per-DTF endpoint blocks the trade surface', async ({
    page,
    overrides,
    unmockedCalls,
    txLog,
  }) => {
    overrides.api(
      { pathname: DTF_GEO_PATH, search: { chainId: String(dtf.chainId) } },
      restrictedDtfGeo('vpn')
    )

    const widget = await openTradeSurface(page, overrides, unmockedCalls)

    await expect(page.getByTestId('dtf-issuance')).toBeVisible()
    await expect(page.getByTestId('compliance-alert')).toBeVisible()
    await expect(widget).toHaveAttribute('data-restricted', 'true')
    await expect(widget.locator('input[inputmode="decimal"]:not([disabled])')).toHaveCount(0)
    await expect(widget.locator('button').last()).toBeDisabled()
    expect(txLog).toEqual([])
  })
})

test.describe('unrestricted (default)', () => {
  // Sanity: with the fixture defaults (top-level US unrestricted + the shared
  // api mock's unrestricted per-DTF answer), the same surface stays open.
  test('an unrestricted result leaves the issuance trade surface open', async ({
    page,
    overrides,
    unmockedCalls,
  }) => {
    const widget = await openTradeSurface(page, overrides, unmockedCalls)
    await enterPinnedBuyAmount(widget)

    await expect(page.getByTestId('dtf-issuance')).toBeVisible()
    await expect(page.getByTestId('compliance-alert')).toHaveCount(0)
    await expect(widget).toHaveAttribute('data-restricted', 'false')
    await expect(widget.locator('button').last()).toBeEnabled()
  })
})
