// Guard for operator-provided URLs (brand/campaign metadata) before rendering
// them as anchors — a javascript:/data: href would execute in the app origin.
export const isSafeHttpUrl = (url: string | null | undefined): url is string => {
  if (!url) return false
  try {
    const { protocol } = new URL(url, window.location.origin)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}
