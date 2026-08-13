import { cn } from '@/lib/utils'
import { CURRENT_SURFACE_EVIDENCE } from './color-foundation-data'
import ColorPerformanceEvidence from './color-performance-evidence'

const ColorFoundationEvidence = () => (
  <div className="space-y-6">
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Focused source audit · 11 August 2026
      </p>
      <p className="mt-2 text-sm leading-6">
        Counts are token-boundary background-utility matches in product TSX,
        including opacity variants and excluding this internal lab. They
        measure implementation frequency, not design quality or a
        recommendation to keep the value.
      </p>
    </div>

    <div>
      <h3 className="font-semibold">Surface evidence</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Rendered from the active theme variables. Observed roles describe how
        the product uses each token today, even when the token name suggests
        something else.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CURRENT_SURFACE_EVIDENCE.map((color) => (
          <article
            key={color.variable}
            className="overflow-hidden rounded-xl border border-border"
          >
            <div
              aria-label={`${color.name} color sample`}
              className={cn('h-14 border-b border-border', color.className)}
            />
            <div className="bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-medium">{color.name}</h4>
                  <code className="text-xs text-muted-foreground">
                    {color.variable}
                  </code>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {color.usageCount} {color.usageCount === 1 ? 'use' : 'uses'}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {color.observedRole}
              </p>
              {color.finding && (
                <p className="mt-2 border-t border-border pt-2 text-xs leading-5">
                  {color.finding}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>

    <div className="grid gap-3 lg:grid-cols-2">
      <EvidenceFinding
        title="Feedback colors are broad legacy roles"
        copy="The product source contains 130 destructive, 41 warning, and 38 success token-boundary text-utility matches, plus dozens of raw red, green, amber, and yellow utilities. The semantic vocabulary exists, but coverage and usage are inconsistent."
      />
      <EvidenceFinding
        title="Recent performance colors form a separate system"
        copy="Home, Discover, and Index overview share one purpose-built positive, negative, and neutral performance palette across 10 consumer files. It does not use the success or destructive variables; Portfolio still does."
      />
    </div>

    <ColorPerformanceEvidence />
  </div>
)

const EvidenceFinding = ({ title, copy }: { title: string; copy: string }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <h3 className="font-medium">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
  </div>
)

export default ColorFoundationEvidence
