import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react'

import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import { popupItemGeometry, popupItemTypography } from './popup-item-geometry'
import {
  PopupChevron,
  popupTriggerGap,
  popupTriggerPadding,
} from './popup-chevron'

export type SelectSize = 'compact' | 'default'

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value

export interface SelectTriggerProps extends Omit<
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
  'size'
> {
  size?: SelectSize
}

const triggerSizeClasses: Record<SelectSize, string> = {
  compact: `h-8 text-sm ${popupTriggerGap.compact} ${popupTriggerPadding.compactText}`,
  default: `h-11 text-base ${popupTriggerGap.default} ${popupTriggerPadding.defaultText}`,
}

export const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ children, className, disabled, size = 'default', ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    disabled={disabled}
    data-size={size}
    className={cn(
      'group flex w-full items-center justify-between rounded-full border border-input bg-card font-light leading-none text-foreground outline-none transition-colors duration-120 data-[placeholder]:text-muted-foreground disabled:pointer-events-none [&>span]:min-w-0 [&>span]:truncate',
      roles.focus.visibleOnContent,
      triggerSizeClasses[size],
      disabled && roles.disabled.control,
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <PopupChevron />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))

SelectTrigger.displayName = 'SelectTrigger'

const SelectScrollUpButton = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex h-8 cursor-default items-center justify-center text-muted-foreground',
      className
    )}
    {...props}
  >
    <ChevronUp aria-hidden="true" className="size-4" strokeWidth={1.5} />
  </SelectPrimitive.ScrollUpButton>
))

SelectScrollUpButton.displayName = 'SelectScrollUpButton'

const SelectScrollDownButton = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex h-8 cursor-default items-center justify-center text-muted-foreground',
      className
    )}
    {...props}
  >
    <ChevronDown aria-hidden="true" className="size-4" strokeWidth={1.5} />
  </SelectPrimitive.ScrollDownButton>
))

SelectScrollDownButton.displayName = 'SelectScrollDownButton'

export const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(
  (
    { children, className, position = 'popper', sideOffset = 8, ...props },
    ref
  ) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(
          'relative z-50 max-h-[min(320px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] max-w-[min(320px,var(--radix-select-content-available-width))] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none',
          className
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className={popupItemGeometry.popupInset}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
)

SelectContent.displayName = 'SelectContent'

export const SelectLabel = forwardRef<
  ElementRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      'px-4 pb-1 pt-2 text-xs font-medium text-muted-foreground',
      className
    )}
    {...props}
  />
))

SelectLabel.displayName = 'SelectLabel'

export interface SelectItemProps extends ComponentPropsWithoutRef<
  typeof SelectPrimitive.Item
> {
  leadingVisual?: ReactNode
}

export const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ children, className, leadingVisual, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded text-foreground outline-none transition-colors duration-120 data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
      popupItemGeometry.itemInset,
      popupItemTypography.singleLine,
      'pr-10',
      roles.interaction.subtleFocus,
      roles.interaction.subtleHighlight,
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>
      <span className="flex min-w-0 items-center gap-2">
        {leadingVisual ? (
          <span
            aria-hidden="true"
            data-slot="select-leading-visual"
            className="flex h-5 shrink-0 items-center justify-center [&>svg]:size-4"
          >
            {leadingVisual}
          </span>
        ) : null}
        <span className="truncate">{children}</span>
      </span>
    </SelectPrimitive.ItemText>
    <span className="absolute right-3 flex size-4 items-center justify-center text-primary">
      <SelectPrimitive.ItemIndicator>
        <Check aria-hidden="true" className="size-4" strokeWidth={1.5} />
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
))

SelectItem.displayName = 'SelectItem'

export const SelectSeparator = forwardRef<
  ElementRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('mx-3 my-1 h-px bg-border', className)}
    {...props}
  />
))

SelectSeparator.displayName = 'SelectSeparator'
