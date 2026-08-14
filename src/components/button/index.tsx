import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'

import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

export type ButtonTone = 'primary' | 'secondary' | 'quiet' | 'destructive'
export type ButtonSize = 'micro' | 'compact' | 'default'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonTone
  size?: ButtonSize
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  loading?: boolean
}

const sizeClasses: Record<ButtonSize, string> = {
  micro: 'h-7 gap-1.5 px-2.5 text-sm [&>svg]:size-3.5',
  compact: 'h-8 gap-2 px-3 text-sm [&>svg]:size-4',
  default: 'h-11 gap-2 px-5 text-sm [&>svg]:size-4',
}

const leadingPaddingClasses: Record<ButtonSize, string> = {
  micro: 'pl-2',
  compact: 'pl-2.5',
  default: 'pl-[18px]',
}

const trailingPaddingClasses: Record<ButtonSize, string> = {
  micro: 'pr-2',
  compact: 'pr-2.5',
  default: 'pr-[18px]',
}

const enabledToneClasses: Record<ButtonTone, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'border border-border bg-card text-foreground hover:bg-muted',
  quiet: 'bg-transparent text-foreground hover:bg-muted',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/80',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled = false,
      leadingIcon,
      loading = false,
      size = 'default',
      tone = 'primary',
      trailingIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const unavailable = disabled && !loading
    const effectiveLeadingIcon = loading ? (
      <LoaderCircle className="animate-spin" />
    ) : (
      leadingIcon
    )

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        data-testid="canonical-button"
        data-tone={tone}
        data-size={size}
        className={cn(
          'inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors duration-120 focus-visible:outline-none disabled:pointer-events-none',
          roles.focus.onContent,
          sizeClasses[size],
          unavailable ? roles.disabled.control : enabledToneClasses[tone],
          effectiveLeadingIcon && leadingPaddingClasses[size],
          trailingIcon && trailingPaddingClasses[size],
          className
        )}
        {...props}
      >
        {effectiveLeadingIcon}
        {children}
        {trailingIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'
