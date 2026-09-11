import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRoles } from '@/components/design-system-v1/semantic-roles'
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
  wrapName?: boolean
}

export const EntityIdentity = React.forwardRef<
  HTMLSpanElement,
  EntityIdentityProps
>(
  (
    {
      mark,
      name,
      supporting,
      density = 'default',
      wrapName = false,
      className,
      ...props
    },
    ref
  ) => (
    <span
      ref={ref}
      data-testid="canonical-entity-identity"
      className={cn(
        'inline-flex min-w-0 items-center gap-2 [&:has(>[data-entity-logo-size=xl])]:gap-3',
        className
      )}
      {...props}
    >
      {mark}
      <span className="min-w-0">
        <span
          data-slot="entity-identity-name"
          className={cn(
            'block',
            wrapName ? 'whitespace-normal break-words' : 'truncate',
            v1SemanticRoles.text.primary,
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
              v1SemanticRoles.text.supporting
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
