import { useState } from 'react'
import { ArrowRight, Check, ChevronDown, RotateCcw } from 'lucide-react'

import { Button } from '@/components/button'
import { Spinner } from '@/components/design-system-v1/loading'
import { v1Typography } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'

const MotionStudy = () => (
  <section
    id="motion-study"
    className="scroll-mt-28 space-y-4"
    aria-label="Motion"
  >
    <Intro />
    <div className="border border-primary/20 bg-primary/5 p-5">
      <p className={cn(v1Typography.label, 'text-primary')}>Current values</p>
      <p
        className={cn(
          v1Typography.supporting,
          'mt-1 max-w-4xl text-muted-foreground'
        )}
      >
        Feedback and hover transitions use 120ms. Small overlays (menu, popover,
        select) and disclosure use 180ms; dialogs and drawers use 240ms.
        Overlays enter with ease-out, and dialogs and drawers leave with
        ease-in. Linear motion is reserved for continuous progress. Reduced
        motion removes overlay entrance and exit and other non-essential
        translation, scale, sweep, and pulse—not the state change itself.
      </p>
    </div>

    <div className="grid gap-px bg-border lg:grid-cols-3">
      <Duration
        value="120ms"
        label="Immediate"
        copy="Hover, press, color, opacity"
      />
      <Duration
        value="180ms"
        label="Standard"
        copy="Menu, popover, select, disclosure"
      />
      <Duration value="240ms" label="Spatial" copy="Dialog and drawer" />
    </div>

    <TimingComparison />

    <div className="grid gap-5 xl:grid-cols-3">
      <MotionCard label="State change" token="120ms · ease-out">
        <div className="flex h-36 items-center justify-center bg-card">
          <Button trailingIcon={<ArrowRight aria-hidden="true" />}>
            Review
          </Button>
        </div>
      </MotionCard>
      <MotionCard label="Disclosure" token="180ms · ease-out">
        <DisclosureSpecimen />
      </MotionCard>
      <MotionCard label="Continuous progress" token="linear · indefinite">
        <div className="flex h-36 items-center justify-center bg-card">
          <div className={cn('flex items-center gap-2', v1Typography.label)}>
            <Spinner /> Fetching quote
          </div>
        </div>
      </MotionCard>
    </div>

    <PreferenceComparison />

    <div className="grid gap-2 text-sm font-light text-muted-foreground md:grid-cols-3">
      <Rule title="Explain change">
        Animate state, hierarchy, or spatial relationship—not decoration.
      </Rule>
      <Rule title="Stay responsive">
        Repeated desktop motion should finish before it feels like waiting.
      </Rule>
      <Rule title="No choreography">
        Avoid staggered page loads, decorative pulses, and motion on every card.
      </Rule>
    </div>
  </section>
)

const DisclosureSpecimen = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex h-36 flex-col items-center justify-center bg-card">
      <Button
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        tone="secondary"
        trailingIcon={
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'transition-transform duration-180 ease-out motion-reduce:transition-none',
              isOpen && 'rotate-180'
            )}
          />
        }
      >
        Details
      </Button>
      <p
        className={cn(
          v1Typography.supporting,
          'mt-2 text-muted-foreground transition-opacity duration-180',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
      >
        Quote details are available.
      </p>
    </div>
  )
}

const PreferenceComparison = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [isResetting, setIsResetting] = useState(false)
  const replay = () => {
    setIsResetting(true)
    setIsVisible(false)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setIsResetting(false)
        setIsVisible(true)
      })
    })
  }

  return (
    <article className="overflow-hidden border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border p-4">
        <div>
          <h3 className="text-sm font-medium">Motion preference comparison</h3>
          <p className="mt-1 text-xs font-light text-muted-foreground">
            Replay the same state appearance with and without spatial movement.
          </p>
        </div>
        <Button
          leadingIcon={<RotateCcw aria-hidden="true" />}
          onClick={replay}
          size="micro"
          tone="secondary"
        >
          Replay
        </Button>
      </div>
      <div className="grid gap-px bg-border xl:grid-cols-2">
        <PreferenceCard
          label="Standard preference"
          token="240ms · opacity + 8px translation"
          isVisible={isVisible}
          isResetting={isResetting}
        />
        <PreferenceCard
          label="Reduced-motion preference"
          token="No entrance · shown immediately"
          isVisible={isVisible}
          isResetting={isResetting}
          reduced
        />
      </div>
    </article>
  )
}

const PreferenceCard = ({
  label,
  token,
  isVisible,
  isResetting,
  reduced = false,
}: {
  label: string
  token: string
  isVisible: boolean
  isResetting: boolean
  reduced?: boolean
}) => (
  <div className="bg-card">
    <div className="flex items-baseline justify-between gap-3 border-b border-border p-4">
      <h4 className="text-sm font-medium">{label}</h4>
      <code className="text-xs text-muted-foreground">{token}</code>
    </div>
    <div className="flex min-h-40 items-center justify-center bg-card p-6">
      <div
        className={cn(
          'w-full max-w-xs rounded-lg border border-border bg-card p-5 shadow-sm ease-out',
          isResetting || reduced
            ? 'transition-none'
            : 'transition-[opacity,transform] duration-240',
          isVisible || reduced
            ? 'translate-y-0 opacity-100'
            : 'translate-y-2 opacity-0'
        )}
      >
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-success" />
          <p className="font-medium">Quote ready</p>
        </div>
        <p className="mt-2 text-sm font-light text-muted-foreground">
          {reduced
            ? 'Meaning appears at once without fade, translation, or scale.'
            : 'A small entrance helps connect the result to the action.'}
        </p>
      </div>
    </div>
  </div>
)

const Intro = () => (
  <p className={cn(v1Typography.supporting, 'max-w-3xl text-muted-foreground')}>
    A quiet, responsive motion character for a serious financial product that
    still explains state changes.
  </p>
)

const Duration = ({
  value,
  label,
  copy,
}: {
  value: string
  label: string
  copy: string
}) => (
  <div className="bg-card p-5">
    <p className="text-2xl font-light text-primary">{value}</p>
    <p className="mt-2 text-sm font-medium">{label}</p>
    <p className="mt-1 text-xs font-light text-muted-foreground">{copy}</p>
  </div>
)

const TimingComparison = () => {
  const [running, setRunning] = useState(true)
  const [isResetting, setIsResetting] = useState(false)
  const replay = () => {
    setIsResetting(true)
    setRunning(false)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setIsResetting(false)
        setRunning(true)
      })
    })
  }

  return (
    <article className="overflow-hidden border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border p-4">
        <div>
          <h3 className="text-sm font-medium">Timing comparison</h3>
          <p className="mt-1 text-xs font-light text-muted-foreground">
            Replay the same distance at each of the three durations.
          </p>
        </div>
        <Button
          leadingIcon={<RotateCcw aria-hidden="true" />}
          onClick={replay}
          size="micro"
          tone="secondary"
        >
          Replay
        </Button>
      </div>
      <div className="grid gap-px bg-border lg:grid-cols-3">
        {[
          ['120ms', 'duration-120'],
          ['180ms', 'duration-180'],
          ['240ms', 'duration-240'],
        ].map(([label, duration]) => (
          <div key={label} className="bg-card p-5">
            <div className="relative h-8 overflow-hidden bg-muted">
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-primary ease-out ${isResetting ? 'transition-none' : `transition-[left] ${duration}`} ${running ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`}
              />
            </div>
            <code className="mt-3 block text-xs text-muted-foreground">
              {label}
            </code>
          </div>
        ))}
      </div>
    </article>
  )
}

const MotionCard = ({
  label,
  token,
  children,
}: {
  label: string
  token: string
  children: React.ReactNode
}) => (
  <article className="overflow-hidden border border-border bg-card">
    <div className="flex items-baseline justify-between gap-3 border-b border-border p-4">
      <h3 className="text-sm font-medium">{label}</h3>
      <code className="text-xs text-muted-foreground">{token}</code>
    </div>
    {children}
  </article>
)

const Rule = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="bg-muted p-4">
    <p className="font-medium text-foreground">{title}</p>
    <p className="mt-1 leading-5">{children}</p>
  </div>
)

export default MotionStudy
