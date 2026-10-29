import { useId, useRef, useState, type ReactNode } from 'react'

import {
  Field,
  FieldMessage,
  TextInput,
} from '@/components/design-system-v1/field'
import {
  SingleChoiceGroup,
  type SingleChoiceOption,
} from '@/components/design-system-v1/single-choice-group'
import { cn } from '@/lib/utils'

export interface PresetOrCustomFieldProps {
  accessibleLabel: string
  className?: string
  customAriaLabel: string
  customPlaceholder: string
  defaultValue?: string
  invalid?: boolean
  message?: ReactNode
  onValueChange?: (value: string) => void
  options: SingleChoiceOption[]
  trailing?: ReactNode
}

const CUSTOM_OPTION_VALUE = '__custom__'

export const PresetOrCustomField = ({
  accessibleLabel,
  className,
  customAriaLabel,
  customPlaceholder,
  defaultValue = '',
  invalid = false,
  message,
  onValueChange,
  options,
  trailing,
}: PresetOrCustomFieldProps) => {
  const initialPreset = options.some((option) => option.value === defaultValue)
    ? defaultValue
    : ''
  const [selectedOption, setSelectedOption] = useState(
    initialPreset || CUSTOM_OPTION_VALUE
  )
  const [customValue, setCustomValue] = useState(
    initialPreset ? '' : defaultValue
  )
  const customInputRef = useRef<HTMLInputElement>(null)
  const messageId = useId()
  const showCustomError = invalid && selectedOption === CUSTOM_OPTION_VALUE
  const choices = [...options, { value: CUSTOM_OPTION_VALUE, label: 'Custom' }]

  const selectOption = (nextValue: string) => {
    setSelectedOption(nextValue)

    if (nextValue === CUSTOM_OPTION_VALUE) {
      customInputRef.current?.focus()
      onValueChange?.(customValue)
      return
    }

    setCustomValue('')
    onValueChange?.(nextValue)
  }

  const enterCustomValue = (nextValue: string) => {
    setSelectedOption(CUSTOM_OPTION_VALUE)
    setCustomValue(nextValue)
    onValueChange?.(nextValue)
  }

  return (
    <div
      data-testid="preset-or-custom-field"
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between',
        className
      )}
    >
      <SingleChoiceGroup
        accessibleLabel={accessibleLabel}
        className="sm:w-fit sm:[&>label]:flex-none"
        onValueChange={selectOption}
        options={choices}
        value={selectedOption}
        width="full"
      />

      <Field className="w-full sm:w-48">
        <TextInput
          ref={customInputRef}
          aria-errormessage={showCustomError && message ? messageId : undefined}
          aria-label={customAriaLabel}
          inputMode="decimal"
          invalid={showCustomError}
          onChange={(event) => enterCustomValue(event.currentTarget.value)}
          placeholder={customPlaceholder}
          trailing={trailing}
          value={customValue}
        />
        {showCustomError && message && (
          <FieldMessage id={messageId}>{message}</FieldMessage>
        )}
      </Field>
    </div>
  )
}
