import { Check } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from './catalog-ui'
import AccessibilityStudy from './accessibility-study'
import ActionsCandidateStudy from './actions-candidate-study'
import ControlGeometryStudy from './control-geometry-study'
import ElevationStudy from './elevation-study'
import FoundationDecisionQueue from './foundation-decision-queue'
import IconographyStudy from './iconography-study'
import LayoutFoundationStudy from './layout-foundation-study'
import LayoutArchitectureStudy from './layout-architecture-study'
import MeaningColorStudy from './meaning-color-study'
import ModalFamilyStudy from './modal-family-study'
import ModalGeometryStudy from './modal-geometry-study'
import MotionStudy from './motion-study'
import ShapeStudy from './shape-study'
import SpacingRhythmStudy from './spacing-rhythm-study'
import TypographyStudy from './typography-study'

const LayoutStudiesPage = () => (
  <div data-testid="layout-studies-page" className="space-y-8">
    <PageHeader
      eyebrow="Working specimens"
      title="Layout studies"
      description="Small page-shaped studies for comparing structural ideas before they become foundations or real-screen migrations. These are intentionally schematic, not finished product designs."
    />
    <FoundationDecisionQueue />

    <section className="space-y-4" aria-labelledby="page-surface-study">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="page-surface-study" className="text-xl font-semibold">
            Page surface structure
          </h2>
          <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
            Scrappy study
          </span>
        </div>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
          An overview-shaped shell with a full-width top bar, persistent left
          navigation, and asymmetric two-column content.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <StudyFrame
          label="Existing stacking model"
          description="Beige wraps the content columns as a rounded grouping surface."
        >
          <ExistingStackSpecimen />
        </StudyFrame>
        <StudyFrame
          label="Bounded substrate hypothesis"
          description="White canvas and sections sit over beige: 2px between major regions, 1px between subsections, and no automatic outer perimeter."
        >
          <BoundedSubstrateSpecimen />
        </StudyFrame>
      </div>
    </section>

    <NeutralSurfaceStudy />
    <InteractionStateStudy />
    <MeaningColorStudy />
    <TypographyStudy />
    <ShapeStudy />
    <ControlGeometryStudy />
    <SpacingRhythmStudy />
    <LayoutFoundationStudy />
    <LayoutArchitectureStudy />
    <ElevationStudy />
    <IconographyStudy />
    <MotionStudy />
    <AccessibilityStudy />
    <ModalGeometryStudy />
    <ModalFamilyStudy />
    <ActionsCandidateStudy />
  </div>
)

const InteractionStateStudy = () => (
  <section className="space-y-4" aria-labelledby="interaction-state-study">
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="interaction-state-study" className="text-xl font-semibold">
          Interaction colors on white
        </h2>
        <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
          Candidate relationships
        </span>
      </div>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
        The same selectable row shown simultaneously across its key visual
        states. These relationships use current tokens; none are accepted V1
        values yet.
      </p>
    </div>

    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid gap-px bg-border md:grid-cols-2 xl:grid-cols-5">
        <InteractionState label="Default" token="white" state="default" />
        <InteractionState label="Hover" token="--muted" state="hover" />
        <InteractionState
          label="Selected"
          token="--accent / 60%"
          state="selected"
        />
        <InteractionState label="Keyboard focus" token="--ring" state="focus" />
        <InteractionState
          label="Disabled"
          token="muted content"
          state="disabled"
        />
      </div>
    </div>
  </section>
)

type InteractionStateName =
  | 'default'
  | 'hover'
  | 'selected'
  | 'focus'
  | 'disabled'

const InteractionState = ({
  label,
  token,
  state,
}: {
  label: string
  token: string
  state: InteractionStateName
}) => (
  <div className="min-w-0 bg-card p-4">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs font-medium">{label}</p>
      <code className="text-[10px] text-muted-foreground">{token}</code>
    </div>
    <div className="mt-4 bg-card p-2">
      <SelectableRow state={state} />
    </div>
  </div>
)

const SelectableRow = ({ state }: { state: InteractionStateName }) => {
  const stateClassName: Record<InteractionStateName, string> = {
    default: 'bg-card',
    hover: 'bg-muted',
    selected: 'bg-accent/60 text-accent-foreground',
    focus: 'bg-card ring-2 ring-ring ring-offset-2 ring-offset-card',
    disabled: 'bg-card text-muted-foreground',
  }

  return (
    <div
      aria-label={`${state} selectable row specimen`}
      className={`flex min-h-20 items-center gap-3 px-3 py-3 ${stateClassName[state]}`}
    >
      <span
        className={`h-8 w-8 shrink-0 rounded-full ${state === 'disabled' ? 'bg-muted' : 'bg-primary/10'}`}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">
          Basket option
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {state === 'disabled' ? 'Unavailable' : 'Supporting detail'}
        </span>
      </span>
      {state === 'selected' && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  )
}

const NeutralSurfaceStudy = () => (
  <section className="space-y-4" aria-labelledby="neutral-surface-study">
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="neutral-surface-study" className="text-xl font-semibold">
          Neutral component chrome
        </h2>
        <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
          Working rule
        </span>
      </div>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
        Gray component chrome stays contained within white. Tables default to no
        grid lines and add a contained gray grid only when density needs it.
      </p>
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      <ContextStudy
        label="On white"
        description="Quiet gray track and white active tab; row and column dividers remain an opt-in density aid."
      >
        <div className="bg-card p-5">
          <Tabs defaultValue="exposure">
            <TabsList>
              <TabsTrigger value="exposure">Exposure</TabsTrigger>
              <TabsTrigger value="collateral">Collateral</TabsTrigger>
            </TabsList>
          </Tabs>
          <TableStructureSpecimens />
        </div>
      </ContextStudy>

      <ContextStudy
        label="On beige"
        description="No gray track or gray divider; selection is carried by text emphasis."
      >
        <div className="min-h-56 bg-secondary p-5">
          <Tabs defaultValue="price">
            <TabsList className="gap-5 rounded-none bg-transparent p-0 text-secondary-foreground/55">
              <TabsTrigger
                value="price"
                className="rounded-none px-0 py-1.5 ring-offset-secondary data-[state=active]:bg-transparent data-[state=active]:text-secondary-foreground data-[state=active]:shadow-none"
              >
                Price
              </TabsTrigger>
              <TabsTrigger
                value="market-cap"
                className="rounded-none px-0 py-1.5 ring-offset-secondary data-[state=active]:bg-transparent data-[state=active]:text-secondary-foreground data-[state=active]:shadow-none"
              >
                Market cap
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="mt-8 space-y-4" aria-label="Beige content specimen">
            <div className="h-2 w-24 bg-secondary-foreground/10" />
            <div className="h-20 bg-secondary-foreground/[0.04]" />
            <div className="flex gap-2">
              <div className="h-2 w-16 bg-secondary-foreground/10" />
              <div className="h-2 w-10 bg-secondary-foreground/10" />
            </div>
          </div>
        </div>
      </ContextStudy>
    </div>
  </section>
)

const ContextStudy = ({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) => (
  <article className="overflow-hidden rounded-2xl border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="font-semibold">{label}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
    <div className="bg-background p-5 sm:p-8">{children}</div>
  </article>
)

const TableStructureSpecimens = () => (
  <div
    className="mt-6 grid gap-4 sm:grid-cols-2"
    aria-label="Table structure specimens"
  >
    <TableStructure label="Default" />
    <TableStructure label="More structure" divided />
  </div>
)

const TableStructure = ({
  label,
  divided = false,
}: {
  label: string
  divided?: boolean
}) => (
  <div>
    <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
    <div className="grid h-8 grid-cols-[minmax(0,1fr)_4.5rem] bg-muted">
      <div className="flex items-center px-3">
        <div className="h-2 w-16 bg-muted-foreground/20" />
      </div>
      <div
        className={`flex items-center justify-end px-3 ${divided ? 'border-l border-border' : ''}`}
      >
        <div className="h-2 w-9 bg-muted-foreground/20" />
      </div>
    </div>
    {[0, 1, 2].map((row) => (
      <div key={row}>
        {divided && row > 0 && <div className="mx-3 h-px bg-border" />}
        <div className="grid h-10 grid-cols-[minmax(0,1fr)_4.5rem]">
          <div className="flex items-center px-3">
            <div className="h-2 w-16 bg-muted" />
          </div>
          <div
            className={`flex items-center justify-end px-3 ${divided ? 'border-l border-border' : ''}`}
          >
            <div className="h-2 w-8 bg-muted" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

const StudyFrame = ({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) => (
  <article className="overflow-hidden rounded-2xl border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="font-semibold">{label}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
    <div className="bg-background p-5 sm:p-8">{children}</div>
  </article>
)

const ExistingStackSpecimen = () => (
  <div className="mx-auto max-w-xl overflow-hidden rounded-xl border border-secondary bg-background">
    <TopNavigation rounded />
    <div className="grid h-80 grid-cols-[3.5rem_minmax(0,1fr)] gap-0.5 p-0.5">
      <SideNavigation rounded />
      <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(0,0.85fr)] gap-0.5 rounded-xl bg-secondary p-0.5">
        <MainColumn rounded />
        <UtilityColumn rounded />
      </div>
    </div>
  </div>
)

const BoundedSubstrateSpecimen = () => (
  <div className="mx-auto max-w-xl bg-card py-3">
    <TopNavigation />
    <div className="mx-auto grid h-80 w-[88%] grid-cols-[3.5rem_minmax(0,1fr)] gap-0.5 bg-secondary">
      <SideNavigation revealCorner />
      <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(0,0.85fr)] gap-0.5">
        <MainColumn revealCorners />
        <UtilityColumn revealCorners />
      </div>
    </div>
  </div>
)

const TopNavigation = ({ rounded = false }: { rounded?: boolean }) => (
  <div
    aria-label="Top navigation surface"
    className={
      rounded ? 'h-11 bg-card' : 'h-11 border-b-2 border-secondary bg-card'
    }
  >
    <div
      className={`flex h-full items-center gap-2 px-3 ${rounded ? '' : 'mx-auto w-[88%]'}`}
    >
      <SurfaceMark className="w-10" rounded={rounded} />
      <SurfaceMark className="w-14" rounded={rounded} />
      <SurfaceMark className="w-12" rounded={rounded} />
      <SurfaceMark className="ml-auto w-8" rounded={rounded} />
    </div>
  </div>
)

const SideNavigation = ({
  rounded = false,
  revealCorner = false,
}: {
  rounded?: boolean
  revealCorner?: boolean
}) => (
  <div
    aria-label="Side navigation surface"
    className={`${rounded ? 'rounded-xl' : ''} ${revealCorner ? 'rounded-tr-2xl' : ''} bg-card p-2`}
  >
    <div className="flex flex-col items-center gap-2">
      {[0, 1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className={
            rounded ? 'h-7 w-7 rounded-full bg-muted' : 'h-7 w-7 bg-muted'
          }
        />
      ))}
    </div>
  </div>
)

const MainColumn = ({
  rounded = false,
  revealCorners = false,
}: {
  rounded?: boolean
  revealCorners?: boolean
}) => (
  <div className={`flex min-w-0 flex-col ${rounded ? 'gap-0.5' : 'gap-px'}`}>
    <SurfaceBlock className="h-28" rounded={rounded} transparent={!rounded} />
    <SurfaceBlock
      className={`h-20 ${revealCorners ? 'rounded-t-2xl' : ''}`}
      rounded={rounded}
    />
    <SurfaceBlock className="min-h-0 flex-1" rounded={rounded} />
  </div>
)

const UtilityColumn = ({
  rounded = false,
  revealCorners = false,
}: {
  rounded?: boolean
  revealCorners?: boolean
}) => (
  <div className={`flex min-w-0 flex-col ${rounded ? 'gap-0.5' : 'gap-px'}`}>
    <SurfaceBlock
      className={`h-40 ${revealCorners ? 'rounded-tl-2xl' : ''}`}
      rounded={rounded}
    >
      {revealCorners && (
        <div
          className="ml-auto mr-3 mt-3 h-16 w-20 rounded-lg bg-muted"
          aria-label="Contained thumbnail"
        />
      )}
    </SurfaceBlock>
    <SurfaceBlock className="h-16" rounded={rounded} />
    <SurfaceBlock className="min-h-0 flex-1" rounded={rounded} />
  </div>
)

const SurfaceBlock = ({
  className,
  rounded = false,
  transparent = false,
  children,
}: {
  className: string
  rounded?: boolean
  transparent?: boolean
  children?: React.ReactNode
}) => (
  <div
    className={`${className} ${transparent ? 'bg-transparent' : 'bg-card'} ${rounded ? 'rounded-lg' : ''}`}
  >
    {children}
  </div>
)

const SurfaceMark = ({
  className,
  rounded,
}: {
  className: string
  rounded: boolean
}) => (
  <span
    className={`h-2.5 bg-muted ${className} ${rounded ? 'rounded-full' : ''}`}
  />
)

export default LayoutStudiesPage
