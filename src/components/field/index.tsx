import { t, Trans } from '@lingui/macro'
import { useMemo } from 'react'
import { HelpCircle } from 'react-feather'
import { RegisterOptions, useFormContext } from 'react-hook-form'
import { Box, Flex, Input, Textarea, Text, InputProps, Slider } from 'theme-ui'
import { StringMap } from 'types'

interface FieldProps extends InputProps {
  label: string
  help?: string
}

interface FormFieldProps extends FieldProps {
  placeholder?: string
  name: string
  textarea?: boolean
  options?: RegisterOptions
}

const getErrorMessage = (error: StringMap): string => {
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
    <Flex mb={1}>
      <Text variant="subtitle" ml={2} sx={{ fontSize: 1 }}>
        {label}
      </Text>
      {!!help && (
        <>
          <Box mx="auto" />
          <HelpCircle size={16} />
        </>
      )}
    </Flex>
    {children}
  </Box>
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

  const InputComponent = textarea ? Textarea : Input

  return useMemo(
    () => (
      <Field {...props}>
        <InputComponent
          disabled={!!disabled}
          placeholder={placeholder}
          sx={{ borderColor: errors[name] ? 'danger' : 'inputBorder' }}
          {...register(name, options)}
        />

        {!!errors && !!errors[name] && (
          <Text
            mt={1}
            ml={2}
            sx={{ display: 'block', fontSize: 1 }}
            variant="error"
          >
            {errors[name]?.message || getErrorMessage(errors[name])}
          </Text>
        )}
      </Field>
    ),
    [register, errors[name]]
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
