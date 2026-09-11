import { v1Typography } from '@/components/design-system-v1/typography'
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { LoaderCircle } from 'lucide-react'
import { Slottable, Slot } from '@radix-ui/react-slot'

import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'

export type ButtonTone = 'primary' | 'secondary' | 'quiet' | 'destructive'
export type ButtonSize = 'micro' | 'compact' | 'default'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  tone?: ButtonTone
  size?: ButtonSize
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  loading?: boolean
}

export type InlineActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  treatment?: 'standalone' | 'contextual'
}

const sizeClasses: Record<ButtonSize, string> = {
  micro: 'h-7 gap-1.5 px-2.5 text-sm [&>svg]:size-3.5',
  compact: 'h-8 gap-2 px-3.5 text-sm [&>svg]:size-4',
  default: 'min-h-11 gap-2 px-6 py-2.5 text-sm [&>svg]:size-4',
}

const leadingPaddingClasses: Record<ButtonSize, string> = {
  micro: 'pl-2',
  compact: 'pl-3',
  default: 'pl-[22px]',
}

const trailingPaddingClasses: Record<ButtonSize, string> = {
  micro: 'pr-2',
  compact: 'pr-3',
  default: 'pr-[22px]',
}

const enabledToneClasses: Record<ButtonTone, string> = {
  primary: `${roles.interaction.filledPrimary} text-primary-foreground`,
  secondary:
    'border border-border bg-card text-foreground hover:bg-muted active:bg-border/70',
  quiet: 'bg-transparent text-foreground hover:bg-muted active:bg-border/50',
  destructive: `${roles.interaction.filledDestructive} text-destructive-foreground`,
}

const disabledToneClasses: Record<ButtonTone, string> = {
  primary: roles.disabled.control,
  secondary: roles.disabled.control,
  quiet: roles.disabled.quietAction,
  destructive: roles.disabled.control,
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      asChild = false,
      className,
      disabled = false,
      leadingIcon,
      loading = false,
      onClickCapture,
      size = 'default',
      tabIndex,
      tone = 'primary',
      trailingIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const unavailable = disabled && !loading
    const asChildUnavailable = asChild && (disabled || loading)
    const effectiveLeadingIcon = loading ? (
      <LoaderCircle className="animate-spin" />
    ) : (
      leadingIcon
    )
    const handleClickCapture = (event: ReactMouseEvent<HTMLElement>) => {
      if (asChildUnavailable) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      onClickCapture?.(event as ReactMouseEvent<HTMLButtonElement>)
    }

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        disabled={asChild ? undefined : disabled || loading}
        aria-disabled={asChildUnavailable ? true : undefined}
        aria-busy={loading || undefined}
        tabIndex={asChildUnavailable ? -1 : tabIndex}
        onClickCapture={handleClickCapture}
        data-testid="canonical-button"
        data-tone={tone}
        data-size={size}
        className={cn(
          'inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full font-medium transition-[color,background-color,border-color,transform] duration-120 motion-safe:active:scale-[0.98] focus-visible:outline-none disabled:pointer-events-none aria-disabled:pointer-events-none',
          roles.focus.visibleOnContent,
          sizeClasses[size],
          unavailable ? disabledToneClasses[tone] : enabledToneClasses[tone],
          effectiveLeadingIcon && leadingPaddingClasses[size],
          trailingIcon && trailingPaddingClasses[size],
          className
        )}
        {...props}
      >
        {effectiveLeadingIcon}
        <Slottable>{children}</Slottable>
        {trailingIcon}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export const InlineAction = forwardRef<HTMLButtonElement, InlineActionProps>(
  (
    {
      children,
      className,
      type = 'button',
      treatment = 'standalone',
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      data-testid="inline-action"
      data-action-treatment={treatment}
      className={cn(
        `relative inline-flex h-5 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap p-0 ${v1Typography.label} text-primary underline-offset-2 transition-colors duration-120 before:absolute before:-inset-x-1 before:-inset-y-1 before:content-[''] hover:underline active:text-primary-pressed focus-visible:outline-none disabled:pointer-events-none disabled:text-muted-foreground disabled:no-underline`,
        roles.focus.visibleInset,
        treatment === 'contextual' &&
          `${v1Typography.body} h-auto gap-1 text-foreground`,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)

InlineAction.displayName = 'InlineAction'
