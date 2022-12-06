import { t } from '@lingui/macro'
import Field, { FieldInput, getErrorMessage } from 'components/field'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Box, BoxProps } from 'theme-ui'
import { ExternalAddressSplit } from '../atoms'

interface ExternalRevenueSplitProps extends Omit<BoxProps, 'onChange'> {
  defaultValues?: Partial<ExternalAddressSplit>
  onChange(data: ExternalAddressSplit): void
}

const inputValidation = {
  required: true,
  pattern: /^[0-9]*[.]?[0-9]$/i,
  min: 0,
  max: 100,
}

const ExternalRevenueSpit = ({
  onChange,
  defaultValues = {},
  ...props
}: ExternalRevenueSplitProps) => {
  const {
    register,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues,
  })
  const formValues = watch(['total', 'stakers', 'holders', 'address'])

  useEffect(() => {
    const [total = '', stakers = '', holders = '', address = ''] = formValues

    if (isDirty) {
      onChange({ total, stakers, holders, address })
    }
  }, [...formValues])

  return (
    <Box {...props}>
      <Field label={t`% Totals`} mb={3}>
        <FieldInput
          {...register('total', inputValidation)}
          error={errors['total'] ? getErrorMessage(errors['total']) : ''}
        />
      </Field>
      <Field label={t`% Stakers`} mb={3}>
        <FieldInput
          {...register('stakers', inputValidation)}
          error={errors['stakers'] ? getErrorMessage(errors['stakers']) : ''}
        />
      </Field>
      <Field label={t`% Holders`} mb={3}>
        <FieldInput
          {...register('holders', inputValidation)}
          error={errors['holders'] ? getErrorMessage(errors['holders']) : ''}
        />
      </Field>
      <Field label={t`Address`}>
        <FieldInput
          {...register('address', inputValidation)}
          error={errors['holders'] ? getErrorMessage(errors['holders']) : ''}
        />
      </Field>
    </Box>
  )
}

export default ExternalRevenueSpit
