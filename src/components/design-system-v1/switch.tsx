import * as SwitchPrimitive from '@radix-ui/react-switch'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react'

import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'

export const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, disabled, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    disabled={disabled}
    className={cn(
      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-muted-foreground/30 outline-none transition-colors duration-120 data-[state=checked]:bg-primary',
      roles.focus.visibleOnContent,
      disabled && cn('cursor-not-allowed', roles.disabled.statefulTrack),
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'block size-4 translate-x-0.5 rounded-full bg-card shadow-sm transition-transform duration-120 data-[state=checked]:translate-x-[18px] motion-reduce:transition-none',
        disabled && cn('shadow-none', roles.disabled.statefulIndicator)
      )}
    />
  </SwitchPrimitive.Root>
))

Switch.displayName = 'Switch'
