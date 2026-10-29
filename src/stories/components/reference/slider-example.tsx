import { useEffect, useId, useRef, useState } from 'react'

import { FieldMessage, TextInput } from '@/components/design-system-v1/field'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export type SliderExampleProps = {
  value: number
  disabled: boolean
  exactEntry?: boolean
  step?: number
  onValueChange?: (value: number) => void
}

export const SliderExample = ({
  value,
  disabled,
  exactEntry,
  step = 1,
  onValueChange,
}: SliderExampleProps) => {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(String(value))
  const [validationMessage, setValidationMessage] = useState('')
  useEffect(() => {
    setDraft(String(value))
  }, [value, exactEntry])
  useEffect(() => {
    setValidationMessage(
      exactEntry ? (inputRef.current?.validationMessage ?? '') : ''
    )
  }, [draft, step, exactEntry])

  return (
    <div className="mx-auto w-full max-w-lg bg-card p-5 sm:p-6">
      <div
        className={cn(
          'mb-1 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4',
          v1Typography.body
        )}
      >
        <label
          htmlFor={exactEntry ? inputId : undefined}
          className={cn('min-w-0', roles.text.supporting)}
        >
          Rebalance Percent
        </label>
        {exactEntry ? (
          <TextInput
            ref={inputRef}
            id={inputId}
            aria-describedby={
              validationMessage ? `${inputId}-error` : undefined
            }
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={step}
            required
            value={draft}
            disabled={disabled}
            invalid={Boolean(validationMessage)}
            trailing="%"
            className="w-28"
            inputClassName="text-right tabular-nums"
            onChange={(event) => {
              setDraft(event.target.value)
              setValidationMessage(event.target.validationMessage)
              if (event.target.validity.valid)
                onValueChange?.(event.target.valueAsNumber)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.reportValidity()
            }}
          />
        ) : (
          <output
            className={cn('font-medium tabular-nums', roles.text.primary)}
          >
            {value}%
          </output>
        )}
      </div>
      <Slider
        aria-label="Rebalance Percent"
        className="h-11"
        min={0}
        max={100}
        step={step}
        value={[value]}
        disabled={disabled}
        onValueChange={([next]) => {
          setDraft(String(next))
          setValidationMessage('')
          onValueChange?.(next)
        }}
      />
      <div
        className={cn(
          'pointer-events-none -mt-1 flex justify-between',
          roles.text.supporting,
          v1Typography.supporting
        )}
      >
        <span>0%</span>
        <span>100%</span>
      </div>
      {exactEntry && validationMessage && (
        <FieldMessage className="mt-2" id={`${inputId}-error`}>
          {validationMessage}
        </FieldMessage>
      )}
    </div>
  )
}
