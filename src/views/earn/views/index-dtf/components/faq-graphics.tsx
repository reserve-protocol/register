import { cn } from '@/lib/utils'
import { Trans } from '@lingui/react/macro'
import { ArrowRight } from 'lucide-react'

const FlowChip = ({
  variant,
  children,
}: {
  variant: 'token' | 'vault'
  children: React.ReactNode
}) => (
  <div
    className={cn(
      'flex h-12 shrink-0 items-center justify-center px-2 text-center text-xs font-medium leading-tight',
      variant === 'token'
        ? 'min-w-12 rounded-full bg-primary text-primary-foreground'
        : 'min-w-16 rounded-xl bg-accent text-accent-foreground'
    )}
  >
    {children}
  </div>
)

const FlowArrow = () => (
  <ArrowRight size={16} className="shrink-0 text-primary" aria-hidden="true" />
)

const RewardFlowCard = ({
  title,
  pill,
  pillVariant,
  children,
}: {
  title: React.ReactNode
  pill: React.ReactNode
  pillVariant: 'primary' | 'muted'
  children: React.ReactNode
}) => (
  <div className="rounded-3xl border bg-card p-4">
    <div className="mb-4 flex items-center justify-between gap-2">
      <span className="text-sm font-medium">{title}</span>
      <span
        className={cn(
          'rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
          pillVariant === 'primary'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        {pill}
      </span>
    </div>
    {children}
  </div>
)

export const RewardFlowDiagrams = () => (
  <div className="mx-auto w-full max-w-4xl grid gap-3 sm:grid-cols-2">
    <RewardFlowCard
      title={<Trans>vlRSR-style rewards</Trans>}
      pill={<Trans>Automatic</Trans>}
      pillVariant="primary"
    >
      <div className="flex items-center gap-2">
        <FlowChip variant="token">RSR</FlowChip>
        <FlowArrow />
        <FlowChip variant="vault">
          <Trans>vlRSR vault</Trans>
        </FlowChip>
        <FlowArrow />
        <div className="min-w-0 text-xs text-legend">
          <span className="block text-sm font-medium text-foreground">
            <Trans>More RSR per share</Trans>
          </span>
          <Trans>Rewards increase the vault’s backing.</Trans>
        </div>
      </div>
    </RewardFlowCard>
    <RewardFlowCard
      title={<Trans>Other vault rewards</Trans>}
      pill={<Trans>May require claim</Trans>}
      pillVariant="muted"
    >
      <div className="flex items-center gap-2">
        <FlowChip variant="token">
          <Trans>Gov. token</Trans>
        </FlowChip>
        <FlowArrow />
        <FlowChip variant="vault">
          <Trans>Vote-lock vault</Trans>
        </FlowChip>
        <FlowArrow />
        <div className="min-w-0 text-xs text-legend">
          <span className="block text-sm font-medium text-foreground">
            <Trans>Separate rewards</Trans>
          </span>
          <Trans>Claimable reward tokens.</Trans>
        </div>
      </div>
    </RewardFlowCard>
  </div>
)

export const StreamingTimeline = () => (
  <div className="mx-auto w-full max-w-3xl rounded-3xl border bg-card p-4">
    <p className="text-sm font-medium">
      <Trans>One reward deposit, released over time</Trans>
    </p>
    <div className="relative mt-3 h-8" aria-hidden="true">
      <div className="absolute inset-x-1 top-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[72%] rounded-full bg-primary" />
      </div>
      <div className="absolute left-[2%] top-1.5 h-4 w-4 rounded-full border-4 border-card bg-primary ring-1 ring-border" />
      <div className="absolute left-[36%] top-1.5 h-4 w-4 rounded-full border-4 border-card bg-primary ring-1 ring-border" />
      <div className="absolute left-[72%] top-1.5 h-4 w-4 rounded-full border-4 border-card bg-primary ring-1 ring-border" />
    </div>
    <div className="flex justify-between text-xs text-legend">
      <span>
        <Trans>Rewards added</Trans>
      </span>
      <span>
        <Trans>Streaming</Trans>
      </span>
      <span>
        <Trans>Fully reflected</Trans>
      </span>
    </div>
  </div>
)

const FormulaStep = ({
  step,
  children,
}: {
  step: React.ReactNode
  children: React.ReactNode
}) => (
  <div className="rounded-2xl border bg-card p-4">
    <span className="mb-1 block text-xs text-legend">{step}</span>
    <span className="text-sm font-medium">{children}</span>
  </div>
)

export const RateFormulaSteps = () => (
  <div className="mx-auto w-full max-w-4xl grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
    <FormulaStep step={<Trans>1 · Observe</Trans>}>
      <Trans>Rewards distributed during the trailing 30-day window</Trans>
    </FormulaStep>
    <ArrowRight
      size={16}
      className="rotate-90 place-self-center text-primary sm:rotate-0"
      aria-hidden="true"
    />
    <FormulaStep step={<Trans>2 · Annualize</Trans>}>
      <Trans>Average daily rewards × 365 ÷ vault value locked</Trans>
    </FormulaStep>
    <ArrowRight
      size={16}
      className="rotate-90 place-self-center text-primary sm:rotate-0"
      aria-hidden="true"
    />
    <FormulaStep step={<Trans>3 · Display</Trans>}>
      <Trans>APR — or compounded APY when rewards accrue automatically</Trans>
    </FormulaStep>
  </div>
)

const BAR_CLASSES = [
  'h-[30%] opacity-30',
  'h-[42%] opacity-50',
  'h-[66%] opacity-60',
  'h-[52%] opacity-80',
  'h-[88%] opacity-100',
]

export const EstimateVsRealizedComparison = () => (
  <div className="mx-auto w-full max-w-4xl grid gap-3 sm:grid-cols-2">
    <div className="rounded-3xl bg-accent p-4 text-accent-foreground">
      <span className="block text-sm font-medium">
        <Trans>Displayed estimate</Trans>
      </span>
      <p className="mb-3 text-xs text-legend">
        <Trans>Projects recent reward activity forward.</Trans>
      </p>
      <div
        className="flex h-16 items-end gap-1.5 border-b border-border px-2"
        aria-hidden="true"
      >
        {BAR_CLASSES.map((barClassName) => (
          <div
            key={barClassName}
            className={cn('flex-1 rounded-t bg-primary', barClassName)}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-legend">
        <span>
          <Trans>30 days ago</Trans>
        </span>
        <span className="font-medium text-foreground">
          <Trans>Annualized APY / APR</Trans>
        </span>
      </div>
    </div>
    <div className="rounded-3xl border bg-card p-4">
      <span className="block text-sm font-medium">
        <Trans>Your realized return</Trans>
      </span>
      <p className="mb-3 text-xs text-legend">
        <Trans>Measures exchange-rate change during your window.</Trans>
      </p>
      <svg
        viewBox="0 0 300 80"
        className="h-16 w-full overflow-visible"
        aria-hidden="true"
      >
        <path d="M3 76H297" className="stroke-border" />
        <path
          d="M5 69C54 66 72 63 104 56s60-13 91-22 57-12 96-23"
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          className="stroke-primary"
        />
        <circle cx={5} cy={69} r={5} className="fill-primary" />
        <circle cx={291} cy={11} r={5} className="fill-primary" />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-legend">
        <span>
          <Trans>Your start date</Trans>
        </span>
        <span className="font-medium text-foreground">
          <Trans>Today</Trans>
        </span>
      </div>
    </div>
  </div>
)

export const Takeaway = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto w-full max-w-3xl rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
    {children}
  </div>
)
