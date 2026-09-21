import { useId, useState, type ReactNode } from 'react'

import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import { ActionGroup } from './action-group'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { popupItemGeometry, popupItemTypography } from './popup-item-geometry'
import { PopupChevron, popupTriggerGap } from './popup-chevron'

export interface MultiSelectFilterOption {
  value: string
  label: ReactNode
  leadingVisual?: ReactNode
  disabled?: boolean
}

export interface MultiSelectFilterProps {
  accessibleLabel: string
  applyLabel?: string
  clearLabel?: string
  minSelected?: number
  onApply: (selected: string[]) => void
  options: readonly MultiSelectFilterOption[]
  selected: readonly string[]
  triggerContent: ReactNode
}

export const MultiSelectFilter = ({
  accessibleLabel,
  applyLabel = 'Apply',
  clearLabel = 'Clear',
  minSelected = 0,
  onApply,
  options,
  selected,
  triggerContent,
}: MultiSelectFilterProps) => {
  const instanceId = useId()
  const [draft, setDraft] = useState<string[]>([...selected])
  const [open, setOpen] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setDraft([...selected])
    setOpen(nextOpen)
  }

  const toggle = (value: string) => {
    setDraft((current) =>
      current.includes(value)
        ? current.filter((candidate) => candidate !== value)
        : [...current, value]
    )
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          tone="secondary"
          aria-label={accessibleLabel}
          className={cn(
            'group justify-between text-base font-light',
            popupTriggerGap.default
          )}
          trailingIcon={<PopupChevron />}
        >
          <span className="flex min-w-0 items-center gap-2">
            {triggerContent}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div
          className={cn(
            'max-h-64 overflow-y-auto',
            popupItemGeometry.popupInset
          )}
        >
          {options.map((option) => {
            const checked = draft.includes(option.value)
            const atMinimum = checked && draft.length <= minSelected
            const unavailable = option.disabled || atMinimum
            const optionId = `${instanceId}-${option.value}`

            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded transition-colors duration-120',
                  popupItemGeometry.itemInset,
                  popupItemTypography.singleLine,
                  roles.interaction.subtleHover,
                  unavailable && 'pointer-events-none text-muted-foreground'
                )}
              >
                {option.leadingVisual ? (
                  <span
                    aria-hidden="true"
                    data-slot="multi-select-leading-visual"
                    className="flex size-5 shrink-0 items-center justify-center [&>svg]:size-5"
                  >
                    {option.leadingVisual}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                <Checkbox
                  id={optionId}
                  checked={checked}
                  disabled={unavailable}
                  className={popupItemGeometry.rowCheckboxCompensation}
                  onCheckedChange={() => toggle(option.value)}
                />
              </label>
            )
          })}
        </div>
        <ActionGroup className="justify-end px-5 pb-5 pt-2">
          <Button
            size="compact"
            tone="secondary"
            disabled={minSelected > 0 || draft.length === 0}
            onClick={() => setDraft([])}
          >
            {clearLabel}
          </Button>
          <Button
            size="compact"
            onClick={() => {
              onApply(draft)
              setOpen(false)
            }}
          >
            {applyLabel}
          </Button>
        </ActionGroup>
      </PopoverContent>
    </Popover>
  )
}
