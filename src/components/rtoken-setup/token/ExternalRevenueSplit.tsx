import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import Field, { FieldInput, getErrorMessage } from 'components/field'
import { useEffect } from 'react'
import { ArrowRight } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Box, BoxProps, Grid } from 'theme-ui'
import { ExternalAddressSplit } from '../atoms'

interface ExternalRevenueSplitProps extends Omit<BoxProps, 'onChange'> {
  defaultValues?: Partial<ExternalAddressSplit>
  onChange(data: ExternalAddressSplit): void
  onRemove(): void
}

const inputValidation = {
  required: true,
  pattern: /^[0-9]*[.]?[0-9]$/i,
  min: 0,
  max: 100,
}

const ExternalRevenueSpit = ({
  onChange,
  onRemove,
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
      <Grid columns={['1fr', '1fr', '3fr 1fr 1fr']} mb={3}>
        <Field label={t`% Totals`}>
          <FieldInput
            {...register('total', inputValidation)}
            error={errors['total'] ? getErrorMessage(errors['total']) : ''}
            placeholder={t`% Revenue share`}
          />
        </Field>
        <Field label={t`As RToken`}>
          <FieldInput
            {...register('holders', inputValidation)}
            error={errors['holders'] ? getErrorMessage(errors['holders']) : ''}
          />
        </Field>
        <Field label={t`As RSR`}>
          <FieldInput
            {...register('stakers', inputValidation)}
            error={errors['stakers'] ? getErrorMessage(errors['stakers']) : ''}
          />
        </Field>
      </Grid>
      <Box variant="layout.verticalAlign">
        <ArrowRight size={20} color="#666666" />
        <FieldInput
          ml={3}
          sx={{ flex: 1 }}
          {...register('address', inputValidation)}
          placeholder={t`Receiving eth address`}
          error={errors['holders'] ? getErrorMessage(errors['holders']) : ''}
        />
      </Box>
      <SmallButton
        mt={3}
        sx={{ color: 'danger' }}
        variant="muted"
        onClick={onRemove}
      >
        <Trans>Remove</Trans>
      </SmallButton>
    </Box>
  )
}

export default ExternalRevenueSpit
