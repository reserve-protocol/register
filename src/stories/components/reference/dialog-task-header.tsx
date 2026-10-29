import type { ReactNode } from 'react'
import { X } from 'lucide-react'

import {
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/dialog'
import { IconButton } from '@/components/icon-button'

export const DialogTaskHeader = ({
  title,
  description,
  topicIcon,
}: {
  title: ReactNode
  description?: ReactNode
  topicIcon?: ReactNode
}) => {
  const close = (
    <DialogClose asChild>
      <IconButton
        label="Close dialog"
        icon={<X />}
        size="compact"
        tone="quiet"
      />
    </DialogClose>
  )

  return (
    <DialogHeader
      leading={
        topicIcon && (
          <span className="flex size-8 items-center justify-center" aria-hidden>
            {topicIcon}
          </span>
        )
      }
      action={topicIcon ? close : undefined}
    >
      {topicIcon ? (
        <DialogTitle className="mt-4">{title}</DialogTitle>
      ) : (
        <div className="flex items-start gap-4">
          <DialogTitle className="min-w-0 flex-1">{title}</DialogTitle>
          {close}
        </div>
      )}
      {description && <DialogDescription>{description}</DialogDescription>}
    </DialogHeader>
  )
}
