import { describe, expect, it } from 'vitest'
import { computeFormValidationBypass } from '../form-validation'

const prodEnv = { DEV: false }
const devEnv = { DEV: true }
const e2eEnv = { DEV: true, VITE_E2E: 'true' }
const debugParams = new URLSearchParams('debug=true')

describe('computeFormValidationBypass', () => {
  it('bypasses on dev builds and localhost hosts', () => {
    expect(computeFormValidationBypass(devEnv, 'app.reserve.org')).toBe(true)
    expect(computeFormValidationBypass(prodEnv, 'localhost')).toBe(true)
    expect(computeFormValidationBypass(prodEnv, '127.0.0.1')).toBe(true)
    expect(
      computeFormValidationBypass({ DEV: false, VITE_DISABLE_VALIDATION: 'true' }, 'app.reserve.org')
    ).toBe(true)
  })

  it('enforces validation on prod hosts unless ?debug=true', () => {
    expect(computeFormValidationBypass(prodEnv, 'app.reserve.org')).toBe(false)
    expect(computeFormValidationBypass(prodEnv, 'app.reserve.org', debugParams)).toBe(true)
  })

  it('VITE_E2E pins prod-like validation even on dev/localhost (B3)', () => {
    expect(computeFormValidationBypass(e2eEnv, 'localhost')).toBe(false)
    expect(computeFormValidationBypass(e2eEnv, '127.0.0.1')).toBe(false)
    expect(
      computeFormValidationBypass({ ...e2eEnv, VITE_DISABLE_VALIDATION: 'true' }, 'localhost')
    ).toBe(false)
    // The explicit escape hatch prod also honors stays available.
    expect(computeFormValidationBypass(e2eEnv, 'localhost', debugParams)).toBe(true)
  })
})
