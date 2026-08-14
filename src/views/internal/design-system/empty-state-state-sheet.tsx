import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { MessageCirclePlus, MessageSquare } from 'lucide-react'

const EmptyStateStateSheet = () => (
  <section
    data-testid="empty-state-state-sheet"
    className="space-y-4"
    aria-labelledby="empty-state-state-sheet-title"
  >
    <div>
      <h2 id="empty-state-state-sheet-title" className="text-xl font-medium">
        Canonical candidate
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        Empty state owns absence hierarchy only. The table, picker, or page
        region owns its available height, surface, and framing.
      </p>
    </div>

    <div className="grid gap-0.5 bg-secondary p-0.5 xl:grid-cols-2">
      <CandidateCell label="Quiet absence">
        <EmptyState title="No proposals found" />
      </CandidateCell>
      <CandidateCell label="User-resolvable absence">
        <EmptyState
          mode="actionable"
          title="No tokens found"
          description="Would you like us to add support for this token?"
          actions={
            <>
              <Button tone="secondary" leadingIcon={<MessageCirclePlus />}>
                Request on Canny
              </Button>
              <Button tone="secondary" leadingIcon={<MessageSquare />}>
                Message us on Telegram
              </Button>
            </>
          }
        />
      </CandidateCell>
    </div>

    <p className="border border-border bg-card p-4 text-sm font-light leading-6 text-muted-foreground">
      Illustration is intentionally absent from this contract. A small set of
      meaningful first-use or milestone states may earn bespoke artwork after
      visual review; routine no-results states do not.
    </p>
  </section>
)

const CandidateCell = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="min-w-0 bg-card">
    <p className="border-b border-border px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="flex min-h-64 items-center justify-center p-6">
      {children}
    </div>
  </div>
)

export default EmptyStateStateSheet
