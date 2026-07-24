interface FormValidationEnv {
  DEV: boolean
  VITE_E2E?: string
  VITE_DISABLE_VALIDATION?: string
}

// Pure core, extracted so the bypass matrix is unit-testable
// (src/utils/tests/form-validation.test.ts).
export const computeFormValidationBypass = (
  env: FormValidationEnv,
  hostname: string | undefined,
  searchParams?: URLSearchParams
): boolean => {
  const debugRequested = searchParams?.get('debug') === 'true'
  // The e2e harness runs on localhost in dev mode but must assert prod-like
  // form bounds (B3): only the explicit ?debug=true escape hatch — which prod
  // honors too — survives. VITE_E2E is set by playwright.config.ts webServer.
  if (env.VITE_E2E === 'true') return debugRequested

  return (
    env.VITE_DISABLE_VALIDATION === 'true' ||
    debugRequested ||
    env.DEV ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  )
}

export const shouldBypassFormValidation = (searchParams?: URLSearchParams) =>
  computeFormValidationBypass(
    import.meta.env,
    typeof window !== 'undefined' ? window.location.hostname : undefined,
    searchParams
  )
