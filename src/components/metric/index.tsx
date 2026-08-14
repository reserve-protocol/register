import { v1SemanticRecipes } from '@/components/ui/v1-semantic-recipes'
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
        'text-base font-light leading-6 tabular-nums',
        v1SemanticRecipes.text.primary,
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
          'flex items-center justify-between gap-4 text-base font-light leading-6',
        role === 'headline' &&
          'flex flex-col items-center justify-center text-center',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'min-w-0',
          role === 'inline' && v1SemanticRecipes.text.supporting,
          role === 'headline' &&
            `text-xs font-medium ${v1SemanticRecipes.text.supporting}`
        )}
      >
        {label}
      </span>
      <MetricValue
        className={cn(
          'min-w-0',
          role === 'headline' && 'mt-1 text-xl leading-7'
        )}
        align={role === 'inline' ? 'end' : 'start'}
      >
        {value}
      </MetricValue>
    </div>
  )
)

Metric.displayName = 'Metric'
