import { HelpCircle } from 'react-feather'
import { RegisterOptions, useFormContext } from 'react-hook-form'
import { Box, Flex, Input, Text, InputProps } from 'theme-ui'

interface Props extends InputProps {
  label: string
  help?: string
  placeholder: string
  name: string
  options?: RegisterOptions
}

const Field = ({
  label,
  help,
  placeholder,
  name,
  options,
  ...props
}: Props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
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
      <Input
        placeholder={placeholder}
        sx={{ borderColor: errors[name] ? 'danger' : 'inherit' }}
        {...register(name, options)}
      />
      {!!errors[name]?.message && (
        <Text
          mt={1}
          ml={2}
          sx={{ display: 'block', fontSize: 1 }}
          variant="error"
        >
          {errors[name].message}
        </Text>
      )}
    </Box>
  )
}

export default Field
