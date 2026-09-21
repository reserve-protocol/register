import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'

import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import { disclosurePresentation } from './disclosure-presentation'
import { v1Typography } from './typography'

export const Collapsible = CollapsiblePrimitive.Root

type CollapsibleTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>,
  'asChild'
> & {
  cue?: {
    closed: React.ReactNode
    open: React.ReactNode
  }
}

export const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  CollapsibleTriggerProps
>(({ children, className, cue, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn(
      disclosurePresentation.trigger,
      v1Typography.itemTitle,
      roles.focus.visibleInset,
      className
    )}
    {...props}
  >
    <span className="min-w-0">{children}</span>
    <span className="flex shrink-0 items-center gap-2">
      {cue ? (
        <>
          <span
            aria-hidden="true"
            className={cn(
              'hidden whitespace-nowrap text-muted-foreground group-hover:text-primary group-focus-visible:text-primary group-disabled:text-muted-foreground sm:inline sm:group-data-[state=open]:hidden',
              v1Typography.label
            )}
          >
            {cue.closed}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              'hidden whitespace-nowrap text-muted-foreground group-hover:text-primary group-focus-visible:text-primary group-disabled:text-muted-foreground sm:group-data-[state=open]:inline',
              v1Typography.label
            )}
          >
            {cue.open}
          </span>
        </>
      ) : null}
      <ChevronDown
        aria-hidden="true"
        className={cn(
          disclosurePresentation.chevron,
          cue && 'group-focus-visible:text-primary'
        )}
        strokeWidth={1.5}
      />
    </span>
  </CollapsiblePrimitive.Trigger>
))

CollapsibleTrigger.displayName = 'CollapsibleTrigger'

export const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ children, className, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={disclosurePresentation.contentMotion}
    {...props}
  >
    <div
      className={cn(
        disclosurePresentation.content,
        v1Typography.supporting,
        className
      )}
    >
      {children}
    </div>
  </CollapsiblePrimitive.Content>
))

CollapsibleContent.displayName = 'CollapsibleContent'
