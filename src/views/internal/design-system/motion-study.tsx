import { useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  RotateCcw,
} from 'lucide-react'

const MotionStudy = () => (
  <section
    id="motion-study"
    className="scroll-mt-28 space-y-4"
    aria-labelledby="motion-heading"
  >
    <Heading />
    <div className="border border-primary/20 bg-primary/5 p-5">
      <p className="text-sm font-medium text-primary">Recommended model</p>
      <p className="mt-1 max-w-4xl text-sm font-light leading-5 text-muted-foreground">
        Use 120ms for immediate state feedback, 180ms for ordinary component
        transitions, and 240ms for entrances or larger spatial changes. Enter
        with ease-out, leave with ease-in, and reserve linear motion for
        continuous progress. Reduced motion removes non-essential translation,
        scale, sweep, and pulse—not the state change itself.
      </p>
    </div>

    <div className="grid gap-px bg-secondary lg:grid-cols-3">
      <Duration
        value="120ms"
        label="Immediate"
        copy="Hover, press, color, opacity"
      />
      <Duration
        value="180ms"
        label="Standard"
        copy="Disclosure, tab, small surface"
      />
      <Duration
        value="240ms"
        label="Spatial"
        copy="Dialog, drawer, meaningful entrance"
      />
    </div>

    <TimingComparison />

    <div className="grid gap-5 xl:grid-cols-3">
      <MotionCard label="State change" token="120ms · ease-out">
        <div className="flex h-36 items-center justify-center bg-card">
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-[120ms] hover:bg-primary/80"
          >
            Review <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </MotionCard>
      <MotionCard label="Disclosure" token="180ms · ease-out">
        <DisclosureSpecimen />
      </MotionCard>
      <MotionCard label="Continuous progress" token="linear · indefinite">
        <div className="flex h-36 items-center justify-center bg-card">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin" /> Fetching quote
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
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium"
      >
        Details{' '}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-[180ms] ease-out ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <p
        className={`mt-2 text-xs font-light text-muted-foreground transition-opacity duration-[180ms] ${isOpen ? 'opacity-100' : 'opacity-0'}`}
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
        <button
          type="button"
          onClick={replay}
          className="flex h-8 items-center gap-2 rounded-full border border-border pl-2.5 pr-3 text-xs font-medium"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} /> Replay
        </button>
      </div>
      <div className="grid gap-px bg-secondary xl:grid-cols-2">
        <PreferenceCard
          label="Standard preference"
          token="240ms · opacity + 8px translation"
          isVisible={isVisible}
          isResetting={isResetting}
        />
        <PreferenceCard
          label="Reduced-motion preference"
          token="120ms · opacity only"
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
        className={`w-full max-w-xs rounded-lg border border-border/60 bg-card p-5 shadow-[0_12px_32px_-14px_hsl(var(--foreground)/0.22),0_4px_12px_-8px_hsl(var(--foreground)/0.12)] ease-out ${isResetting ? 'transition-none' : `transition-[opacity,transform] ${reduced ? 'duration-[120ms]' : 'duration-[240ms]'}`} ${isVisible ? 'translate-y-0 opacity-100' : reduced ? 'translate-y-0 opacity-0' : 'translate-y-2 opacity-0'}`}
      >
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-success" />
          <p className="font-medium">Quote ready</p>
        </div>
        <p className="mt-2 text-sm font-light text-muted-foreground">
          {reduced
            ? 'Meaning remains visible without translation, pulse, or scale.'
            : 'A small entrance helps connect the result to the action.'}
        </p>
      </div>
    </div>
  </div>
)

const Heading = () => (
  <div>
    <div className="flex flex-wrap items-center gap-2">
      <h2 id="motion-heading" className="text-xl font-semibold">
        Motion
      </h2>
      <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
        Accepted provisional foundation
      </span>
    </div>
    <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
      Define a quiet, responsive motion character for a serious financial
      product while preserving useful state explanation.
    </p>
  </div>
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
            Replay the same distance at all three candidate durations.
          </p>
        </div>
        <button
          type="button"
          onClick={replay}
          className="flex h-8 items-center gap-2 rounded-full border border-border pl-2.5 pr-3 text-xs font-medium"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} /> Replay
        </button>
      </div>
      <div className="grid gap-px bg-secondary lg:grid-cols-3">
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
