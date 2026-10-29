import { Check, CircleDashed } from 'lucide-react'

const LayoutFoundationStudy = () => (
  <section
    id="layout-foundation-study"
    className="scroll-mt-28 space-y-4"
    aria-labelledby="layout-foundation-heading"
  >
    <Heading />

    <div className="grid gap-px bg-secondary sm:grid-cols-2 xl:grid-cols-4">
      <Evidence value="1400px" label="Historical outer-cap evidence" />
      <Evidence
        value="72 / 256px"
        label="V1 navigation · collapsed / expanded"
      />
      <Evidence value="1.5:1 · 2:1" label="Competing fluid splits" />
      <Evidence value="408–480px" label="Focused and support widths" />
    </div>

    <StudyCard
      label="Historical split evidence"
      copy="These captured route proportions inform layout candidates; they are not accepted V1 ratios or measurements of the current navigation shell."
    >
      <div className="grid gap-px bg-secondary lg:grid-cols-3">
        <CurrentSplit
          label="Governance / settings"
          value="1.5 : 1"
          columns="grid-cols-[1.5fr_1fr]"
        />
        <CurrentSplit
          label="Deploy / manage"
          value="2 : 1"
          columns="grid-cols-[2fr_1fr]"
        />
        <CurrentSplit
          label="Overview"
          value="≈ 1.45 : 1 at 1400px"
          columns="grid-cols-[1.45fr_1fr]"
        />
      </div>
    </StudyCard>

    <StudyCard
      label="Candidate layout grammar"
      copy="Choose by the job of the second region. Component internals keep their own spacing and do not redefine page columns."
    >
      <div className="grid gap-px bg-secondary lg:grid-cols-3">
        <Template
          label="Table-led content + support"
          use="Overview and other data-dense primary regions"
          rule="The support rail stays stable while the primary region absorbs available width. Stack before tables compress below their useful minimum."
        >
          <div className="grid h-40 grid-cols-[3rem_minmax(0,1fr)] gap-0.5 bg-secondary">
            <Block tone="muted" />
            <div className="grid grid-cols-[1.45fr_1fr] gap-0.5">
              <Block />
              <Block />
            </div>
          </div>
        </Template>
        <Template
          label="Balanced split"
          use="Two substantial peer regions"
          rule="Use one shared 3:2 relationship only when both columns carry meaningful page work."
        >
          <div className="grid h-40 grid-cols-[3rem_minmax(0,1fr)] gap-0.5 bg-secondary">
            <Block tone="muted" />
            <div className="grid grid-cols-[3fr_2fr] gap-0.5">
              <Block />
              <Block />
            </div>
          </div>
        </Template>
        <Template
          label="Focused column"
          use="Linear form or task"
          rule="Center one readable task column; add a peer region only when the workflow truly needs it."
        >
          <div className="grid h-40 grid-cols-[3rem_minmax(0,1fr)] gap-0.5 bg-secondary">
            <Block tone="muted" />
            <div className="flex justify-center bg-card p-3">
              <div className="w-[52%] bg-muted" />
            </div>
          </div>
        </Template>
      </div>
    </StudyCard>

    <div className="grid gap-2 text-sm font-light text-muted-foreground md:grid-cols-3">
      <Rule title="Outer frame owns alignment">
        Header, navigation, and route content share the same centered frame and
        desktop gutter.
      </Rule>
      <Rule title="Roles own columns">
        Content importance selects the template; a route does not invent a new
        ratio because its cards happen to fit.
      </Rule>
      <Rule title="Narrow screens stack">
        Supporting regions follow the primary task in reading order; component
        geometry does not shrink to preserve a desktop split.
      </Rule>
    </div>
  </section>
)

const Heading = () => (
  <div>
    <div className="flex flex-wrap items-center gap-2">
      <h2 id="layout-foundation-heading" className="text-xl font-semibold">
        Layout and responsive structure
      </h2>
      <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
        Decision ready
      </span>
    </div>
    <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
      A small page grammar for stable alignment and column behavior. It does not
      prescribe the composition inside product regions.
    </p>
  </div>
)

const Evidence = ({ value, label }: { value: string; label: string }) => (
  <div className="bg-card p-5">
    <code className="text-base font-medium text-foreground">{value}</code>
    <p className="mt-1 text-xs font-light text-muted-foreground">{label}</p>
  </div>
)

const StudyCard = ({
  label,
  copy,
  children,
}: {
  label: string
  copy: string
  children: React.ReactNode
}) => (
  <article className="overflow-hidden border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="font-medium">{label}</h3>
      <p className="mt-1 max-w-4xl text-sm font-light leading-5 text-muted-foreground">
        {copy}
      </p>
    </div>
    {children}
  </article>
)

const CurrentSplit = ({
  label,
  value,
  columns,
}: {
  label: string
  value: string
  columns: string
}) => (
  <div className="bg-card p-5">
    <div className="grid h-24 grid-cols-[3rem_minmax(0,1fr)] gap-0.5 bg-secondary">
      <Block tone="muted" />
      <div className={`grid gap-0.5 bg-secondary ${columns}`}>
        <Block />
        <Block />
      </div>
    </div>
    <p className="mt-4 text-sm font-medium">{label}</p>
    <code className="text-xs text-muted-foreground">{value}</code>
  </div>
)

const Template = ({
  label,
  use,
  rule,
  children,
}: {
  label: string
  use: string
  rule: string
  children: React.ReactNode
}) => (
  <div className="bg-card p-5">
    {children}
    <div className="mt-4 flex items-center gap-2">
      <Check className="h-4 w-4 text-primary" />
      <p className="text-sm font-medium">{label}</p>
    </div>
    <p className="mt-1 text-xs font-medium text-foreground">{use}</p>
    <p className="mt-1 text-xs font-light leading-5 text-muted-foreground">
      {rule}
    </p>
  </div>
)

const Block = ({ tone = 'muted' }: { tone?: 'card' | 'muted' }) => (
  <div className={tone === 'card' ? 'bg-card' : 'bg-muted'} />
)

const Rule = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="border border-border bg-card p-4">
    <div className="flex items-center gap-2">
      <CircleDashed className="h-3.5 w-3.5 text-primary" />
      <p className="font-medium text-foreground">{title}</p>
    </div>
    <p className="mt-2 text-xs leading-5">{children}</p>
  </div>
)

export default LayoutFoundationStudy
