import { useState, useEffect } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useFormContext } from 'react-hook-form'
import { FastForward, SlidersHorizontal, Snail, Zap } from 'lucide-react'

const OPTIONS = [
  {
    value: 'slow',
    label: 'Slow',
    icon: <Snail />,
  },
  {
    value: 'fast',
    label: 'Fast',
    icon: <FastForward />,
  },
  {
    value: 'very-fast',
    label: 'Very Fast',
    icon: <Zap />,
  },
  {
    value: 'custom',
    label: 'Custom',
    icon: <SlidersHorizontal />,
  },
] as const

const fields = [
  'VotingDelay',
  'VotingPeriod',
  'VotingThreshold',
  'VotingQuorum',
  'ExecutionDelay',
] as const

const makeFields = (section: 'basket' | 'governance') => {
  return fields.map((f) => section + f)
}

type Preset = (typeof OPTIONS)[number]['value']

const presets = {
  basket: {
    slow: {
      VotingDelay: 48,
      VotingPeriod: 72,
      VotingThreshold: 0.01,
      VotingQuorum: 10,
      ExecutionDelay: 48,
    },
    fast: {
      VotingDelay: 24,
      VotingPeriod: 24,
      VotingThreshold: 0.1,
      VotingQuorum: 10,
      ExecutionDelay: 24,
    },
    'very-fast': {
      VotingDelay: 24,
      VotingPeriod: 24,
      VotingThreshold: 1,
      VotingQuorum: 20,
      ExecutionDelay: 24,
    },
  },
  governance: {
    slow: {
      VotingDelay: 2,
      VotingPeriod: 3,
      VotingThreshold: 0.01,
      VotingQuorum: 10,
      ExecutionDelay: 2,
    },
    fast: {
      VotingDelay: 1,
      VotingPeriod: 1,
      VotingThreshold: 0.1,
      VotingQuorum: 10,
      ExecutionDelay: 1,
    },
    'very-fast': {
      VotingDelay: 1,
      VotingPeriod: 1,
      VotingThreshold: 1,
      VotingQuorum: 20,
      ExecutionDelay: 1,
    },
  },
} as const

type ToggleGroupPresetProps = {
  section: 'basket' | 'governance'
}

export const ToggleGroupPreset = ({ section }: ToggleGroupPresetProps) => {
  const [freeze, setFreeze] = useState(false)
  const [preset, setPreset] = useState<Preset>('slow')
  const { watch, setValue, clearErrors } = useFormContext()

  const fields = makeFields(section).map(watch)

  useEffect(() => {
    if (!freeze) {
      setPreset('custom')
    }
  }, fields)

  return (
    <div className="px-2 mb-2">
      <ToggleGroup
        type="single"
        className="bg-muted-foreground/10 p-1 rounded-xl justify-start w-full"
        value={preset}
        onValueChange={(value: Preset) => {
          setPreset(value)
          setFreeze(true)
          if (value !== 'custom') {
            const preset = presets[section][value]
            for (const [field, value] of Object.entries(preset)) {
              clearErrors(field)
              setValue(section + field, value)
            }
          }
          setTimeout(() => setFreeze(false), 1)
        }}
      >
        {OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="flex-grow px-5 h-12 whitespace-nowrap rounded-lg data-[state=on]:bg-card data-[state=on]:shadow-sm text-secondary-foreground/80 data-[state=on]:text-primary"
          >
            {option.icon} {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
