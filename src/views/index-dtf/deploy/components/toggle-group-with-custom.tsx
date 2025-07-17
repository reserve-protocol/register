import { ReactNode } from 'react'
import BasicInput from './basic-input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import WarningBanner from './warning-banner'

type ToggleGroupWithCustomProps = {
  title: string
  description: ReactNode
  icon: ReactNode
  options: number[]
  optionsFormatter: (option: number) => string
  fieldName: string
  customLabel: string
  customPlaceholder: string
  warningMessage?: ReactNode
  inputProps?: React.ComponentProps<typeof Input>
  decimalPlaces?: number
}

const CustomInput = ({
  fieldName,
  customLabel,
  customPlaceholder,
  inputProps,
  decimalPlaces = 2,
}: Pick<
  ToggleGroupWithCustomProps,
  'fieldName' | 'customLabel' | 'customPlaceholder' | 'inputProps' | 'decimalPlaces'
>) => {
  const { clearErrors } = useFormContext()
  return (
    <div className="w-full max-w-48">
      <BasicInput
        type="number"
        fieldName={fieldName}
        label={customLabel}
        placeholder={customPlaceholder}
        decimalPlaces={decimalPlaces}
        inputProps={{
          onKeyDown: () => clearErrors(fieldName),
          ...inputProps,
        }}
      />
    </div>
  )
}

const ToggleGroupSelector = ({
  fieldName,
  options,
  optionsFormatter,
}: Pick<
  ToggleGroupWithCustomProps,
  'fieldName' | 'options' | 'optionsFormatter'
>) => {
  const { watch, setValue, clearErrors } = useFormContext()

  return (
    <ToggleGroup
      type="single"
      className="bg-muted-foreground/10 p-1 rounded-xl justify-start w-fit max-w-full overflow-x-auto"
      value={watch(fieldName)?.toString() || ''}
      onValueChange={(value) => {
        clearErrors(fieldName)
        const parsedValue = parseFloat(value)
        if (!isNaN(parsedValue)) {
          setValue(fieldName, parsedValue)
        }
      }}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option}
          value={option.toString()}
          className="px-5 h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
        >
          {optionsFormatter(option)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

const ToggleGroupWithCustom = ({
  title,
  description,
  icon,
  options,
  optionsFormatter,
  fieldName,
  customLabel,
  customPlaceholder,
  warningMessage,
  inputProps,
  decimalPlaces,
}: ToggleGroupWithCustomProps) => (
  <div
    className="w-full rounded-xl flex flex-col gap-3 justify-between p-4 bg-muted/70"
    key={title}
  >
    <div className="flex items-center gap-2">
      <div className="p-2 border border-foreground rounded-full">{icon}</div>

      <div className="flex flex-col">
        <div className="text-base font-bold">{title}</div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {description}
        </div>
      </div>
    </div>
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <ToggleGroupSelector
        fieldName={fieldName}
        options={options}
        optionsFormatter={optionsFormatter}
      />
      <CustomInput
        fieldName={fieldName}
        customLabel={customLabel}
        customPlaceholder={customPlaceholder}
        inputProps={inputProps}
        decimalPlaces={decimalPlaces}
      />
    </div>
    {!!warningMessage && (
      <div className="-mt-3">
        <WarningBanner title="Caution" description={warningMessage} />
      </div>
    )}
  </div>
)

export default ToggleGroupWithCustom
