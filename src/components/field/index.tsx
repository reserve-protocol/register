import { t } from '@lingui/macro'
import Help from 'components/help'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import React, { useMemo } from 'react'
import { RegisterOptions, useFormContext } from 'react-hook-form'
import { StringMap } from 'types'
import { cn } from '@/lib/utils'

interface FieldProps {
  label?: string
  strong?: boolean
  help?: string
  required?: boolean
  children?: React.ReactNode
  className?: string
  mb?: number
}

interface FormFieldProps extends FieldProps {
  placeholder?: string
  name: string
  textarea?: boolean
  error?: string | boolean
  options?: RegisterOptions
  helper?: string
  disabled?: boolean
}

export const getErrorMessage = (error: StringMap): string => {
  switch (error.type) {
    case 'required':
      return t`This field is required`
    case 'pattern':
      return t`Invalid number`
    case 'max':
      return t`Invalid maximum range`
    case 'min':
      return t`Invalid minimum range `
    default:
      return t`Invalid value`
  }
}

const mbToClass: Record<number, string> = {
  1: 'mb-1',
  2: 'mb-2',
  3: 'mb-4',
  4: 'mb-6',
  5: 'mb-8',
}

export const Field = ({
  label,
  help,
  required,
  strong,
  children,
  className,
  mb,
}: FieldProps) => (
  <div className={cn('relative', mb && mbToClass[mb], className)}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1 ml-4">
        <span
          className={cn(
            'text-sm',
            strong ? 'font-bold text-foreground' : 'text-inherit'
          )}
        >
          {label}
        </span>
        {required && <span className="text-destructive">*</span>}
      </div>
      {!!help && <Help className="mx-2" content={help} />}
    </div>
    {children}
  </div>
)

export const FieldInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormFieldProps
>(({ textarea = false, error, className, ...props }, ref) => {
  const InputComponent = textarea ? Textarea : Input

  return (
    <>
      <InputComponent
        className={cn(error && 'border-destructive', className)}
        ref={ref as any}
        {...(props as any)}
      />

      {!!error && typeof error === 'string' && (
        <span className="block mt-1 ml-2 text-sm text-destructive">
          {error}
        </span>
      )}
    </>
  )
})

export const FormField = ({
  placeholder,
  name,
  options,
  textarea = false,
  disabled,
  helper,
  ...props
}: FormFieldProps) => {
  const {
    register,
    getFieldState,
    formState: { errors },
  } = useFormContext()
  const fieldState = getFieldState(name)
  let errorMessage = ''
  if (errors && errors[name]) {
    errorMessage = String(
      errors[name]?.message || getErrorMessage(errors[name])
    )
  }

  return useMemo(
    () => (
      <Field {...props}>
        <FieldInput
          disabled={disabled}
          placeholder={placeholder}
          textarea={textarea}
          error={errorMessage}
          {...register(name, options)}
        />
        {helper && (
          <span className="absolute right-5 top-11 text-sm text-legend">
            {helper}
          </span>
        )}
      </Field>
    ),
    [register, errors[name], helper, fieldState]
  )
}

export const FormFieldRange = ({
  name,
  options,
  min = 0,
  max = 100,
  className,
  ...props
}: FormFieldProps & { min?: number; max?: number }) => {
  const { register, watch } = useFormContext()
  const { onChange } = register(name, options)
  const value = watch(name)

  return useMemo(
    () => (
      <Field {...props} className={cn('mb-6', className)}>
        <Slider
          min={min}
          max={max}
          value={[Number(value) || 0]}
          onValueChange={(val) =>
            onChange({ target: { name, value: val[0] } })
          }
        />
      </Field>
    ),
    [register, value]
  )
}

export default Field
