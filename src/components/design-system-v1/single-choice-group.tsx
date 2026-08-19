import { type HTMLAttributes, useId } from 'react'

import { containedSelectionRecipe } from './contained-selection'
import { cn } from '@/lib/utils'

export interface SingleChoiceOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SingleChoiceGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  accessibleLabel: string
  defaultValue?: string
  name?: string
  onValueChange?: (value: string) => void
  options: SingleChoiceOption[]
  value?: string
}

export const SingleChoiceGroup = ({
  accessibleLabel,
  className,
  defaultValue,
  name,
  onValueChange,
  options,
  value,
  ...props
}: SingleChoiceGroupProps) => {
  const generatedName = useId()
  const groupName = name ?? generatedName

  return (
    <div
      role="radiogroup"
      aria-label={accessibleLabel}
      data-testid="canonical-single-choice-group"
      className={cn(containedSelectionRecipe.default.track, className)}
      {...props}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="relative shrink-0 cursor-pointer has-[:disabled]:cursor-not-allowed"
        >
          <input
            className="peer sr-only"
            type="radio"
            name={groupName}
            value={option.value}
            checked={value === undefined ? undefined : value === option.value}
            defaultChecked={
              value === undefined ? defaultValue === option.value : undefined
            }
            disabled={option.disabled}
            onChange={() => onValueChange?.(option.value)}
          />
          <span
            className={cn(
              containedSelectionRecipe.default.item,
              containedSelectionRecipe.radioItemState
            )}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  )
}
