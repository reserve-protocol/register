import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatPercentage } from '@/utils'
import BasicInput from '../../components/basic-input'
import { useFormContext } from 'react-hook-form'

const DEMURRAGE_OPTIONS = [0, 0.25, 0.5, 1, 1.5, 2]

const DemurrageFeeSelector = () => {
  const { watch, setValue } = useFormContext()

  const resetField = () => {
    setValue('demurrageFee', '')
  }

  const resetCustomField = () => {
    setValue('customDemurrageFee', '')
  }

  return (
    <div className="flex items-center gap-2 mx-6 mb-6">
      <ToggleGroup
        type="single"
        className="bg-muted/60 p-1 rounded-xl justify-start w-max"
        value={watch('demurrageFee').toString()}
        onValueChange={(value) => {
          const parsedValue = parseFloat(value)
          setValue('demurrageFee', isNaN(parsedValue) ? 0 : parsedValue)
          resetCustomField()
        }}
      >
        {DEMURRAGE_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option}
            value={option.toString()}
            aria-label={`Toggle ${option}`}
            className="px-4 rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
          >
            {formatPercentage(option)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="w-24" onClick={resetField} role="button">
        <BasicInput
          fieldName="customDemurrageFee"
          label="%"
          placeholder="0.00"
        />
      </div>
    </div>
  )
}

export default DemurrageFeeSelector
