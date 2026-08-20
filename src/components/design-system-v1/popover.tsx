import * as PopoverPrimitive from '@radix-ui/react-popover'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react'

import { cn } from '@/lib/utils'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger

export const PopoverContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={8}
      className={cn(
        'z-50 max-h-[var(--radix-popover-content-available-height)] max-w-[min(320px,var(--radix-popover-content-available-width))] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-sm outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))

PopoverContent.displayName = 'PopoverContent'
