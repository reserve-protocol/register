import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { Address } from 'viem'

const REFERRAL_KEY = 'register:referral'
const CODE_REGEX = /^[a-zA-Z0-9_-]{1,32}$/

// localStorage throws in Safari Private Mode / storage-blocked webviews —
// referral tracking must never take the app down.
const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const safeSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

const getStoredReferral = (): string | null => {
  const code = safeGet(REFERRAL_KEY)
  return code && CODE_REGEX.test(code) ? code : null
}

// Reads ?referral= from both link forms: /?referral=x and legacy
// /#/?referral=x — including when a real query string precedes the hash
// (/?utm_source=x#/?referral=y), which a naive replace('/#/', '/') misses.
const readReferralFromUrl = (): string | null => {
  const { search, hash } = window.location
  const hashQuery = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : ''
  const code = (
    new URLSearchParams(search).get('referral') ??
    new URLSearchParams(hashQuery).get('referral')
  )?.toLowerCase()

  return code && CODE_REGEX.test(code) ? code : null
}

// Survives the page load in memory so attribution still works this session
// when storage is blocked, and after Redirects rewrites the URL.
let urlReferralCode: string | null = null

const getActiveReferral = () => urlReferralCode ?? getStoredReferral()

// Called from index.tsx BEFORE React renders: effects (legacy Redirects
// navigation, wallet-link in AtomUpdater) run before App's own effects and
// must never observe the URL or storage pre-capture. Last-touch: a new
// ?referral= always overwrites (no expiry — multi-month campaign). The
// mixpanel half lives in registerReferralSuperProperty; mixpanel is not
// initialized yet here.
export const storeReferralFromUrl = () => {
  urlReferralCode = readReferralFromUrl()
  if (urlReferralCode) {
    safeSet(REFERRAL_KEY, urlReferralCode)
  }
}

// Called right after mixpanel.init — the auto pageview at init fires before
// the super property exists, so referral_landed is the reliable landing
// signal, not pageviews.
export const registerReferralSuperProperty = () => {
  const code = getActiveReferral()
  if (!code) return

  mixpanel.register({ referral: code })
  if (urlReferralCode) {
    mixpanel.track('referral_landed')
  }
}

// Guards concurrent effect re-runs (and caps storage-blocked browsers at one
// event per session).
const linkedThisSession = new Set<string>()

// The wallet<>code link lives in Mixpanel only: this event is the attribution
// record, extracted later via the Mixpanel export API. Conversions are
// settled post-campaign from on-chain data.
export const linkWalletToReferral = (wallet: Address) => {
  const code = getActiveReferral()
  if (!code) return

  // Scoped by mixpanel project so events fired against the staging project
  // can't suppress the prod event after keys flip.
  const project = import.meta.env.VITE_MIXPANEL_KEY || 'mixpanel_key'
  const linkedKey = `register:referral-linked:${project}:${wallet.toLowerCase()}:${code}`
  if (linkedThisSession.has(linkedKey) || safeGet(linkedKey)) return

  linkedThisSession.add(linkedKey)
  safeSet(linkedKey, '1')
  mixpanel.track('referral_wallet_linked', {
    wallet: wallet.toLowerCase(),
    code,
  })
}
