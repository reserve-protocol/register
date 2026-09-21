import type { ReactNode } from 'react'

import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'

export type TransactionMetricTone =
  | 'neutral'
  | 'realized-favorable'
  | 'realized-adverse'
  | 'caution'
  | 'critical'
  | 'superseded'

const TRANSACTION_METRIC_TONE_CLASSES: Record<TransactionMetricTone, string> = {
  neutral: roles.text.primary,
  'realized-favorable': PERFORMANCE_TEXT_CLASSES.positive,
  'realized-adverse': PERFORMANCE_TEXT_CLASSES.negative,
  caution: 'text-feedback-warning-foreground',
  critical: 'text-feedback-danger-foreground',
  superseded: cn(roles.text.supporting, 'line-through'),
}

export const TransactionMetricValue = ({
  children,
  className,
  tone = 'neutral',
}: {
  children: ReactNode
  className?: string
  tone?: TransactionMetricTone
}) => (
  <span
    className={cn(TRANSACTION_METRIC_TONE_CLASSES[tone], className)}
    data-transaction-metric-tone={tone}
  >
    {children}
  </span>
)
