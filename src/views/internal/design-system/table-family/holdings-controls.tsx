import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/design-system-v1/select'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import type { HoldingsState } from './holdings-fixtures'

export type HoldingsWidth = 'full' | 'overview' | 'mobile'

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
  width,
  onWidth,
}: {
  dataset: 'cmc20' | 'photon'
  onDataset: (value: 'cmc20' | 'photon') => void
  state: HoldingsState
  onState: (value: HoldingsState) => void
  width: HoldingsWidth
  onWidth: (value: HoldingsWidth) => void
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
      <div className="space-y-2">
        <p className={type.supporting}>Preview width</p>
        <Select
          value={width}
          onValueChange={(value) => onWidth(value as HoldingsWidth)}
        >
          <SelectTrigger
            size="compact"
            className="w-56"
            aria-label="Holdings preview width"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full width</SelectItem>
            <SelectItem value="overview">DTF overview · 836px</SelectItem>
            <SelectItem value="mobile">Mobile · 390px</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
