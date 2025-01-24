import { Button } from '@/components/ui/button'
import { PlusIcon, XIcon } from 'lucide-react'
import BasicInput from '../../components/basic-input'
import { useFormContext } from 'react-hook-form'
import { Address } from 'viem'

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
      className="flex gap-2 text-base pl-3 pr-4 py-7 rounded-xl bg-muted/80"
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
        />
      </div>
      <RemoveRecipientButton index={index} />
    </div>
  )
}

const AdditionalRevenueRecipients = () => {
  const { watch } = useFormContext()

  const recipients = watch('additionalRevenueRecipients') as Recipient[]

  return (
    <div className="flex flex-col gap-2">
      {recipients.map(({ address, share }, index) => (
        <div className="flex flex-col gap-2" key={`${index}${address}${share}`}>
          <AdditionalRevenueRecipient index={index} />
        </div>
      ))}
      <AddRecipientButton />
    </div>
  )
}

export default AdditionalRevenueRecipients
