import { t, Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import Field, { FieldInput, getErrorMessage } from 'components/field'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ExternalAddressSplit, isRevenueValidAtom } from '../atoms'

interface ExternalRevenueSplitProps {
  defaultValues?: Partial<ExternalAddressSplit>
  onChange(data: ExternalAddressSplit): void
  onRemove(): void
  className?: string
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
  className,
}: ExternalRevenueSplitProps) => {
  const {
    register,
    watch,
    setValue,
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

  // Stakers
  useEffect(() => {
    const [, stakers = '', holders = ''] = formValues

    if (
      stakers &&
      !isNaN(+stakers) &&
      !isNaN(+holders) &&
      +stakers >= 0 &&
      +stakers <= 100
    ) {
      setValue('holders', ((1000 - +stakers * 10) / 10).toString())
    }
  }, [formValues[1]])

  // Holders
  useEffect(() => {
    const [, stakers = '', holders = ''] = formValues

    if (
      holders &&
      !isNaN(+stakers) &&
      !isNaN(+holders) &&
      +holders >= 0 &&
      +holders <= 100
    ) {
      setValue('stakers', ((1000 - +holders * 10) / 10).toString())
    }
  }, [formValues[2]])

  return (
    <div className={`flex ${className || ''}`}>
      <div className="mr-3 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-0">
          <Field label={t`Total % to arbitrary address`}>
            <FieldInput
              {...register('total', inputValidation)}
              error={!!errors['total'] || !isSplitValid}
              placeholder={t`% Revenue share`}
              className="rounded-tl-md rounded-tr-none rounded-br-none rounded-bl-none lg:rounded-tl-md"
            />
          </Field>
          <Field label={t`As RToken`}>
            <FieldInput
              {...register('holders', { ...inputValidation, min: 0 })}
              error={!!errors['holders']}
              className="rounded-none border-l-0"
            />
          </Field>
          <Field label={t`As RSR`}>
            <FieldInput
              {...register('stakers', { ...inputValidation, min: 0 })}
              error={!!errors['stakers']}
              className="rounded-tl-none rounded-tr-md rounded-br-none rounded-bl-none border-l-0"
            />
          </Field>
        </div>
        <div className="flex-1">
          <FieldInput
            className="flex-1 rounded-tl-none rounded-tr-none rounded-br-md rounded-bl-md border-t-0"
            {...register('address', inputValidation)}
            placeholder={t`Receiving eth address`}
            error={errors['holders'] ? getErrorMessage(errors['holders']) : ''}
          />
        </div>
      </div>
      <Button
        className="flex-shrink-0 text-destructive mt-4 px-2"
        size="sm"
        variant="ghost"
        onClick={onRemove}
      >
        <Trans>X</Trans>
      </Button>
    </div>
  )
}

export default ExternalRevenueSpit
