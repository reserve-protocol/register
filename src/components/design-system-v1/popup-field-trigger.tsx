import { forwardRef, type ReactNode } from 'react'
import { Button, type ButtonProps } from '@/components/button'
import { cn } from '@/lib/utils'
import { v1SemanticRoles as roles } from './semantic-roles'
import {
  PopupChevron,
  popupTriggerGap,
  popupTriggerPadding,
} from './popup-chevron'

export interface PopupFieldTriggerProps extends Omit<
  ButtonProps,
  'size' | 'tone' | 'leadingIcon' | 'trailingIcon'
> {
  contextLabel?: ReactNode
}

export const PopupFieldTrigger = forwardRef<
  HTMLButtonElement,
  PopupFieldTriggerProps
>(({ children, className, contextLabel, disabled = false, ...props }, ref) => (
  <Button
    {...props}
    ref={ref}
    disabled={disabled}
    size="default"
    tone="secondary"
    className={cn(
      'group h-11 min-h-0 w-full justify-between py-0 text-base font-light',
      !disabled && roles.line.control,
      popupTriggerGap.default,
      popupTriggerPadding.defaultText,
      className
    )}
    trailingIcon={<PopupChevron />}
  >
    {contextLabel !== undefined && (
      <span className="shrink-0">{contextLabel}</span>
    )}
    <span
      className={cn(
        'min-w-0 truncate',
        contextLabel !== undefined && 'ml-auto'
      )}
    >
      {children}
    </span>
  </Button>
))

PopupFieldTrigger.displayName = 'PopupFieldTrigger'
