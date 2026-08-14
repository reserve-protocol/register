import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import { Button, type ButtonSize } from '@/components/button'

const ActionsCandidateStudy = () => (
  <section
    id="actions-candidate-study"
    className="scroll-mt-28 space-y-4"
    aria-labelledby="actions-candidate-heading"
  >
    <Heading />

    <div className="border border-primary/20 bg-primary/5 p-5">
      <p className="text-sm font-medium text-primary">
        Prepared starting point
      </p>
      <p className="mt-1 max-w-4xl text-sm font-light leading-5 text-muted-foreground">
        This is the first component-family sheet, not a product migration. It
        combines the provisional 28/32/44px geometry, optical icon padding,
        full-radius atomic shape, quiet motion, and current semantic colors so
        tomorrow&apos;s review can expose where the foundations disagree.
      </p>
    </div>

    <StudyCard
      label="Variant hierarchy"
      copy="Four jobs, shown together. If two variants communicate the same priority, one should disappear."
    >
      <div className="flex min-h-36 flex-wrap items-center gap-3 bg-card p-6">
        <Button tone="primary">Review proposal</Button>
        <Button tone="secondary">Save draft</Button>
        <Button tone="quiet">Cancel</Button>
        <Button tone="destructive" leadingIcon={<Trash2 />}>
          Delete
        </Button>
      </div>
    </StudyCard>

    <div className="grid gap-5 xl:grid-cols-2">
      <StudyCard
        label="Size families"
        copy="Each category shares height, type, icon size, gap, and optical padding across text and icon content."
      >
        <div className="grid gap-px bg-secondary p-0.5">
          <SizeRow label="Micro" value="28 · icon 14" size="micro" />
          <SizeRow label="Compact" value="32 · icon 16" size="compact" />
          <SizeRow label="Default" value="44 · icon 16" size="default" />
        </div>
      </StudyCard>

      <StudyCard
        label="Icon composition"
        copy="Leading and trailing icons reduce padding on the icon side by 2px; icon-only actions preserve the size category."
      >
        <div className="flex min-h-60 flex-wrap content-center items-center gap-3 bg-card p-6">
          <Button tone="secondary" leadingIcon={<Plus />}>
            Add token
          </Button>
          <Button tone="primary" trailingIcon={<ArrowRight />}>
            Continue
          </Button>
        </div>
      </StudyCard>
    </div>

    <StudyCard
      label="Required states"
      copy="Every retained variant needs a complete state contract before migration; these previews make gaps visible together."
    >
      <div className="grid gap-px bg-secondary sm:grid-cols-2 xl:grid-cols-5">
        <State label="Default">
          <Button tone="primary">Continue</Button>
        </State>
        <State label="Hover">
          <Button tone="primary" className="bg-primary/80">
            Continue
          </Button>
        </State>
        <State label="Focus">
          <Button tone="primary">Continue</Button>
        </State>
        <State label="Loading">
          <Button tone="primary" loading>
            Submitting
          </Button>
        </State>
        <State label="Disabled">
          <Button tone="primary" disabled>
            Continue
          </Button>
        </State>
      </div>
    </StudyCard>

    <div className="grid gap-2 text-sm font-light text-muted-foreground md:grid-cols-3">
      <Rule title="Choose by hierarchy">
        Variant describes importance and consequence, never which color happens
        to fit a screen.
      </Rule>
      <Rule title="Choose by density">
        Use micro only when embedded, compact in dense toolbars, and default for
        ordinary actions.
      </Rule>
      <Rule title="Compose deliberately">
        Prefer one primary action per decision area; group peers by size and
        alignment.
      </Rule>
    </div>
  </section>
)

const SizeRow = ({
  label,
  value,
  size,
}: {
  label: string
  value: string
  size: ButtonSize
}) => (
  <div className="grid min-h-24 items-center gap-4 bg-card p-5 sm:grid-cols-[7rem_1fr]">
    <div>
      <p className="text-sm font-medium">{label}</p>
      <code className="text-xs text-muted-foreground">{value}</code>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <Button tone="secondary" size={size}>
        Filter
      </Button>
      <Button tone="secondary" size={size} leadingIcon={<Plus />}>
        Add
      </Button>
    </div>
  </div>
)

const Heading = () => (
  <div>
    <div className="flex flex-wrap items-center gap-2">
      <h2 id="actions-candidate-heading" className="text-xl font-semibold">
        Actions family starting point
      </h2>
      <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
        Beyond foundations
      </span>
    </div>
    <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
      A compact candidate matrix for reviewing the first reusable component
      family once the remaining foundations feel coherent.
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

const State = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex min-h-32 flex-col items-start justify-between bg-card p-4">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    {children}
  </div>
)

const Rule = ({
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

export default ActionsCandidateStudy
