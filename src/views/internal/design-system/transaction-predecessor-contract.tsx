import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'

export const TransactionPredecessorContract = () => (
  <section
    data-testid="transaction-predecessor-contract"
    className="border border-border bg-card"
    aria-labelledby="transaction-predecessor-contract-title"
  >
    <header className="border-b border-border p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-primary/30 bg-accent/60 px-2.5 py-1 text-xs font-medium text-primary">
          Strong visual evidence
        </span>
        <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Not canonical authority
        </span>
      </div>
      <h3
        id="transaction-predecessor-contract-title"
        className="mt-3 text-xl font-medium"
      >
        Predecessor transfer contract
      </h3>
      <p
        className={cn(
          'mt-1 max-w-4xl',
          v1Typography.supporting,
          roles.text.supporting
        )}
      >
        The earlier faithful Zapper reconstruction is the strongest visual
        composition reference. The installed product seam confirms its real
        context. Neither source overrides accepted foundations or package
        ownership.
      </p>
      <div className="mt-4 grid gap-2 text-xs font-light text-muted-foreground">
        <code className="break-all">
          src/views/internal/design-system/zapper-modal-study.tsx
        </code>
        <code className="break-all">
          src/views/index-dtf/components/zapper/zapper-wrapper.tsx
        </code>
      </div>
    </header>
    <div className="grid gap-px bg-border md:grid-cols-2 xl:grid-cols-3">
      {TRANSFER_RULES.map((rule) => (
        <article key={rule.quality} className="bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={v1Typography.label}>{rule.quality}</p>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-xs font-medium',
                rule.status === 'Intentionally not transferred'
                  ? 'border-border bg-card text-muted-foreground'
                  : 'border-primary/30 bg-accent/60 text-primary'
              )}
            >
              {rule.status}
            </span>
          </div>
          <p
            className={cn(
              'mt-1',
              v1Typography.supporting,
              roles.text.supporting
            )}
          >
            {rule.treatment}
          </p>
        </article>
      ))}
    </div>
    <p
      className={cn(
        'border-t border-border p-4 sm:px-6',
        v1Typography.supporting,
        roles.text.supporting
      )}
    >
      Removal rule: an important successful predecessor quality leaves the
      composition only when stronger evidence or a named product constraint
      explains the change.
    </p>
  </section>
)

const TRANSFER_RULES = [
  {
    quality: 'Input and output relationship',
    status: 'Improved',
    treatment:
      'Paired surfaces keep the 2px seam and explicit direction, while estimated, final, and later-claimable outputs now remain semantically distinct.',
  },
  {
    quality: 'Financial hierarchy',
    status: 'Improved',
    treatment:
      'Prominent tabular amounts and asset identity remain primary; balance and Max return to the amount footer, and outcome values lead once the task completes.',
  },
  {
    quality: 'Compact focus and dominant action',
    status: 'Preserved',
    treatment:
      'The RFQ and task-dialog slices retain compact framing and one clear primary action; wider workspaces expand only for real order or requirement detail.',
  },
  {
    quality: 'Dense supporting information',
    status: 'Improved',
    treatment:
      'Secondary facts are quieter and more open, while lifecycle steps, requirements, and durable queues stay dense without turning every group into a card.',
  },
  {
    quality: 'Package-owned control internals',
    status: 'Intentionally not transferred',
    treatment:
      'The local slices transfer composition quality, not package settings, selectors, quote mechanics, or implementation details.',
  },
  {
    quality: 'One shell for every flow',
    status: 'Intentionally not transferred',
    treatment:
      'The audit requires focused pages, staged workspaces, task dialogs, and durable account state; forcing one shell would erase meaningful differences.',
  },
] as const
