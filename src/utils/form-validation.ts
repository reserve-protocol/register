export const shouldBypassFormValidation = (searchParams?: URLSearchParams) => {
  const hostname = window.location.hostname

  return (
    !!import.meta.env.VITE_DISABLE_VALIDATION ||
    searchParams?.get('debug') === 'true' ||
    import.meta.env.DEV ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  )
}
