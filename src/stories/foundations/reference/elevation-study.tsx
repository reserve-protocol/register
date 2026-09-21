import { ChevronDown, MoreHorizontal } from 'lucide-react'

export const FLOATING_SHADOW =
  'shadow-[0_12px_32px_-14px_hsl(var(--foreground)/0.22),0_4px_12px_-8px_hsl(var(--foreground)/0.12)]'
export const MODAL_SHADOW =
  'shadow-[0_24px_64px_-22px_hsl(var(--foreground)/0.3),0_8px_24px_-14px_hsl(var(--foreground)/0.18)]'

const ElevationStudy = () => (
  <section
    id="elevation-study"
    className="scroll-mt-28 space-y-4"
    aria-labelledby="elevation-heading"
  >
    <StudyHeading
      id="elevation-heading"
      title="Elevation and floating surfaces"
      copy="Compare a flat structural layer, an anchored floating surface, and a modal layer. Shadows communicate overlap—not importance or card-ness."
    />

    <div className="border border-primary/20 bg-primary/5 p-5">
      <p className="text-sm font-medium text-primary">Recommended model</p>
      <p className="mt-1 max-w-4xl text-sm font-light leading-5 text-muted-foreground">
        Keep page sections flat. Use one quiet floating treatment for menus,
        popovers, and white wrappers that overlap content; use one stronger but
        similarly soft treatment for dialogs and temporary layers. Put the
        shadow on an overlapping wrapper rather than its buttons. In dark mode,
        surface contrast must carry more of the separation because shadows
        weaken.
      </p>
    </div>

    <div className="grid gap-5 xl:grid-cols-3">
      <ElevationCard
        label="Level 0 · structural"
        value="surface + seam"
        copy="Page regions and ordinary cards remain flat."
      >
        <div className="grid gap-px bg-secondary p-0.5">
          <div className="bg-card p-5">
            <p className="text-xl font-light">Transactions</p>
            <p className="mt-2 text-sm font-light text-muted-foreground">
              Structure comes from white surfaces and beige seams.
            </p>
          </div>
          <div className="h-16 bg-card" />
        </div>
      </ElevationCard>

      <ElevationCard
        label="Level 1 · floating"
        value="quiet shadow"
        copy="Menus and popovers visibly overlap their source surface."
      >
        <div className="relative min-h-44 bg-card p-5">
          <button className="flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium">
            Time range <ChevronDown className="h-4 w-4" />
          </button>
          <div
            className={`absolute left-14 top-[72px] w-44 rounded-lg border border-border/60 bg-popover p-2 ${FLOATING_SHADOW}`}
          >
            {['24 hours', '7 days', '30 days'].map((item) => (
              <div key={item} className="px-3 py-2 text-sm font-light">
                {item}
              </div>
            ))}
          </div>
        </div>
      </ElevationCard>

      <ElevationCard
        label="Level 2 · modal"
        value="strong shadow"
        copy="Dialogs and temporary task layers need unmistakable separation."
      >
        <div className="flex min-h-44 items-center justify-center bg-foreground/10 p-5">
          <div className={`w-full max-w-60 bg-card p-4 ${MODAL_SHADOW}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">Review transaction</p>
              <MoreHorizontal className="h-4 w-4" />
            </div>
            <div className="mt-4 h-11 rounded-full bg-primary" />
          </div>
        </div>
      </ElevationCard>
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      <Comparison
        title="Recommended · elevated wrapper"
        copy="The white bar owns the quiet shadow; the action inside remains an ordinary button."
      >
        <div className="relative grid min-h-40 grid-cols-2 gap-px bg-secondary p-0.5">
          <div className="bg-card p-4">Content section</div>
          <div className="bg-card p-4">Content section</div>
          <div
            className={`absolute bottom-4 right-4 rounded-full bg-popover p-2 ${FLOATING_SHADOW}`}
          >
            <button className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground">
              Continue
            </button>
          </div>
        </div>
      </Comparison>
      <Comparison
        title="Avoid · every card is raised"
        copy="Repeated shadows create noise and erase meaningful layer changes."
      >
        <div className="grid min-h-40 grid-cols-2 gap-4 bg-background p-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className={`bg-card p-4 ${FLOATING_SHADOW}`}>
              Card {item + 1}
            </div>
          ))}
        </div>
      </Comparison>
    </div>
  </section>
)

const StudyHeading = ({
  id,
  title,
  copy,
}: {
  id: string
  title: string
  copy: string
}) => (
  <div>
    <div className="flex flex-wrap items-center gap-2">
      <h2 id={id} className="text-xl font-semibold">
        {title}
      </h2>
      <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
        Accepted provisional foundation
      </span>
    </div>
    <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
      {copy}
    </p>
  </div>
)

const ElevationCard = ({
  label,
  value,
  copy,
  children,
}: {
  label: string
  value: string
  copy: string
  children: React.ReactNode
}) => (
  <article className="overflow-hidden border border-border bg-card">
    <div className="border-b border-border p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-medium">{label}</h3>
        <code className="text-xs text-muted-foreground">{value}</code>
      </div>
      <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
        {copy}
      </p>
    </div>
    {children}
  </article>
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

export default ElevationStudy
