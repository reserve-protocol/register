import { useState } from 'react'
import { Button } from '@/components/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/dialog'
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
  CURRENT_SCENARIOS,
  DATA_STATES,
  OUTCOMES,
  SOURCE_RECORDS,
  LIQUIDITY_RECORD,
  VIEWERS,
  type DataState,
  type Outcome,
  type Viewer,
} from './fixtures'
import { CurrentWorkspace } from './workspace'
import { Skeleton } from '@/components/design-system-v1/loading'
import { useCurrentScene } from './use-scene'
import type { HistoricalRebalance } from '../auctions-browse/history-model'

export function CurrentRebalanceReview({
  constrained,
  onArchive,
}: {
  constrained: boolean
  onArchive: (row: HistoricalRebalance) => void
}) {
  const {
    root,
    scenario,
    pendingScene,
    requestScene,
    cancelScene,
    confirmScene,
  } = useCurrentScene()
  const [viewer, setViewer] = useState<Viewer>('launcher')
  const [data, setData] = useState<DataState>('ready')
  const [outcome, setOutcome] = useState<Outcome>('success')
  const [network, setNetwork] = useState(true)
  const [playing, setPlaying] = useState(false)
  const records = ['empty', 'loading', 'not-found'].includes(scenario)
    ? []
    : scenario === 'multiple'
      ? [SOURCE_RECORDS.cmc20, SOURCE_RECORDS.lcap]
      : [
          scenario.startsWith('liquidity')
            ? LIQUIDITY_RECORD
            : SOURCE_RECORDS[scenario === 'hybrid' ? 'lcap' : 'cmc20'],
        ]
  return (
    <div
      ref={root}
      data-testid="current-rebalance-review"
      className="space-y-4"
    >
      <div className="flex flex-wrap items-end gap-4">
        <PreviewSelect
          id="current-scene"
          label="Current rebalance"
          value={scenario}
          choices={CURRENT_SCENARIOS}
          onChange={requestScene}
        />
        <PreviewSelect
          id="current-viewer"
          label="Viewer"
          value={viewer}
          choices={VIEWERS}
          onChange={setViewer}
        />
      </div>
      <details className={cn(type.supporting, 'text-muted-foreground')}>
        <summary className="min-h-11 cursor-pointer py-3">
          Data and simulation
        </summary>
        <div className="flex flex-wrap items-end gap-4 py-3">
          <PreviewSelect
            id="current-data"
            label="Data"
            value={data}
            choices={DATA_STATES}
            onChange={setData}
          />
          <PreviewSelect
            id="current-outcome"
            label="Launch outcome"
            value={outcome}
            choices={OUTCOMES}
            onChange={setOutcome}
          />
          <label className="flex min-h-11 items-center gap-2">
            <Switch
              checked={!network}
              onCheckedChange={(value) => setNetwork(!value)}
              data-testid="current-wrong-network"
            />
            Wrong network
          </label>
          <label className="flex min-h-11 items-center gap-2">
            <Switch
              checked={playing}
              onCheckedChange={setPlaying}
              data-testid="current-clock"
            />
            Run preview clock
          </label>
        </div>
      </details>
      <p
        data-testid="current-fixture-note"
        className={cn(type.supporting, 'max-w-3xl text-muted-foreground')}
      >
        Snapshot identities; illustrative metrics, assets traded and bids. All
        actions simulate the flow in this tab. No wallet request or transaction
        is sent.
        {scenario.startsWith('liquidity') &&
          ' Liquidity pressure adds NVDAon from the BUILDOUT snapshot; this is not a CMC20 holding. Liquidity responses and effective auction size are illustrative, not computed quotes.'}
      </p>
      <div className={cn('space-y-4', constrained && 'max-w-[390px]')}>
        <h3 className={cn(type.supporting, 'text-muted-foreground')}>
          Current Rebalances
        </h3>
        {records.map((record) => (
          <CurrentWorkspace
            key={`${record.address}-${scenario}`}
            record={record}
            scenario={scenario}
            viewer={viewer}
            data={data}
            outcome={outcome}
            network={network}
            playing={playing}
            onConnect={() => setViewer('launcher')}
            onNetwork={() => setNetwork(true)}
            onArchive={onArchive}
          />
        ))}
        {scenario === 'loading' && (
          <Skeleton
            data-testid="current-list-loading"
            className="h-52 w-full"
          />
        )}
        {scenario === 'not-found' && (
          <p className={type.supporting}>
            Lab: no proposal matches this route. No launch state is inferred.
          </p>
        )}
        {!records.length && scenario !== 'loading' && (
          <p className={cn(type.body, 'bg-card p-6 text-muted-foreground')}>
            No rebalances found
          </p>
        )}
      </div>
      <Dialog
        open={pendingScene !== null}
        onOpenChange={(open) => {
          if (!open) cancelScene()
        }}
      >
        <DialogContent width="compact">
          <DialogHeader>
            <DialogTitle>Lab: reset this preview?</DialogTitle>
            <DialogDescription>
              This discards the open draft or local operation and stops the
              simulated browser filler. No real transaction will be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-wrap justify-end gap-2">
            <Button
              tone="secondary"
              data-testid="current-guard-stay"
              onClick={cancelScene}
            >
              Cancel
            </Button>
            <Button data-testid="current-guard-leave" onClick={confirmScene}>
              Reset preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PreviewSelect<T extends string>({
  id,
  label,
  value,
  choices,
  onChange,
}: {
  id: string
  label: string
  value: T
  choices: Record<T, string>
  onChange: (value: T) => void
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label
        htmlFor={id}
        className={cn(type.supporting, 'text-muted-foreground')}
      >
        {label}
      </label>
      <Select value={value} onValueChange={(value) => onChange(value as T)}>
        <SelectTrigger id={id} data-testid={id} className="w-64 max-w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries<string>(choices).map(([key, name]) => (
            <SelectItem key={key} value={key} data-testid={`${id}-${key}`}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
