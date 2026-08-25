import { Button } from '@/components/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSurface,
  DialogTitle,
} from '@/components/dialog'
import { IconButton } from '@/components/icon-button'
import { X } from 'lucide-react'
import { useState } from 'react'
import { EligibilityDialogCandidate } from './eligibility-dialog-candidate'

const DialogStateSheet = () => (
  <section
    data-testid="dialog-state-sheet"
    className="space-y-4"
    aria-labelledby="dialog-state-sheet-title"
  >
    <div>
      <h2 id="dialog-state-sheet-title" className="text-xl font-medium">
        Canonical candidate · shell states
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Compact reversible tasks, standard non-dismissible gates, and long
        body-owned scrolling use the same anchored header, body, and action
        regions. The shell changes only where the evidenced task requires it.
      </p>
    </div>
    <div className="grid min-w-0 gap-4 xl:grid-cols-3">
      <DialogSpecimen label="Compact · ordinary dismissible task">
        <DialogSurface width="compact">
          <CompactSimulationDialog />
        </DialogSurface>
      </DialogSpecimen>
      <DialogSpecimen label="Standard · non-dismissible eligibility gate">
        <DialogSurface width="standard">
          <EligibilityDialogCandidate idPrefix="dialog-static-review" />
        </DialogSurface>
      </DialogSpecimen>
      <DialogSpecimen label="Standard · anchored regions and long body">
        <DialogSurface width="standard" className="max-h-[36rem]">
          <EligibilityDialogCandidate
            idPrefix="dialog-long-review"
            jurisdictionsDefaultOpen
          />
        </DialogSurface>
      </DialogSpecimen>
    </div>
  </section>
)

const DialogSpecimen = ({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) => (
  <div className="min-w-0 overflow-hidden border border-border bg-background p-5">
    <p className="mb-4 text-xs font-medium text-muted-foreground">{label}</p>
    {children}
  </div>
)

const CompactSimulationDialog = () => (
  <>
    <DialogHeader
      action={
        <DialogClose asChild>
          <IconButton
            label="Close dialog"
            icon={<X />}
            size="compact"
            tone="secondary"
          />
        </DialogClose>
      }
    >
      <DialogTitle>Proposal Simulation</DialogTitle>
      <DialogDescription>
        Test the proposal before submitting it onchain.
      </DialogDescription>
    </DialogHeader>
    <DialogBody>
      <p className="py-4 text-sm font-light leading-5 text-muted-foreground">
        The result remains in this task and can link to Tenderly after the
        simulation completes.
      </p>
    </DialogBody>
    <DialogFooter>
      <Button className="w-full">Simulate</Button>
    </DialogFooter>
  </>
)

export const EligibilityDialogInteractionReview = () => {
  const [open, setOpen] = useState(false)

  return (
    <section
      data-testid="dialog-interaction-review"
      className="border border-border bg-card p-5"
    >
      <h2 className="text-xl font-medium">Extended interaction evidence</h2>
      <p className="mt-1 max-w-2xl text-sm font-light leading-5 text-muted-foreground">
        Open the real Radix shell to verify focus, dismissal prevention,
        disclosure, and constrained-screen presentation. This interaction is
        detail-only; the complete visual states remain in the shared sheet.
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <Button className="mt-4" onClick={() => setOpen(true)}>
          Open eligibility dialog
        </Button>
        <DialogContent dismissible={false} width="standard">
          <EligibilityDialogCandidate
            idPrefix="dialog-review"
            onConfirm={() => setOpen(false)}
            showClosePreview
          />
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default DialogStateSheet
