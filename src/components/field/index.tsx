import { t, Trans } from '@lingui/macro'
import { useMemo } from 'react'
import { HelpCircle } from 'react-feather'
import { RegisterOptions, useFormContext } from 'react-hook-form'
import { Box, Flex, Input, Text, InputProps } from 'theme-ui'
import { StringMap } from 'types'

interface FieldProps extends InputProps {
  label: string
  help?: string
}

interface FormFieldProps extends FieldProps {
  placeholder: string
  name: string
  options?: RegisterOptions
}

const Field = ({ label, help, children, ...props }: FieldProps) => (
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

const getErrorMessage = (error: StringMap): string => {
  console.log('error?', error)
  if (error.required) {
    return t`This field is required`
  }
  if (error.pattern) {
    return t`Invalid number`
  }
  if (error.maxLength) {
    return t`Invalid range (max: ${error.maxLength.value})`
  }
  if (error.minLength) {
    return t`Invalid range (min: ${error.minLength.value})`
  }

  return t`Invalid value`
}

export const FormField = ({
  placeholder,
  name,
  options,
  ...props
}: FormFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return useMemo(
    () => (
      <Field {...props}>
        <Input
          placeholder={placeholder}
          sx={{ borderColor: errors[name] ? 'danger' : 'inputBorder' }}
          {...register(name, options)}
        />

        {!!errors[name] && (
          <Text
            mt={1}
            ml={2}
            sx={{ display: 'block', fontSize: 1 }}
            variant="error"
          >
            {errors[name].message || getErrorMessage(errors[name])}
          </Text>
        )}
      </Field>
    ),
    [register, errors[name]]
  )
}

export const StaticField = ({ value, ...props }: FieldProps) => (
  <Field {...props} sx={{ position: 'relative' }}>
    <Input
      value={value}
      disabled
      sx={{
        '&:disabled': {
          backgroundColor: 'inherit',
          color: 'lightText',
        },
      }}
    />
    <Text sx={{ position: 'absolute', right: 14, top: 34, color: 'lightText' }}>
      <Trans>FIXED</Trans>
    </Text>
  </Field>
)

export default Field
