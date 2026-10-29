import { useEffect, useState } from 'react'
import { addons } from 'storybook/preview-api'
import { CLOSE_PREVIEW_DIALOG } from '../../../../.storybook/preview-dialog-events'
import { EligibilityDialogCandidate } from './eligibility-dialog'

import { Button } from '@/components/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/dialog'

export const EligibilityDialogPreview = ({
  expanded = false,
}: {
  expanded?: boolean
}) => {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const channel = addons.getChannel()
    const close = () => setOpen(false)
    channel.on(CLOSE_PREVIEW_DIALOG, close)
    return () => channel.off(CLOSE_PREVIEW_DIALOG, close)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{expanded ? 'Open eligibility' : 'Review eligibility'}</Button>
      </DialogTrigger>
      <DialogContent dismissible={false} width="standard">
        <EligibilityDialogCandidate
          idPrefix={
            expanded ? 'storybook-long-eligibility' : 'storybook-eligibility'
          }
          jurisdictionsDefaultOpen={expanded}
        />
      </DialogContent>
    </Dialog>
  )
}
