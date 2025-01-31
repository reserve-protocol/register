import { Button } from '@/components/ui/button'
import { PlusIcon, XIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import BasicInput from '@/views/index-dtf/deploy/components/basic-input'

export interface BasicInputWithAdditionalProps {
  fieldName: string
  inputLabel: string
  placeholder: string
  defaultValue?: string
  buttonLabel?: string
}

const AddButton = ({
  fieldName,
  buttonLabel,
}: Pick<BasicInputWithAdditionalProps, 'fieldName' | 'buttonLabel'>) => {
  const { watch, setValue } = useFormContext()

  const onAdd = () => {
    setValue(fieldName, [...watch(fieldName), ''])
  }

  return (
    <Button
      variant="accent"
      className="flex gap-2 text-base pl-3 pr-4 py-7 rounded-xl bg-transparent border border-border"
      onClick={onAdd}
    >
      <PlusIcon size={16} />
      {buttonLabel}
    </Button>
  )
}

const RemoveButton = ({
  fieldName,
  index,
}: {
  fieldName: string
  index: number
}) => {
  const { watch, setValue } = useFormContext()

  const onRemove = () => {
    const items = watch(fieldName)
    items.splice(index, 1)
    setValue(fieldName, items)
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

const InputWithAdditional = ({
  fieldName,
  inputLabel,
  placeholder = '0x...',
  defaultValue = '',
  index,
}: BasicInputWithAdditionalProps & {
  index: number
}) => {
  return (
    <div className="w-full rounded-xl flex items-center gap-2 justify-between py-1">
      <BasicInput
        className="w-full"
        fieldName={`${fieldName}[${index}]`}
        label={`${inputLabel} ${index + 1}`}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
      <RemoveButton fieldName={fieldName} index={index} />
    </div>
  )
}

const BasicInputWithAdditional = ({
  fieldName,
  buttonLabel,
  inputLabel,
  placeholder,
  defaultValue,
}: BasicInputWithAdditionalProps) => {
  const { watch } = useFormContext()

  const items = watch(fieldName) as string[]

  return (
    <div className="flex flex-col gap-2">
      <BasicInput
        className="w-full"
        fieldName={`${fieldName}[0]`}
        label={inputLabel}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />

      {items.length >= 1 &&
        items.slice(1).map((item, index) => (
          <div className="flex flex-col gap-2" key={`${index + 1}${item}`}>
            <InputWithAdditional
              fieldName={fieldName}
              inputLabel={inputLabel}
              placeholder={placeholder}
              defaultValue={defaultValue}
              index={index + 1}
            />
          </div>
        ))}
      <AddButton fieldName={fieldName} buttonLabel={buttonLabel} />
    </div>
  )
}

export default BasicInputWithAdditional
