import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CURRENT_REVIEW } from './current-review'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'

export const CurrentReviewSpotlight = () => {
  const item = CURRENT_REVIEW[0]
  if (!item) return null

  return (
    <Link
      data-testid="current-review-spotlight"
      to={item.destination}
      className="group grid gap-4 border border-primary/20 bg-primary/5 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
    >
      <span className="w-fit rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
        Current review
      </span>
      <span>
        <span className="block text-sm font-medium">{item.title}</span>
        <span className="mt-1 block text-xs font-light leading-5 text-muted-foreground">
          {item.reason}
        </span>
      </span>
      <span className="flex items-center gap-2 text-xs font-medium text-primary">
        {item.type}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export const CurrentReviewList = () => (
  <section className="space-y-4" aria-labelledby="current-review-heading">
    <div>
      <p className="text-sm font-medium text-primary">Human judgment</p>
      <h2 id="current-review-heading" className="mt-1 text-xl font-medium">
        Current review
      </h2>
      <p className="mt-1 text-sm font-light text-muted-foreground">
        Only nearly complete candidates at the boundary of confident autonomous
        resolution belong here. Earlier implementation work stays in the project
        tracker.
      </p>
    </div>
    {CURRENT_REVIEW.length === 0 ? (
      <p
        data-testid="current-review-empty"
        className="border border-border bg-card p-4 text-sm font-light text-muted-foreground"
      >
        No human design judgment is waiting. The next review will appear after
        its source-grounded candidate is ready.
      </p>
    ) : (
      <div className="divide-y divide-border border border-border bg-card">
        {CURRENT_REVIEW.map((item) => (
          <Link
            key={item.title}
            to={item.destination}
            className={`group grid gap-3 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[minmax(0,1fr)_auto] ${roles.interaction.contentHover}`}
          >
            <span>
              <span className="block text-sm font-medium">{item.title}</span>
              <span className="mt-1 block text-xs font-light leading-5 text-muted-foreground">
                {item.reason}
              </span>
            </span>
            <span className="flex items-center gap-2 self-center text-xs font-medium text-primary">
              {item.type}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    )}
  </section>
)
