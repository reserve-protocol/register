import { ActionGroup } from '@/components/design-system-v1/action-group'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRoles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import * as React from 'react'

export type EmptyStateMode = 'quiet' | 'actionable'

export type EmptyStateSize = 'region' | 'page'

export interface EmptyStateProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'title'
> {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  icon?: React.ReactNode
  mode?: EmptyStateMode
  size?: EmptyStateSize
  titleAs?: 'p' | 'h1' | 'h2' | 'h3' | 'h4'
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      title,
      description,
      actions,
      icon,
      mode = 'quiet',
      size = 'region',
      titleAs: Title = size === 'page' ? 'h2' : 'p',
      className,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      data-testid="canonical-empty-state"
      data-mode={mode}
      data-size={size}
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
              ? v1SemanticRoles.text.supporting
              : v1SemanticRoles.text.primary
          )}
        >
          {icon}
        </span>
      )}
      <Title
        className={cn(
          size === 'page'
            ? cn(v1Typography.sectionTitle, v1SemanticRoles.text.primary)
            : mode === 'quiet'
              ? cn(v1Typography.body, v1SemanticRoles.text.supporting)
              : cn(v1Typography.itemTitle, v1SemanticRoles.text.primary)
        )}
      >
        {title}
      </Title>
      {description && (
        <p
          className={cn(
            size === 'page'
              ? cn('mt-2 max-w-md', v1Typography.body)
              : cn('mt-1 max-w-sm', v1Typography.supporting),
            v1SemanticRoles.text.supporting
          )}
        >
          {description}
        </p>
      )}
      {actions && (
        <ActionGroup
          className={cn(
            'w-fit max-w-full flex-wrap justify-center max-sm:w-full max-sm:flex-col max-sm:[&>*]:w-full',
            size === 'page' ? 'mt-6' : 'mt-4'
          )}
        >
          {actions}
        </ActionGroup>
      )}
    </div>
  )
)

EmptyState.displayName = 'EmptyState'
