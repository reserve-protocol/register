import { useCallback, useEffect, useRef, useState } from 'react'

const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

// Must match the action the Reserve API endpoint expects for the token
export type TurnstileAction =
  | 'eligibility'
  | 'confirm-eligibility'
  | 'create-dtf'
  | 'vip-minter'

type TurnstileRenderOptions = {
  sitekey: string
  action?: string
  appearance?: 'always' | 'execute' | 'interaction-only'
  size?: 'normal' | 'flexible' | 'compact'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let scriptPromise: Promise<void> | undefined

const loadTurnstile = () => {
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = undefined
      reject(new Error('Failed to load Turnstile'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

const useTurnstile = (siteKey: string, action: TurnstileAction) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string>()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          appearance: 'interaction-only',
          size: 'flexible',
          callback: setToken,
          'expired-callback': () => setToken(null),
          'error-callback': () => setToken(null),
        })
      })
      .catch((error) => console.error(error))

    return () => {
      cancelled = true
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current)
      widgetIdRef.current = undefined
    }
  }, [siteKey, action])

  // Tokens are single-use; a retry after any submit needs a fresh one
  const reset = useCallback(() => {
    setToken(null)
    if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current)
  }, [])

  return { containerRef, token, reset }
}

export default useTurnstile
