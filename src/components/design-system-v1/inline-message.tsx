import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography } from '@/components/design-system-v1/typography'
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

export type InlineMessagePresentation = 'default' | 'summary'

export type InlineMessageIconPresentation = 'plain' | 'contained'

const TONE_PRESENTATION = {
  information: {
    Icon: Info,
    className: cn(
      roles.feedback.information.surface,
      roles.feedback.information.border
    ),
    iconClassName: roles.feedback.information.foreground,
    surfaceVariable: cn(
      '[--inline-message-surface:var(--feedback-information-surface)]',
      '[--inline-message-icon-surface:var(--feedback-information-border)]'
    ),
  },
  success: {
    Icon: CircleCheck,
    className: cn(
      roles.feedback.success.surface,
      roles.feedback.success.border
    ),
    iconClassName: roles.feedback.success.foreground,
    surfaceVariable: cn(
      '[--inline-message-surface:var(--feedback-success-surface)]',
      '[--inline-message-icon-surface:var(--feedback-success-border)]'
    ),
  },
  warning: {
    Icon: TriangleAlert,
    className: cn(
      roles.feedback.warning.surface,
      roles.feedback.warning.border
    ),
    iconClassName: roles.feedback.warning.foreground,
    surfaceVariable: cn(
      '[--inline-message-surface:var(--feedback-warning-surface)]',
      '[--inline-message-icon-surface:var(--feedback-warning-border)]'
    ),
  },
  danger: {
    Icon: CircleAlert,
    className: cn(roles.feedback.danger.surface, roles.feedback.danger.border),
    iconClassName: roles.feedback.danger.foreground,
    surfaceVariable: cn(
      '[--inline-message-surface:var(--feedback-danger-surface)]',
      '[--inline-message-icon-surface:var(--feedback-danger-border)]'
    ),
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
  iconPresentation?: InlineMessageIconPresentation
  presentation?: InlineMessagePresentation
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
      iconPresentation = 'plain',
      presentation = 'default',
      tone = 'information',
      ...props
    },
    ref
  ) => {
    const tonePresentation = TONE_PRESENTATION[tone]
    const ToneIcon = tonePresentation.Icon
    const usesContainedIcon =
      presentation === 'summary' && iconPresentation === 'contained'

    return (
      <div
        ref={ref}
        data-density={density}
        data-icon-presentation={usesContainedIcon ? 'contained' : 'plain'}
        data-presentation={presentation}
        data-testid="canonical-inline-message"
        data-tone={tone}
        className={cn(
          'w-full text-foreground ring-1 ring-inset',
          presentation === 'summary'
            ? cn(
                'flex min-h-11 items-center gap-2 rounded-full',
                usesContainedIcon ? 'p-2' : 'px-4 py-2'
              )
            : cn('relative rounded-lg', density === 'compact' ? 'p-3' : 'p-4'),
          tonePresentation.className,
          tonePresentation.surfaceVariable,
          className
        )}
        {...props}
      >
        {icon === false ? null : (
          <span
            aria-hidden="true"
            className={cn(
              'flex shrink-0 items-center justify-center [&>svg]:size-4 [&>svg]:stroke-[1.5]',
              usesContainedIcon
                ? 'size-8 rounded-full bg-[var(--inline-message-icon-surface)]'
                : 'size-4',
              presentation === 'default' &&
                (density === 'compact'
                  ? 'absolute left-3 top-3 mt-0.5'
                  : 'absolute left-4 top-4 mt-0.5'),
              tonePresentation.iconClassName
            )}
          >
            {icon ?? <ToneIcon />}
          </span>
        )}
        <div
          className={cn(
            'min-w-0',
            presentation === 'summary'
              ? 'flex flex-1 items-center gap-1'
              : icon !== false && '[&>*:first-child]:pl-6'
          )}
        >
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
      roles.text.supporting,
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
