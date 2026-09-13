import { useCallback, useState } from 'react'
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
import { OwnedTable } from './owned-table'
import { OwnedBoundary } from './owned-boundary'
import {
  previewOwned,
  type OwnedFamily,
  type OwnedPosition,
  type OwnedState,
} from './owned-fixtures'

export function OwnedPositionsReview() {
  const [family, setFamily] = useState<OwnedFamily>('lock')
  const [state, setState] = useState<OwnedState>('default')
  const [constrained, setConstrained] = useState(false)
  const [boundary, setBoundary] = useState<{
    row: OwnedPosition
    trigger: HTMLElement
  } | null>(null)
  const modify = useCallback(
    (row: OwnedPosition, trigger: HTMLElement) => setBoundary({ row, trigger }),
    []
  )
  return (
    <section
      id="owned-positions-review"
      data-testid="owned-positions-review"
      className="scroll-mt-40 space-y-6"
    >
      <div className="space-y-1">
        <h2 className={type.sectionTitle}>Portfolio</h2>
        <p className={cn(type.supporting, 'text-supporting-foreground')}>
          Source-backed identities with illustrative values—not live rates or
          balances. No transactions are submitted.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <div className="space-y-2">
          <p className={type.supporting}>Position type</p>
          <Select
            value={family}
            onValueChange={(value) => {
              setBoundary(null)
              setFamily(value as OwnedFamily)
            }}
          >
            <SelectTrigger
              size="compact"
              className="w-56"
              aria-label="Position type"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lock">Vote-locked positions</SelectItem>
              <SelectItem value="stake">Staked RSR Positions</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <p className={type.supporting}>Preview conditions</p>
          <Select
            value={state}
            onValueChange={(value) => {
              setBoundary(null)
              setState(value as OwnedState)
            }}
          >
            <SelectTrigger
              size="compact"
              className="w-56"
              aria-label="Preview state"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries({
                default: 'Default',
                loading: 'Loading',
                pending: 'Loading wallet position',
                missing: 'Zero / unavailable',
                long: 'Long content',
                empty: 'Empty',
              }).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label
          className={cn(type.supporting, 'flex min-h-11 items-center gap-2')}
        >
          <Switch checked={constrained} onCheckedChange={setConstrained} />
          Constrained column
        </label>
      </div>
      {state === 'empty' && (
        <p className={cn(type.supporting, 'text-supporting-foreground')}>
          Both sections are absent when their lists are empty. The Portfolio
          page’s wallet, error and no-activity states are outside this slice.
        </p>
      )}
      <div
        data-testid="owned-composition"
        className={cn(
          'min-w-0 bg-secondary [container-type:inline-size]',
          constrained && 'max-w-[390px]'
        )}
      >
        <OwnedTable
          key={family}
          family={family}
          rows={previewOwned(family, state)}
          loading={state === 'loading'}
          onModify={modify}
        />
      </div>
      <OwnedBoundary boundary={boundary} onClose={() => setBoundary(null)} />
    </section>
  )
}
