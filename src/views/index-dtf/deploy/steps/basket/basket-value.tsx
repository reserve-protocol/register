import { useAtomValue } from 'jotai'
import { DollarSign } from 'lucide-react'
import { basketAtom } from '../../atoms'
import BasicInput from '../../components/basic-input'
import Ticker from '../../utils/ticker'

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
    <div className="p-5 px-6 flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-muted/80 rounded-full">
          <DollarSign size={24} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col max-w-md">
          <span className="text-base font-bold">Price at launch</span>
          <span className="text-sm text-secondary-foreground">
            The approximate value of 1 unit of <Ticker /> when the DTF is
            created. The exact price may be different due to market volatility
            and errors in oracle pricing.
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
