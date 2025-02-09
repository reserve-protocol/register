import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAtom, useSetAtom } from 'jotai'
import { amountAtom, modeAtom } from '../atoms'

const ModeSelector = () => {
  const [mode, setMode] = useAtom(modeAtom)
  const setAmount = useSetAtom(amountAtom.debouncedValueAtom)

  return (
    <ToggleGroup
      type="single"
      className="bg-muted-foreground/10 p-1 rounded-xl justify-start w-fit"
      value={mode}
      onValueChange={(value) => {
        setMode(value as 'buy' | 'sell')
        setAmount('')
      }}
    >
      {['buy', 'sell'].map((option) => (
        <ToggleGroupItem
          key={option}
          value={option.toString()}
          className="px-5 capitalize h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary flex-grow"
        >
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export default ModeSelector
