import { Button } from '@/components/ui/button'
import { useAtomValue } from 'jotai'
import { Asterisk } from 'lucide-react'
import { useCallback } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { selectedGovernanceOptionAtom } from '../../atoms'
import BasicInput from '../../components/basic-input'
import { Decimal } from '../../utils/decimals'
import AdditionalRevenueRecipients from './additional-revenue-recipients'

const SETTINGS = [
  {
    title: 'Platform',
    description:
      'Percentage of fee revenue sent to the protocol; cannot be changed by governance.',
    field: 'fixedPlatformFee',
    disabled: true,
  },
  {
    title: 'Creator',
    description: 'Percentage of fee revenue sent to the creator of the DTF.',
    field: 'deployerShare',
  },
  {
    title: 'Governance',
    description:
      'Percentage of fee revenue sent to the vote-lock DAO governing the DTF.',
    field: 'governanceShare',
  },
]

const useFormValues = () => {
  const { getValues } = useFormContext()

  return {
    ...useWatch(), // subscribe to form value updates

    ...getValues(), // always merge with latest form values
  }
}

const RemainingAllocation = () => {
  const { watch } = useFormContext()

  // Hack to update nested values
  useFormValues()

  const [
    fixedPlatformFee,
    governanceShare,
    deployerShare,
    additionalRevenueRecipients,
  ] = watch([
    'fixedPlatformFee',
    'governanceShare',
    'deployerShare',
    'additionalRevenueRecipients',
  ])

  const remaining = new Decimal(100).minus(
    new Decimal(fixedPlatformFee || 0)
      .plus(new Decimal(governanceShare || 0))
      .plus(new Decimal(deployerShare || 0))
      .plus(
        additionalRevenueRecipients?.reduce(
          (sum: Decimal, recipient: { share: number }) =>
            sum.plus(new Decimal(recipient.share || 0)),
          new Decimal(0)
        ) || 0
      )
  )

  const isNegative = remaining.isNegative()
  const absValue = remaining.abs()
  const displayValue = absValue.toDisplayString()

  return (
    <div className="text-base ml-auto px-4">
      <span className="text-muted-foreground">Remaining allocation:</span>{' '}
      <span className={isNegative ? 'text-red-500' : ''}>
        {isNegative ? `-${displayValue}` : displayValue}%
      </span>
    </div>
  )
}

const EvenDistributionButton = () => {
  const { setValue, getValues } = useFormContext()
  const selectedGovOption = useAtomValue(selectedGovernanceOptionAtom)

  const onEvenDistribution = useCallback(() => {
    const fixedPlatformFee = getValues('fixedPlatformFee') || 0
    const additionalRecipients = getValues('additionalRevenueRecipients') || []
    const isGovSharePresent = selectedGovOption !== 'governanceWalletAddress'
    const isAdditionalRecipientsPresent = additionalRecipients.length > 0

    const participantsCount = [
      true, // deployerShare
      isGovSharePresent, // governanceShare
      ...additionalRecipients.map(Boolean),
    ].filter(Boolean).length

    const remainingPercentage = new Decimal(100).minus(fixedPlatformFee)
    const baseShare =
      Math.floor((remainingPercentage.value / participantsCount) * 100) / 100
    const totalPercentage = baseShare * (participantsCount - 1)
    const lastShare = +(remainingPercentage.value - totalPercentage).toFixed(2)

    setValue('deployerShare', baseShare)

    if (isGovSharePresent) {
      setValue('governanceShare', baseShare)
    }

    if (isAdditionalRecipientsPresent) {
      setValue(
        'additionalRevenueRecipients',
        additionalRecipients.map(
          (recipient: { address: string; share: number }, index: number) => ({
            ...recipient,
            share:
              index === additionalRecipients.length - 1 ? lastShare : baseShare,
          })
        )
      )
    }
  }, [getValues, setValue, selectedGovOption])

  return (
    <Button
      variant="accent"
      className="flex gap-2 text-base pl-3 pr-4 rounded-xl text-nowrap w-48 py-7 -mr-2 bg-muted/80"
      onClick={onEvenDistribution}
    >
      Even distribution
    </Button>
  )
}

const RevenueDistributionSettings = () => {
  const { getValues } = useFormContext()
  const selectedGovOption = useAtomValue(selectedGovernanceOptionAtom)

  const settings = SETTINGS.filter(
    ({ field }) =>
      field !== 'governanceShare' ||
      selectedGovOption !== 'governanceWalletAddress'
  )

  return (
    <div className="flex flex-col gap-2 mx-2 mb-3">
      <RemainingAllocation />
      <div className="flex flex-col gap-2">
        {settings.map(({ title, description, field, disabled }) => (
          <div
            className="w-full rounded-xl flex items-center gap-2 justify-between p-4 bg-muted/70"
            key={title}
          >
            <div className="flex items-center gap-2">
              <div className="bg-muted-foreground/10 rounded-full">
                <Asterisk size={32} strokeWidth={1.5} />
              </div>

              <div className="flex flex-col">
                <div className="text-base font-bold">{title}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {description}
                </div>
              </div>
            </div>
            {disabled ? (
              <div className="flex justify-end items-center gap-1 font-semibold px-[18px] border-lg bg-muted-foreground/5 rounded-lg w-19 h-10 flex-nowrap">
                {getValues(field)} %
              </div>
            ) : (
              <BasicInput
                className="max-w-32"
                fieldName={field}
                label="%"
                placeholder="0"
                defaultValue={0}
                decimalPlaces={2}
              />
            )}
          </div>
        ))}
      </div>
      <AdditionalRevenueRecipients>
        <EvenDistributionButton />
      </AdditionalRevenueRecipients>
    </div>
  )
}

export default RevenueDistributionSettings
