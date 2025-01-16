import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatPercentage } from '@/utils'
import BasicInput from '../../components/basic-input'
import { useFormContext } from 'react-hook-form'
import { Asterisk } from 'lucide-react'

const FOLIO_FEE_OPTIONS = [0, 0.25, 0.5, 1, 1.5, 2]

const FolioFeeSelector = () => {
  const { watch, setValue } = useFormContext()

  const resetField = () => {
    setValue('folioFee', '')
  }

  const resetCustomField = () => {
    setValue('customFolioFee', '')
  }

  return (
    <div className="rounded-xl flex flex-col gap-3 justify-between p-4 bg-muted/70 mx-4">
      <div className="flex items-center gap-2">
        <div className="bg-muted-foreground/10 rounded-full">
          <Asterisk size={32} strokeWidth={1.5} />
        </div>

        <div className="flex flex-col">
          <div className="text-base font-bold">Folio fee</div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Describe folio fee...
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mx-6 ">
        <ToggleGroup
          type="single"
          className="bg-muted-foreground/10 p-1 rounded-xl justify-start w-max"
          value={watch('folioFee').toString()}
          onValueChange={(value) => {
            const parsedValue = parseFloat(value)
            setValue('folioFee', isNaN(parsedValue) ? 0 : parsedValue)
            resetCustomField()
          }}
        >
          {FOLIO_FEE_OPTIONS.map((option) => (
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
          <BasicInput fieldName="customFolioFee" label="%" placeholder="0.00" />
        </div>
      </div>
    </div>
  )
}

export default FolioFeeSelector
