import { V1_PERFORMANCE_TOKEN_GROUPS } from './color-performance-data'

const ColorPerformanceCandidate = () => (
  <section className="rounded-2xl border border-border bg-card p-5">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div>
        <h3 className="font-semibold">Smaller V1 performance candidate</h3>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
          Reduce today’s independent chart, dot, text, and dark-surface values
          to three stable jobs per direction. The structure is proposed; names
          and exact light/dark values remain open.
        </p>
      </div>
      <span className="w-fit rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-warning/30">
        3 roles per direction
      </span>
    </div>

    <div className="mt-5 grid gap-3 lg:grid-cols-2">
      {V1_PERFORMANCE_TOKEN_GROUPS.map((group) => (
        <article
          key={group.name}
          className="overflow-hidden rounded-xl border border-border"
        >
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <h4 className="font-medium">{group.name}</h4>
          </div>
          <div className="divide-y divide-border">
            {group.tokens.map((token) => (
              <div
                key={token.token}
                className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-7 w-7 shrink-0 rounded-md ring-1 ring-inset ring-foreground/15"
                    style={{ backgroundColor: token.nearestCurrentValue }}
                  />
                  <code className="truncate text-xs">{token.token}</code>
                </div>
                <div>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {token.role}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    Nearest current value · {token.nearestCurrentValue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>

    <div className="mt-4 grid gap-3 md:grid-cols-3">
      <CandidateRule
        title="Derive chart treatments"
        copy="Gradient uses emphasis plus main. Dot and icon reuse the main value; translucent fills derive from it."
      />
      <CandidateRule
        title="Theme the aliases"
        copy="Light and dark override the same three aliases instead of introducing a second public palette."
      />
      <CandidateRule
        title="Preserve meaning"
        copy="Feedback aliases remain technically separate, even if success and danger resolve to the same underlying visual values."
      />
    </div>
  </section>
)

const CandidateRule = ({ title, copy }: { title: string; copy: string }) => (
  <div className="rounded-xl bg-muted/40 p-4">
    <h4 className="text-sm font-medium">{title}</h4>
    <p className="mt-2 text-xs leading-5 text-muted-foreground">{copy}</p>
  </div>
)

export default ColorPerformanceCandidate
