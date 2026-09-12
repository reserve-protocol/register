import { useCallback, useMemo, useRef, useState } from 'react'
import { EarnBoundary } from './earn-boundary'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/design-system-v1/accordion'
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
  previewEarn,
  type EarnFamily,
  type EarnRow,
  type EarnState,
} from './earn-fixtures'
import { EarnTable } from './earn-table'
import { DefiTable } from './defi-table'

const states: Record<EarnState, string> = {
  default: 'Default',
  loading: 'Loading opportunities',
  'wallet-loading': 'Loading wallet position',
  sparse: 'Sparse wallet positions',
  missing: 'Zero / unavailable',
  long: 'Long content',
  empty: 'Empty',
}

export function EarnReview() {
  const [family, setFamily] = useState<EarnFamily | 'defi'>('index')
  const [state, setState] = useState<EarnState>('default')
  const [wallet, setWallet] = useState(false)
  const [constrained, setConstrained] = useState(false)
  const [help, setHelp] = useState('')
  const helpTrigger = useRef<HTMLButtonElement>(null)
  const [boundary, setBoundary] = useState<{
    row: EarnRow
    trigger: HTMLElement
  } | null>(null)
  const open = useCallback(
    (row: EarnRow, trigger: HTMLElement) => setBoundary({ row, trigger }),
    []
  )
  const showHelp = useCallback(() => {
    setHelp('rate')
    helpTrigger.current?.focus({ preventScroll: true })
    helpTrigger.current?.scrollIntoView({
      block: 'nearest',
      behavior: 'instant',
    })
  }, [])
  const rows = useMemo(
    () => (family === 'defi' ? [] : previewEarn(family, state)),
    [family, state]
  )
  return (
    <section
      id="earn-family-review"
      data-testid="earn-review"
      className="scroll-mt-40 space-y-6"
    >
      <div className="space-y-1">
        <h2 className={type.sectionTitle}>Earn opportunities</h2>
        <p
          className={cn(
            type.supporting,
            'max-w-3xl text-supporting-foreground'
          )}
        >
          Index governance, Yield staking and DeFi Yield: token/value pairs,
          governed assets, APR/APY, pool rate breakdowns and wallet-dependent
          positions. Source-backed identities with illustrative values—not live
          rates or balances. No transactions are submitted.
        </p>
      </div>
      <div
        className="flex flex-wrap items-end gap-x-8 gap-y-4"
        data-testid="earn-controls"
      >
        <div className="space-y-2">
          <p className={type.supporting}>Opportunity family</p>
          <Select
            value={family}
            onValueChange={(value) => {
              setFamily(value as EarnFamily | 'defi')
              if (
                value === 'defi' &&
                (state === 'wallet-loading' || state === 'sparse')
              )
                setState('default')
            }}
          >
            <SelectTrigger
              size="compact"
              className="w-56"
              aria-label="Earn opportunity family"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="index">Index DTF Governance</SelectItem>
              <SelectItem value="yield">Yield DTF Staking</SelectItem>
              <SelectItem value="defi">DeFi Yield</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <p className={type.supporting}>Preview conditions</p>
          <Select
            value={state}
            onValueChange={(value) => setState(value as EarnState)}
          >
            <SelectTrigger
              size="compact"
              className="w-56"
              aria-label="Earn preview state"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(states)
                .filter(
                  ([value]) =>
                    family !== 'defi' ||
                    (value !== 'wallet-loading' && value !== 'sparse')
                )
                .map(([value, name]) => (
                  <SelectItem key={value} value={value}>
                    {name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        {family !== 'defi' && (
          <label
            className={cn(
              type.supporting,
              'flex min-h-11 cursor-pointer items-center gap-2'
            )}
          >
            <Switch checked={wallet} onCheckedChange={setWallet} />
            Wallet position
          </label>
        )}
        <label
          className={cn(
            type.supporting,
            'flex min-h-11 cursor-pointer items-center gap-2'
          )}
        >
          <Switch checked={constrained} onCheckedChange={setConstrained} />
          Constrained Earn column
        </label>
      </div>
      {(state === 'wallet-loading' || state === 'sparse') && !wallet && (
        <p role="status" className={type.supporting}>
          Turn on Wallet position to inspect{' '}
          {state === 'sparse' ? 'sparse holdings' : 'its loading state'}.
        </p>
      )}
      <div
        data-testid="earn-composition"
        className={cn('min-w-0 bg-card', constrained && 'max-w-[390px]')}
      >
        {family === 'defi' ? (
          <DefiTable state={state} />
        ) : (
          <EarnTable
            rows={rows}
            state={state}
            family={family}
            wallet={wallet}
            onOpen={open}
            onHelp={showHelp}
          />
        )}
      </div>
      {family === 'index' && (
        <div className="max-w-3xl space-y-2">
          <p className={cn(type.supporting, 'text-supporting-foreground')}>
            Rate-help interaction sample. The full Earn FAQ and transaction
            drawers remain outside this review.
          </p>
          <Accordion
            type="single"
            collapsible
            value={help}
            onValueChange={setHelp}
          >
            <AccordionItem value="rate">
              <AccordionTrigger ref={helpTrigger}>
                How is the estimated APY or APR calculated?
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <p>
                  The displayed rate estimates what would happen if the vault’s
                  recent reward pace continued for one year, based on rewards
                  distributed over approximately the last 30 days.
                </p>
                <p>
                  The estimate is not guaranteed. It changes when rewards, vault
                  deposits and withdrawals, token prices, or the calculation
                  window change.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
      <EarnBoundary boundary={boundary} onClose={() => setBoundary(null)} />
    </section>
  )
}
