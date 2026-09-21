import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  TriangleAlert,
} from 'lucide-react'

const IconographyStudy = () => (
  <section
    id="iconography-study"
    className="scroll-mt-28 space-y-4"
    aria-labelledby="iconography-heading"
  >
    <Heading />

    <div className="border border-primary/20 bg-primary/5 p-5">
      <p className="text-sm font-medium text-primary">Recommended model</p>
      <p className="mt-1 max-w-4xl text-sm font-light leading-5 text-muted-foreground">
        Use Lucide for ordinary interface actions. Default to 1.5px stroke, 14px
        in micro controls, and 16px in compact/default controls. Use 20px only
        when the icon is itself content. Keep brand, token, chain, and bespoke
        product diagrams as explicit exceptions rather than forcing them into
        the UI-icon language.
      </p>
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      <StudyCard
        label="Productive size and stroke"
        copy="The same icon at the candidate productive sizes and stroke character."
      >
        <div className="grid gap-px bg-secondary p-0.5 sm:grid-cols-3">
          <IconScale label="Micro" value="14px" size={14} />
          <IconScale label="Control" value="16px" size={16} />
          <IconScale label="Content" value="20px" size={20} />
        </div>
      </StudyCard>

      <StudyCard
        label="Icon-to-text pairing"
        copy="Icons match the text color, stay center-aligned, and preserve the geometry study's optical padding."
      >
        <div className="grid min-h-44 content-center gap-4 bg-card p-6 sm:grid-cols-2">
          <button
            type="button"
            className="flex h-11 w-fit items-center gap-2 rounded-full bg-primary pl-[18px] pr-5 text-sm font-medium text-primary-foreground"
          >
            <Settings className="h-4 w-4" strokeWidth={1.5} /> Settings
          </button>
          <button
            type="button"
            className="flex h-11 w-fit items-center gap-2 rounded-full border border-border pl-5 pr-[18px] text-sm font-medium"
          >
            Continue <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
            <Search className="h-4 w-4" strokeWidth={1.5} /> Search assets
          </div>
          <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
            Time range <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
          </div>
        </div>
      </StudyCard>
    </div>

    <StudyCard
      label="Directional and disclosure semantics"
      copy="Use the smallest stable mapping that communicates behavior. Clear labels do not receive decorative icons by default."
    >
      <div className="grid gap-px bg-secondary sm:grid-cols-2 xl:grid-cols-3">
        <Direction
          label="Ordinary route"
          copy="Optional trailing emphasis when the label alone is not enough."
          icon={<ArrowRight className="size-4" strokeWidth={1.5} />}
        />
        <Direction
          label="Return"
          copy="Leading direction; name the parent when that improves orientation."
          icon={<ArrowLeft className="size-4" strokeWidth={1.5} />}
        />
        <Direction
          label="External or new tab"
          copy="Trailing indication when context changes, unless a more specific outcome icon applies."
          icon={<ArrowUpRight className="size-4" strokeWidth={1.5} />}
        />
        <Direction
          label="Download"
          copy="Use only when the result is genuinely a file or resource."
          icon={<Download className="size-4" strokeWidth={1.5} />}
        />
        <Direction
          label="Navigable row or card"
          copy="A trailing drill-in cue aligned to the far edge of the item."
          icon={<ChevronRight className="size-4" strokeWidth={1.5} />}
        />
        <Direction
          label="Expand or collapse"
          copy="Reveals content in place; it is a disclosure control, not a route."
          icon={<ChevronDown className="size-4" strokeWidth={1.5} />}
        />
      </div>
    </StudyCard>

    <StudyCard
      label="Usage roles"
      copy="This is a classification of icon jobs, not a placement template. Component context decides whether an icon is inline, framed, or omitted."
    >
      <div className="grid gap-px bg-secondary sm:grid-cols-2 lg:grid-cols-5">
        <Role
          label="Action"
          copy="Verb or command"
          icon={<Plus className="h-4 w-4" strokeWidth={1.5} />}
        />
        <Role
          label="Navigation"
          copy="Route direction or drill-in"
          icon={<ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
        />
        <Role
          label="Disclosure"
          copy="Content revealed in place"
          icon={<ChevronDown className="h-4 w-4" strokeWidth={1.5} />}
        />
        <Role
          label="Status"
          copy="Always paired with meaning"
          icon={<TriangleAlert className="h-4 w-4" strokeWidth={1.5} />}
        />
        <Role
          label="Utility"
          copy="Common repeated operation"
          icon={<MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />}
        />
      </div>
    </StudyCard>

    <StudyCard
      label="Placement and framing"
      copy="Choose placement from what the icon describes. A whole-item icon uses one fixed passive leading slot; its visible fill may change emphasis without changing layout."
    >
      <div className="grid gap-px bg-secondary lg:grid-cols-3">
        <Placement label="Icon describes the primary line">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" strokeWidth={1.5} />
            <p className="text-sm font-medium">Protocol settings</p>
          </div>
          <p className="mt-1 text-sm font-light text-muted-foreground">
            Supporting copy returns to the item’s main left edge.
          </p>
        </Placement>
        <Placement label="Whole item · ghost leading slot">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
              <TriangleAlert className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-medium">Review required</p>
              <p className="mt-1 text-sm font-light text-muted-foreground">
                The 32px slot aligns varied 20px glyphs without visible chrome.
              </p>
            </div>
          </div>
        </Placement>
        <Placement label="Icon communicates disclosure">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Governance settings</p>
              <p className="mt-1 text-sm font-light text-muted-foreground">
                Configure voting and execution.
              </p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          </div>
        </Placement>
      </div>
      <div className="grid gap-px border-t border-secondary bg-secondary lg:grid-cols-3">
        <Placement label="Stacked anchor · visible icon well">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <TriangleAlert className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <p className="mt-3 text-sm font-medium">Review required</p>
          <p className="mt-1 text-sm font-light text-muted-foreground">
            The 32px circle establishes a clear left edge for the stack.
          </p>
        </Placement>
        <Placement label="Item action · trailing icon button">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Protocol settings</p>
              <p className="mt-1 text-sm font-light text-muted-foreground">
                Content leads; the action sits at the trailing edge.
              </p>
            </div>
            <button
              type="button"
              aria-label="Open protocol settings"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Settings className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </Placement>
        <Placement label="Avoid · bare icon above a stack">
          <TriangleAlert className="h-4 w-4" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-medium">Review required</p>
          <p className="mt-1 text-sm font-light text-muted-foreground">
            The glyph’s optical bounds make the left edge feel accidental.
          </p>
        </Placement>
      </div>
    </StudyCard>

    <div className="grid gap-5 xl:grid-cols-2">
      <Comparison
        title="Recommended · icon supports recognition"
        copy="Text remains the primary label where the action is not universally obvious."
      >
        <div className="flex min-h-32 items-center gap-3 bg-card p-6">
          <Check className="h-4 w-4 text-success" strokeWidth={1.5} />
          <span className="text-sm font-medium">Proposal submitted</span>
        </div>
      </Comparison>
      <Comparison
        title="Avoid · icon decoration as hierarchy"
        copy="Large decorative tiles make ordinary actions feel louder and less institutional."
      >
        <div className="grid min-h-32 grid-cols-3 gap-3 bg-card p-5">
          {[Search, Settings, ArrowUpRight].map((Icon, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 rounded-2xl bg-muted p-4"
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">Action</span>
            </div>
          ))}
        </div>
      </Comparison>
    </div>
  </section>
)

const Heading = () => (
  <div>
    <div className="flex flex-wrap items-center gap-2">
      <h2 id="iconography-heading" className="text-xl font-semibold">
        Iconography
      </h2>
      <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
        Accepted provisional foundation
      </span>
    </div>
    <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
      Choose a productive icon character and clear exceptions without turning
      icons into decorative furniture.
    </p>
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
      <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
        {copy}
      </p>
    </div>
    {children}
  </article>
)

const IconScale = ({
  label,
  value,
  size,
}: {
  label: string
  value: string
  size: number
}) => (
  <div className="flex min-h-36 flex-col items-center justify-center bg-card p-4">
    <Settings size={size} strokeWidth={1.5} />
    <p className="mt-4 text-sm font-medium">{label}</p>
    <code className="text-xs text-muted-foreground">{value} · 1.5 stroke</code>
  </div>
)

const Role = ({
  label,
  copy,
  icon,
}: {
  label: string
  copy: string
  icon: React.ReactElement
}) => (
  <div className="bg-card p-5">
    <div className="grid grid-cols-[20px_1fr] items-center gap-2">
      <span className="flex items-center justify-center text-foreground">
        {icon}
      </span>
      <p className="text-sm font-medium">{label}</p>
      <p className="col-start-2 text-xs font-light text-muted-foreground">
        {copy}
      </p>
    </div>
  </div>
)

const Direction = ({
  label,
  copy,
  icon,
}: {
  label: string
  copy: string
  icon: React.ReactElement
}) => (
  <div className="grid min-h-32 grid-cols-[20px_1fr] content-center gap-x-2 bg-card p-5">
    <span className="flex items-center justify-center text-foreground">
      {icon}
    </span>
    <p className="text-sm font-medium">{label}</p>
    <p className="col-start-2 mt-1 text-xs font-light leading-5 text-muted-foreground">
      {copy}
    </p>
  </div>
)

const Placement = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="min-h-44 bg-card p-6">
    <p className="mb-6 text-xs font-medium text-muted-foreground">{label}</p>
    {children}
  </div>
)

const Comparison = ({
  title,
  copy,
  children,
}: {
  title: string
  copy: string
  children: React.ReactNode
}) => (
  <article className="overflow-hidden border border-border bg-card">
    <div className="border-b border-border p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1 text-sm font-light text-muted-foreground">{copy}</p>
    </div>
    {children}
  </article>
)

export default IconographyStudy
