import { useState } from 'react'

import { Button } from '@/components/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/dialog'
import {
  ZapperInlineReference,
  type ZapperReviewState,
} from './reference/transaction-composition-rfq'

export const BoundedZapperProposal = ({
  state,
}: {
  state: ZapperReviewState
}) => {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Zapper</Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle className="sr-only">Buy / Sell</DialogTitle>
        <div className="flex min-h-0 overflow-y-auto overscroll-contain">
          <ZapperInlineReference
            key={state}
            state={state}
            presentation="dialog"
            onClose={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
