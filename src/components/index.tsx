// Base components (migrated to shadcn)
export { Input, NumericalInput } from './ui/input'
export { Button as ShadcnButton, buttonVariants } from './ui/button'
export type { ButtonProps as ShadcnButtonProps } from './ui/button'
export { default as Modal } from './ui/modal'
export type { ModalProps } from './ui/modal'

// Legacy Button wrapper - supports old theme-ui props for backward compatibility
// Files importing Button from 'components' get this wrapper
// New code should import Button from '@/components/ui/button' directly
import { Button as BaseButton, ButtonProps as BaseButtonProps, buttonVariants } from './ui/button'
import React, { forwardRef, ButtonHTMLAttributes } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// Spacing utility for theme-ui to Tailwind conversion
const spacingMap: Record<number, string> = { 0: '0', 1: '1', 2: '2', 3: '4', 4: '6', 5: '8' }
const getSpacing = (value?: number | string) => {
  if (value === undefined) return ''
  if (typeof value === 'string') {
    if (value === 'auto') return 'auto'
    return value
  }
  return spacingMap[value] ?? String(value)
}

const getSpacingClasses = (
  ml?: number | string,
  mr?: number | string,
  mt?: number | string,
  mb?: number | string,
  px?: number | string,
  py?: number | string
) => {
  return [
    ml !== undefined && `ml-${getSpacing(ml)}`,
    mr !== undefined && `mr-${getSpacing(mr)}`,
    mt !== undefined && `mt-${getSpacing(mt)}`,
    mb !== undefined && `mb-${getSpacing(mb)}`,
    px !== undefined && `px-${getSpacing(px)}`,
    py !== undefined && `py-${getSpacing(py)}`,
  ].filter(Boolean).join(' ')
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  // Legacy props for backward compatibility
  small?: boolean
  medium?: boolean
  fullWidth?: boolean
  ml?: number | string
  mr?: number | string
  mt?: number | string
  mb?: number | string
  px?: number | string
  py?: number | string
  backgroundColor?: string
  // Allow sx but ignore it (theme-ui compat)
  sx?: Record<string, unknown>
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      small,
      medium,
      fullWidth,
      ml,
      mr,
      mt,
      mb,
      px,
      py,
      backgroundColor,
      sx: _sx, // Ignore sx prop
      size,
      ...props
    },
    ref
  ) => {
    const spacingClasses = getSpacingClasses(ml, mr, mt, mb, px, py)
    const buttonSize = small ? 'sm' : medium ? 'default' : size

    return (
      <BaseButton
        ref={ref}
        size={buttonSize}
        className={cn(
          fullWidth && 'w-full',
          backgroundColor && `bg-[${backgroundColor}]`,
          spacingClasses,
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

// SmallButton - Button with size="sm" preset
interface SmallButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  ml?: number | string
  mr?: number | string
  mt?: number | string
  mb?: number | string
  px?: number | string
  py?: number | string
  sx?: Record<string, unknown>
}

export const SmallButton = forwardRef<HTMLButtonElement, SmallButtonProps>(
  ({ className, ml, mr, mt, mb, px, py, sx: _sx, variant, ...props }, ref) => {
    const spacingClasses = getSpacingClasses(ml, mr, mt, mb, px, py)

    return (
      <BaseButton
        ref={ref}
        size="sm"
        variant={variant}
        className={cn(spacingClasses, className)}
        {...props}
      />
    )
  }
)
SmallButton.displayName = 'SmallButton'

// LoadingButton - Button with loading spinner
interface LoadingButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  loadingText?: React.ReactNode
  text?: React.ReactNode
  fullWidth?: boolean
  ml?: number | string
  mr?: number | string
  mt?: number | string
  mb?: number | string
  py?: number | string
  px?: number | string
  backgroundColor?: string
  sx?: Record<string, unknown>
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      className,
      loading,
      loadingText,
      text,
      fullWidth,
      ml,
      mr,
      mt,
      mb,
      py,
      px,
      backgroundColor,
      sx: _sx,
      variant,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const spacingClasses = getSpacingClasses(ml, mr, mt, mb, px, py)

    return (
      <BaseButton
        ref={ref}
        variant={variant}
        disabled={disabled || loading}
        className={cn(
          fullWidth && 'w-full',
          backgroundColor && `bg-[${backgroundColor}]`,
          spacingClasses,
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? loadingText : text || children}
      </BaseButton>
    )
  }
)
LoadingButton.displayName = 'LoadingButton'
