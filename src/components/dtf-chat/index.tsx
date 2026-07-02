import { useIsDesktop } from '@/hooks/use-media-query'
import { chainIdAtom } from '@/state/atoms'
import {
  iTokenAddressAtom,
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFStatusAtom,
} from '@/state/dtf/atoms'
import { t } from '@lingui/core/macro'
import {
  ReserveChat,
  type DtfContext,
  type ReserveView,
} from '@reserve-protocol/dtf-chat'
import '@reserve-protocol/dtf-chat/styles.css'
import './overrides.css'
import { useAtomValue } from 'jotai'
import { useLocation, useNavigate } from 'react-router-dom'

// Public Turnstile site key for the chat.reserve.org deployment (paired with
// app.reserve.org). Not secret. Dropped automatically when pointing at a local
// dev server (which runs without Turnstile).
const TURNSTILE_SITE_KEY = '0x4AAAAAADiKRe72qu3srt7k'

function onLocalhost(): boolean {
  return (
    typeof window !== 'undefined' &&
    /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
  )
}

/**
 * Chat server URL. Priority:
 *   1. localStorage 'dtfChatApi'  (set in the console, reload — no rebuild)
 *   2. VITE_DTF_CHAT_API env       (.env.local)
 *   3. on localhost → local dev server (no Turnstile, no CORS friction)
 *   4. else undefined → package default (https://chat.reserve.org, live)
 * To hit live from a local Register, set one of the overrides to the live URL.
 */
function resolveApiBase(): string | undefined {
  try {
    const ls = localStorage.getItem('dtfChatApi')
    if (ls) return ls
  } catch {
    /* SSR / blocked storage */
  }
  if (import.meta.env.VITE_DTF_CHAT_API)
    return import.meta.env.VITE_DTF_CHAT_API
  if (onLocalhost()) return 'http://localhost:8787'
  return undefined
}

// Top-level screen → known view. DTF routes return undefined (handled via
// dtfContext); unknown routes (home, etc.) → undefined → general mode.
function viewForPath(pathname: string): ReserveView | undefined {
  if (pathname.startsWith('/earn')) return 'earn'
  if (pathname.startsWith('/explorer')) return 'explorer'
  if (pathname.startsWith('/bridge')) return 'bridge'
  if (pathname.startsWith('/portfolio')) return 'portfolio'
  return undefined
}

const DtfChat = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const address = useAtomValue(iTokenAddressAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const status = useAtomValue(indexDTFStatusAtom)

  const apiBase = resolveApiBase()
  // Turnstile follows the SERVER: a local chat server runs without it, so skip
  // the challenge there. Live (chat.reserve.org, apiBase undefined) requires it.
  const local = /localhost|127\.0\.0\.1/.test(apiBase ?? '')

  // On a DTF page with a loaded address → DTF mode (tools fetch live fees/price/
  // weights, so we keep the static context to identity + mandate + holdings).
  const onDtf = !!address && pathname.includes('index-dtf')

  // DTF mobile pages use their own action bar for chat, but ReserveChat still
  // needs to stay mounted so that custom button can trigger the panel. Desktop
  // keeps the standard launcher.
  const hideLauncher = onDtf

  // 24px gap on desktop, 12px on mobile.
  const isDesktop = useIsDesktop()
  const gap = isDesktop ? 24 : 12
  const bottomOffset = gap
  const rightOffset = gap

  const dtfContext: DtfContext | undefined = onDtf
    ? {
        address,
        chainId,
        symbol: dtf?.token.symbol,
        name: dtf?.token.name,
        mandate: dtf?.mandate,
        status,
        basket: basket?.map((t) => ({ symbol: t.symbol })),
      }
    : undefined

  return (
    <div className={hideLauncher ? 'dtf-chat-hide-mobile-launcher' : undefined}>
      <ReserveChat
        apiBase={apiBase}
        // Turnstile only against the live server; a local dev server runs without it.
        turnstileSiteKey={local ? undefined : TURNSTILE_SITE_KEY}
        dtfContext={dtfContext}
        launcherLabel={t`Ask Reserve AI`}
        view={dtfContext ? undefined : viewForPath(pathname)}
        offset={{ bottom: bottomOffset, right: rightOffset }}
        zIndex={50}
        // Assistant links to app pages route through react-router — no full reload.
        onNavigate={navigate}
      />
    </div>
  )
}

export default DtfChat
