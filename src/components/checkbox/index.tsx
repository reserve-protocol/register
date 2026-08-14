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
        'peer flex size-5 shrink-0 items-center justify-center rounded-[4px] border border-border bg-card text-primary-foreground transition-colors duration-120 focus-visible:outline-none data-[state=checked]:border-primary data-[state=checked]:bg-primary disabled:pointer-events-none disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:data-[state=checked]:border-border disabled:data-[state=checked]:bg-muted',
        roles.focus.onContent,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        <Check className="size-3.5" strokeWidth={2} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
)

Checkbox.displayName = 'Checkbox'
