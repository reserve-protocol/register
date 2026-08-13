import { ArrowDown, Check } from 'lucide-react'

const decisions = [
  {
    label: 'Spacing & density',
    detail: 'Accepted provisionally; pressure-test during component work.',
    href: '#spacing-rhythm-study',
    complete: true,
  },
  {
    label: 'Elevation',
    detail: 'Accepted provisionally; tune shared recipes through real use.',
    href: '#elevation-study',
    complete: true,
  },
  {
    label: 'Iconography',
    detail: 'Accepted provisionally; compare libraries on real surfaces later.',
    href: '#iconography-study',
    complete: true,
  },
  {
    label: 'Motion',
    detail:
      'Accepted provisionally; keep ordinary motion quiet and responsive.',
    href: '#motion-study',
    complete: true,
  },
  {
    label: 'Accessibility guardrails',
    detail: 'Accepted as a pragmatic shared-primitive baseline.',
    href: '#accessibility-study',
    complete: true,
  },
  {
    label: 'Layout structure',
    detail: 'Accepted provisionally; validate table minimums in real routes.',
    href: '#layout-foundation-study',
    complete: true,
  },
  {
    label: 'Modal width',
    detail: '432px task role and 384px compact role accepted provisionally.',
    href: '#modal-geometry-study',
    complete: true,
  },
  {
    label: 'Route architecture',
    detail:
      'Auctions accepted for V1; Governance redesign explicitly deferred.',
    href: '#layout-architecture-study',
    complete: true,
  },
  {
    label: 'Real modal pressure tests',
    detail: 'Review Eligibility current versus foundations applied.',
    href: '#modal-family-study',
    complete: false,
  },
] as const

const FoundationDecisionQueue = () => (
  <section className="border border-primary/20 bg-primary/5">
    <div className="border-b border-primary/15 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Tomorrow's review path
          </p>
          <h2 className="text-xl font-light">Finish the provisional kernel</h2>
        </div>
      </div>
      <p className="mt-3 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Review these in order. Each section starts with a recommendation, then
        shows the visual evidence needed to disagree. Afterward, begin the
        Actions component family and pressure-test the combined foundations.
      </p>
    </div>
    <div className="grid gap-px bg-primary/15 md:grid-cols-2 xl:grid-cols-4">
      {decisions.map((decision, index) => (
        <a
          key={decision.label}
          href={decision.href}
          className="group flex min-h-32 flex-col bg-card p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <span className="text-xs font-medium text-primary">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="mt-3 text-sm font-medium">{decision.label}</span>
          <span className="mt-1 text-xs font-light leading-5 text-muted-foreground">
            {decision.detail}
          </span>
          {decision.complete ? (
            <Check className="mt-auto h-4 w-4 text-primary" />
          ) : (
            <ArrowDown className="mt-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
          )}
        </a>
      ))}
    </div>
  </section>
)

export default FoundationDecisionQueue
