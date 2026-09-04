import type { ReactNode } from 'react'

import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

export const TransactionOutcomeDetailRow = ({
  label,
  testId,
  value,
}: {
  label: ReactNode
  testId?: string
  value: ReactNode
}) => (
  <div
    data-testid={testId ?? 'transaction-outcome-detail-row'}
    className="flex min-h-5 items-center justify-between gap-4"
  >
    <dt className={cn(v1Typography.supporting, roles.text.supporting)}>
      {label}
    </dt>
    <dd className={cn(v1Typography.label, 'text-right')}>{value}</dd>
  </div>
)
