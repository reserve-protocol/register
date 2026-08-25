import { ActionGroup } from '@/components/design-system-v1/action-group'
import { v1Typography } from '@/components/design-system-v1/typography'
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
  icon?: React.ReactNode
  mode?: EmptyStateMode
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { title, description, actions, icon, mode = 'quiet', className, ...props },
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
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            'mb-2 flex size-6 items-center justify-center [&>svg]:size-5',
            mode === 'quiet'
              ? v1SemanticRecipes.text.supporting
              : v1SemanticRecipes.text.primary
          )}
        >
          {icon}
        </span>
      )}
      <p
        className={cn(
          mode === 'quiet'
            ? cn(v1Typography.body, v1SemanticRecipes.text.supporting)
            : cn(v1Typography.itemTitle, v1SemanticRecipes.text.primary)
        )}
      >
        {title}
      </p>
      {description && (
        <p
          className={cn(
            'mt-1 max-w-sm',
            v1Typography.supporting,
            v1SemanticRecipes.text.supporting
          )}
        >
          {description}
        </p>
      )}
      {actions && (
        <ActionGroup className="mt-4 w-fit max-w-full justify-center">
          {actions}
        </ActionGroup>
      )}
    </div>
  )
)

EmptyState.displayName = 'EmptyState'
