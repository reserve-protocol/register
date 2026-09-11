import { v1Typography } from '@/components/design-system-v1/typography'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'

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
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[calc(100dvh-0.5rem)] w-full flex-col bg-card p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-[100%] data-[state=open]:slide-in-from-bottom-[100%] sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:max-h-[calc(100vh-2rem)] sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:pb-2 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95',
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

export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode
  leading?: ReactNode
}

export const DialogHeader = ({
  action,
  children,
  className,
  leading,
  ...props
}: DialogHeaderProps) => (
  <div className={cn('shrink-0 px-4 pb-2 pt-4', className)} {...props}>
    {(leading || action) && (
      <div className="flex min-h-8 items-center gap-4">
        {leading}
        {action && <div className="ml-auto">{action}</div>}
      </div>
    )}
    {children}
  </div>
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
    className={cn(`mt-1 ${v1Typography.body} text-muted-foreground`, className)}
    {...props}
  />
))

DialogDescription.displayName = 'DialogDescription'
