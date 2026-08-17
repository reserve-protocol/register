import { Check, CircleDashed } from 'lucide-react'

const REVIEWED_RULES = [
  {
    title: 'Surface structure',
    detail:
      'White owns both page-canvas and ordinary content roles. Beige is a structural substrate revealed through 2px major seams and 1px subsection seams, without an automatic outer perimeter.',
  },
  {
    title: 'Neutral chrome',
    detail:
      'Gray fills, dividers, and hover layers stay contained within white and never terminate directly against beige. Tables default to no dividers.',
  },
  {
    title: 'Interaction states',
    detail:
      'Selection uses a quiet blue surface with a stronger blue indicator. Focus uses a context-matching inner gap and an outer ring. Disabled content stays structurally intact and explains why it is unavailable when needed.',
  },
  {
    title: 'Feedback family',
    detail:
      'Success, warning, danger, and information use vivid main colors with dark icon foregrounds and quiet opaque derived surfaces. These preserve their white-card appearance without mixing with a selected parent surface. Information is a brighter relative of the deeper brand/action blue.',
  },
  {
    title: 'Financial movement',
    detail:
      'The appreciated positive and negative performance colors and gradients remain intact. Their semantic aliases stay separate from success and danger even if future tokens share visual ingredients.',
  },
  {
    title: 'Foreground hierarchy',
    detail:
      'V1 starts with primary and supporting neutral foregrounds. Disabled content may reuse the supporting role until component studies prove that a consistently quieter alias is necessary.',
  },
] as const

const OPEN_ITEMS = [
  'Final cross-theme tuning of the information blue and semantic foreground contrast',
  'Exact primary, selected, focus-ring, divider, and overlay values',
  'When feedback indicators should be filled, outlined, or text-only',
  'Categorical chart colors when a real multi-series product need appears',
] as const

const ColorFoundationDefinition = () => (
  <section aria-labelledby="color-definition-heading" className="space-y-4">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div>
        <h2 id="color-definition-heading" className="text-xl font-semibold">
          V1 definition
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
          The visual and semantic direction reviewed in the lab. These rules are
          accepted working constraints; exact token values remain open.
        </p>
      </div>
      <span className="w-fit rounded-full bg-[var(--feedback-success-surface)] px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-[var(--feedback-success-border)]">
        Direction reviewed
      </span>
    </div>

    <div className="grid gap-3 lg:grid-cols-2">
      {REVIEWED_RULES.map((rule) => (
        <article
          key={rule.title}
          className="bg-card p-4 ring-1 ring-inset ring-border"
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">{rule.title}</h3>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {rule.detail}
          </p>
        </article>
      ))}
    </div>

    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5">
      <div className="flex items-center gap-2">
        <CircleDashed className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Still open before final tokenization</h3>
      </div>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground md:grid-cols-2">
        {OPEN_ITEMS.map((item) => (
          <li key={item} className="flex gap-2">
            <span
              aria-hidden
              className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-border"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  </section>
)

export default ColorFoundationDefinition
