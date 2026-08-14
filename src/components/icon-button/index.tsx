import { forwardRef, type ReactNode } from 'react'

import { Button, type ButtonProps, type ButtonSize } from '@/components/button'
import { cn } from '@/lib/utils'

export interface IconButtonProps extends Omit<
  ButtonProps,
  'children' | 'leadingIcon' | 'trailingIcon'
> {
  label: string
  icon: ReactNode
}

const squareClasses: Record<ButtonSize, string> = {
  micro: 'w-7 px-0',
  compact: 'w-8 px-0',
  default: 'w-11 px-0',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { className, icon, label, size = 'compact', tone = 'secondary', ...props },
    ref
  ) => (
    <Button
      ref={ref}
      aria-label={label}
      data-testid="canonical-icon-button"
      leadingIcon={icon}
      size={size}
      tone={tone}
      className={cn(squareClasses[size], className)}
      {...props}
    />
  )
)

IconButton.displayName = 'IconButton'
