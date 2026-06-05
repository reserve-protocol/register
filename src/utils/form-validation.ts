export const shouldBypassFormValidation = (searchParams?: URLSearchParams) => {
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : undefined
  const isValidationDisabled =
    import.meta.env.VITE_DISABLE_VALIDATION === 'true'

  return (
    isValidationDisabled ||
    searchParams?.get('debug') === 'true' ||
    import.meta.env.DEV ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  )
}
