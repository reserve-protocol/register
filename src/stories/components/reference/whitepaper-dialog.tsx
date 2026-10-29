import { useId, useState } from 'react'
import { DialogTaskHeader } from './dialog-task-header'
import { CFB_WHITEPAPER_CHANGES } from './whitepaper-fixture'

import { Button } from '@/components/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/design-system-v1/collapsible'
import { Link } from '@/components/design-system-v1/link'
import { v1Typography } from '@/components/design-system-v1/typography'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogTrigger,
} from '@/components/dialog'
import { v1LayoutRecipes as layout } from '@/components/ui/v1-layout-recipes'
import { cn } from '@/lib/utils'

export const WhitepaperDialog = () => {
  const currentId = useId()
  const previousId = useId()
  const [changesOpen, setChangesOpen] = useState(false)

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setChangesOpen(false)
      }}
    >
      <DialogTrigger asChild>
        <Button tone="secondary">Review CFB Whitepaper</Button>
      </DialogTrigger>
      <DialogContent
        width="standard"
        // The nine-entry change log would otherwise grow the dialog to full height.
        className="max-h-[min(640px,calc(100dvh-0.5rem))] sm:max-h-[min(640px,calc(100vh-2rem))]"
      >
        <DialogTaskHeader
          title="CFB Token Whitepapers"
          description="Official documentation for the CFB LCAP token"
        />
        <div className="relative flex min-h-0 flex-1 flex-col">
          {/* The full-bleed trigger already carries 12px around its label. */}
          <DialogBody
            className={cn(
              layout.stack.internalRegions,
              'pt-4',
              changesOpen ? 'pb-6' : 'pb-1'
            )}
          >
            <div className={layout.stack.internalRegions}>
              <section aria-labelledby={currentId}>
                <div
                  className={cn(
                    'flex items-center justify-between',
                    layout.cluster.internalRegions
                  )}
                >
                  <div className={cn('min-w-0', layout.stack.tightText)}>
                    <h3 id={currentId} className={v1Typography.itemTitle}>
                      Current Version (v2)
                    </h3>
                    <p
                      className={cn(
                        v1Typography.supporting,
                        'text-muted-foreground'
                      )}
                    >
                      Published: October 2025
                    </p>
                  </div>
                  <Link
                    href="https://storage.reserve.org/cfb-whitepaper-v2.pdf"
                    treatment="standalone"
                    external
                    externalAnnouncement="opens in a new tab"
                    className="shrink-0"
                    aria-label="View PDF · Current Version (v2), opens in a new tab"
                  >
                    View PDF
                  </Link>
                </div>
              </section>
              <section aria-labelledby={previousId}>
                <div
                  className={cn(
                    'flex items-center justify-between',
                    layout.cluster.internalRegions
                  )}
                >
                  <div className={cn('min-w-0', layout.stack.tightText)}>
                    <h3 id={previousId} className={v1Typography.itemTitle}>
                      Previous Version (v1)
                    </h3>
                    <p
                      className={cn(
                        v1Typography.supporting,
                        'text-muted-foreground'
                      )}
                    >
                      Original whitepaper documentation
                    </p>
                  </div>
                  <Link
                    href="https://storage.reserve.org/cfb-whitepaper.pdf"
                    treatment="standalone"
                    external
                    externalAnnouncement="opens in a new tab"
                    className="shrink-0"
                    aria-label="View PDF · Previous Version (v1), opens in a new tab"
                  >
                    View PDF
                  </Link>
                </div>
              </section>
            </div>
            <section aria-label="Summary of Changes from v1">
              <Collapsible
                className="-mx-4"
                open={changesOpen}
                onOpenChange={setChangesOpen}
              >
                <CollapsibleTrigger cue={{ closed: 'Show', open: 'Hide' }}>
                  Summary of Changes from v1
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className={layout.stack.relatedContent}>
                    {CFB_WHITEPAPER_CHANGES.map(({ label, text }) => (
                      <li key={label}>
                        <span className="font-medium text-foreground">
                          {label}:
                        </span>{' '}
                        {text}
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </section>
          </DialogBody>
          {/* Same overflow fade as product navigation, so the clipped entry reads as scrollable. */}
          {changesOpen && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-card"
              data-slot="dialog-overflow-fade"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
