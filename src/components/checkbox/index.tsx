import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { forwardRef } from 'react'

import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

export type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  'checked' | 'defaultChecked' | 'onCheckedChange'
> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    {
      checked,
      className,
      defaultChecked,
      disabled = false,
      onCheckedChange,
      ...props
    },
    ref
  ) => (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onCheckedChange={(value) => onCheckedChange?.(value === true)}
      data-testid="canonical-checkbox"
      className={cn(
        'group peer flex size-7 shrink-0 items-center justify-center focus-visible:outline-none disabled:pointer-events-none',
        className
      )}
      {...props}
    >
      <span
        data-testid="canonical-checkbox-mark"
        className={cn(
          'flex size-5 items-center justify-center rounded-[4px] border border-border bg-card text-primary-foreground transition-colors duration-120 group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary group-disabled:border-border group-disabled:bg-muted group-disabled:text-muted-foreground group-disabled:group-data-[state=checked]:border-border group-disabled:group-data-[state=checked]:bg-muted',
          roles.focus.onContentWithinGroup
        )}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
          <Check className="size-3.5" strokeWidth={2} />
        </CheckboxPrimitive.Indicator>
      </span>
    </CheckboxPrimitive.Root>
  )
)

Checkbox.displayName = 'Checkbox'
