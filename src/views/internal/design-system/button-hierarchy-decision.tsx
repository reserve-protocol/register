import type { ReactNode } from 'react'
import { ArrowUpRight, Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

const ButtonHierarchyDecision = () => (
  <section
    id="button-hierarchy-decision"
    aria-labelledby="button-hierarchy-decision-heading"
    className="space-y-4"
  >
    <header className="border border-primary/20 bg-primary/5 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-primary">
          Decision 01 · Actions
        </p>
        <span className="rounded-full border border-primary/20 bg-card px-2.5 py-1 text-xs font-medium text-primary">
          Accepted
        </span>
      </div>
      <h2
        id="button-hierarchy-decision-heading"
        className="mt-3 text-2xl font-light leading-8"
      >
        Secondary actions use outlined white
      </h2>
      <p className="mt-2 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        A secondary action stays on the white content surface and uses the
        neutral control border. Neutral gray fill is not another secondary
        variant; it remains available for contained control chrome.
      </p>
    </header>

    <div className="grid gap-0.5 bg-secondary p-0.5 md:grid-cols-2">
      <ProductSlice label="Async mint · completion">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-4" strokeWidth={1.75} />
          </div>
          <div className="flex items-center gap-2">
            <SecondaryButton icon={<RotateCcw />}>New mint</SecondaryButton>
            <PrimaryButton>View DTF</PrimaryButton>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-sm font-medium text-primary">Mint Completed</p>
          <p className="mt-2 text-[32px] font-light leading-9">1,248.42 DTF</p>
        </div>
      </ProductSlice>

      <ProductSlice label="Governance · simulation result">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-4" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-base font-medium">Proposal Simulated</p>
            <p className="text-sm font-light text-muted-foreground">
              Powered by Tenderly
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-2">
          <PrimaryButton fullWidth>Simulation successful</PrimaryButton>
          <SecondaryButton trailingIcon={<ArrowUpRight />} fullWidth>
            View on Tenderly
          </SecondaryButton>
        </div>
      </ProductSlice>
    </div>
  </section>
)

const buttonBase =
  'inline-flex h-8 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium transition-colors duration-[120ms] [&>svg]:size-4'

const PrimaryButton = ({
  children,
  fullWidth = false,
}: {
  children: ReactNode
  fullWidth?: boolean
}) => (
  <button
    type="button"
    className={cn(
      buttonBase,
      'bg-primary text-primary-foreground hover:bg-primary/80',
      fullWidth && 'w-full'
    )}
  >
    {children}
  </button>
)

const SecondaryButton = ({
  children,
  icon,
  trailingIcon,
  fullWidth = false,
}: {
  children: ReactNode
  icon?: ReactNode
  trailingIcon?: ReactNode
  fullWidth?: boolean
}) => (
  <button
    type="button"
    className={cn(
      buttonBase,
      'border border-border bg-card text-foreground hover:bg-muted',
      icon && 'pl-2.5',
      trailingIcon && 'pr-2.5',
      fullWidth && 'w-full'
    )}
  >
    {icon}
    {children}
    {trailingIcon}
  </button>
)

const ProductSlice = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className="bg-card p-5">
    <p className="mb-5 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
      {label}
    </p>
    {children}
  </div>
)

export default ButtonHierarchyDecision
