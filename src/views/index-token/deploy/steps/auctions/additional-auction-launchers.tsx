import { Button } from '@/components/ui/button'
import { PlusIcon, XIcon } from 'lucide-react'
import BasicInput from '../../components/basic-input'
import { useFormContext } from 'react-hook-form'
import { Address } from 'viem'

const AddRecipientButton = () => {
  const { watch, setValue } = useFormContext()

  const onAdd = () => {
    setValue('additionalAuctionLaunchers', [
      ...watch('additionalAuctionLaunchers'),
      '',
    ])
  }

  return (
    <Button
      variant="accent"
      className="flex gap-2 text-base pl-3 pr-4 py-7 rounded-xl bg-transparent border border-border"
      onClick={onAdd}
    >
      <PlusIcon size={16} />
      Add additional auction launcher
    </Button>
  )
}

const RemoveRecipientButton = ({ index }: { index: number }) => {
  const { watch, setValue } = useFormContext()

  const onRemove = () => {
    const recipients = watch('additionalAuctionLaunchers')
    recipients.splice(index, 1)
    setValue('additionalAuctionLaunchers', recipients)
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

const AdditionalAuctionLauncher = ({ index }: { index: number }) => {
  return (
    <div className="w-full rounded-xl flex items-center gap-2 justify-between py-1">
      <BasicInput
        className="w-full"
        fieldName={`additionalAuctionLaunchers[${index}]`}
        label={`Additional address ${index + 1} `}
        placeholder="0x..."
        defaultValue={''}
      />
      <RemoveRecipientButton index={index} />
    </div>
  )
}

const AdditionalAuctionLaunchers = () => {
  const { watch } = useFormContext()

  const recipients = watch('additionalAuctionLaunchers') as Address[]

  return (
    <div className="flex flex-col gap-2">
      {recipients.map((address, index) => (
        <div className="flex flex-col gap-2" key={`${index}${address}`}>
          <AdditionalAuctionLauncher index={index} />
        </div>
      ))}
      <AddRecipientButton />
    </div>
  )
}

export default AdditionalAuctionLaunchers
