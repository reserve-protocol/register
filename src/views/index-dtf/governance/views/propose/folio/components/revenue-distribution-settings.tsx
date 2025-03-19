import { useFormContext, useFieldArray } from 'react-hook-form'
import { GovernanceInputs } from '../schema'
import { Button } from '@/components/ui/button'
import { Landmark, LandPlot, Plus, TrainTrack, X } from 'lucide-react'
import { isAddressNotStrict } from '@/views/index-dtf/deploy/utils'
import { Decimal } from '@/views/index-dtf/deploy/utils/decimals'
import BasicInput from '@/views/index-dtf/deploy/components/basic-input'

type SettingConfig = {
  title: string
  description: string
  field: keyof GovernanceInputs
  icon: React.ReactNode
  disabled?: boolean
}

const SETTINGS: SettingConfig[] = [
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

const RemainingAllocation = () => {
  const { watch } = useFormContext<GovernanceInputs>()

  const fixedPlatformFee = watch('fixedPlatformFee') || 0
  const governanceShare = watch('governanceShare') || 0
  const deployerShare = watch('deployerShare') || 0
  const additionalRevenueRecipients = watch('additionalRevenueRecipients') || []

  const remaining = new Decimal(100).minus(
    new Decimal(fixedPlatformFee)
      .plus(new Decimal(governanceShare))
      .plus(new Decimal(deployerShare))
      .plus(
        additionalRevenueRecipients.reduce(
          (sum, recipient) => sum.plus(new Decimal(recipient.share || 0)),
          new Decimal(0)
        )
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

const RemoveRecipientButton = ({ onRemove }: { onRemove: () => void }) => {
  return (
    <div
      className="border border-muted-foreground/20 rounded-full p-1 hover:bg-muted-foreground/20 cursor-pointer"
      role="button"
      onClick={onRemove}
    >
      <X size={24} strokeWidth={1.5} />
    </div>
  )
}

const AddRecipientButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      type="button"
      variant="accent"
      className="flex gap-2 text-base pl-3 pr-4 py-7 rounded-xl bg-muted/80 w-full"
      onClick={onClick}
    >
      <Plus size={16} />
      Add additional recipients
    </Button>
  )
}

const RevenueDistributionSettings = () => {
  const { getValues, setValue, watch } = useFormContext<GovernanceInputs>()
  const { fields, append, remove } = useFieldArray<GovernanceInputs>({
    name: 'additionalRevenueRecipients',
  })

  const handleAddRecipient = () => {
    const emptyAddress =
      '0x0000000000000000000000000000000000000000' as `0x${string}`
    append({ address: emptyAddress, share: 0 })
  }

  const handleEvenDistribution = () => {
    const fixedPlatformFee = getValues('fixedPlatformFee') || 0
    const additionalRecipients = getValues('additionalRevenueRecipients') || []

    // Always include deployer and governance shares
    const participantsCount = 2 + additionalRecipients.length

    const remainingPercentage = new Decimal(100).minus(fixedPlatformFee)
    const baseShare =
      Math.floor((remainingPercentage.value / participantsCount) * 100) / 100
    const totalPercentage = baseShare * (participantsCount - 1)
    const lastShare = +(remainingPercentage.value - totalPercentage).toFixed(2)

    setValue('deployerShare', baseShare)
    setValue('governanceShare', baseShare)

    if (additionalRecipients.length > 0) {
      setValue(
        'additionalRevenueRecipients',
        additionalRecipients.map((recipient, index) => ({
          ...recipient,
          share:
            index === additionalRecipients.length - 1 ? lastShare : baseShare,
        }))
      )
    }
  }

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
                {String(getValues(field))} %
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

      <div className="flex flex-col gap-2 mt-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="w-full rounded-xl flex items-center gap-2 justify-between px-4 py-3 bg-muted/70"
          >
            <div className="w-full flex items-top gap-2">
              <BasicInput
                className="w-full"
                fieldName={`additionalRevenueRecipients.${index}.address`}
                label={`Recipient ${index + 1} address`}
                placeholder="0x..."
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value
                  if (isAddressNotStrict(value)) {
                    return value
                  }
                  return field.address
                }}
              />
              <BasicInput
                className="max-w-32"
                fieldName={`additionalRevenueRecipients.${index}.share`}
                label="%"
                placeholder="0"
                defaultValue={0}
                decimalPlaces={2}
              />
            </div>
            <RemoveRecipientButton onRemove={() => remove(index)} />
          </div>
        ))}

        <div className="flex items-center gap-2 mr-2">
          <div className="flex-1">
            <AddRecipientButton onClick={handleAddRecipient} />
          </div>
          <Button
            type="button"
            variant="accent"
            className="flex gap-2 text-base pl-3 pr-4 rounded-xl text-nowrap w-48 py-7 bg-muted/80"
            onClick={handleEvenDistribution}
          >
            Even distribution
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RevenueDistributionSettings
