import { useAtomValue } from 'jotai'
import { DollarSign } from 'lucide-react'
import { basketAtom } from '../../atoms'
import BasicInput from './basic-input'

const FTokenValueInput = () => {
  return (
    <BasicInput
      fieldName="initialValue"
      label="USD"
      placeholder="Initial value"
      type="number"
    />
  )
}

const BasketValue = () => {
  const basket = useAtomValue(basketAtom)

  if (basket.length === 0) return null

  return (
    <div className="p-5 flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-muted/80 rounded-full">
          <DollarSign size={24} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col max-w-md">
          <span className="text-base font-bold">
            Approximate inital value of 1 $DTF
          </span>
          <span className="text-sm text-secondary-foreground">
            (Heads up about not using proper oracles & this being approximate
            values which will inform final units at deploy)
          </span>
        </div>
      </div>
      <div className="w-44">
        <FTokenValueInput />
      </div>
    </div>
  )
}

export default BasketValue
