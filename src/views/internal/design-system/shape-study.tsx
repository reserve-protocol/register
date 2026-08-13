import { Check, ChevronDown, MoreHorizontal, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const ShapeStudy = () => (
  <section className="space-y-4" aria-labelledby="shape-study">
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="shape-study" className="text-xl font-semibold">
          Radius and control geometry
        </h2>
        <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
          Working rule
        </span>
      </div>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
        Test a restrained three-level language: square structure with selective
        substrate-reveal corners, softly rounded composite objects, and fully
        rounded atomic one-row controls.
      </p>
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      <StudyPanel
        title="Square structure"
        description="Page regions, cards, and list rows behave as layout—not as a collection of bubbles."
      >
        <div className="bg-secondary p-0.5">
          <div className="bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-medium leading-[26px]">Exposure</p>
                <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
                  Current portfolio allocation
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-rounded"
                aria-label="More exposure options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-px grid bg-secondary sm:grid-cols-2">
            <Metric label="Total value" value="$24.8m" />
            <Metric label="30 day return" value="+8.42%" separated />
          </div>
          <div className="mt-px bg-card">
            <AssetRow name="Ethereum" symbol="WETH" value="34.82%" />
            <AssetRow name="USD Coin" symbol="USDC" value="21.15%" />
          </div>
        </div>
      </StudyPanel>

      <StudyPanel
        title="Pill controls"
        description="Buttons, one-row inputs and selects, tabs, badges, and icon controls read as discrete atomic objects."
      >
        <div className="space-y-7 bg-card p-5">
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full">Review proposal</Button>
            <Button variant="outline" className="rounded-full">
              Preview
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="rounded-full">
              <TabsTrigger className="rounded-full" value="overview">
                Overview
              </TabsTrigger>
              <TabsTrigger className="rounded-full" value="governance">
                Governance
              </TabsTrigger>
              <TabsTrigger className="rounded-full" value="holders">
                Holders
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-7 items-center rounded-full bg-success/10 px-2.5 text-xs font-medium">
              Active
            </span>
            <span className="flex h-7 items-center rounded-full bg-muted px-2.5 text-xs font-medium text-muted-foreground">
              Index DTF
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </StudyPanel>
    </div>

    <StudyPanel
      title="Soft containment radius"
      description="The 8px candidate belongs to composite amount panels, multiline fields, menus, popovers, and thumbnails—not ordinary one-row inputs or select triggers."
    >
      <div className="grid gap-px bg-secondary xl:grid-cols-2">
        <ContainmentCandidate label="Square composite comparison" />
        <ContainmentCandidate label="8px composite candidate" softened />
      </div>
    </StudyPanel>

    <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
      <GeometryRule
        role="Structural surface"
        value="0 / reveal"
        copy="Square by default; selective composition-owned corners reveal beige at major seams."
      />
      <GeometryRule
        role="Contained object"
        value="8px"
        copy="Composite amount panels, multiline fields, menus, popovers, and thumbnails keep a complete symmetric silhouette."
      />
      <GeometryRule
        role="Atomic control"
        value="Full"
        copy="Buttons, one-row inputs and selects, tabs, badges, icon controls, switches, and handles."
      />
      <GeometryRule
        role="Exact values"
        value="16 / 8"
        copy="Working reveal/containment pair; validate in overview and mint or Zapper compositions."
        open
      />
    </div>
  </section>
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
      <h3 className="text-base font-medium leading-6">{title}</h3>
      <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
    <div className="bg-background p-5">{children}</div>
  </article>
)

const Metric = ({
  label,
  value,
  separated = false,
}: {
  label: string
  value: string
  separated?: boolean
}) => (
  <div className={`bg-card p-5 ${separated ? 'sm:ml-px' : ''}`}>
    <p className="text-sm font-light leading-5 text-muted-foreground">
      {label}
    </p>
    <p className="mt-2 text-xl font-light leading-7 tabular-nums">{value}</p>
  </div>
)

const AssetRow = ({
  name,
  symbol,
  value,
}: {
  name: string
  symbol: string
  value: string
}) => (
  <div className="flex min-h-16 items-center gap-3 px-5 py-3 hover:bg-muted">
    <span className="h-8 w-8 shrink-0 rounded-full bg-primary/10" />
    <span className="min-w-0 flex-1">
      <span className="block text-base font-medium leading-6">{name}</span>
      <span className="block text-sm font-light leading-5 text-muted-foreground">
        {symbol}
      </span>
    </span>
    <span className="text-base font-light leading-6 tabular-nums">{value}</span>
  </div>
)

const ContainmentCandidate = ({
  label,
  softened = false,
}: {
  label: string
  softened?: boolean
}) => {
  const radius = softened ? 'rounded-lg' : 'rounded-none'

  return (
    <div className="bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <code className="text-[11px] text-muted-foreground">
          {softened ? '8px' : '0px'}
        </code>
      </div>

      <div
        className={`mt-5 border border-border bg-card p-4 ${radius}`}
      >
        <div className="flex items-center justify-between text-sm font-light text-muted-foreground">
          <span>You pay</span>
          <span>Balance 2,420 USDC</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xl font-light tabular-nums">1,000</span>
          <span className="flex items-center gap-2 text-sm font-medium">
            USDC <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div
        className={`mt-3 overflow-hidden border border-border bg-card shadow-md ${radius}`}
      >
        <MenuRow name="Ethereum" symbol="WETH" selected />
        <MenuRow name="USD Coin" symbol="USDC" />
        <MenuRow name="Wrapped Bitcoin" symbol="WBTC" />
      </div>
    </div>
  )
}

const MenuRow = ({
  name,
  symbol,
  selected = false,
}: {
  name: string
  symbol: string
  selected?: boolean
}) => (
  <div
    className={`flex min-h-11 items-center gap-3 px-3 py-2 ${selected ? 'bg-accent/60' : 'bg-card'}`}
  >
    <span className="h-6 w-6 rounded-full bg-primary/10" />
    <span className="min-w-0 flex-1 text-sm font-light">
      {name} <span className="text-muted-foreground">{symbol}</span>
    </span>
    {selected && <Check className="h-4 w-4 text-primary" />}
  </div>
)

const GeometryRule = ({
  role,
  value,
  copy,
  open = false,
}: {
  role: string
  value: string
  copy: string
  open?: boolean
}) => (
  <div className="bg-card p-4">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs font-medium">{role}</p>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
          open
            ? 'bg-warning/10 text-foreground'
            : 'bg-success/10 text-foreground'
        }`}
      >
        {open ? 'Open' : 'Candidate'}
      </span>
    </div>
    <p className="mt-3 text-xl font-light leading-7">{value}</p>
    <p className="mt-1 text-xs font-light leading-5 text-muted-foreground">
      {copy}
    </p>
  </div>
)

export default ShapeStudy
