import {
  ArrowDown,
  ArrowUp,
  Check,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PERFORMANCE_COLORS,
  PERFORMANCE_TEXT_CLASSES,
} from '@/utils/chart-performance-colors'

const MeaningColorStudy = () => (
  <section className="space-y-4" aria-labelledby="meaning-color-study">
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="meaning-color-study" className="text-xl font-semibold">
          Meaning colors
        </h2>
        <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
          Values open
        </span>
      </div>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
        The remaining color roles shown in realistic contexts. Feedback
        describes an event or product state; performance describes financial
        movement even when both happen to use related green and red hues.
      </p>
    </div>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <StudyPanel
        title="Feedback states"
        description="One vivid family with dark icon foregrounds throughout. Information is a brighter relative of the deeper brand/action blue."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FeedbackNotice
            icon={<Check className="h-4 w-4" />}
            title="Transaction confirmed"
            detail="Your deposit is now complete."
            tone="success"
          />
          <FeedbackNotice
            icon={<TriangleAlert className="h-4 w-4" />}
            title="Review before continuing"
            detail="Price impact is higher than usual."
            tone="warning"
          />
          <FeedbackNotice
            icon={<X className="h-4 w-4" />}
            title="Transaction failed"
            detail="No funds were moved. Try again."
            tone="danger"
          />
          <FeedbackNotice
            icon={<Info className="h-4 w-4" />}
            title="Rebalance in progress"
            detail="Weights may change during this period."
            tone="information"
          />
        </div>
        <OpenQuestion>
          Candidate rule: feedback favors vividness and one dark foreground
          treatment. Brand actions keep the deeper primary blue with white;
          information remains a separate semantic role derived from that hue.
        </OpenQuestion>
      </StudyPanel>

      <StudyPanel
        title="Foreground hierarchy"
        description="Neutral hierarchy should do most of the communication; semantic color is reserved for meaning."
      >
        <div className="bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground">
            Portfolio value
          </p>
          <p className="mt-2 text-2xl font-medium text-foreground">$42,860.20</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Updated a few seconds ago
          </p>
          <div className="my-5 h-px bg-border" />
          <div className="space-y-4">
            <ForegroundRow
              label="Primary content"
              token="--foreground"
              className="text-foreground"
            />
            <ForegroundRow
              label="Supporting content"
              token="--muted-foreground"
              className="text-muted-foreground"
            />
            <ForegroundRow
              label="Unavailable content"
              token="disabled role open"
              className="text-muted-foreground"
              disabled
            />
          </div>
        </div>
        <OpenQuestion>
          Disabled currently reuses muted foreground. A separate alias is only
          worthwhile if later component studies need a consistently quieter
          value.
        </OpenQuestion>
      </StudyPanel>
    </div>

    <StudyPanel
      title="Financial movement"
      description="Positive, negative, and neutral movement are data roles—not success, failure, or warning feedback."
    >
      <div className="grid gap-3 md:grid-cols-3">
        <PerformanceCard direction="positive" />
        <PerformanceCard direction="negative" />
        <PerformanceCard direction="neutral" />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <CandidateRule
          title="Keep semantic aliases separate"
          copy="Price up never becomes success, and price down never becomes an error in component code."
        />
        <CandidateRule
          title="Allow visual relationships"
          copy="Feedback and performance may share a ramp or exact value if the combined palette feels coherent."
        />
        <CandidateRule
          title="Derive chart treatments"
          copy="One main color can produce the dot and fill; one emphasis stop completes the line gradient."
        />
      </div>
    </StudyPanel>
  </section>
)

type FeedbackTone = 'success' | 'warning' | 'danger' | 'information'

const FeedbackNotice = ({
  icon,
  title,
  detail,
  tone,
}: {
  icon: React.ReactNode
  title: string
  detail: string
  tone: FeedbackTone
}) => {
  const toneClassName: Record<FeedbackTone, string> = {
    success: 'bg-success/[0.09] ring-success/20',
    warning: 'bg-warning/[0.09] ring-warning/20',
    danger: 'bg-destructive/[0.09] ring-destructive/20',
    information: 'bg-primary/[0.08] ring-primary/20',
  }
  const iconClassName: Record<FeedbackTone, string> = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-destructive/80',
    information: 'bg-primary/65',
  }
  const darkIconFillClassName: Record<FeedbackTone, string> = {
    success: 'bg-success/75',
    warning: 'bg-warning/75',
    danger: 'bg-destructive/75',
    information: 'bg-primary/75',
  }

  return (
    <div className={cn('p-4 ring-1 ring-inset', toneClassName[tone])}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-foreground dark:bg-white dark:text-background',
            iconClassName[tone]
          )}
        >
          <span
            className={cn(
              'absolute inset-0 hidden dark:block',
              darkIconFillClassName[tone]
            )}
          />
          <span className="relative z-10">{icon}</span>
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-foreground">
            {title}
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            {detail}
          </span>
        </span>
      </div>
    </div>
  )
}

type PerformanceDirection = 'positive' | 'negative' | 'neutral'

const PerformanceCard = ({
  direction,
}: {
  direction: PerformanceDirection
}) => {
  const content = {
    positive: {
      label: 'Positive',
      value: '+8.42%',
      icon: ArrowUp,
      textClassName: PERFORMANCE_TEXT_CLASSES.positive,
    },
    negative: {
      label: 'Negative',
      value: '−4.18%',
      icon: ArrowDown,
      textClassName: PERFORMANCE_TEXT_CLASSES.negative,
    },
    neutral: {
      label: 'Neutral',
      value: '0.00%',
      icon: null,
      textClassName: 'text-muted-foreground',
    },
  }[direction]
  const Icon = content.icon

  return (
    <div className="bg-card p-4 ring-1 ring-inset ring-border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">30 day return</p>
          <p className={cn('mt-1 text-lg font-medium', content.textClassName)}>
            {content.value}
          </p>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {content.label}
        </span>
      </div>
      <PerformanceLine direction={direction} />
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        {Icon && <Icon className={cn('h-3.5 w-3.5', content.textClassName)} />}
        <span>Financial movement</span>
      </div>
    </div>
  )
}

const PerformanceLine = ({ direction }: { direction: PerformanceDirection }) => {
  if (direction === 'neutral') {
    return <div className="mt-6 h-0.5 bg-muted-foreground/50" />
  }

  const colors = PERFORMANCE_COLORS[direction]

  return (
    <div
      aria-label={`${direction} gradient from ${colors.start} to ${colors.end}`}
      className="mt-6 h-0.5"
      style={{
        background: `linear-gradient(90deg, ${colors.start}, ${colors.end})`,
      }}
    />
  )
}

const ForegroundRow = ({
  label,
  token,
  className,
  disabled = false,
}: {
  label: string
  token: string
  className: string
  disabled?: boolean
}) => (
  <div className="flex items-center justify-between gap-4">
    <span className={cn('flex items-center gap-2 text-sm', className)}>
      <span className={cn('h-2.5 w-2.5 rounded-full bg-current', disabled && 'opacity-50')} />
      {label}
    </span>
    <code className="text-[10px] text-muted-foreground">{token}</code>
  </div>
)

const StudyPanel = ({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) => (
  <article className="overflow-hidden rounded-2xl border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
    <div className="bg-background p-5">{children}</div>
  </article>
)

const OpenQuestion = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-4 text-xs leading-5 text-muted-foreground">{children}</p>
)

const CandidateRule = ({ title, copy }: { title: string; copy: string }) => (
  <div className="bg-muted/40 p-4">
    <h4 className="text-sm font-medium">{title}</h4>
    <p className="mt-2 text-xs leading-5 text-muted-foreground">{copy}</p>
  </div>
)

export default MeaningColorStudy
