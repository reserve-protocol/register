import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { HTMLAttributes } from 'react'

import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  type DialogWidth,
} from '@/components/dialog'
import { cn } from '@/lib/utils'

const widthClasses: Record<DialogWidth, string> = {
  compact: 'sm:max-w-[384px]',
  standard: 'sm:max-w-[432px]',
}

export const DialogSurface = ({
  className,
  width = 'standard',
  ...props
}: HTMLAttributes<HTMLDivElement> & { width?: DialogWidth }) => (
  <DialogPrimitive.Root>
    <div
      data-width={width}
      className={cn(
        'flex w-full flex-col bg-card p-2 shadow-lg',
        widthClasses[width],
        className
      )}
      {...props}
    />
  </DialogPrimitive.Root>
)

export {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
}
