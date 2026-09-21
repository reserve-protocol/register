import { MoreHorizontal } from 'lucide-react'
const spacingSteps = [
  { value: '1 / 2', width: 'w-0.5', role: 'structural seams' },
  { value: '4', width: 'w-1', role: 'optical nudge' },
  { value: '8', width: 'w-2', role: 'related items' },
  { value: '12', width: 'w-3', role: 'compact cluster' },
  { value: '16', width: 'w-4', role: 'contained inset' },
  { value: '24', width: 'w-6', role: 'content / groups' },
  { value: '32', width: 'w-8', role: 'distinct regions' },
  { value: '48', width: 'w-12', role: 'major separation' },
]
export const RecommendedSpacingRules = () => (
  <article className="border border-primary/20 bg-primary/5">
    <div className="border-b border-primary/15 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-medium">Recommended starting grammar</h3>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
          Product evidence + system guidance
        </span>
      </div>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Accepted as the provisional spacing grammar. Component and real-screen
        work can still expose a reason to revise it.
      </p>
    </div>
    <div className="grid gap-px bg-primary/15 sm:grid-cols-2 lg:grid-cols-4">
      <Recommendation value="24px" label="ordinary section inset" />
      <Recommendation value="16px" label="nested or narrow inset" />
      <Recommendation value="8px" label="within one relationship" />
      <Recommendation value="32px+" label="distinct page regions" />
    </div>
  </article>
)

const Recommendation = ({ value, label }: { value: string; label: string }) => (
  <div className="bg-card p-4">
    <p className="text-xl font-light text-primary">{value}</p>
    <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
  </div>
)

export const SpacingLadder = () => (
  <article className="border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="font-medium">Candidate layout ladder</h3>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        A limited relationship scale. The 18px and 20px values in control
        geometry remain component-specific optical padding, not layout steps.
      </p>
    </div>
    <div className="grid gap-px bg-secondary sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
      {spacingSteps.map((step) => (
        <div key={step.value} className="bg-card p-4">
          <div className="flex h-12 items-center">
            <span className={`h-8 ${step.width} bg-primary`} />
          </div>
          <p className="text-sm font-medium">{step.value}px</p>
          <p className="mt-0.5 text-xs font-light text-muted-foreground">
            {step.role}
          </p>
        </div>
      ))}
    </div>
  </article>
)

export const StudyCard = ({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) => (
  <article className="overflow-hidden border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="font-medium">{label}</h3>
      <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
    {children}
  </article>
)

export const InsetSpecimen = ({
  inset,
  className,
  recommended = false,
}: {
  inset: string
  className: string
  recommended?: boolean
}) => (
  <div className={`relative min-h-44 bg-card ${className}`}>
    <SpecimenMarker label={recommended ? `${inset} · recommended` : inset} />
    <ContentSample />
    <div className="mt-5 h-11 rounded-full border border-input" />
  </div>
)

export const AxisSpecimen = ({
  label,
  direct = false,
}: {
  label: string
  direct?: boolean
}) => (
  <div className="relative min-h-44 overflow-hidden bg-card">
    <div className="absolute bottom-0 left-6 top-0 z-10 w-px bg-primary/40" />
    <span className="absolute bottom-3 left-7 z-10 text-[10px] font-medium text-primary">
      24px axis
    </span>
    <span className="absolute right-3 top-3 z-10 text-[10px] font-medium text-muted-foreground">
      {label}
    </span>
    {direct ? (
      <div className="p-6">
        <ContentSample />
      </div>
    ) : (
      <div className="p-2">
        <div className="rounded-lg bg-muted p-4">
          <ContentSample />
        </div>
      </div>
    )}
  </div>
)

const SpecimenMarker = ({ label }: { label: string }) => (
  <span className="absolute right-2 top-2 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
    {label}
  </span>
)

export const FormInsetSpecimen = ({
  label,
  value,
  wideControls = false,
}: {
  label: string
  value: string
  wideControls?: boolean
}) => {
  const controlInset = wideControls ? 'mx-2' : 'mx-6'
  const controlWrapperInset = wideControls ? 'px-2' : 'px-6'

  return (
    <div className="relative bg-card py-6">
      <div className="absolute bottom-0 left-6 top-0 w-px bg-primary/40" />
      <div className="relative px-6">
        <SpecimenLabel label={label} value={value} />
        <div className="mt-5">
          <p className="text-xl font-medium">Create proposal</p>
          <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
            Define the change for governance review.
          </p>
        </div>
      </div>

      <div className="relative mt-6 flex flex-col gap-6">
        <Field
          label="Proposal title"
          value="Increase revenue share"
          controlInset={controlInset}
        />
        <Field
          label="Voting period"
          value="3 days"
          controlInset={controlInset}
        />
      </div>

      <div className={`${controlWrapperInset} relative mt-6`}>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Review proposal
        </button>
      </div>
    </div>
  )
}

const Field = ({
  label,
  value,
  controlInset,
}: {
  label: string
  value: string
  controlInset: string
}) => (
  <label className="block">
    <span className="block px-6 text-sm font-medium">{label}</span>
    <span
      className={`${controlInset} mt-2 flex h-11 items-center rounded-full border border-input px-4 text-sm font-light`}
    >
      {value}
    </span>
    <span className="mt-2 block px-6 text-sm font-light text-muted-foreground">
      Supporting information sits 8px below.
    </span>
  </label>
)

export const ResponsiveInsetSpecimens = () => (
  <div className="flex min-h-[20rem] items-end gap-3 overflow-hidden bg-secondary p-0.5">
    <div className="flex min-h-[19.75rem] min-w-0 flex-1 flex-col bg-card p-6">
      <SpecimenLabel label="Normal section" value="24px" />
      <div className="mt-8">
        <ContentSample />
      </div>
      <div className="mt-auto h-11 rounded-full border border-input" />
    </div>
    <div className="flex min-h-[17rem] w-44 shrink-0 flex-col bg-card p-4">
      <SpecimenLabel label="Narrow" value="16px" />
      <div className="mt-6">
        <p className="text-base font-medium">Governance</p>
        <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
          Review activity and proposals.
        </p>
      </div>
      <div className="mt-auto h-11 rounded-full border border-input" />
    </div>
  </div>
)

export const RowRhythmSpecimens = () => (
  <div className="grid gap-3 bg-secondary p-0.5 lg:grid-cols-3">
    <RowColumn label="Dense data" value="40px baseline">
      {['ETH Plus', 'Large Cap', 'DeFi Index'].map((name, index) => (
        <SingleLineRow
          key={name}
          name={name}
          value={`${index + 3}.24%`}
          dense
        />
      ))}
    </RowColumn>
    <RowColumn label="Standard content" value="48px baseline">
      {['ETH Plus', 'Large Cap', 'DeFi Index'].map((name, index) => (
        <SingleLineRow key={name} name={name} value={`${index + 3}.24%`} />
      ))}
    </RowColumn>
    <RowColumn label="Rich asset" value="12px vertical padding">
      {[
        ['Ethereum', 'ETH', '38.24%'],
        ['USD Coin', 'USDC', '24.18%'],
        ['Wrapped BTC', 'WBTC', '17.06%'],
      ].map(([name, symbol, value]) => (
        <RichRow key={symbol} name={name} symbol={symbol} value={value} />
      ))}
    </RowColumn>
  </div>
)

const RowColumn = ({
  label,
  value,
  children,
}: {
  label: string
  value: string
  children: React.ReactNode
}) => (
  <div className="bg-card p-6">
    <SpecimenLabel label={label} value={value} />
    <div className="mt-4">{children}</div>
  </div>
)

const SingleLineRow = ({
  name,
  value,
  dense = false,
}: {
  name: string
  value: string
  dense?: boolean
}) => (
  <div
    className={`flex items-center justify-between gap-3 ${dense ? 'h-10' : 'h-12'}`}
  >
    <span className="text-sm font-medium">{name}</span>
    <span className="text-sm font-light tabular-nums text-muted-foreground">
      {value}
    </span>
  </div>
)

const RichRow = ({
  name,
  symbol,
  value,
}: {
  name: string
  symbol: string
  value: string
}) => (
  <div className="flex items-center gap-3 py-3">
    <span className="h-8 w-8 shrink-0 rounded-full bg-primary/10" />
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-medium">{name}</span>
      <span className="block text-sm font-light text-muted-foreground">
        {symbol}
      </span>
    </span>
    <span className="text-sm font-light tabular-nums">{value}</span>
    <button
      type="button"
      aria-label={`More actions for ${name}`}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border"
    >
      <MoreHorizontal className="h-4 w-4" />
    </button>
  </div>
)

const SpecimenLabel = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-2">
    <p className="text-sm font-medium">{label}</p>
    <code className="text-xs text-muted-foreground">{value}</code>
  </div>
)

export const RulePrompt = ({
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

const ContentSample = () => (
  <div>
    <p className="text-xl font-medium">Governance</p>
    <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
      Review voting activity and recent proposals.
    </p>
  </div>
)
