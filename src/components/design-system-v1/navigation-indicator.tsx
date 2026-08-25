import type { HTMLAttributes } from 'react'

import { candidateSemanticRoles as roles } from './semantic-roles'
import { cn } from '@/lib/utils'

export type NavigationIndicatorTone = 'active' | 'notable'
export type NavigationIndicatorSize = 'compact' | 'default'

export interface NavigationIndicatorDescriptor {
  label: string
  tone: NavigationIndicatorTone
}

export interface NavigationIndicatorProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  announce?: boolean
  label: string
  size?: NavigationIndicatorSize
  tone: NavigationIndicatorTone
}

const TONE_CLASSES: Record<NavigationIndicatorTone, string> = {
  active: roles.feedback.information.foreground,
  notable: roles.feedback.warning.foreground,
}

export const NavigationIndicator = ({
  announce = true,
  className,
  label,
  size = 'default',
  tone,
  ...props
}: NavigationIndicatorProps) => (
  <span
    className={cn(
      'inline-flex shrink-0 items-center justify-center',
      size === 'compact' ? 'size-2' : 'size-4',
      TONE_CLASSES[tone],
      className
    )}
    data-size={size}
    data-slot="product-navigation-indicator"
    data-tone={tone}
    title={label}
    {...props}
  >
    <span
      aria-hidden="true"
      className={cn(
        'rounded-full bg-current',
        size === 'compact' ? 'size-1' : 'size-1.5'
      )}
    />
    {announce && <span className="sr-only">{label}</span>}
  </span>
)
