import { useState } from 'react'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { Skeleton } from '@/components/design-system-v1/loading'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import { type AuctionPhase, type PreviewState } from './fixtures'
import { browseRecords } from './model'
import { PreviewControls, type BrowsePreview } from './preview-controls'
import { RebalanceListRecord } from './record'

export function AuctionsRecordReview() {
  const [preview, setPreview] = useState<
    BrowsePreview & { contentMode: PreviewState }
  >({
    mode: 'default',
    phase: 'restricted',
    constrained: false,
    launcherWallet: false,
    auctionsRun: 0,
    contentMode: 'default',
  })
  const { mode, phase, constrained, launcherWallet, auctionsRun } = preview
  const records = browseRecords(
    mode === 'loading' ? preview.contentMode : mode,
    phase,
    launcherWallet,
    auctionsRun
  )
  return (
    <section
      id="auctions-records-review"
      data-testid="auctions-browse-review"
      aria-labelledby="rebalance-record-review-title"
      className="scroll-mt-36 space-y-4"
    >
      <div>
        <h3 id="rebalance-record-review-title" className={type.panelTitle}>
          Auction rebalance browse list
        </h3>
        <p
          className={cn(
            type.supporting,
            'mt-1 max-w-3xl text-muted-foreground'
          )}
        >
          Review records only: hierarchy, timing, outcomes and provenance.
          Selection, the detail pane and transaction actions remain out of
          scope.
        </p>
      </div>
      <PreviewControls
        value={preview}
        onChange={(patch) =>
          setPreview((previous) => ({
            ...previous,
            ...patch,
            contentMode:
              patch.mode && patch.mode !== 'loading' && patch.mode !== 'empty'
                ? patch.mode
                : previous.contentMode,
          }))
        }
      />
      <FixtureNote
        phase={phase}
        launcherWallet={launcherWallet}
        priceUnavailable={preview.contentMode === 'price-unavailable'}
      />
      <div
        className={cn(
          'grid gap-8',
          !constrained &&
            'xl:grid-cols-[40rem_minmax(0,1fr)] xl:gap-0.5 xl:bg-secondary'
        )}
      >
        <div
          data-testid="rebalance-browse-list"
          aria-busy={mode === 'loading'}
          className={cn(
            'w-full min-w-0 space-y-0.5 bg-secondary [container-type:inline-size]',
            constrained ? 'max-w-[390px]' : 'max-w-[40rem]'
          )}
        >
          {[true, false].map((active) => {
            const group = records.filter((record) => record.active === active)
            if (!group.length && records.length) return null
            return (
              <section
                key={String(active)}
                className={
                  active ? roles.surface.content : roles.surface.recessedContent
                }
                data-testid={
                  active
                    ? 'rebalance-active-section'
                    : 'rebalance-history-section'
                }
              >
                <header
                  className={cn(
                    'flex items-center justify-between gap-4 px-6 pt-4 text-muted-foreground',
                    active
                      ? roles.surface.content
                      : roles.surface.recessedContent
                  )}
                >
                  <h4 className={type.label}>
                    {active ? 'Active rebalances' : 'Recent rebalances'}
                  </h4>
                  <span className={cn(type.supporting, 'tabular-nums')}>
                    {mode === 'loading' ? (
                      <Skeleton className="h-5 w-5" />
                    ) : (
                      group.length
                    )}
                  </span>
                </header>
                <div className="space-y-px bg-border">
                  {group.map((record) => (
                    <RebalanceListRecord
                      key={record.identity.id}
                      record={record}
                      loading={mode === 'loading'}
                    />
                  ))}
                  {group.length === 0 && (
                    <p
                      data-testid="rebalance-empty"
                      className={cn(
                        type.body,
                        'px-6 py-12 text-muted-foreground',
                        active
                          ? roles.surface.content
                          : roles.surface.recessedContent
                      )}
                    >
                      No rebalances found
                    </p>
                  )}
                </div>
              </section>
            )
          })}
        </div>
        {!constrained && (
          <aside
            data-testid="rebalance-selected-detail"
            className="hidden bg-card p-6 xl:block"
          >
            <p className={cn(type.label, 'text-muted-foreground')}>
              Future selected-auction pane · context only
            </p>
          </aside>
        )}
      </div>
    </section>
  )
}

function FixtureNote({
  phase,
  launcherWallet,
  priceUnavailable,
}: {
  phase: AuctionPhase
  launcherWallet: boolean
  priceUnavailable: boolean
}) {
  return (
    <p
      data-testid="rebalance-fixture-note"
      className={cn(type.supporting, 'max-w-3xl text-muted-foreground')}
    >
      CMC20 snapshot names, dates and rebalance windows; illustrative metrics
      and auction activity. Frozen preview, not live data.
      {phase === 'restricted' &&
        ' “Ready to start” is for an authorized launcher during the restricted period.'}
      {launcherWallet &&
        (priceUnavailable
          ? ' This control does not connect or check a real wallet.'
          : ' Launcher wallet is simulated; ready-to-start fixtures assume launch prerequisites are satisfied. This control does not connect or check a real wallet.')}
    </p>
  )
}
