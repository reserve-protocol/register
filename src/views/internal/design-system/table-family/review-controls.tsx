import { Button } from '@/components/button'
import { TabsList, TabsTrigger } from '@/components/design-system-v1/tabs'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/design-system-v1/select'
import { Switch } from '@/components/design-system-v1/switch'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'

export function ReviewControls({
  mode,
  onMode,
  constrained,
  onConstrained,
  ready,
  onReady,
  canReceive,
  onReceipt,
}: {
  mode: string
  onMode: (value: string) => void
  constrained: boolean
  onConstrained: (value: boolean) => void
  ready: boolean
  onReady: (value: boolean) => void
  canReceive: boolean
  onReceipt: () => void
}) {
  return (
    <div
      data-testid="table-review-controls"
      className="flex flex-wrap items-start gap-x-8 gap-y-6"
    >
      <div className="space-y-2">
        <p className={cn(type.supporting, 'text-supporting-foreground')}>
          Position type
        </p>
        <div className="flex min-h-11 items-center">
          <TabsList size="compact" aria-label="Position type">
            <TabsTrigger value="index" data-testid="table-family-index">
              Index DTFs
            </TabsTrigger>
            <TabsTrigger value="yield" data-testid="table-state-yield">
              Yield DTFs
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      <fieldset className="min-w-0 space-y-2">
        <legend className={cn(type.supporting, 'text-supporting-foreground')}>
          Preview conditions
        </legend>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Select value={mode} onValueChange={onMode}>
            <SelectTrigger
              size="compact"
              className="w-40"
              aria-label="Preview state"
              data-testid="table-preview-state"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries({
                default: 'Default',
                loading: 'Loading',
                pressure: 'Long content',
                empty: 'Empty',
              }).map(([value, label]) => (
                <SelectItem
                  key={value}
                  value={value}
                  data-testid={`table-state-${value}`}
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label
            className={cn(
              type.supporting,
              'flex min-h-11 cursor-pointer items-center gap-2'
            )}
          >
            <Switch
              data-testid="table-constrain"
              checked={constrained}
              onCheckedChange={onConstrained}
            />
            Constrained column
          </label>
        </div>
      </fieldset>
      <fieldset className="min-w-0 space-y-2">
        <legend className={cn(type.supporting, 'text-supporting-foreground')}>
          Withdrawal simulation
        </legend>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <label
            className={cn(
              type.supporting,
              'flex min-h-11 cursor-pointer items-center gap-2'
            )}
          >
            <Switch
              data-testid="table-deadline"
              checked={ready}
              onCheckedChange={onReady}
            />
            Elapsed deadlines
          </label>
          <Button
            size="compact"
            tone="secondary"
            data-testid="table-simulate-receipt"
            disabled={!canReceive}
            onClick={onReceipt}
          >
            Simulate receipt
          </Button>
        </div>
      </fieldset>
    </div>
  )
}
