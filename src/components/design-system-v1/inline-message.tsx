import { candidateSemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import * as React from 'react'

export type InlineMessageTone = 'information' | 'success' | 'warning' | 'danger'

export type InlineMessageDensity = 'default' | 'compact'

const TONE_PRESENTATION = {
  information: {
    Icon: Info,
    className: cn(
      roles.feedback.information.surface,
      roles.feedback.information.border
    ),
    iconClassName: roles.feedback.information.foreground,
    surfaceVariable:
      '[--inline-message-surface:var(--feedback-information-surface)]',
  },
  success: {
    Icon: CircleCheck,
    className: cn(
      roles.feedback.success.surface,
      roles.feedback.success.border
    ),
    iconClassName: roles.feedback.success.foreground,
    surfaceVariable:
      '[--inline-message-surface:var(--feedback-success-surface)]',
  },
  warning: {
    Icon: TriangleAlert,
    className: cn(
      roles.feedback.warning.surface,
      roles.feedback.warning.border
    ),
    iconClassName: roles.feedback.warning.foreground,
    surfaceVariable:
      '[--inline-message-surface:var(--feedback-warning-surface)]',
  },
  danger: {
    Icon: CircleAlert,
    className: cn(roles.feedback.danger.surface, roles.feedback.danger.border),
    iconClassName: roles.feedback.danger.foreground,
    surfaceVariable:
      '[--inline-message-surface:var(--feedback-danger-surface)]',
  },
} satisfies Record<
  InlineMessageTone,
  {
    Icon: LucideIcon
    className: string
    iconClassName: string
    surfaceVariable: string
  }
>

export interface InlineMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: InlineMessageDensity
  icon?: React.ReactNode | false
  tone?: InlineMessageTone
}

export const InlineMessage = React.forwardRef<
  HTMLDivElement,
  InlineMessageProps
>(
  (
    {
      children,
      className,
      density = 'default',
      icon,
      tone = 'information',
      ...props
    },
    ref
  ) => {
    const presentation = TONE_PRESENTATION[tone]
    const ToneIcon = presentation.Icon

    return (
      <div
        ref={ref}
        data-density={density}
        data-testid="canonical-inline-message"
        data-tone={tone}
        className={cn(
          'grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-lg text-foreground ring-1 ring-inset',
          density === 'compact' ? 'p-3' : 'p-4',
          presentation.className,
          presentation.surfaceVariable,
          className
        )}
        {...props}
      >
        {icon === false ? null : (
          <span
            aria-hidden="true"
            className={cn(
              'mt-0.5 flex size-4 shrink-0 items-center justify-center [&>svg]:size-4 [&>svg]:stroke-[1.5]',
              presentation.iconClassName
            )}
          >
            {icon ?? <ToneIcon />}
          </span>
        )}
        <div className={cn('min-w-0', icon === false && 'col-span-2')}>
          {children}
        </div>
      </div>
    )
  }
)

InlineMessage.displayName = 'InlineMessage'

export const InlineMessageTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(v1Typography.label, 'text-foreground', className)}
    {...props}
  />
))

InlineMessageTitle.displayName = 'InlineMessageTitle'

export const InlineMessageDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      v1Typography.supporting,
      v1SemanticRecipes.text.supporting,
      '[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2',
      className
    )}
    {...props}
  />
))

InlineMessageDescription.displayName = 'InlineMessageDescription'

export const InlineMessageActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-testid="inline-message-actions"
    className={cn(
      'mt-3 flex flex-wrap items-center gap-2 [&>*]:focus-visible:ring-offset-[var(--inline-message-surface)]',
      className
    )}
    {...props}
  />
))

InlineMessageActions.displayName = 'InlineMessageActions'
