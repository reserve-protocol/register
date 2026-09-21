import { Check, Info, Keyboard, MousePointer2, PanelTop } from 'lucide-react'

const AccessibilityStudy = () => (
  <section
    id="accessibility-study"
    className="scroll-mt-28 space-y-4"
    aria-labelledby="accessibility-heading"
  >
    <Heading />
    <div className="border border-primary/20 bg-primary/5 p-5">
      <p className="text-sm font-medium text-primary">Recommended guardrails</p>
      <p className="mt-1 max-w-4xl text-sm font-light leading-5 text-muted-foreground">
        Put the mechanical work in shared primitives: keyboard behavior, focus,
        names, status meaning, dialog focus management, and reduced motion.
        Product work should mainly supply truthful labels, messages, and reading
        order—not repeat an accessibility project on every screen.
      </p>
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      <StudyCard
        label="Visible size versus hit target"
        copy="Compact visual geometry can retain a larger interaction area without changing alignment."
      >
        <div className="grid min-h-48 grid-cols-2 gap-px bg-secondary p-0.5">
          <TargetSpecimen label="Visible" value="32px" expanded={false} />
          <TargetSpecimen label="Hit area" value="44px" expanded />
        </div>
      </StudyCard>

      <StudyCard
        label="Keyboard focus"
        copy="The current two-color construction separates focus from the control border and surrounding surface."
      >
        <div className="flex min-h-48 items-center justify-center bg-card p-6">
          <button
            type="button"
            className="h-11 rounded-full border border-input px-5 text-sm font-medium ring-2 ring-ring ring-offset-2 ring-offset-card"
          >
            Focused action
          </button>
        </div>
      </StudyCard>
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      <StudyCard
        label="Meaning beyond color"
        copy="Status pairs color with a recognizable symbol and readable label."
      >
        <div className="grid min-h-40 content-center gap-4 bg-card p-6 sm:grid-cols-2">
          <Status
            icon={<Check className="h-4 w-4" strokeWidth={1.5} />}
            label="Proposal passed"
            className="text-success"
          />
          <Status
            icon={<Info className="h-4 w-4" strokeWidth={1.5} />}
            label="Review required"
            className="text-primary"
          />
        </div>
      </StudyCard>

      <StudyCard
        label="Label and accessible name"
        copy="What users see and what assistive technology announces should describe the same action."
      >
        <div className="flex min-h-40 items-center justify-center bg-card p-6">
          <div className="max-w-xs">
            <label
              className="text-sm font-medium"
              htmlFor="accessibility-example"
            >
              Proposal title
            </label>
            <input
              id="accessibility-example"
              readOnly
              value="Increase revenue share"
              className="mt-2 h-11 w-full rounded-full border border-input px-5 text-sm font-light"
            />
          </div>
        </div>
      </StudyCard>
    </div>

    <div className="grid gap-px bg-secondary sm:grid-cols-2 lg:grid-cols-3">
      <Guardrail
        icon={<Keyboard className="h-4 w-4" strokeWidth={1.5} />}
        label="Keyboard"
        copy="All actions and disclosures work without pointer input."
      />
      <Guardrail
        icon={<MousePointer2 className="h-4 w-4" strokeWidth={1.5} />}
        label="Target"
        copy="Use a 44px interaction area where pointer or touch input is expected."
      />
      <Guardrail
        icon={<Check className="h-4 w-4" strokeWidth={1.5} />}
        label="Perception"
        copy="Color, icon, text, and structure cooperate to carry meaning."
      />
      <Guardrail
        icon={<Info className="h-4 w-4" strokeWidth={1.5} />}
        label="Meaning"
        copy="Errors and statuses use readable language or symbols rather than color alone."
      />
      <Guardrail
        icon={<PanelTop className="h-4 w-4" strokeWidth={1.5} />}
        label="Dialogs"
        copy="Focus enters, stays inside, closes predictably, and returns to the trigger."
      />
      <Guardrail
        icon={<Check className="h-4 w-4" strokeWidth={1.5} />}
        label="Motion"
        copy="Reduced motion preserves information and completion feedback."
      />
    </div>

    <div className="grid gap-px bg-secondary md:grid-cols-2">
      <Boundary
        label="Built and checked once"
        copy="Button, field, dialog, menu, focus, and status primitives own the mechanics. Representative component states verify them."
      />
      <Boundary
        label="Not a V1 ceremony"
        copy="No formal certification project, exhaustive screen-reader matrix, or bespoke checklist for every modal unless evidence exposes a real problem."
      />
    </div>
  </section>
)

const Heading = () => (
  <div>
    <div className="flex flex-wrap items-center gap-2">
      <h2 id="accessibility-heading" className="text-xl font-semibold">
        Accessibility guardrails
      </h2>
      <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
        Cross-foundation
      </span>
    </div>
    <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
      These constraints shape every foundation and component; they are not a
      final audit performed after visual design. V1 uses a pragmatic baseline,
      not accessibility work for its own sake.
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

const TargetSpecimen = ({
  label,
  value,
  expanded,
}: {
  label: string
  value: string
  expanded: boolean
}) => (
  <div className="flex flex-col items-center justify-center bg-card p-5">
    <div
      className={`flex items-center justify-center border border-dashed border-primary/40 ${expanded ? 'h-11 w-11' : 'h-8 w-8'}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border">
        <MousePointer2 className="h-4 w-4" />
      </span>
    </div>
    <p className="mt-4 text-sm font-medium">{label}</p>
    <code className="text-xs text-muted-foreground">{value}</code>
  </div>
)

const Status = ({
  icon,
  label,
  className,
}: {
  icon: React.ReactElement
  label: string
  className: string
}) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
    <span className="text-sm font-medium text-foreground">{label}</span>
  </div>
)

const Guardrail = ({
  icon,
  label,
  copy,
}: {
  icon: React.ReactElement
  label: string
  copy: string
}) => (
  <div className="bg-card p-5">
    <span className="block [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
    <p className="mt-4 text-sm font-medium">{label}</p>
    <p className="mt-1 text-xs font-light leading-5 text-muted-foreground">
      {copy}
    </p>
  </div>
)

const Boundary = ({ label, copy }: { label: string; copy: string }) => (
  <div className="bg-card p-5">
    <p className="text-sm font-medium">{label}</p>
    <p className="mt-1 text-xs font-light leading-5 text-muted-foreground">
      {copy}
    </p>
  </div>
)

export default AccessibilityStudy
