import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'

import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import { disclosurePresentation } from './disclosure-presentation'
import { v1Typography } from './typography'

export const Accordion = AccordionPrimitive.Root

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={className} {...props} />
))

AccordionItem.displayName = 'AccordionItem'

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  Omit<
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>,
    'asChild'
  >
>(({ children, className, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
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
      <ChevronDown
        aria-hidden="true"
        className={disclosurePresentation.chevron}
        strokeWidth={1.5}
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))

AccordionTrigger.displayName = 'AccordionTrigger'

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ children, className, ...props }, ref) => (
  <AccordionPrimitive.Content
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
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = 'AccordionContent'
