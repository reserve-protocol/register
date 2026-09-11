import { useCallback, useState } from 'react'
import { Tabs, TabsContent } from '@/components/design-system-v1/tabs'
import { CellSpecimens } from './cell-specimens'
import { ReviewControls } from './review-controls'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import {
  POSITIONS,
  YIELD_POSITIONS,
  WITHDRAWALS,
  withLongContent,
  type WithdrawalFixture,
} from './fixtures'
import { Positions } from './positions'
import { Withdrawals, type WithdrawalPreview } from './withdrawals'

export function TableFamilyReview() {
  const [family, setFamily] = useState('index')
  const [mode, setMode] = useState('default')
  const [states, setStates] = useState<Record<string, WithdrawalPreview>>({})
  const [source, setSource] = useState<WithdrawalFixture | null>(null)
  const [ready, setReady] = useState(false)
  const [constrained, setConstrained] = useState(false)
  const onWithdraw = useCallback(
    (row: WithdrawalFixture) =>
      setStates((prev) => ({ ...prev, [row.id]: 'processing' })),
    []
  )
  const baseRows = family === 'yield' ? YIELD_POSITIONS : POSITIONS
  const rows =
    mode === 'empty'
      ? []
      : mode === 'pressure'
        ? withLongContent(baseRows)
        : baseRows
  return (
    <section
      id="table-family-review"
      data-testid="table-family-review"
      className="scroll-mt-40 space-y-6"
    >
      <div className="space-y-1">
        <h2 className={type.sectionTitle}>Position rows and withdrawals</h2>
        <p
          className={cn(
            type.supporting,
            'max-w-3xl text-supporting-foreground'
          )}
        >
          First table-family candidate. Shared cells below, then two Portfolio
          anchors. Fixtures include both Index and Yield destinations; they are
          not live holdings.
        </p>
      </div>
      <CellSpecimens />
      <Tabs value={family} onValueChange={setFamily} className="space-y-4">
        <ReviewControls
          mode={mode}
          onMode={(mode) => {
            setMode(mode)
            setStates({})
            setSource(null)
            setReady(false)
          }}
          constrained={constrained}
          onConstrained={setConstrained}
          ready={ready}
          onReady={setReady}
          canReceive={Object.values(states).includes('processing')}
          onReceipt={() =>
            setStates((prev) =>
              Object.fromEntries(
                Object.entries(prev).map(([id, state]) => [
                  id,
                  state === 'processing' ? 'withdrawn' : state,
                ])
              )
            )
          }
        />
        <p
          data-testid="table-family-preview-note"
          className={cn(type.supporting, 'text-supporting-foreground')}
        >
          Lab-only simulation: no wallet or on-chain writes. Withdraw starts a
          processing preview; Simulate receipt demonstrates the result.
          Source-sidebar design and wallet/chain gates remain production-owned.
        </p>
        {source && (
          <div
            role="status"
            data-testid="table-source-preview"
            className={cn(type.supporting, 'bg-muted p-4')}
          >
            Source selected: {source.sourceLabel}. Production opens the
            vote-lock sidebar and resolves its unstaking manager before
            claimLock(lockId). This lab does not open a wallet or replace that
            sidebar.
          </div>
        )}
        {mode === 'empty' && (
          <p className={type.supporting}>
            Both sections are absent when their lists are empty. The Portfolio
            page’s wallet, error and no-activity states are outside this slice.
          </p>
        )}
        <TabsContent value={family}>
          <div
            data-testid="table-family-compositions"
            className={cn(
              'grid gap-0.5 bg-secondary [container-type:inline-size] [&_tr:last-child_[data-slot=row-seam]]:hidden',
              constrained && 'max-w-xl'
            )}
          >
            <Positions
              rows={rows}
              loading={mode === 'loading'}
              family={family === 'yield' ? 'yield' : 'index'}
            />
            <Withdrawals
              rows={
                mode === 'empty'
                  ? []
                  : WITHDRAWALS.map((row) => ({
                      ...row,
                      remaining: ready ? 0 : row.remaining,
                    }))
              }
              loading={mode === 'loading'}
              states={states}
              onWithdraw={onWithdraw}
              onSource={setSource}
            />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
