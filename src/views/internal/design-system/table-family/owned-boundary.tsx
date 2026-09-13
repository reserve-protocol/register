import { Button } from '@/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/dialog'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import type { OwnedPosition } from './owned-fixtures'
import { mainnet, base, bsc } from 'viem/chains'
import { cn } from '@/lib/utils'

export function OwnedBoundary({
  boundary,
  onClose,
}: {
  boundary: { row: OwnedPosition; trigger: HTMLElement } | null
  onClose: () => void
}) {
  return (
    <Dialog
      open={!!boundary}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      {boundary && (
        <DialogContent
          width="compact"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const { trigger } = boundary
            const root = trigger.closest('[data-slot="table-family-container"]')
            const target = [
              ...(root?.querySelectorAll<HTMLElement>('[data-table-focus]') ??
                []),
            ].find(
              (element) =>
                element.dataset.tableFocus === trigger.dataset.tableFocus &&
                element.getClientRects().length
            )
            target?.focus({ preventScroll: true })
          }}
        >
          <DialogHeader>
            <DialogTitle>Vote-lock · {boundary.row.symbol}</DialogTitle>
            <DialogDescription>
              Non-executing lab preview. No wallet is connected and no
              transaction can be submitted here.
            </DialogDescription>
          </DialogHeader>
          <dl className={cn(type.supporting, 'space-y-2 break-all')}>
            <div>
              <dt className="text-supporting-foreground">Chain</dt>
              <dd>
                {
                  [mainnet, base, bsc].find(
                    (chain) => chain.id === boundary.row.chain
                  )?.name
                }{' '}
                ({boundary.row.chain})
              </dd>
            </div>
            <div>
              <dt className="text-supporting-foreground">DTF</dt>
              <dd>
                {boundary.row.governs[0]?.name ?? '—'}
                <br />
                {boundary.row.governs[0]?.href}
              </dd>
            </div>
            <div>
              <dt className="text-supporting-foreground">Underlying</dt>
              <dd>{boundary.row.underlying.symbol}</dd>
            </div>
            <div>
              <dt className="text-supporting-foreground">Governs</dt>
              <dd>
                {boundary.row.governs.map((asset) => asset.symbol).join(', ') ||
                  '—'}
              </dd>
            </div>
            <div>
              <dt className="text-supporting-foreground">Address</dt>
              <dd>{boundary.row.address}</dd>
            </div>
          </dl>
          <DialogFooter>
            <Button tone="quiet" size="compact" onClick={onClose}>
              Close preview
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
