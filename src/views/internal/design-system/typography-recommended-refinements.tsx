import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'

export const TypographyRecommendedRefinements = () => (
  <section
    data-testid="typography-recommended-refinements"
    aria-labelledby="typography-recommended-refinements-title"
    className="border border-primary/20 bg-primary/5 p-6"
  >
    <div className="max-w-3xl">
      <p className="text-sm font-medium leading-5 text-primary">
        Accepted refinements
      </p>
      <h3
        id="typography-recommended-refinements-title"
        className="mt-1 text-xl font-medium leading-[26px]"
      >
        Working rules to apply together
      </h3>
      <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
        These reviewed refinements are part of the current typography baseline.
        Acceptance does not authorize production migration.
      </p>
    </div>

    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      <RecommendationPanel
        title="Display on narrow phones"
        description="Only the rare display or hero role steps down. Page titles, sections, body, controls, and data keep their normal size."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TypeComparison label="Default · 48 / 54">
            <p className="text-5xl font-light leading-[54px] tracking-[-0.015em]">
              Build a durable portfolio
            </p>
          </TypeComparison>
          <TypeComparison label="Narrow phone · 40 / 46">
            <p className="text-[40px] font-light leading-[46px] tracking-[-0.015em]">
              Build a durable portfolio
            </p>
          </TypeComparison>
        </div>
      </RecommendationPanel>

      <RecommendationPanel
        title="Choosing between similar roles"
        description="Keep neighboring sizes useful by assigning them different jobs rather than choosing by appearance alone."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TypeComparison label="Lead · 20 / 28 · 300">
            <p className="text-xl font-light leading-7">
              Diversified exposure through transparent onchain portfolios.
            </p>
          </TypeComparison>
          <TypeComparison label="Panel title · 20 / 26 · 500">
            <p className="text-xl font-medium leading-[26px]">
              Governance activity
            </p>
          </TypeComparison>
          <TypeComparison label="Ordinary content · 16 / 24 · 300">
            <p className="text-base font-light leading-6">
              Review the current portfolio composition and recent activity.
            </p>
          </TypeComparison>
          <TypeComparison label="Supporting · 14 / 20 · 300">
            <p
              data-testid="typography-readable-supporting"
              className="text-sm font-light leading-5 text-muted-foreground"
            >
              Supporting text stays readable and never borrows disabled-level
              fading.
            </p>
          </TypeComparison>
        </div>
      </RecommendationPanel>

      <RecommendationPanel
        title="Financial and machine values"
        description="Human-readable financial values stay in Lausanne with tabular figures. Monospace is reserved for identifiers."
      >
        <div className="space-y-3 text-base font-light leading-6">
          <NumericRow label="Portfolio value" value="$12,345,678.90" />
          <NumericRow label="Positive change" value="+8.42%" tone="positive" />
          <NumericRow label="Negative change" value="−4.18%" tone="negative" />
          <NumericRow label="Voting power" value="1,204,358" />
          <NumericRow label="Unavailable" value="—" />
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-sm font-medium leading-5">Machine identifiers</p>
          <p
            data-testid="typography-machine-value"
            className="mt-1 font-mono text-sm leading-5 text-muted-foreground"
          >
            0x1294…6D45 · tx 0xa7f1…29bc
          </p>
        </div>
      </RecommendationPanel>

      <RecommendationPanel
        title="Reading and wrapping"
        description="Readable content gets a deliberate measure; meaningful titles wrap, while known-width machine values may truncate."
      >
        <h4
          data-testid="typography-wrapping-title"
          className="max-w-[20rem] text-2xl font-light leading-[30px]"
        >
          Decentralized Token Fund governance overview
        </h4>
        <p
          data-testid="typography-reading-measure"
          className="mt-3 max-w-[65ch] text-base font-light leading-6 text-muted-foreground"
        >
          Long-form product explanations stay close to a 65-character reading
          measure. The layout adapts around meaningful language instead of
          shrinking or truncating the type.
        </p>
        <div className="mt-4 max-w-56">
          <p className="text-sm font-medium leading-5">Fixed identifier cell</p>
          <p className="truncate font-mono text-sm leading-5 text-muted-foreground">
            0x1294a6cc45f8cb138093dd841b9a1d6f4f6d6d45
          </p>
        </div>
      </RecommendationPanel>

      <RecommendationPanel
        title="Extended reading comparison"
        description="The same sustained content shows where ordinary reading remains comfortable and where supporting typography begins to feel too quiet or dense. The 14px side is a stress test, not a recommendation for long-form copy."
        wide
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <TypeComparison label="Ordinary content · 16 / 24 · 300">
            <div
              data-testid="typography-long-ordinary-content"
              className="max-w-[65ch] space-y-3 text-base font-light leading-6"
            >
              <ReadingParagraphs />
            </div>
          </TypeComparison>
          <TypeComparison label="Supporting · 14 / 20 · 300 · stress test">
            <div
              data-testid="typography-long-supporting-content"
              className="max-w-[65ch] space-y-3 text-sm font-light leading-5 text-muted-foreground"
            >
              <ReadingParagraphs />
            </div>
          </TypeComparison>
        </div>
      </RecommendationPanel>
    </div>
  </section>
)

const RecommendationPanel = ({
  title,
  description,
  children,
  wide = false,
}: {
  title: string
  description: string
  children: React.ReactNode
  wide?: boolean
}) => (
  <article
    className={`border border-border bg-card p-4 ${wide ? 'xl:col-span-2' : ''}`}
  >
    <h4 className="text-base font-medium leading-6">{title}</h4>
    <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
      {description}
    </p>
    <div className="mt-4">{children}</div>
  </article>
)

const TypeComparison = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div>
    <p className="mb-2 text-sm font-medium leading-5 text-muted-foreground">
      {label}
    </p>
    {children}
  </div>
)

const ReadingParagraphs = () => (
  <>
    <p>
      A diversified portfolio can bring several onchain assets into one
      position. Its mandate explains the intended exposure and provides the
      context needed to understand the current composition.
    </p>
    <p>
      Portfolio changes should be reviewed alongside their timing, execution,
      and expected effect. That context helps readers distinguish a routine
      update from a change that deserves closer attention.
    </p>
    <p>
      Historical activity remains useful after execution because it shows how
      the portfolio arrived at its current state. Clear hierarchy should make
      that explanation comfortable to scan and read without hiding detail.
    </p>
  </>
)

const NumericRow = ({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'positive' | 'negative'
}) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span
      data-testid={
        label === 'Portfolio value'
          ? 'typography-financial-value'
          : tone === 'negative'
            ? 'typography-negative-value'
            : undefined
      }
      className={`text-right tabular-nums ${tone ? PERFORMANCE_TEXT_CLASSES[tone] : ''}`}
    >
      {value}
    </span>
  </div>
)
