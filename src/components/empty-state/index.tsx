import { v1SemanticRecipes } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import * as React from 'react'

export type EmptyStateMode = 'quiet' | 'actionable'

export interface EmptyStateProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'title'
> {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  mode?: EmptyStateMode
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { title, description, actions, mode = 'quiet', className, ...props },
    ref
  ) => (
    <div
      ref={ref}
      data-testid="canonical-empty-state"
      data-mode={mode}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        className
      )}
      {...props}
    >
      <p
        className={cn(
          'text-base font-light leading-6',
          mode === 'quiet'
            ? v1SemanticRecipes.text.supporting
            : v1SemanticRecipes.text.primary
        )}
      >
        {title}
      </p>
      {description && (
        <p
          className={cn(
            'mt-2 max-w-md text-sm font-light leading-5',
            v1SemanticRecipes.text.supporting
          )}
        >
          {description}
        </p>
      )}
      {actions && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
)

EmptyState.displayName = 'EmptyState'
