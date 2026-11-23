import { Button } from '@/components/ui/button'
import { PlusIcon, XIcon } from 'lucide-react'
import BasicInput from '../../components/basic-input'
import { useFormContext } from 'react-hook-form'
import { Address } from 'viem'
import { ReactNode } from 'react'
import { Trans, useLingui } from '@lingui/react/macro'

type Recipient = {
  address: Address
  share: number
}

export type RecipientsField =
  | 'additionalRevenueRecipients'
  | 'permanentRevenueRecipients'

const AddRecipientButton = ({
  field,
  label,
}: {
  field: RecipientsField
  label: ReactNode
}) => {
  const { watch, setValue } = useFormContext()

  const onAdd = () => {
    setValue(field, [...(watch(field) ?? []), { address: '', share: 0 }])
  }

  return (
    <Button
      data-testid={`deploy-add-${field}`}
      variant="accent"
      className="flex gap-2 text-base pl-3 pr-4 py-7 rounded-xl bg-muted/80 w-full"
      onClick={onAdd}
    >
      <PlusIcon size={16} />
      {label}
    </Button>
  )
}

const RemoveRecipientButton = ({
  field,
  index,
}: {
  field: RecipientsField
  index: number
}) => {
  const { watch, setValue } = useFormContext()

  const onRemove = () => {
    const recipients = watch(field)
    setValue(
      field,
      recipients.filter((_: unknown, i: number) => i !== index)
    )
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

const AdditionalRevenueRecipient = ({
  field,
  index,
}: {
  field: RecipientsField
  index: number
}) => {
  const { t } = useLingui()
  return (
    <div className="w-full rounded-xl flex items-center gap-2 justify-between px-4 py-3 bg-muted/70">
      <div className="w-full flex flex-col sm:flex-row items-top gap-2">
        <BasicInput
          className="w-full"
          fieldName={`${field}[${index}].address`}
          label={t`Recipient ${index + 1} address`}
          placeholder="0x..."
        />
        <BasicInput
          className="sm:max-w-32"
          fieldName={`${field}[${index}].share`}
          label="%"
          placeholder="0"
          defaultValue={0}
          decimalPlaces={2}
        />
      </div>
      <RemoveRecipientButton field={field} index={index} />
    </div>
  )
}

const AdditionalRevenueRecipients = ({
  children,
  field = 'additionalRevenueRecipients',
  addLabel = <Trans>Add additional recipients</Trans>,
}: {
  children?: ReactNode
  field?: RecipientsField
  addLabel?: ReactNode
}) => {
  const { watch } = useFormContext()

  const recipients = (watch(field) ?? []) as Recipient[]

  return (
    <div className="flex flex-col gap-2">
      {recipients.map(({ address, share }, index) => (
        <div className="flex flex-col gap-2" key={`${index}${address}${share}`}>
          <AdditionalRevenueRecipient field={field} index={index} />
        </div>
      ))}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:mr-2">
        <div className="flex-1">
          <AddRecipientButton field={field} label={addLabel} />
        </div>
        {children}
      </div>
    </div>
  )
}

export default AdditionalRevenueRecipients
