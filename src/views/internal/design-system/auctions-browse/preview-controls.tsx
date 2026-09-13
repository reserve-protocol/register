import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import { Switch } from '@/components/design-system-v1/switch'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import {
  AUCTION_PHASES,
  PREVIEW_STATES,
  type AuctionPhase,
  type AuctionsRun,
  type PreviewState,
} from './fixtures'

export interface BrowsePreview {
  mode: PreviewState
  phase: AuctionPhase
  auctionsRun: AuctionsRun
  launcherWallet: boolean
  constrained: boolean
}

export function PreviewControls({
  value,
  onChange,
}: {
  value: BrowsePreview
  onChange: (patch: Partial<BrowsePreview>) => void
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
      <PreviewSelect
        id="rebalance-preview-state"
        optionPrefix="rebalance-state"
        label="Preview state"
        value={value.mode}
        options={PREVIEW_STATES}
        onChange={(mode) => onChange({ mode: mode as PreviewState })}
      />
      <PreviewSelect
        id="rebalance-preview-phase"
        optionPrefix="rebalance-phase"
        label="Auction phase"
        value={value.phase}
        options={AUCTION_PHASES}
        onChange={(phase) => onChange({ phase: phase as AuctionPhase })}
      />
      <PreviewSelect
        id="rebalance-auctions-run"
        optionPrefix="rebalance-auctions-run"
        label="Auctions run"
        value={String(value.auctionsRun)}
        options={{ 0: '0', 1: '1', 2: '2' }}
        onChange={(count) =>
          onChange({ auctionsRun: Number(count) as AuctionsRun })
        }
      />
      <label
        className={cn(
          type.supporting,
          'flex min-h-11 cursor-pointer items-center gap-2'
        )}
      >
        <Switch
          checked={value.launcherWallet}
          onCheckedChange={(launcherWallet) => onChange({ launcherWallet })}
          data-testid="rebalance-launcher-wallet"
        />
        Connected launcher wallet
      </label>
      <label
        className={cn(
          type.supporting,
          'flex min-h-11 cursor-pointer items-center gap-2'
        )}
      >
        <Switch
          checked={value.constrained}
          onCheckedChange={(constrained) => onChange({ constrained })}
          data-testid="rebalance-constrain"
        />
        Constrained column · 390px
      </label>
    </div>
  )
}

function PreviewSelect({
  id,
  optionPrefix,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  optionPrefix: string
  label: string
  value: string
  options: Record<string, string>
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className={cn(type.supporting, 'text-muted-foreground')}
      >
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          data-testid={id}
          className={
            id === 'rebalance-preview-state' ? 'w-72 max-w-full' : 'w-48'
          }
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(options).map(([option, text]) => (
            <SelectItem
              key={option}
              value={option}
              data-testid={`${optionPrefix}-${option}`}
            >
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
