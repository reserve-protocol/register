import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'

// Geolocation / compliance gating on the Index DTF trade surface.
//
// Gating map (derived from src, no wallet needed — geolocation & DTF checks are
// IP-based in useComplianceRestrictions):
//   - /v2/compliance/geolocation (top-level) restricted:true  -> reason
//     'geolocation', short-circuits before the per-DTF check. The `compliance`
//     fixture option drives this response.
//   - /v2/compliance/geolocation/dtf/<addr> restricted:true   -> per-DTF gate,
//     carries a granular reason ('geolocation-restricted' | 'geolocation-
//     prohibited' | 'vpn'). This endpoint is NOT seeded by the shared api mock,
//     so it's driven here with overrides.api().
//   - Top-level `isVPN` is NOT a gating input (only useTrackPage reads it); the
//     'vpn' reason arrives via the per-DTF endpoint's `restriction` field.
//
// On the issuance page (panelMode defaults to 'swap') a restricted result
// renders <ComplianceAlert> (testid `compliance-alert`) and passes
// disabled=true to the Zapper; an allowed result renders neither.
//
// No frozen clock here: these flows don't pin a governance/rebalance phase, so
// react-query runs normally and needs no clock pumps.
//
// KNOWN BLOCKER (shared infra — reported to orchestrator): the issuance page
// does `if (!indexDTF) return null`, and `indexDTFAtom` never populates because
// react-sdk 0.2.0's `sdk.index.get` throws on the FLAT `GetIndexDTF` snapshot
// captured by `e2e/scripts/capture.ts` (SDK 0.2.0 expects a nested DTF schema).
// So `dtf-issuance` never renders and all three tests fail on that visibility
// wait. The compliance gating logic asserted here is correct; the spec goes
// green once the DTF subgraph snapshot is re-captured against SDK 0.2.0.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const dtf = findDtfByAddress(DTF_ADDRESS)!

// Per-DTF geolocation endpoint shape (validated by isDTFGeolocationStatus in
// use-dtf-restricted.ts: requires `restriction`, not `isVPN`).
const DTF_GEO_PATH = '/compliance/geolocation/dtf/'
const allowedDtfGeo = {
  country: 'United States',
  countryCode: 'US',
  restricted: false,
  restriction: 'none',
}
const restrictedDtfGeo = (restriction: 'vpn' | 'geolocation-prohibited') => ({
  country: 'Germany',
  countryCode: 'DE',
  restricted: true,
  restriction,
})

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
  }) => {
    await page.goto(dtfPath(dtf, 'issuance'))

    // The issuance panel mounted, and the compliance alert gates it.
    await expect(page.getByTestId('dtf-issuance')).toBeVisible()
    await expect(page.getByTestId('compliance-alert')).toBeVisible()
  })
})

test.describe('per-DTF VPN restriction', () => {
  // Top-level geolocation is unrestricted; the per-DTF endpoint flags a VPN.
  // Proves the 'vpn' reason path (useDTFRestricted) gates independently of the
  // top-level check — the code branch that top-level `isVPN` does NOT drive.
  test('a VPN flag from the per-DTF endpoint blocks the trade surface', async ({
    page,
    overrides,
  }) => {
    overrides.api(DTF_GEO_PATH, restrictedDtfGeo('vpn'))

    await page.goto(dtfPath(dtf, 'issuance'))

    await expect(page.getByTestId('dtf-issuance')).toBeVisible()
    await expect(page.getByTestId('compliance-alert')).toBeVisible()
  })
})

test.describe('unrestricted (default)', () => {
  // Sanity: with both the top-level (fixture default US) and the per-DTF
  // endpoint unrestricted, the same surface stays open — no compliance alert.
  // The per-DTF override is required because the shared api mock returns the
  // top-level geo shape for the DTF endpoint, which fails validation and
  // fail-closes useDTFRestricted (reported to the orchestrator).
  test('an unrestricted result leaves the issuance trade surface open', async ({
    page,
    overrides,
  }) => {
    overrides.api(DTF_GEO_PATH, allowedDtfGeo)

    await page.goto(dtfPath(dtf, 'issuance'))

    await expect(page.getByTestId('dtf-issuance')).toBeVisible()
    await expect(page.getByTestId('compliance-alert')).toHaveCount(0)
  })
})
