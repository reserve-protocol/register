import type { ReactNode } from 'react'

import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

export type TransactionSystemPartStatus =
  | 'Current baseline'
  | 'Retained current'
  | 'Proposed candidate'
  | 'Flow-owned'
  | 'Upstream-owned'
  | 'Deferred'

const STATUS_CLASSES: Record<TransactionSystemPartStatus, string> = {
  'Current baseline': 'border-primary/30 bg-accent/60 text-primary',
  'Retained current': 'border-border bg-muted text-foreground',
  'Proposed candidate':
    'border-[var(--feedback-information-border)] bg-[var(--feedback-information-surface)] text-[var(--feedback-information-foreground)]',
  'Flow-owned':
    'border-[var(--feedback-warning-border)] bg-[var(--feedback-warning-surface)] text-[var(--feedback-warning-foreground)]',
  'Upstream-owned': 'border-border bg-card text-muted-foreground',
  Deferred: 'border-border bg-card text-muted-foreground',
}

export const TransactionSystemStatus = ({
  status,
}: {
  status: TransactionSystemPartStatus
}) => (
  <span
    className={cn(
      'inline-flex h-6 w-fit shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 text-xs font-medium',
      STATUS_CLASSES[status]
    )}
  >
    {status}
  </span>
)

export const TransactionSystemStatusLegend = () => (
  <section className="border border-border bg-card p-4 sm:p-6">
    <h3 className={v1Typography.itemTitle}>How to read visible parts</h3>
    <p
      className={cn(
        'mt-1 max-w-3xl',
        v1Typography.supporting,
        roles.text.supporting
      )}
    >
      These labels sit outside the product compositions. They identify design
      authority without turning a proposal into a baseline.
    </p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {STATUS_DESCRIPTIONS.map((item) => (
        <div key={item.status} className="flex min-w-0 items-start gap-3">
          <TransactionSystemStatus status={item.status} />
          <p className={cn(v1Typography.supporting, roles.text.supporting)}>
            {item.description}
          </p>
        </div>
      ))}
    </div>
  </section>
)

export const TransactionSystemPart = ({
  children,
  label,
  status,
}: {
  children?: ReactNode
  label: string
  status: TransactionSystemPartStatus
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <TransactionSystemStatus status={status} />
    <span className={cn(v1Typography.supporting, roles.text.supporting)}>
      {label}
    </span>
    {children}
  </div>
)

const STATUS_DESCRIPTIONS: {
  status: TransactionSystemPartStatus
  description: string
}[] = [
  {
    status: 'Current baseline',
    description: 'Accepted V1 component or foundation used directly.',
  },
  {
    status: 'Retained current',
    description: 'Strong product behavior preserved during design work.',
  },
  {
    status: 'Proposed candidate',
    description: 'Complete reusable proposal requiring human review.',
  },
  {
    status: 'Flow-owned',
    description: 'Product-specific presentation that should not be generic.',
  },
  {
    status: 'Upstream-owned',
    description:
      'Package behavior represented without local restyling authority.',
  },
  {
    status: 'Deferred',
    description: 'Blocked by engineering truth or intentionally out of scope.',
  },
]
