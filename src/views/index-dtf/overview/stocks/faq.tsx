import DtfChat from '@/components/dtf-chat'
import { Button } from '@/components/ui/button'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { cn } from '@/lib/utils'
import type { ReserveChatHandle } from '@reserve-protocol/dtf-chat'
import { useAtomValue } from 'jotai'
import { Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'

const FAQ_QUESTIONS: MessageDescriptor[] = [
  msg`Am I buying real stocks?`,
  msg`How is the price determined?`,
  msg`How do US market hours affect stock DTF pricing?`,
  msg`What are the fees?`,
  msg`Can I sell whenever I want?`,
  msg`What are the risks?`,
]

const StocksFaq = () => {
  const { t } = useLingui()
  const dtf = useAtomValue(indexDTFAtom)
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')
  const chatRef = useRef<ReserveChatHandle>(null)
  // Chips yield to the thread once any message (chip or typed) was sent.
  const [asked, setAsked] = useState(false)

  const ask = (question: string) => {
    trackClick('faq-chip', { question })
    chatRef.current?.send(question)
  }

  return (
    <div data-testid="stocks-faq" className="rounded-3xl bg-card p-4">
      <div className="mb-3 flex items-center gap-3 px-2 pt-2">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
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
          {[
            t`What is the $${dtf?.token.symbol ?? 'DTF'} DTF?`,
            ...FAQ_QUESTIONS.map((question) => t(question)),
          ].map((question) => (
            <Button
              key={question}
              variant="outline"
              size="sm"
              onClick={() => ask(question)}
              className="h-auto whitespace-normal rounded-full border-primary/20 bg-primary/5 px-3 py-1.5 text-left font-normal hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
            >
              {question}
            </Button>
          ))}
        </div>
      )}
      <div
        className={cn(
          'stocks-embedded-chat overflow-hidden px-2 pb-2 transition-[height] duration-300 ease-out motion-reduce:transition-none',
          asked ? 'h-[440px]' : 'h-[116px]'
        )}
        data-testid="stocks-embedded-chat"
      >
        <DtfChat
          ref={chatRef}
          embedded
          inputPlaceholder={t`Ask Reserve AI`}
          onMessageSent={() => setAsked(true)}
        />
      </div>
    </div>
  )
}

export default StocksFaq
