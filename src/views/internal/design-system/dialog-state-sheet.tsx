import { Button } from '@/components/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/dialog'
import { EligibilityDialogCandidate } from './eligibility-dialog-candidate'
import { useState } from 'react'

const DialogStateSheet = () => {
  const [open, setOpen] = useState(false)

  return (
    <section
      data-testid="dialog-state-sheet"
      className="space-y-4"
      aria-labelledby="dialog-state-sheet-title"
    >
      <div>
        <h2 id="dialog-state-sheet-title" className="text-xl font-medium">
          Canonical candidate · minimal shell
        </h2>
        <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
          This is the real reusable shell, not a copied lab card. The
          eligibility body is source-grounded and proves a non-dismissible
          workflow using the canonical Button, Checkbox, and compact IconButton
          candidates.
        </p>
      </div>
      <div className="border border-border bg-card p-5">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Open eligibility dialog</Button>
          </DialogTrigger>
          <DialogContent dismissible={false} showClose={false} width="standard">
            <EligibilityDialogCandidate
              idPrefix="dialog-review"
              onConfirm={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
        <p className="mt-3 max-w-2xl text-xs font-light leading-5 text-muted-foreground">
          Judge shell geometry, content axis, anchored regions, and dependency
          consistency. Do not judge outcome layouts, illustration, final shadow,
          or constrained-screen adaptation here.
        </p>
      </div>
    </section>
  )
}

export default DialogStateSheet
