import { ArrowRight, ChevronDown, MoreHorizontal, Search, SlidersHorizontal } from 'lucide-react'
import ControlGeometryMatrix from './control-geometry-matrix'

const ControlGeometryStudy = () => (
  <section className="space-y-4" aria-labelledby="control-geometry-study">
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="control-geometry-study" className="text-xl font-semibold">
          Control geometry
        </h2>
        <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
          Working proposal
        </span>
      </div>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        Two realistic compositions for choosing visible heights, padding,
        icons, radius, and alignment. Values remain provisional.
      </p>
    </div>
    <div className="grid gap-px bg-secondary p-0.5 md:grid-cols-3">
      <ScaleRole
        label="Micro"
        value="28px"
        description="Embedded actions and segmented items"
      >
        <button
          type="button"
          className="h-7 rounded-full bg-primary/10 px-2.5 text-xs font-medium text-primary"
        >
          Max
        </button>
      </ScaleRole>
      <ScaleRole
        label="Compact"
        value="32px"
        description="Dense toolbars and icon actions"
      >
        <button
          type="button"
          aria-label="Compact more actions example"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </ScaleRole>
      <ScaleRole
        label="Default"
        value="44px"
        description="Ordinary fields, buttons, and actions"
      >
        <button
          type="button"
          className="flex h-11 items-center gap-2 rounded-full bg-primary pl-5 pr-[18px] text-sm font-medium text-primary-foreground"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </ScaleRole>
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <StudyCard
        label="Standard form panel"
        description="Default fields and actions share one 44px control height."
      >
        <div className="bg-secondary p-0.5">
          <div className="bg-card p-6">
            <h3 className="text-xl font-medium">Proposal settings</h3>
            <p className="mt-1 max-w-lg text-sm font-light leading-5 text-muted-foreground">
              Configure the visible name and execution behavior before review.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-medium">
                  Proposal title
                </span>
                <input
                  readOnly
                  value="Increase revenue share"
                  className="h-11 w-full rounded-full border border-input bg-card px-5 text-sm font-light outline-none"
                />
                <span className="block text-sm font-light text-muted-foreground">
                  Visible to all governance participants.
                </span>
              </label>

              <label className="space-y-2">
                <span className="flex items-center justify-between gap-2 text-sm font-medium">
                  Voting period
                  <span className="text-xs font-light text-muted-foreground">
                    Focused
                  </span>
                </span>
                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-between rounded-full border border-input bg-card pl-5 pr-[18px] text-sm font-light ring-2 ring-ring ring-offset-2 ring-offset-card"
                >
                  3 days
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                <span className="block text-sm font-light text-muted-foreground">
                  Select menus share field geometry.
                </span>
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="flex items-center justify-between gap-2 text-sm font-medium">
                  Execution delay
                  <span className="text-xs font-light text-muted-foreground">
                    Disabled
                  </span>
                </span>
                <input
                  disabled
                  value="24 hours"
                  className="h-11 w-full rounded-full border border-input bg-card px-5 text-sm font-light text-muted-foreground disabled:cursor-not-allowed"
                />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-6">
              <button
                type="button"
                className="h-11 rounded-full border border-border bg-card px-5 text-sm font-medium"
              >
                Save draft
              </button>
              <button
                type="button"
                className="flex h-11 items-center gap-2 rounded-full bg-primary pl-5 pr-[18px] text-sm font-medium text-primary-foreground"
              >
                Review proposal
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </StudyCard>

      <div className="space-y-5">
        <StudyCard
          label="Compact filter toolbar"
          description="Every visible control is 32px; search and select remain restrained objects while actions stay fully rounded."
        >
          <div className="bg-card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative min-w-44 flex-1">
                <span className="sr-only">Search DTFs</span>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  readOnly
                  placeholder="Search DTFs"
                  className="h-8 w-full rounded-full border border-input bg-card pl-9 pr-4 text-sm font-light outline-none"
                />
              </label>
              <button
                type="button"
                className="flex h-8 items-center gap-2 rounded-full border border-border bg-card pl-2.5 pr-3 text-sm font-medium"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
              <button
                type="button"
                aria-label="More table actions"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex h-8 items-center rounded-full bg-muted p-0.5 text-sm font-medium">
                <button
                  type="button"
                  className="h-7 rounded-full bg-card px-3 shadow-sm"
                >
                  All
                </button>
                <button
                  type="button"
                  className="h-7 rounded-full px-3 text-muted-foreground"
                >
                  Watchlist
                </button>
              </div>
              <span className="text-sm font-light text-muted-foreground">
                24 results
              </span>
            </div>
          </div>
        </StudyCard>

        <StudyCard
          label="Default-height decision"
          description="The previous 40px field beside the 44px candidate. Judge density, centering, and ordinary form rhythm."
        >
          <div className="grid gap-4 bg-card p-6 sm:grid-cols-2">
            <HeightOption label="Previous · 40px" heightClassName="h-10" paddingClassName="pl-4 pr-3.5" />
            <HeightOption label="Candidate · 44px" heightClassName="h-11" paddingClassName="pl-5 pr-[18px]" />
          </div>
        </StudyCard>
      </div>
    </div>
    <ControlGeometryMatrix />
    <div className="grid gap-2 text-sm font-light text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
      <RuleNote title="Size placement">
        Micro is 28px, compact is 32px, and default is 44px; there is no separate action size.
      </RuleNote>
      <RuleNote title="Shape logic">
        Atomic single-row controls are fully rounded; composite objects use 8px.
      </RuleNote>
      <RuleNote title="Content alignment">
        Icon controls use 2px less padding on the icon side for optical balance.
      </RuleNote>
      <RuleNote title="Interaction target">
        Micro and compact visuals still require a larger production hit area.
      </RuleNote>
    </div>
  </section>
)

const ScaleRole = ({
  label,
  value,
  description,
  children,
}: {
  label: string
  value: string
  description: string
  children: React.ReactNode
}) => (
  <div className="flex min-h-32 flex-col items-start justify-between gap-4 bg-card p-4">
    <div>
      <div className="flex items-baseline gap-2">
        <p className="text-sm font-medium">{label}</p>
        <code className="text-xs text-muted-foreground">{value}</code>
      </div>
      <p className="mt-1 max-w-44 text-sm font-light leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
)

const StudyCard = ({
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

const HeightOption = ({
  label,
  heightClassName,
  paddingClassName,
}: {
  label: string
  heightClassName: string
  paddingClassName: string
}) => (
  <div>
    <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
    <div
      className={`flex w-full items-center justify-between rounded-full border border-input text-sm font-light ${heightClassName} ${paddingClassName}`}
    >
      3 days
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </div>
  </div>
)

const RuleNote = ({
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

export default ControlGeometryStudy
