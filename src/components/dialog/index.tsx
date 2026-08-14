import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
} from 'react'

import { IconButton } from '@/components/icon-button'
import { cn } from '@/lib/utils'

export type DialogWidth = 'compact' | 'standard'

const widthClasses: Record<DialogWidth, string> = {
  compact: 'sm:max-w-[384px]',
  standard: 'sm:max-w-[432px]',
}

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))

DialogOverlay.displayName = 'DialogOverlay'

export interface DialogContentProps extends ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  dismissible?: boolean
  showClose?: boolean
  width?: DialogWidth
}

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      children,
      className,
      dismissible = true,
      onEscapeKeyDown,
      onInteractOutside,
      onPointerDownOutside,
      showClose = true,
      width = 'standard',
      ...props
    },
    ref
  ) => (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-testid="canonical-dialog-content"
        data-width={width}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col bg-card p-2 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          widthClasses[width],
          className
        )}
        onEscapeKeyDown={(event) => {
          onEscapeKeyDown?.(event)
          if (!dismissible) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event)
          if (!dismissible) event.preventDefault()
        }}
        onPointerDownOutside={(event) => {
          onPointerDownOutside?.(event)
          if (!dismissible) event.preventDefault()
        }}
        {...props}
      >
        {children}
        {showClose && dismissible && (
          <DialogPrimitive.Close asChild>
            <IconButton
              label="Close dialog"
              icon={<X />}
              size="compact"
              tone="secondary"
              className="absolute right-2 top-2"
            />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
)

DialogContent.displayName = 'DialogContent'

export const DialogSurface = ({
  className,
  width = 'standard',
  ...props
}: HTMLAttributes<HTMLDivElement> & { width?: DialogWidth }) => {
  // Static lab specimens still use the canonical Radix title/description
  // primitives, so they need the same context as an interactive dialog.
  return (
    <DialogPrimitive.Root>
      <div
        data-testid="canonical-dialog-surface"
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
}

export const DialogHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('shrink-0 px-4 pb-2 pt-4', className)} {...props} />
)

export const DialogBody = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('min-h-0 flex-1 overflow-y-auto px-4', className)}
    {...props}
  />
)

export const DialogFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('shrink-0 px-4 pb-4 pt-3', className)} {...props} />
)

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-2xl font-light leading-8', className)}
    {...props}
  />
))

DialogTitle.displayName = 'DialogTitle'

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      'mt-2 text-base font-light leading-6 text-muted-foreground',
      className
    )}
    {...props}
  />
))

DialogDescription.displayName = 'DialogDescription'
