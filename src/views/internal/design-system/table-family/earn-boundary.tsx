import { Button } from '@/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/dialog'
import type { EarnRow } from './earn-fixtures'

export function EarnBoundary({
  boundary,
  onClose,
}: {
  boundary: { row: EarnRow; trigger: HTMLElement } | null
  onClose: () => void
}) {
  return (
    <Dialog
      open={!!boundary}
      onOpenChange={(value) => {
        if (!value) onClose()
      }}
    >
      {boundary && (
        <DialogContent
          width="compact"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const { trigger } = boundary
            const root = trigger.closest('[data-slot="table-family-container"]')
            const target = trigger.getClientRects().length
              ? trigger
              : [
                  ...(root?.querySelectorAll<HTMLElement>(
                    '[data-table-focus]'
                  ) ?? []),
                ].find(
                  (element) =>
                    element.dataset.tableFocus === trigger.dataset.tableFocus &&
                    element.getClientRects().length
                )
            target?.focus({ preventScroll: true })
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {boundary.row.family === 'index' ? 'Vote-lock' : 'Stake RSR'} ·{' '}
              {boundary.row.vault}
            </DialogTitle>
            <DialogDescription>
              Non-executing lab preview. In the app, this row opens the existing{' '}
              {boundary.row.family === 'index' ? 'vote-lock' : 'staking'}{' '}
              drawer. No wallet is connected and no transaction can be submitted
              here.
            </DialogDescription>
          </DialogHeader>
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
