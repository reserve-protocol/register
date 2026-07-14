import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { indexDTFStatusAtom } from '@/state/dtf/atoms'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { amountAtom, modeAtom } from '../atoms'

const MODE_LABELS: Record<'buy' | 'sell', MessageDescriptor> = {
  buy: msg`Buy`,
  sell: msg`Sell`,
}

const ModeSelector = () => {
  const { t } = useLingui()
  const [mode, setMode] = useAtom(modeAtom)
  const setAmount = useSetAtom(amountAtom)
  const isDeprecated = isInactiveDTF(useAtomValue(indexDTFStatusAtom))

  useEffect(() => {
    if (isDeprecated && mode === 'buy') {
      setMode('sell')
    }
  }, [isDeprecated])

  return (
    <ToggleGroup
      type="single"
      className="bg-muted-foreground/10 p-1 rounded-xl justify-start w-fit"
      value={mode}
      onValueChange={(value) => {
        if (isDeprecated && value === 'buy') return
        setMode(value as 'buy' | 'sell')
        setAmount('')
      }}
    >
      {(['buy', 'sell'] as const).map((option) => (
        <ToggleGroupItem
          key={option}
          value={option}
          data-testid={`issuance-mode-${option}`}
          disabled={isDeprecated && option === 'buy'}
          className="px-5 capitalize h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary flex-grow"
        >
          {t(MODE_LABELS[option])}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export default ModeSelector
