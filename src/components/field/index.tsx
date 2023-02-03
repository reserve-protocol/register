import { t } from '@lingui/macro'
import React from 'react'
import { useMemo } from 'react'
import { HelpCircle } from 'react-feather'
import Help from 'components/help'
import { RegisterOptions, useFormContext } from 'react-hook-form'
import { Box, Flex, Input, InputProps, Slider, Text, Textarea } from 'theme-ui'
import { StringMap } from 'types'

interface FieldProps extends InputProps {
  label?: string
  help?: string
}

interface FormFieldProps extends FieldProps {
  placeholder?: string
  name: string
  textarea?: boolean
  error?: string | boolean
  options?: RegisterOptions
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

export const Field = ({ label, help, children, ...props }: FieldProps) => (
  <Box {...props}>
    <Flex mb={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Text variant="subtitle" ml={3} sx={{ fontSize: 1 }}>
        {label}
      </Text>
      {!!help && <Help mx={2} content={help} />}
    </Flex>
    {children}
  </Box>
)

export const FieldInput = React.forwardRef(
  ({ sx = {}, textarea = false, error, ...props }: FormFieldProps, ref) => {
    const InputComponent = textarea ? Textarea : Input

    return (
      <>
        <InputComponent
          sx={{ ...sx, borderColor: !!error ? 'danger' : 'inputBorder' }}
          ref={ref}
          {...(props as any)}
        />

        {!!error && typeof error === 'string' && (
          <Text
            mt={1}
            ml={2}
            sx={{ display: 'block', fontSize: 1 }}
            variant="error"
          >
            {error}
          </Text>
        )}
      </>
    )
  }
)

export const FormField = ({
  placeholder,
  name,
  options,
  textarea = false,
  disabled,
  ...props
}: FormFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  let errorMessage = ''

  if (errors && errors[name]) {
    errorMessage = errors[name]?.message || getErrorMessage(errors[name])
  }

  return (
    <Field {...props}>
      <FieldInput
        disabled={disabled}
        placeholder={placeholder}
        textarea={textarea}
        error={errorMessage}
        {...register(name, options)}
      />
    </Field>
  )
}

export const FormFieldRange = ({
  name,
  options,
  min = 0,
  max = 100,
  ...props
}: FormFieldProps) => {
  const { register } = useFormContext()

  return (
    <Field {...props} mb={4}>
      <Slider {...register(name, options)} min={min} max={max} />
    </Field>
  )
}

export default Field
