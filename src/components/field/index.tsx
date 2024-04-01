import { t } from '@lingui/macro'
import Help from 'components/help'
import React, { useMemo } from 'react'
import { RegisterOptions, useFormContext } from 'react-hook-form'
import { Box, Flex, Input, InputProps, Slider, Text, Textarea } from 'theme-ui'
import { StringMap } from 'types'

interface FieldProps extends InputProps {
  label?: string
  help?: string
  required?: boolean
}

interface FormFieldProps extends FieldProps {
  placeholder?: string
  name: string
  textarea?: boolean
  error?: string | boolean
  options?: RegisterOptions
  helper?: string
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

export const Field = ({
  label,
  help,
  required,
  children,
  sx = {},
  ...props
}: FieldProps) => (
  <Box sx={{ ...sx, position: 'relative' }} {...props}>
    <Flex mb={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Box variant="layout.verticalAlign" sx={{ gap: 1 }} ml={3}>
        <Text variant="subtitle" sx={{ fontSize: 1 }}>
          {label}
        </Text>
        {required && <Text color="red">*</Text>}
      </Box>
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
    errorMessage = errors[name]?.message || getErrorMessage(errors[name])
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
          <Text
            variant="legend"
            sx={{
              position: 'absolute',
              right: '20px',
              top: '44px',
              fontSize: 1,
            }}
          >
            {helper}
          </Text>
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
  ...props
}: FormFieldProps) => {
  const { register } = useFormContext()

  return useMemo(
    () => (
      <Field {...props} mb={4}>
        <Slider {...register(name, options)} min={min} max={max} />
      </Field>
    ),
    [register]
  )
}

export default Field
