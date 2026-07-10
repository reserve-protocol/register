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
const DTF_GEO_PATH = '/compliance/geolocation/dtf/'
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
  // Sanity: with the fixture defaults (top-level US unrestricted + the shared
  // api mock's unrestricted per-DTF answer), the same surface stays open.
  test('an unrestricted result leaves the issuance trade surface open', async ({
    page,
  }) => {
    await page.goto(dtfPath(dtf, 'issuance'))

    await expect(page.getByTestId('dtf-issuance')).toBeVisible()
    await expect(page.getByTestId('compliance-alert')).toHaveCount(0)
  })
})
