import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import Field, { FieldInput, getErrorMessage } from 'components/field'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Box, BoxProps, Grid } from 'theme-ui'
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

    onChange({ total, stakers, holders, address })
  }, [...formValues])

  return (
    <Box {...props} sx={{ display: 'flex' }}>
      <Box mr={3} sx={{ flexGrow: 1 }}>
        <Grid columns={['1fr', '1fr', '2fr 1fr 1fr']} gap={0}>
          <Field label={t`Total % to arbitrary address`}>
            <FieldInput
              {...register('total', inputValidation)}
              error={!!errors['total'] || !isSplitValid}
              placeholder={t`% Revenue share`}
              sx={{
                borderRadius: '6px 0 0 0',
              }}
            />
          </Field>
          <Field label={t`As RToken`}>
            <FieldInput
              {...register('holders', inputValidation)}
              error={!!errors['holders']}
              sx={{
                borderRadius: '0',
                borderLeft: 'none',
              }}
            />
          </Field>
          <Field label={t`As RSR`}>
            <FieldInput
              {...register('stakers', inputValidation)}
              error={!!errors['stakers']}
              sx={{
                borderRadius: '0 6px 0 0',
                borderLeft: 'none',
              }}
            />
          </Field>
        </Grid>
        <Box sx={{ flex: 1 }}>
          <FieldInput
            sx={{
              flex: 1,
              borderRadius: '0 0 6px 6px',
              borderTop: 'none',
            }}
            {...register('address', inputValidation)}
            placeholder={t`Receiving eth address`}
            error={errors['holders'] ? getErrorMessage(errors['holders']) : ''}
          />
        </Box>
      </Box>
      <SmallButton
        sx={{ flexShrink: 0, color: 'danger' }}
        mt={4}
        px={2}
        variant="transparent"
        onClick={onRemove}
      >
        <Trans>X</Trans>
      </SmallButton>
    </Box>
  )
}

export default ExternalRevenueSpit
