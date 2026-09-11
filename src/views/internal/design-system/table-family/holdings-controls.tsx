import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/design-system-v1/select'
import { Switch } from '@/components/design-system-v1/switch'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import type { HoldingsState } from './holdings-fixtures'

const states: Record<HoldingsState, string> = {
  default: 'Default',
  loading: 'Loading basket',
  'performance-loading': 'Loading performance',
  missing: 'Zero / unavailable',
  new: 'Newly added asset',
  long: 'Long content',
  empty: 'Empty',
}

export function HoldingsControls({
  dataset,
  onDataset,
  state,
  onState,
  constrained,
  onConstrained,
}: {
  dataset: 'cmc20' | 'photon'
  onDataset: (value: 'cmc20' | 'photon') => void
  state: HoldingsState
  onState: (value: HoldingsState) => void
  constrained: boolean
  onConstrained: (value: boolean) => void
}) {
  return (
    <div
      className="flex flex-wrap items-end gap-x-8 gap-y-4"
      data-testid="holdings-controls"
    >
      <div className="space-y-2">
        <p className={type.supporting}>Basket fixture</p>
        <Select
          value={dataset}
          onValueChange={(value) => onDataset(value as 'cmc20' | 'photon')}
        >
          <SelectTrigger
            size="compact"
            className="w-48"
            aria-label="Basket fixture"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cmc20">CMC20 · Crypto</SelectItem>
            <SelectItem value="photon">PHOTON · Stocks</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <p className={type.supporting}>Preview conditions</p>
        <Select
          value={state}
          onValueChange={(value) => onState(value as HoldingsState)}
        >
          <SelectTrigger
            size="compact"
            className="w-56"
            aria-label="Holdings preview state"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(states).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <label
        className={`flex min-h-11 cursor-pointer items-center gap-2 ${type.supporting}`}
      >
        <Switch checked={constrained} onCheckedChange={onConstrained} />
        Constrained holdings column
      </label>
    </div>
  )
}
