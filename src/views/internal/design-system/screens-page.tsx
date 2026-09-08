import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from './catalog-ui'
import { GOLDEN_SCREEN_CANDIDATES } from './golden-screen-candidates'

const ScreensPage = () => (
  <div data-testid="screens-overview" className="space-y-8">
    <PageHeader
      eyebrow="Real product proving ground"
      title="Golden screens"
      description="These are production reference routes, not approved V1 screens. Flow-specific lab compositions are separate evidence; complete-page validation and deterministic fixture coverage remain explicit work."
    />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {GOLDEN_SCREEN_CANDIDATES.map((item) => (
        <section
          key={item.id}
          id={item.id}
          className="flex min-h-64 flex-col justify-between rounded-2xl border border-border bg-card p-5"
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold">{item.name}</h2>
            </div>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              {item.note}
            </p>
            <p className="mt-4 text-sm leading-5">{item.testingRole}</p>
            {item.constraint && (
              <p className="mt-3 rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground">
                {item.constraint}
              </p>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {item.routes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-3 text-xs font-medium hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {route.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  </div>
)

export default ScreensPage
