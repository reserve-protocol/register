import DtfChat from '@/components/dtf-chat'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { cn } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// The former FAQ accordion, reshaped: the questions are now quick-question
// chips that feed the embedded Reserve AI chat below, which answers with live
// DTF data instead of canned copy.
const FAQ_QUESTIONS: MessageDescriptor[] = [
  msg`Why an AI infrastructure DTF?`,
  msg`Am I buying real stocks?`,
  msg`How is the price determined?`,
  msg`How do US market hours affect stock DTF pricing?`,
  msg`What are the fees?`,
  msg`Can I sell whenever I want?`,
  msg`What are the risks?`,
]

// INTERIM chip→chat bridge: @reserve-protocol/dtf-chat v0.0.6 has no
// `suggestions` prop, so chips inject the question through the widget's DOM
// (React-controlled input needs the native value setter). The send button
// stays disabled while Turnstile verifies, so retry briefly instead of firing
// once. Resolves true once the send was dispatched, false if the widget never
// became sendable (the typed question stays in the input either way). Replace
// with the package's suggestions prop when it ships — the rc-* testids are
// internal, not a stable API (same caveat as overrides.css).
const askEmbeddedChat = (
  container: HTMLElement | null,
  question: string
): Promise<boolean> => {
  const input = container?.querySelector<HTMLInputElement>(
    '[data-testid="rc-input"]'
  )
  if (!input) return Promise.resolve(false)

  const setValue = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  )?.set
  setValue?.call(input, question)
  input.dispatchEvent(new Event('input', { bubbles: true }))

  return new Promise((resolve) => {
    const started = Date.now()
    const trySend = () => {
      const send = container?.querySelector<HTMLButtonElement>(
        '[data-testid="rc-send"]'
      )
      if (send && !send.disabled) {
        send.click()
        resolve(true)
        return
      }
      // Generous window: on first load the send button stays disabled until
      // Turnstile mints a token, which can take several seconds.
      if (Date.now() - started < 10000) setTimeout(trySend, 150)
      else resolve(false)
    }
    requestAnimationFrame(trySend)
  })
}

const StocksFaq = () => {
  const { t } = useLingui()
  const dtf = useAtomValue(indexDTFAtom)
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')
  const chatRef = useRef<HTMLDivElement>(null)
  // Chips are the empty-state prompt; once a conversation starts they yield
  // the space to the thread (mirrors the widget's own suggestion behavior).
  const [asked, setAsked] = useState(false)

  // The chat rests as a bare input row and grows into a thread pane once a
  // conversation exists. Chip clicks flip the state directly; the observer
  // catches questions typed into the input by hand.
  useEffect(() => {
    const container = chatRef.current
    if (!container || asked) return

    const observer = new MutationObserver(() => {
      if (container.querySelector('[data-testid^="rc-msg-"]')) {
        setAsked(true)
        observer.disconnect()
      }
    })
    observer.observe(container, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [asked])

  // INTERIM placeholder override (same widget-internals caveat as the chip
  // bridge above): the widget hardcodes "Ask a question…". React won't
  // re-assert the attribute (its vdom value never changes), so a one-time
  // write sticks; the observer re-applies it if the input remounts. Leave
  // the restricted-mode placeholder ("Educational questions only…") alone.
  useEffect(() => {
    const container = chatRef.current
    if (!container) return

    const apply = () => {
      const input = container.querySelector<HTMLInputElement>(
        '[data-testid="rc-input"]'
      )
      if (input && !input.placeholder.startsWith('Educational')) {
        input.placeholder = t`Ask Reserve AI`
      }
    }
    apply()
    const observer = new MutationObserver(apply)
    observer.observe(container, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [t])

  // Chips only yield to the thread once the question was actually sent; if
  // the widget never became sendable the chips stay (the question remains in
  // the input for the user to submit by hand) and the miss is tracked.
  const ask = async (question: string) => {
    trackClick('faq-chip', { question })
    const sent = await askEmbeddedChat(chatRef.current, question)
    if (sent) setAsked(true)
    else trackClick('faq-chip-unsent', { question })
  }

  return (
    <div data-testid="stocks-faq" className="rounded-3xl bg-card p-4">
      <div className="mb-3 flex items-center gap-3 px-2 pt-2">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
          {/* Live-chat "online" convention: solid dot + a pulsing halo. */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="font-medium">
            <Trans>Ask Reserve AI</Trans>
          </h3>
          <p className="text-xs text-muted-foreground">
            <Trans>
              Online — answers use live {dtf?.token.symbol ?? 'DTF'} data.
            </Trans>
          </p>
        </div>
      </div>
      {!asked && (
        <div className="mb-3 flex flex-wrap gap-2 px-2">
          {FAQ_QUESTIONS.map((question) => (
            <button
              key={question.id}
              type="button"
              onClick={() => ask(t(question))}
              className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t(question)}
            </button>
          ))}
        </div>
      )}
      <div
        ref={chatRef}
        className={cn(
          'stocks-embedded-chat overflow-hidden px-2 pb-2 transition-[height] duration-300 ease-out motion-reduce:transition-none',
          asked ? 'h-[440px]' : 'h-[116px]'
        )}
        data-testid="stocks-embedded-chat"
      >
        <DtfChat embedded />
      </div>
    </div>
  )
}

export default StocksFaq
