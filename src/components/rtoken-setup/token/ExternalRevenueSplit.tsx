import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import Field, { FieldInput, getErrorMessage } from 'components/field'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { ArrowRight } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Box, BoxProps, Flex, Grid } from 'theme-ui'
import { ExternalAddressSplit, isRevenueValidAtom } from '../atoms'

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
    formState: { errors, isDirty },
  } = useForm({
    mode: 'onChange',
    defaultValues,
  })
  const formValues = watch(['total', 'stakers', 'holders', 'address'])
  const isSplitValid = useAtomValue(isRevenueValidAtom)

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
            error={!!errors['total'] || !isSplitValid}
            placeholder={t`% Revenue share`}
          />
        </Field>
        <Field label={t`As RToken`}>
          <FieldInput
            {...register('holders', inputValidation)}
            error={!!errors['holders']}
          />
        </Field>
        <Field label={t`As RSR`}>
          <FieldInput
            {...register('stakers', inputValidation)}
            error={!!errors['stakers']}
          />
        </Field>
      </Grid>
      <Flex>
        <Box sx={{ position: 'relative', top: 3, color: 'secondaryText' }}>
          <ArrowRight size={20} />
        </Box>
        <Box sx={{ flex: 1 }} ml={3}>
          <FieldInput
            sx={{ flex: 1 }}
            {...register('address', inputValidation)}
            placeholder={t`Receiving eth address`}
            error={errors['holders'] ? getErrorMessage(errors['holders']) : ''}
          />
        </Box>
      </Flex>
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
