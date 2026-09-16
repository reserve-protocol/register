import { cn } from '@/lib/utils'
import { TypographyReviewContexts } from './typography-review-contexts'
import { TypographyRecommendedRefinements } from './typography-recommended-refinements'
import { DesignAuthorityBadge } from './catalog-ui'
import { getFoundationItem } from './foundation-catalog'
import {
  TYPOGRAPHY_REVIEW_PRINCIPLES,
  TYPOGRAPHY_REVIEW_ROLES,
  TYPOGRAPHY_REVIEW_WEIGHTS,
} from './typography-review-contract'

const typographyFoundation = getFoundationItem('typography')!

const TypographyStudy = () => (
  <section
    data-testid="typography-baseline"
    className="space-y-8"
    aria-labelledby="typography-study"
  >
    <header>
      <div className="flex flex-wrap items-center gap-2">
        <h2
          id="typography-study"
          className="text-2xl font-light leading-[30px]"
        >
          Typography foundation
        </h2>
        <DesignAuthorityBadge item={typographyFoundation} />
      </div>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Use this compact role system for expressive entry points, dense
        financial UI, forms, and longer reading. Real product evidence may still
        justify a later refinement.
      </p>
    </header>

    <section
      data-testid="typography-review-boundary"
      aria-labelledby="typography-review-boundary-title"
      className="border border-border bg-card p-6"
    >
      <h3
        id="typography-review-boundary-title"
        className="text-xl font-medium leading-[26px]"
      >
        What the baseline covers
      </h3>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <BoundaryColumn
          title="Included in the baseline"
          items={[
            'The role names, exact size and line-height pairs, and 300/500 weight split.',
            'Hierarchy across pages, panels, repeated records, forms, and reading content.',
            'Default multiline behavior, numeric treatment, and the restricted 12px exception.',
            'Stable application role defaults, the 48px to 40px responsive display, and the opt-in 32px to 24px responsive page title.',
          ]}
        />
        <BoundaryColumn
          title="Still outside this baseline"
          items={[
            'Production migration or cleanup of every legacy utility class.',
            'A component wrapper for every role or automatic heading-level selection.',
            'Chart-library internals, localization copy changes, and product-specific truncation.',
            'Any routine role for Lausanne 700; it remains installed but parked.',
          ]}
        />
      </div>
    </section>

    <section
      data-testid="typography-review-role-map"
      aria-label="Current role map"
      className="space-y-4"
    >
      <SectionHeading
        title="Current role map"
        description="Nine core semantic jobs use six core sizes, plus one restricted 12px exception. Weight and line height distinguish structure from reading without inventing a separate size for every component."
      />
      <div className="border border-border bg-card">
        <div className="hidden grid-cols-[10rem_9rem_minmax(0,1fr)] gap-4 border-b border-border px-4 py-3 text-sm font-medium leading-5 text-muted-foreground lg:grid">
          <span>Role</span>
          <span>Specification</span>
          <span>Rendered example and usage</span>
        </div>
        {TYPOGRAPHY_REVIEW_ROLES.map((role) => (
          <div
            key={role.id}
            className="grid gap-3 border-b border-border p-4 last:border-b-0 lg:grid-cols-[10rem_9rem_minmax(0,1fr)] lg:gap-4"
          >
            <p className="text-sm font-medium leading-5">{role.role}</p>
            <code className="text-xs font-light leading-4 text-muted-foreground">
              {role.spec}
            </code>
            <div className="min-w-0">
              <p
                data-testid={
                  role.id === 'display'
                    ? 'typography-responsive-display'
                    : role.id === 'label'
                      ? 'typography-role-label'
                      : role.id === 'supporting'
                        ? 'typography-role-supporting'
                        : undefined
                }
                className={cn(
                  role.className,
                  (role.id === 'supporting' || role.id === 'auxiliary') &&
                    'text-muted-foreground'
                )}
              >
                {role.sample}
              </p>
              <p className="mt-2 text-sm font-light leading-5 text-muted-foreground">
                {role.use}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <TypographyRecommendedRefinements />

    <section
      data-testid="typography-review-weight-strategy"
      aria-label="Weight strategy"
      className="space-y-4"
    >
      <SectionHeading
        title="Weight strategy"
        description="The same 20px scale makes the difference visible: 300 supports reading, 500 creates structure, and 700 remains deliberately unavailable as a routine shortcut."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {TYPOGRAPHY_REVIEW_WEIGHTS.map((weight) => (
          <article
            key={weight.weight}
            className="border border-border bg-card p-4"
          >
            <div className="flex items-baseline justify-between gap-4">
              <p className={cn('text-xl leading-7', weight.className)}>
                {weight.title}
              </p>
              <code className="text-xs font-light leading-4 text-muted-foreground">
                {weight.weight}
              </code>
            </div>
            <p className="mt-2 text-sm font-light leading-5 text-muted-foreground">
              {weight.use}
            </p>
          </article>
        ))}
      </div>
    </section>

    <section
      data-testid="typography-review-contexts"
      className="space-y-4"
      aria-labelledby="contexts-heading"
    >
      <SectionHeading
        id="contexts-heading"
        title="Hierarchy in realistic contexts"
        description="These are bounded, source-grounded product jobs—not proposed screen redesigns. Judge the relationships between roles as much as the individual text samples."
      />
      <TypographyReviewContexts />
    </section>

    <section
      data-testid="typography-review-stress-tests"
      aria-label="Typography stress tests"
      className="space-y-4"
    >
      <SectionHeading
        title="Stress tests and exceptional behavior"
        description="The system must survive wrapping, narrow widths, long values, and machine-readable content without quietly changing its scale."
      />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <StressCase title="Long title at a narrow measure">
          <div className="max-w-[20rem]">
            <p className="text-[32px] font-light leading-[38px] tracking-[-0.01em]">
              Decentralized Token Fund governance overview
            </p>
            <p className="mt-2 text-sm font-light leading-5 text-muted-foreground">
              The title wraps naturally; the type does not shrink at a smaller
              breakpoint.
            </p>
          </div>
        </StressCase>
        <StressCase title="Ordinary multiline supporting copy">
          <div className="max-w-[18rem]">
            <p className="text-sm font-medium leading-5">Proposal threshold</p>
            <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
              The minimum voting power required to create a governance proposal
              for this DTF.
            </p>
          </div>
        </StressCase>
        <StressCase title="Numbers and machine-readable values">
          <p className="text-[32px] font-light leading-[38px] tabular-nums">
            $12,345,678.90
          </p>
          <p className="mt-1 font-mono text-sm leading-5 text-muted-foreground">
            0x1294…6D45
          </p>
          <p className="mt-1 text-sm font-light leading-5 text-muted-foreground tabular-nums">
            2026-08-21 · 14:23 UTC
          </p>
        </StressCase>
        <StressCase title="Expressive ceiling">
          <div className="max-w-xl">
            <p className="text-5xl font-light leading-[54px] tracking-[-0.015em]">
              Build a durable portfolio
            </p>
            <p className="mt-2 text-xl font-light leading-7 text-muted-foreground">
              Display is rare; lead copy carries the supporting narrative.
            </p>
          </div>
        </StressCase>
        <StressCase title="Restricted 12px role">
          <div className="flex items-end justify-between gap-4 border-b border-border pb-2 text-xs font-light leading-4 text-muted-foreground">
            <span>Aug 01</span>
            <span>$1.20</span>
            <span>Aug 21</span>
          </div>
          <p className="mt-3 text-sm font-light leading-5 text-muted-foreground">
            Auxiliary text is for constrained chart or metadata jobs, not
            paragraphs, form help, or ordinary table content.
          </p>
        </StressCase>
        <StressCase title="Explicit single-line exception">
          <div className="flex h-10 items-center rounded px-3 text-sm font-light leading-4 hover:bg-muted">
            Ethereum mainnet
          </div>
          <p className="mt-3 text-sm font-light leading-5 text-muted-foreground">
            A reviewed component may tighten one known single-line geometry.
            That exception never becomes the default for 14px copy.
          </p>
        </StressCase>
      </div>
    </section>

    <section className="border border-border bg-card p-6">
      <SectionHeading
        title="Baseline summary"
        description="Later components start from these roles and may challenge them only with concrete product evidence."
      />
      <ul className="mt-4 grid gap-3 lg:grid-cols-2">
        {TYPOGRAPHY_REVIEW_PRINCIPLES.map((principle) => (
          <li
            key={principle}
            className="border-l-2 border-primary pl-4 text-sm font-light leading-5"
          >
            {principle}
          </li>
        ))}
      </ul>
    </section>
  </section>
)

const BoundaryColumn = ({
  title,
  items,
}: {
  title: string
  items: readonly string[]
}) => (
  <div>
    <h4 className="text-sm font-medium leading-5">{title}</h4>
    <ul className="mt-2 space-y-2 text-sm font-light leading-5 text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden="true">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
)

const SectionHeading = ({
  id,
  title,
  description,
}: {
  id?: string
  title: string
  description: string
}) => (
  <div>
    <h3 id={id} className="text-xl font-medium leading-[26px]">
      {title}
    </h3>
    <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
      {description}
    </p>
  </div>
)

const StressCase = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <article className="border border-border bg-card p-4">
    <h4 className="mb-4 text-sm font-medium leading-5">{title}</h4>
    {children}
  </article>
)

export default TypographyStudy
