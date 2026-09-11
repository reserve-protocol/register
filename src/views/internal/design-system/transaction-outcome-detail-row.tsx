import type { ReactNode } from 'react'

import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'

export const TransactionOutcomeDetailRow = ({
  label,
  testId,
  value,
  wrap = false,
}: {
  label: ReactNode
  testId?: string
  value: ReactNode
  wrap?: boolean
}) => (
  <div
    data-testid={testId ?? 'transaction-outcome-detail-row'}
    className={cn(
      'flex min-h-5 items-center justify-between gap-4',
      wrap && 'flex-wrap gap-y-1'
    )}
  >
    <dt className={cn(v1Typography.supporting, roles.text.supporting)}>
      {label}
    </dt>
    <dd className={cn(v1Typography.label, 'text-right', wrap && 'ml-auto')}>
      {value}
    </dd>
  </div>
)
