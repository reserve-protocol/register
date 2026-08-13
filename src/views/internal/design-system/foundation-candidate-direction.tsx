import { ArrowRight, Check, CircleHelp, Minus } from 'lucide-react'
import ColorFoundationCandidate from './color-foundation-candidate'
import { getFoundationCandidateDirection } from './foundation-candidate-directions'

const FoundationCandidateDirection = ({
  foundationId,
}: {
  foundationId: string
}) => {
  const candidate = getFoundationCandidateDirection(foundationId)
  const hasStructuredCandidate = foundationId === 'color'
  const candidateLabel =
    foundationId === 'color' || foundationId === 'layout'
      ? 'Candidate system'
      : 'Candidate direction'

  if (!candidate) return null

  return (
    <section
      data-testid={`foundation-candidate-${foundationId}`}
      aria-labelledby="candidate-direction-heading"
      className="space-y-6"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2
            id="candidate-direction-heading"
            className="text-xl font-semibold"
          >
            {candidateLabel}
          </h2>
          <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-warning/30">
            Provisional
          </span>
        </div>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
          {candidate.summary}{' '}
          {hasStructuredCandidate
            ? 'The proposed roles are now structured below; exact values stay open until visual review.'
            : 'Values and rules stay open until design review.'}
        </p>
      </div>

      {hasStructuredCandidate && <ColorFoundationCandidate />}

      <div>
        <h3 className="text-lg font-semibold">Reasoning and validation</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Why this candidate exists, what it borrows, and what still needs to
          survive real screens.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Evidence reviewed
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {candidate.sources.map((source) => (
            <li
              key={source}
              className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs"
            >
              {source}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <DirectionList
          title="Carry forward"
          Icon={Check}
          items={candidate.carryForward}
        />
        <DirectionList
          title="Adapt"
          Icon={ArrowRight}
          items={candidate.adapt}
        />
        <DirectionList
          title="Leave behind"
          Icon={Minus}
          items={candidate.leaveBehind}
        />
        <DirectionList
          title="Validate next"
          Icon={CircleHelp}
          items={candidate.validateNext}
        />
      </div>
    </section>
  )
}

const DirectionList = ({
  title,
  Icon,
  items,
}: {
  title: string
  Icon: typeof Check
  items: string[]
}) => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="font-semibold">{title}</h3>
    </div>
    <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span
            aria-hidden
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-border"
          />
          {item}
        </li>
      ))}
    </ul>
  </div>
)

export default FoundationCandidateDirection
