import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRoles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import * as React from 'react'

export type MetricRole = 'inline' | 'headline'

export interface MetricProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  label: React.ReactNode
  value: React.ReactNode
  role?: MetricRole
}

export interface MetricValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  align?: 'start' | 'end'
}

export const MetricValue = React.forwardRef<HTMLSpanElement, MetricValueProps>(
  ({ align = 'start', className, ...props }, ref) => (
    <span
      ref={ref}
      data-testid="canonical-metric-value"
      className={cn(
        `${v1Typography.body} tabular-nums`,
        v1SemanticRoles.text.primary,
        align === 'end' && 'text-right',
        className
      )}
      {...props}
    />
  )
)

MetricValue.displayName = 'MetricValue'

export const Metric = React.forwardRef<HTMLDivElement, MetricProps>(
  ({ label, value, role = 'inline', className, ...props }, ref) => (
    <div
      ref={ref}
      data-testid="canonical-metric"
      data-role={role}
      className={cn(
        'min-w-0',
        role === 'inline' &&
          `flex items-center justify-between gap-4 ${v1Typography.body}`,
        role === 'headline' &&
          'flex flex-col items-center justify-center text-center',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'min-w-0',
          role === 'inline' && v1SemanticRoles.text.supporting,
          role === 'headline' &&
            `${v1Typography.body} ${v1SemanticRoles.text.supporting}`
        )}
      >
        {label}
      </span>
      <MetricValue
        className={cn(
          'min-w-0',
          role === 'headline' && `mt-1 ${v1Typography.itemTitle}`
        )}
        align={role === 'inline' ? 'end' : 'start'}
      >
        {value}
      </MetricValue>
    </div>
  )
)

Metric.displayName = 'Metric'
