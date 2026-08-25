import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { LoaderCircle } from 'lucide-react'
import { Slottable, Slot } from '@radix-ui/react-slot'

import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
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
          roles.focus.onContent,
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
