import { type HTMLAttributes, useId, useLayoutEffect, useRef } from 'react'

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
  width?: 'content' | 'full'
}

export const SingleChoiceGroup = ({
  accessibleLabel,
  className,
  defaultValue,
  name,
  onValueChange,
  options,
  value,
  width = 'content',
  ...props
}: SingleChoiceGroupProps) => {
  const generatedName = useId()
  const groupName = name ?? generatedName
  const layout = containedSelectionRecipe.layout[width]
  const groupRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    revealSelectedOption(groupRef.current)
  }, [defaultValue, value])

  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => revealSelectedOption(group))
    observer.observe(group)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={accessibleLabel}
      data-testid="canonical-single-choice-group"
      data-width={width}
      className={cn(
        containedSelectionRecipe.default.track,
        layout.track,
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'relative cursor-pointer has-[:disabled]:cursor-not-allowed',
            layout.item
          )}
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
            onChange={(event) => {
              revealOption(
                groupRef.current,
                event.currentTarget.closest('label')
              )
              onValueChange?.(option.value)
            }}
          />
          <span
            className={cn(
              containedSelectionRecipe.default.item,
              containedSelectionRecipe.radioItemState,
              'w-full'
            )}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  )
}

const revealSelectedOption = (group: HTMLDivElement | null) => {
  const selectedOption = group
    ?.querySelector<HTMLInputElement>('input:checked')
    ?.closest<HTMLElement>('label')

  revealOption(group, selectedOption ?? null)
}

const revealOption = (
  group: HTMLDivElement | null,
  option: HTMLElement | null
) => {
  if (!group || !option || group.scrollWidth <= group.clientWidth) return

  const groupRect = group.getBoundingClientRect()
  const optionRect = option.getBoundingClientRect()
  const optionStart = group.scrollLeft + optionRect.left - groupRect.left
  const optionEnd = optionStart + optionRect.width

  if (optionStart < group.scrollLeft) {
    group.scrollLeft = optionStart
  } else if (optionEnd > group.scrollLeft + group.clientWidth) {
    group.scrollLeft = optionEnd - group.clientWidth
  }
}
