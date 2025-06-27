import { Button } from '@/components/ui/button'
import BasicInput from '@/views/index-dtf/deploy/components/basic-input'
import { Decimal } from '@/views/index-dtf/deploy/utils/decimals'
import { Landmark, LandPlot, PlusIcon, TrainTrack, XIcon } from 'lucide-react'
import { ReactNode, useCallback } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Address } from 'viem'
import { cn } from '@/lib/utils'

type Recipient = {
  address: Address
  share: number
}

const AddRecipientButton = () => {
  const { watch, setValue } = useFormContext()

  const onAdd = () => {
    setValue('additionalRevenueRecipients', [
      ...watch('additionalRevenueRecipients'),
      { address: '', share: 0 },
    ])
  }

  return (
    <Button
      variant="accent"
      className="flex gap-2 text-base pl-3 pr-4 py-7 rounded-xl bg-muted/80 w-full"
      onClick={onAdd}
    >
      <PlusIcon size={16} />
      Add additional recipients
    </Button>
  )
}

const RemoveRecipientButton = ({ index }: { index: number }) => {
  const { watch, setValue } = useFormContext()

  const onRemove = () => {
    const recipients = watch('additionalRevenueRecipients')
    recipients.splice(index, 1)
    setValue('additionalRevenueRecipients', recipients)
  }

  return (
    <div
      className="border border-muted-foreground/20 rounded-full p-1 hover:bg-muted-foreground/20"
      role="button"
      onClick={onRemove}
    >
      <XIcon size={24} strokeWidth={1.5} />
    </div>
  )
}

const AdditionalRevenueRecipient = ({ index }: { index: number }) => {
  return (
    <div className="w-full rounded-xl flex items-center gap-2 justify-between px-4 py-3 bg-muted/70">
      <div className="w-full flex items-top gap-2">
        <BasicInput
          className="w-full"
          fieldName={`additionalRevenueRecipients[${index}].address`}
          label={`Recipient ${index + 1} address`}
          placeholder="0x..."
        />
        <BasicInput
          className="max-w-32"
          fieldName={`additionalRevenueRecipients[${index}].share`}
          label="%"
          placeholder="0"
          defaultValue={0}
          decimalPlaces={2}
        />
      </div>
      <RemoveRecipientButton index={index} />
    </div>
  )
}

const AdditionalRevenueRecipients = ({ children }: { children: ReactNode }) => {
  const { watch } = useFormContext()

  const recipients = watch('additionalRevenueRecipients') as Recipient[]

  return (
    <div className="flex flex-col gap-2">
      {recipients?.map(({ address, share }, index) => (
        <div className="flex flex-col gap-2" key={`${index}${address}${share}`}>
          <AdditionalRevenueRecipient index={index} />
        </div>
      ))}
      <div className="flex items-center gap-2 mr-2">
        <div className="flex-1">
          <AddRecipientButton />
        </div>
        {children}
      </div>
    </div>
  )
}

const SETTINGS = [
  {
    title: 'Platform',
    description:
      'Percentage of fee revenue sent to the protocol; cannot be changed by governance.',
    field: 'fixedPlatformFee',
    icon: <TrainTrack size={14} strokeWidth={1.5} />,
    disabled: true,
  },
  {
    title: 'Creator',
    description: 'Percentage of fee revenue sent to the creator of the DTF.',
    icon: <Landmark size={14} strokeWidth={1.5} />,
    field: 'deployerShare',
  },
  {
    title: 'Governance',
    icon: <LandPlot size={14} strokeWidth={1.5} />,
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
  const { watch, formState: { errors } } = useFormContext()

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
  const hasError = remaining.value !== 0

  return (
    <div className="flex flex-col gap-2">
      <div className="text-base ml-auto px-4">
        <span className="text-muted-foreground">Remaining allocation:</span>{' '}
        <span className={cn(
          hasError ? 'text-destructive' : 'text-success',
          'font-medium'
        )}>
          {isNegative ? `-${displayValue}` : displayValue}%
        </span>
      </div>
      {errors['revenue-distribution'] && (
        <div className="text-sm text-destructive px-4 text-right">
          {errors['revenue-distribution'].message}
        </div>
      )}
    </div>
  )
}

const EvenDistributionButton = () => {
  const { setValue, getValues } = useFormContext()

  const onEvenDistribution = useCallback(() => {
    const fixedPlatformFee = getValues('fixedPlatformFee') || 0
    const additionalRecipients = getValues('additionalRevenueRecipients') || []
    const isAdditionalRecipientsPresent = additionalRecipients.length > 0

    const participantsCount = [
      true, // deployerShare
      true, // governanceShare
      ...additionalRecipients.map(Boolean),
    ].filter(Boolean).length

    const remainingPercentage = new Decimal(100).minus(fixedPlatformFee)
    const baseShare =
      Math.floor((remainingPercentage.value / participantsCount) * 100) / 100
    const totalPercentage = baseShare * (participantsCount - 1)
    const lastShare = +(remainingPercentage.value - totalPercentage).toFixed(2)

    setValue('deployerShare', baseShare)
    setValue('governanceShare', baseShare)

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
  }, [getValues, setValue])

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

const ProposeRevenueDistribution = () => {
  const { getValues } = useFormContext()

  return (
    <div className="flex flex-col gap-2 mx-2 mb-3">
      <RemainingAllocation />
      <div className="flex flex-col gap-2">
        {SETTINGS.map(({ title, description, field, icon, disabled }) => (
          <div
            className="w-full rounded-xl flex items-center gap-2 justify-between p-4 bg-muted/70"
            key={title}
          >
            <div className="flex items-center gap-2">
              <div className="p-2 border border-foreground rounded-full">
                {icon}
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

export default ProposeRevenueDistribution
