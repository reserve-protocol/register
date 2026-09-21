import type { ReactNode } from 'react'
import { Check, Circle, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/button'
import {
  InlineMessage,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { cn } from '@/lib/utils'

const previousFeedbackClasses = cn(
  '[&_[data-status-role=active]]:!text-primary',
  '[&_[data-status-role=success]]:!text-success',
  '[&_[data-status-role=actionable]]:!text-warning',
  '[&_[data-status-role=unsuccessful]]:!text-destructive',
  '[&_[data-tone=information]>span]:!text-primary',
  '[&_[data-tone=success]>span]:!text-success',
  '[&_[data-tone=warning]>span]:!text-warning',
  '[&_[data-tone=danger]>span]:!text-destructive'
)

const ColorContrastReview = () => (
  <section
    id="color-contrast-review"
    data-testid="color-contrast-review"
    className="space-y-8"
    aria-labelledby="color-contrast-review-title"
  >
    <header>
      <div className="flex flex-wrap items-center gap-2">
        <h2
          id="color-contrast-review-title"
          className="text-xl font-medium leading-7"
        >
          Cross-theme contrast calibration
        </h2>
        <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
          Current baseline
        </span>
      </div>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        The semantic color structure already works across light and dark themes.
        Human review accepted a restrained correction for three small contrast
        gaps without changing the palette structure or making the interface
        heavier.
      </p>
    </header>

    <section
      data-testid="color-architecture-audit"
      aria-labelledby="color-architecture-audit-title"
      className="border border-border bg-card"
    >
      <div className="border-b border-border p-5">
        <h3
          id="color-architecture-audit-title"
          className="text-base font-medium leading-6"
        >
          Architecture audit
        </h3>
        <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
          The system already has the right ownership boundary. The remaining
          work is calibration and later migration, not a new light/dark styling
          model.
        </p>
      </div>
      <div className="grid gap-px bg-border md:grid-cols-3">
        <AuditResult
          value="0"
          label="V1 owner files with dark: overrides"
          detail="Canonical components consume semantic roles without choosing a different alias in dark mode."
        />
        <AuditResult
          value="59"
          label="Legacy product files with dark: utilities"
          detail="This is migration evidence to consolidate, not precedent for new V1 components."
        />
        <AuditResult
          value="1 → 2"
          label="Semantic ownership model"
          detail="One component-facing alias maps to tuned light and dark values at the theme boundary."
        />
      </div>
    </section>

    <section
      aria-label="Color review principles"
      className="grid gap-px bg-border md:grid-cols-3"
    >
      <ReviewPrinciple
        title="Same semantic alias in both themes"
        detail="Components keep one role name. The theme changes its underlying value; components never switch aliases with dark: utilities."
      />
      <ReviewPrinciple
        title="Preserve the quiet surfaces"
        detail="Tint, border, geometry, and spacing stay unchanged. Contrast comes from a modest foreground calibration, not a heavier box."
      />
      <ReviewPrinciple
        title="Tune at the reusable owner"
        detail="Feedback, action, and supporting roles change once and every canonical consumer inherits the accepted result."
      />
    </section>

    <ComparisonPanel
      testId="color-feedback-comparison"
      title="Feedback and lifecycle states"
      detail="The previous semantic text and icons could fall below normal-text contrast on their quiet surfaces. The accepted role retains 65% of the semantic hue and mixes in 35% of the theme foreground."
      currentMetric="Weakest previous pairing · 2.19:1"
      candidateMetric="Weakest baseline pairing · 4.64:1"
      current={
        <div className={previousFeedbackClasses}>
          <FeedbackSpecimen />
        </div>
      }
      candidate={<FeedbackSpecimen />}
    />

    <ComparisonPanel
      testId="color-action-comparison"
      title="Destructive filled action"
      detail="The previous light-theme destructive fill was vivid but too light under white type. The accepted deeper default preserves its hue and interaction model."
      currentMetric="Previous light pairing · 3.59:1"
      candidateMetric="Baseline light pairing · 4.50:1"
      current={<DestructiveSpecimen previous />}
      candidate={<DestructiveSpecimen />}
    />

    <ComparisonPanel
      testId="color-supporting-comparison"
      title="Supporting text on an inset surface"
      detail="The previous light-theme supporting foreground fell just below the target on muted surfaces. The accepted role moves it 8% toward ordinary foreground without making it primary text."
      currentMetric="Previous light pairing · 4.17:1"
      candidateMetric="Baseline light pairing · 4.72:1"
      current={<SupportingTextSpecimen previous />}
      candidate={<SupportingTextSpecimen />}
    />

    <section
      data-testid="color-heavier-alternatives"
      aria-labelledby="color-heavier-alternatives-title"
      className="space-y-4"
    >
      <div>
        <h3
          id="color-heavier-alternatives-title"
          className="text-base font-medium leading-6"
        >
          Why the recommendation stays restrained
        </h3>
        <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
          All three approaches can improve recognition. Only the recommended one
          keeps the existing visual hierarchy and semantic scanability.
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <Alternative
          label="Too heavy"
          detail="A filled semantic pill clears contrast but competes with primary actions."
        >
          <span className="inline-flex h-6 items-center gap-1 rounded-full bg-warning px-2.5 text-xs font-medium text-foreground">
            <TriangleAlert className="size-3.5 stroke-[1.5]" /> Action required
          </span>
        </Alternative>
        <Alternative
          label="Too neutral"
          detail="Neutral text with a small color cue is calm, but weakens semantic recognition."
        >
          <span className="inline-flex h-6 items-center gap-1 rounded-full bg-muted px-2.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
            <Circle className="size-3 fill-warning stroke-warning" /> Action
            required
          </span>
        </Alternative>
        <Alternative
          label="Current baseline"
          detail="Quiet tint, existing border, and a calibrated semantic foreground preserve both clarity and hierarchy."
          recommended
        >
          <span className="inline-flex h-6 items-center gap-1 rounded-full bg-[var(--feedback-warning-surface)] px-2.5 text-xs font-medium text-feedback-warning-foreground ring-1 ring-inset ring-[var(--feedback-warning-border)]">
            <TriangleAlert className="size-3.5 stroke-[1.5]" /> Action required
          </span>
        </Alternative>
      </div>
    </section>

    <section className="grid gap-4 border border-primary/20 bg-primary/5 p-5 md:grid-cols-[auto_minmax(0,1fr)]">
      <Check className="mt-0.5 size-5 text-primary" />
      <div>
        <h3 className="text-sm font-medium leading-5">Decision recorded</h3>
        <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
          Keep the palette and semantic role architecture as the working
          baseline, with cross-theme feedback foreground aliases, a slightly
          deeper destructive action surface, and a general supporting role that
          is strong enough for muted surfaces. Complex screens can still expose
          evidence-based refinements before production migration.
        </p>
      </div>
    </section>
  </section>
)

const ReviewPrinciple = ({
  title,
  detail,
}: {
  title: string
  detail: string
}) => (
  <article className="bg-card p-5">
    <h3 className="text-sm font-medium leading-5">{title}</h3>
    <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
      {detail}
    </p>
  </article>
)

const AuditResult = ({
  detail,
  label,
  value,
}: {
  detail: string
  label: string
  value: string
}) => (
  <article className="bg-card p-5">
    <p className="text-2xl font-light leading-8 tabular-nums">{value}</p>
    <h4 className="mt-1 text-sm font-medium leading-5">{label}</h4>
    <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
      {detail}
    </p>
  </article>
)

const ComparisonPanel = ({
  candidate,
  candidateMetric,
  current,
  currentMetric,
  detail,
  testId,
  title,
}: {
  candidate: ReactNode
  candidateMetric: string
  current: ReactNode
  currentMetric: string
  detail: string
  testId: string
  title: string
}) => (
  <article data-testid={testId} className="border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="text-base font-medium leading-6">{title}</h3>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        {detail}
      </p>
    </div>
    <div className="grid gap-px bg-border lg:grid-cols-2">
      <ComparisonCell label="Previous" metric={currentMetric}>
        {current}
      </ComparisonCell>
      <ComparisonCell
        label="Current baseline"
        metric={candidateMetric}
        recommended
      >
        {candidate}
      </ComparisonCell>
    </div>
  </article>
)

const ComparisonCell = ({
  children,
  label,
  metric,
  recommended = false,
}: {
  children: ReactNode
  label: string
  metric: string
  recommended?: boolean
}) => (
  <div className="bg-card p-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span
        className={cn(
          'text-xs font-medium',
          recommended ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
      <span className="text-xs font-light text-muted-foreground">{metric}</span>
    </div>
    <div className="mt-4">{children}</div>
  </div>
)

const FeedbackSpecimen = () => (
  <div className="space-y-4">
    <div className="flex flex-wrap gap-2">
      <LifecycleStatusPill role="active">Voting active</LifecycleStatusPill>
      <LifecycleStatusPill role="success">Passed</LifecycleStatusPill>
      <LifecycleStatusPill role="actionable">
        Ready to start
      </LifecycleStatusPill>
      <LifecycleStatusPill role="unsuccessful">Failed</LifecycleStatusPill>
    </div>
    <InlineMessage tone="success">
      <InlineMessageTitle>Basket weights are valid</InlineMessageTitle>
      <InlineMessageDescription className="mt-1">
        The proposal can continue without changing the message surface.
      </InlineMessageDescription>
    </InlineMessage>
  </div>
)

const DestructiveSpecimen = ({ previous = false }: { previous?: boolean }) => (
  <div className="flex items-center justify-between gap-4 bg-muted p-4">
    <div className="min-w-0">
      <p className="text-sm font-medium leading-5">Token permissions</p>
      <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
        Remove an entry that is no longer needed.
      </p>
    </div>
    <Button
      tone="destructive"
      size="compact"
      className={
        previous
          ? '!bg-destructive hover:!bg-destructive-hover active:!bg-destructive-pressed'
          : undefined
      }
    >
      Remove
    </Button>
  </div>
)

const SupportingTextSpecimen = ({
  previous = false,
}: {
  previous?: boolean
}) => (
  <div className="bg-muted p-4">
    <p className="text-sm font-medium leading-5">Voting delay</p>
    <p
      className={cn(
        'mt-1 text-sm font-light leading-5',
        previous ? 'text-muted-foreground' : 'text-supporting-foreground'
      )}
    >
      The delay begins after the proposal is submitted.
    </p>
  </div>
)

const Alternative = ({
  children,
  detail,
  label,
  recommended = false,
}: {
  children: ReactNode
  detail: string
  label: string
  recommended?: boolean
}) => (
  <article
    className={cn(
      'border bg-card p-5',
      recommended ? 'border-primary/25' : 'border-border'
    )}
  >
    <span
      className={cn(
        'text-xs font-medium',
        recommended ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {label}
    </span>
    <div className="mt-4">{children}</div>
    <p className="mt-3 text-sm font-light leading-5 text-muted-foreground">
      {detail}
    </p>
  </article>
)

export default ColorContrastReview
