const CHUNK_ERRORS = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'Unable to preload CSS',
]
const RELOAD_KEY = 'chunk-error-reload-at'
const RELOAD_COOLDOWN_MS = 60_000

export const isChunkLoadError = (error: Error) =>
  CHUNK_ERRORS.some((message) => error.message.includes(message))

/** Allows one automatic reload per tab per minute, so a persistent failure does not reload forever */
export const claimAutoReload = (now = Date.now()) => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY))
    if (last && now - last < RELOAD_COOLDOWN_MS) return false
    sessionStorage.setItem(RELOAD_KEY, String(now))
    return true
  } catch {
    return false
  }
}
