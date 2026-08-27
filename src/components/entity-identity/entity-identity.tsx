import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import * as React from 'react'

export interface EntityIdentityProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  mark: React.ReactNode
  name: React.ReactNode
  supporting?: React.ReactNode
  density?: 'compact' | 'default'
}

export const EntityIdentity = React.forwardRef<
  HTMLSpanElement,
  EntityIdentityProps
>(
  (
    { mark, name, supporting, density = 'default', className, ...props },
    ref
  ) => (
    <span
      ref={ref}
      data-testid="canonical-entity-identity"
      className={cn('inline-flex min-w-0 items-center gap-2', className)}
      {...props}
    >
      {mark}
      <span className="min-w-0">
        <span
          data-slot="entity-identity-name"
          className={cn(
            'block truncate',
            v1SemanticRecipes.text.primary,
            density === 'compact' ? v1Typography.label : v1Typography.itemTitle
          )}
        >
          {name}
        </span>
        {supporting && (
          <span
            data-slot="entity-identity-supporting"
            className={cn(
              'block truncate',
              v1Typography.supporting,
              v1SemanticRecipes.text.supporting
            )}
          >
            {supporting}
          </span>
        )}
      </span>
    </span>
  )
)

EntityIdentity.displayName = 'EntityIdentity'
