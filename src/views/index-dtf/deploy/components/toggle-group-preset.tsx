import { useMemo, useState } from 'react'
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

const presetValues = ['slow', 'fast', 'very-fast', 'custom'] as const
type Preset = (typeof presetValues)[number]

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
      VotingDelay: 1,
      VotingPeriod: 23,
      VotingThreshold: 0.1,
      VotingQuorum: 10,
      ExecutionDelay: 24,
    },
    'very-fast': {
      VotingDelay: 1,
      VotingPeriod: 1,
      VotingThreshold: 1,
      VotingQuorum: 20,
      ExecutionDelay: 0.25,
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

const reverseMap = (section: 'basket' | 'governance') => {
  const map: Map<string, Preset> = new Map()
  const values = presets[section]
  for (const preset of presetValues) {
    if (preset === 'custom') continue
    const key: number[] = []
    for (const field of fields) {
      const v = values[preset][field]
      key.push(v)
    }
    map.set(key.toString(), preset)
  }

  return map
}

type ToggleGroupPresetProps = {
  section: 'basket' | 'governance'
}

export const ToggleGroupPreset = ({ section }: ToggleGroupPresetProps) => {
  const [force, setForce] = useState(false)
  const { watch, setValue, clearErrors } = useFormContext()

  const key = makeFields(section).map(watch)
  const map = useMemo(() => reverseMap(section), [section])

  return (
    <div className="px-2 mb-2">
      <ToggleGroup
        type="single"
        className="bg-muted-foreground/10 p-1 rounded-xl justify-start w-full"
        value={force ? 'custom' : map.get(key.toString()) || 'custom'}
        onValueChange={(value: Preset) => {
          setForce(value === 'custom')
          if (value === 'custom') {
            return
          }
          const preset = presets[section][value]
          for (const [field, value] of Object.entries(preset)) {
            clearErrors(field)
            setValue(section + field, value)
          }
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
